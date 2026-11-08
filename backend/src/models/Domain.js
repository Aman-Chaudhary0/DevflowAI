import mongoose from "mongoose";

const verificationRecordSchema = new mongoose.Schema(
  {
    type: { type: String, default: "", trim: true, maxlength: 20 },
    name: { type: String, default: "", trim: true, maxlength: 255 },
    value: { type: String, default: "", trim: true, maxlength: 1000 },
    reason: { type: String, default: "", trim: true, maxlength: 500 }
  },
  { _id: false }
);

const domainSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true
    },
    deployment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deployment",
      default: null,
      index: true
    },
    provider: {
      type: String,
      enum: ["vercel"],
      default: "vercel",
      index: true
    },
    providerProjectId: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200
    },
    providerDomainId: {
      type: String,
      default: "",
      trim: true,
      maxlength: 255
    },
    domain: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 255,
      index: true
    },
    environment: {
      type: String,
      enum: ["production", "preview", "development"],
      default: "production"
    },
    dnsStatus: {
      type: String,
      enum: ["pending", "configured", "misconfigured", "verifying", "unknown"],
      default: "pending"
    },
    sslStatus: {
      type: String,
      enum: ["pending", "issued", "failed", "unknown"],
      default: "pending"
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "failed", "removed", "unknown"],
      default: "pending"
    },
    verificationRecords: {
      type: [verificationRecordSchema],
      default: []
    },
    status: {
      type: String,
      enum: ["active", "removed"],
      default: "active",
      index: true
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    verifiedAt: {
      type: Date,
      default: null
    },
    removedAt: {
      type: Date,
      default: null
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

domainSchema.index({ workspace: 1, createdAt: -1 });
domainSchema.index({ project: 1, environment: 1, createdAt: -1 });
domainSchema.index({ project: 1, domain: 1 }, { unique: true });

const Domain = mongoose.models.Domain || mongoose.model("Domain", domainSchema);

export default Domain;
