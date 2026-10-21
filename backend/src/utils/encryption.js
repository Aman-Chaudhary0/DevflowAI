import crypto from "crypto";

const SECRET_KEY = crypto
  .createHash("sha256")
  .update(process.env.TWO_FACTOR_ENCRYPTION_KEY || process.env.JWT_ACCESS_SECRET || "devflow-ai-2fa-fallback")
  .digest();

export function encryptValue(value) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", SECRET_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(String(value), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decryptValue(value) {
  const buffer = Buffer.from(value, "base64");
  const iv = buffer.subarray(0, 16);
  const tag = buffer.subarray(16, 32);
  const encrypted = buffer.subarray(32);
  const decipher = crypto.createDecipheriv("aes-256-gcm", SECRET_KEY, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}
