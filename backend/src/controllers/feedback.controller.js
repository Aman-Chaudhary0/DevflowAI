import Feedback from "../models/Feedback.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendEmail } from "../utils/sendEmail.js";

export const createFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.create({ ...req.body, createdBy: req.user?._id || null });
  const result = feedback.toObject();
  result.reference = `FDB-${String(feedback._id).slice(-6).toUpperCase()}`;

  let emailSent = false;
  let emailReason = "recipient_not_configured";
  if (process.env.EMAIL) {
    const senderEmail = req.user?.email || "Not provided";
    const text = [
      `Reference: ${result.reference}`,
      `Type: ${feedback.type}`,
      `Title: ${feedback.title}`,
      `Priority: ${feedback.priority}`,
      `Feature: ${feedback.feature}`,
      `Submitted by: ${req.user?.name || "Guest"} (${senderEmail})`,
      `Satisfaction: ${feedback.satisfaction == null ? "Not rated" : `${feedback.satisfaction + 1}/5`}`,
      "",
      feedback.description
    ].join("\n");
    const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
    const html = `<h2>New Devflow AI feedback</h2><p><strong>Reference:</strong> ${result.reference}</p><p><strong>Type:</strong> ${escapeHtml(feedback.type)}</p><p><strong>Title:</strong> ${escapeHtml(feedback.title)}</p><p><strong>Priority:</strong> ${escapeHtml(feedback.priority)}</p><p><strong>Feature:</strong> ${escapeHtml(feedback.feature)}</p><p><strong>Submitted by:</strong> ${escapeHtml(req.user?.name || "Guest")} (${escapeHtml(senderEmail)})</p><p><strong>Satisfaction:</strong> ${feedback.satisfaction == null ? "Not rated" : `${feedback.satisfaction + 1}/5`}</p><hr /><p>${escapeHtml(feedback.description).replace(/\r?\n/g, "<br />")}</p>`;

    try {
      const delivery = await sendEmail({
        to: process.env.EMAIL,
        ...(req.user?.email ? { replyTo: req.user.email } : {}),
        subject: `[${result.reference}] ${feedback.type}: ${feedback.title}`,
        text,
        html
      });
      emailSent = Boolean(delivery.sent);
      emailReason = delivery.reason || (emailSent ? "" : "delivery_failed");
    } catch (error) {
      emailReason = "delivery_failed";
      console.error("Feedback email delivery failed:", error.message);
    }
  }

  res.status(201).json(new ApiResponse(201, { feedback: result, emailSent, emailReason }, "Feedback submitted"));
});

export const listMyFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.find({ createdBy: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();
  res.status(200).json(new ApiResponse(200, { feedback }, "Feedback history fetched"));
});
