import nodemailer from "nodemailer";

export async function sendEmail({ to, subject, html, text }) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log("Email skipped. Configure SMTP_* env vars to send:", { to, subject, text });
    return;
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
}
