import crypto from "crypto";
import * as OTPAuth from "otpauth";
import bcrypt from "bcryptjs";

const TOTP_WINDOW = 1;
const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export function createTotpSecret(label, issuer) {
  const secret = new OTPAuth.Secret({ size: 32 });
  const totp = new OTPAuth.TOTP({
    issuer,
    label,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: secret.base32
  });

  return {
    secret: secret.base32,
    otpauthUrl: totp.toString(),
    issuer,
    label
  };
}

export function verifyTotpCode(secret, code) {
  if (!secret || !code) return false;

  const totp = new OTPAuth.TOTP({
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret
  });

  return totp.validate({ token: String(code).replace(/\s+/g, ""), window: TOTP_WINDOW }) !== null;
}

export function generateRecoveryCodes(count = 8) {
  return Array.from({ length: count }, () => {
    const bytes = crypto.randomBytes(5).toString("hex");
    return bytes.slice(0, 10).toUpperCase();
  });
}

export function hashRecoveryCode(code) {
  return bcrypt.hashSync(code, 12);
}

export function verifyRecoveryCode(hashedCode, candidate) {
  if (!hashedCode || !candidate) return false;
  return bcrypt.compareSync(candidate, hashedCode);
}

export function buildTwoFactorLockout(user) {
  const lockUntil = user.twoFactorLockUntil ? new Date(user.twoFactorLockUntil) : null;
  if (lockUntil && lockUntil > new Date()) {
    return { locked: true, remainingMs: lockUntil.getTime() - Date.now() };
  }

  return { locked: false, remainingMs: 0 };
}

export function incrementTwoFactorAttempts(user) {
  const attempts = (user.twoFactorFailedAttempts || 0) + 1;
  const lockUntil = attempts >= MAX_ATTEMPTS ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000) : null;

  user.twoFactorFailedAttempts = attempts;
  user.twoFactorLockUntil = lockUntil;
  return lockUntil;
}

export function clearTwoFactorAttempts(user) {
  user.twoFactorFailedAttempts = 0;
  user.twoFactorLockUntil = undefined;
}
