import nodemailer from "nodemailer";

// A missing SMTP setup is reported to the caller without breaking existing auth flows.
export async function sendEmail({ to, subject, html, text }) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return { sent: false, reason: "smtp_not_configured" };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: SMTP_FROM || "Devflow AI <no-reply@devflow.ai>",
    to,
    subject,
    html,
    text
  });
  return { sent: true };
}
