import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendEmail } from "../utils/sendEmail.js";

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

export const submitContactMessage = asyncHandler(async (req, res) => {
  const { name, email, company, subject, message } = req.body;
  const recipient = process.env.EMAIL;
  if (!recipient) throw new ApiError(503, "Contact email is not configured on the server (EMAIL).");

  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    ...(company ? [`Company: ${company}`] : []),
    `Subject: ${subject}`,
    "",
    message
  ].join("\n");
  const html = `<h2>New Devflow AI contact message</h2><p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p>${company ? `<p><strong>Company:</strong> ${escapeHtml(company)}</p>` : ""}<p><strong>Subject:</strong> ${escapeHtml(subject)}</p><hr /><p>${escapeHtml(message).replace(/\r?\n/g, "<br />")}</p>`;

  const result = await sendEmail({
    to: recipient,
    replyTo: email,
    subject: `Contact form: ${subject}`,
    text,
    html
  });
  if (!result.sent) {
    throw new ApiError(503, "Email delivery is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS on the backend.");
  }

  res.status(200).json(new ApiResponse(200, { sent: true }, "Your message has been sent"));
});
