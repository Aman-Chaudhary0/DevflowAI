import mongoose from "mongoose";
import Domain from "../models/Domain.js";
import Deployment from "../models/Deployment.js";
import { ApiError } from "../utils/ApiError.js";
import { getAuthorizedProjectIdsForUser, getProjectForUser } from "./project.service.js";
import { getDomainProvider } from "./deployment-provider.service.js";

function parsePaging(input = {}) {
  const page = Math.max(1, Number(input.page || 1));
  const limit = Math.max(1, Math.min(100, Number(input.limit || 20)));
  return { page, limit };
}

function toResponse(document) {
  const domain = document.toObject ? document.toObject() : { ...document };
  return {
    ...domain,
    id: String(domain._id),
    projectName: domain.project?.name || ""
  };
}

async function domainByIdForUser(userId, domainId) {
  if (!mongoose.isValidObjectId(domainId)) {
    throw new ApiError(400, "Invalid domain id");
  }

  const projectIds = await getAuthorizedProjectIdsForUser(userId);
  const domain = await Domain.findOne({
    _id: domainId,
    project: {
      $in: projectIds.length ? projectIds : [new mongoose.Types.ObjectId("000000000000000000000000")]
    }
  })
    .populate("project", "_id name slug")
    .populate("deployment", "_id status deploymentUrl")
    .populate("addedBy", "_id name avatar");

  if (!domain) {
    throw new ApiError(404, "Domain not found or access denied");
  }

  return domain;
}

export async function createDomainForUser(user, input = {}) {
  const provider = getDomainProvider();
  const project = await getProjectForUser(user._id, input.projectId);

  let deployment = null;
  if (input.deploymentId) {
    deployment = await Deployment.findOne({
      _id: input.deploymentId,
      project: project._id
    });
    if (!deployment) {
      throw new ApiError(404, "Deployment not found in this project");
    }
  }

  const existing = await Domain.findOne({
    project: project._id,
    domain: String(input.domain).toLowerCase()
  }).lean();

  if (existing && existing.status !== "removed") {
    throw new ApiError(409, "Domain already exists for this project");
  }

  const providerProjectId = String(process.env.VERCEL_PROJECT_ID || "").trim();
  if (!providerProjectId) {
    throw new ApiError(503, "Vercel project configuration is missing. Set VERCEL_PROJECT_ID.");
  }

  const added = await provider.addDomain({
    providerProjectId,
    domain: String(input.domain).toLowerCase(),
    environment: input.environment || "production"
  });

  const domain = existing
    ? await Domain.findByIdAndUpdate(
      existing._id,
      {
        $set: {
          workspace: project.workspace,
          project: project._id,
          deployment: deployment?._id || null,
          provider: "vercel",
          providerProjectId,
          providerDomainId: added.providerDomainId || added.domain,
          domain: String(input.domain).toLowerCase(),
          environment: input.environment || "production",
          dnsStatus: added.dnsStatus || "pending",
          sslStatus: added.sslStatus || "pending",
          verificationStatus: added.verificationStatus || "pending",
          verificationRecords: added.verificationRecords || [],
          status: "active",
          removedAt: null,
          addedBy: user._id,
          metadata: added.raw || {}
        }
      },
      { new: true, runValidators: true }
    )
    : await Domain.create({
      workspace: project.workspace,
      project: project._id,
      deployment: deployment?._id || null,
      provider: "vercel",
      providerProjectId,
      providerDomainId: added.providerDomainId || added.domain,
      domain: String(input.domain).toLowerCase(),
      environment: input.environment || "production",
      dnsStatus: added.dnsStatus || "pending",
      sslStatus: added.sslStatus || "pending",
      verificationStatus: added.verificationStatus || "pending",
      verificationRecords: added.verificationRecords || [],
      addedBy: user._id,
      metadata: added.raw || {}
    });

  const populated = await domainByIdForUser(user._id, domain._id);
  return { domain: toResponse(populated) };
}

export async function listDomainsForUser(userId, query = {}) {
  const { page, limit } = parsePaging(query);
  const projectIds = await getAuthorizedProjectIdsForUser(userId);
  const filter = {
    project: {
      $in: projectIds.length ? projectIds : [new mongoose.Types.ObjectId("000000000000000000000000")]
    },
    ...(query.projectId ? { project: query.projectId } : {}),
    ...(query.environment ? { environment: query.environment } : {}),
    ...(query.status ? { status: query.status } : {})
  };

  const [items, total] = await Promise.all([
    Domain.find(filter)
      .populate("project", "_id name slug")
      .populate("deployment", "_id status deploymentUrl")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Domain.countDocuments(filter)
  ]);

  return {
    domains: items.map((item) => toResponse(item)),
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit))
  };
}

export async function getDomainForUser(userId, domainId) {
  const domain = await domainByIdForUser(userId, domainId);
  return { domain: toResponse(domain) };
}

export async function verifyDomainForUser(userId, domainId) {
  const domain = await domainByIdForUser(userId, domainId);
  const provider = getDomainProvider();

  const verification = await provider.verifyDomain({
    providerProjectId: domain.providerProjectId,
    domain: domain.domain
  });

  domain.dnsStatus = verification.dnsStatus || domain.dnsStatus;
  domain.sslStatus = verification.sslStatus || domain.sslStatus;
  domain.verificationStatus = verification.verificationStatus || domain.verificationStatus;
  domain.verificationRecords = verification.verificationRecords || domain.verificationRecords;
  if (domain.verificationStatus === "verified") {
    domain.verifiedAt = new Date();
  }
  domain.metadata = {
    ...(domain.metadata || {}),
    verifyResponse: verification.raw || {}
  };

  await domain.save();

  return { domain: toResponse(domain) };
}

export async function removeDomainForUser(userId, domainId) {
  const domain = await domainByIdForUser(userId, domainId);
  const provider = getDomainProvider();

  if (domain.status !== "removed") {
    await provider.removeDomain({
      providerProjectId: domain.providerProjectId,
      domain: domain.domain
    });
  }

  domain.status = "removed";
  domain.verificationStatus = "removed";
  domain.removedAt = new Date();
  await domain.save();

  return {
    domain: toResponse(domain)
  };
}
