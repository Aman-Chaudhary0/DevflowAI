import bcrypt from "bcryptjs";
import crypto from "crypto";
import QRCode from "qrcode";
import { User } from "../../models/User.js";
import { ApiError } from "../../utils/ApiError.js";
import { decryptValue, encryptValue } from "../../utils/encryption.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/generateToken.js";
import { sendEmail } from "../../utils/sendEmail.js";
import {
  buildTwoFactorLockout,
  clearTwoFactorAttempts,
  createTotpSecret,
  generateRecoveryCodes,
  hashRecoveryCode,
  incrementTwoFactorAttempts,
  verifyRecoveryCode,
  verifyTotpCode
} from "../../utils/twoFactor.js";

const TWO_FACTOR_SETUP_WINDOW_MS = 10 * 60 * 1000;
const TWO_FACTOR_CHALLENGE_WINDOW_MS = 5 * 60 * 1000;

// The hashToken function hashes a given token using SHA-256 and returns the hexadecimal representation of the hash.
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// The issueTokenPair function generates a new access token and refresh token for a given user, hashes the refresh token, saves it to the user's record in the database, and returns both tokens.
async function issueTokenPair(user) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  user.refreshToken = await bcrypt.hash(refreshToken, 12);
  await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
}

// buildUrl constructs a URL for the frontend application by appending a token to a route or query string.
function buildUrl(path, token, useQueryParam = true) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  return useQueryParam ? `${frontendUrl}${path}?token=${token}` : `${frontendUrl}${path}/${token}`;
}

// sendVerificationEmail sends an email to the user with a verification link containing a unique token for email verification.
async function sendVerificationEmail(user, invitationToken = "") {
  const token = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  const verificationUrl = new URL(buildUrl("/verify-email", token));
  if (invitationToken) verificationUrl.searchParams.set("invite", invitationToken);
  const verificationLink = verificationUrl.toString();
  await sendEmail({
    to: user.email,
    subject: "Verify your Devflow AI email",
    text: `Hi ${user.name},\n\nVerify your Devflow AI account by visiting this link:\n${verificationLink}\n\nThis link expires in 1 hour.\n\nIf you did not create an account, ignore this email.`,
    html: `<!DOCTYPE html><html><body style="font-family:Inter,sans-serif;background:#0b0f19;color:#f8fafc;padding:40px 20px;">
<div style="max-width:480px;margin:0 auto;background:#1a2235;border-radius:18px;padding:40px;border:1px solid #273244;">
<h2 style="margin:0 0 8px;font-size:24px;">Verify your email</h2>
<p style="color:#94a3b8;margin:0 0 24px;">Hi ${user.name}, thanks for signing up for Devflow AI. Click the button below to verify your email address.</p>
<a href="${verificationLink}" style="display:inline-block;background:#3b82f6;color:#fff;text-decoration:none;padding:14px 28px;border-radius:14px;font-weight:700;">Verify Email</a>
<p style="color:#64748b;font-size:13px;margin-top:24px;">Or copy this link: ${verificationLink}</p>
<p style="color:#64748b;font-size:13px;">This link expires in 1 hour. If you did not create an account, ignore this email.</p>
</div></body></html>`
  });
}

// registerUser handles the user registration process. It checks for existing users, creates a new user, sends a verification email, and issues an access and refresh token pair.
export async function registerUser({ name, email, password, invitationToken }) {
  const trimmedName = String(name || "").trim();
  const normalizedEmail = String(email || "").trim().toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new ApiError(409, "Email is already registered");
  }

  const user = await User.create({ name: trimmedName, email: normalizedEmail, password });
  await sendVerificationEmail(user, invitationToken);

  return { user: user.toSafeObject() };
}

// loginUser authenticates a user by verifying their email and password. If successful, it issues a new access and refresh token pair and returns the user's safe object along with the tokens.
export async function loginUser({ email, password }) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select("+password +refreshToken +twoFactorEnabled +twoFactorPendingTokenHash +twoFactorChallengeExpires +twoFactorSecret +twoFactorRecoveryCodes +twoFactorFailedAttempts +twoFactorLockUntil");

  if (!user || !user.password) {
    throw new ApiError(401, "Invalid email or password");
  }

  const passwordMatches = await user.comparePassword(password);
  if (!passwordMatches) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isVerified && user.provider === "local") {
    throw new ApiError(403, "Please verify your email before logging in");
  }

  const lockout = buildTwoFactorLockout(user);
  if (lockout.locked) {
    throw new ApiError(429, "Too many failed attempts. Please try again later.");
  }

  if (user.twoFactorEnabled) {
    const challengeToken = crypto.randomBytes(32).toString("hex");
    user.twoFactorPendingTokenHash = hashToken(challengeToken);
    user.twoFactorChallengeExpires = new Date(Date.now() + TWO_FACTOR_CHALLENGE_WINDOW_MS);
    user.twoFactorFailedAttempts = 0;
    user.twoFactorLockUntil = undefined;
    await user.save({ validateBeforeSave: false });

    return {
      requiresTwoFactor: true,
      challengeToken,
      user: user.toSafeObject()
    };
  }

  const tokens = await issueTokenPair(user);
  return { user: user.toSafeObject(), ...tokens };
}

// logoutUser removes the refresh token from the user's record in the database, effectively logging the user out by invalidating their session.
export async function logoutUser(userId) {
  if (!userId) return;
  await User.findByIdAndUpdate(userId, { $unset: { refreshToken: "" } });
}

export async function revokeSessionFromRefreshToken(refreshTokenValue) {
  if (!refreshTokenValue) return false;

  try {
    const decoded = verifyRefreshToken(refreshTokenValue);
    const user = await User.findById(decoded.sub).select("+refreshToken");
    if (!user?.refreshToken) return false;

    const matches = await bcrypt.compare(refreshTokenValue, user.refreshToken);
    if (!matches) return false;

    await logoutUser(user._id);
    return true;
  } catch {
    return false;
  }
}

// refreshUserToken validates the provided refresh token, checks if it matches the stored hashed token for the user, and if valid, issues a new access and refresh token pair. It returns the user's safe object along with the new tokens.
export async function refreshUserToken(refreshToken) {
  if (!refreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  const decoded = verifyRefreshToken(refreshToken);
  const user = await User.findById(decoded.sub).select("+refreshToken");

  if (!user?.refreshToken) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const tokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
  if (!tokenMatches) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const tokens = await issueTokenPair(user);
  return { user: user.toSafeObject(), ...tokens };
}

// getCurrentUser retrieves the current user's information from the database using their user ID. If the user is not found, it throws a 404 error. It returns the user's safe object representation.
export async function getCurrentUser(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return user.toSafeObject();
}

// requestPasswordReset initiates the password reset process by generating a password reset token for the user associated with the provided email. It sends an email to the user with a link to reset their password, which includes the token as a query parameter.
export async function requestPasswordReset(email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select("+passwordResetToken +passwordResetExpires");
  if (!user) {
    return;
  }

  const token = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = buildUrl("/reset-password", token, false);
  await sendEmail({
    to: user.email,
    subject: "Reset your Devflow AI password",
    text: `Hi ${user.name},\n\nReset your Devflow AI password by visiting this link:\n${resetUrl}\n\nThis link expires in 15 minutes.\n\nIf you did not request a password reset, ignore this email.`,
    html: `<!DOCTYPE html><html><body style="font-family:Inter,sans-serif;background:#0b0f19;color:#f8fafc;padding:40px 20px;">
<div style="max-width:480px;margin:0 auto;background:#1a2235;border-radius:18px;padding:40px;border:1px solid #273244;">
<h2 style="margin:0 0 8px;font-size:24px;">Reset your password</h2>
<p style="color:#94a3b8;margin:0 0 24px;">Hi ${user.name}, we received a request to reset your Devflow AI password. Click the button below to choose a new password.</p>
<a href="${resetUrl}" style="display:inline-block;background:#3b82f6;color:#fff;text-decoration:none;padding:14px 28px;border-radius:14px;font-weight:700;">Reset Password</a>
<p style="color:#64748b;font-size:13px;margin-top:24px;">Or copy this link: ${resetUrl}</p>
<p style="color:#64748b;font-size:13px;">This link expires in 15 minutes. If you did not request this, ignore this email.</p>
</div></body></html>`
  });
}

// resetPassword validates the provided password reset token, checks if it matches the stored hashed token for the user, and if valid, updates the user's password
export async function resetPassword({ token, password }) {
  const user = await User.findOne({
    passwordResetToken: hashToken(token),
    passwordResetExpires: { $gt: Date.now() }
  }).select("+password +passwordResetToken +passwordResetExpires");

  if (!user) {
    throw new ApiError(400, "Password reset token is invalid or expired");
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshToken = undefined;
  await user.save();
}

// verifyEmail validates the provided email verification token, checks if it matches the stored hashed token for the user, and if valid, marks the user's email as verified. It returns the user's safe object representation.
export async function verifyEmail(token) {
  const user = await User.findOne({
    emailVerificationToken: hashToken(token),
    emailVerificationExpires: { $gt: Date.now() }
  }).select("+emailVerificationToken +emailVerificationExpires");

  if (!user) {
    throw new ApiError(400, "Email verification token is invalid or expired");
  }

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  return user.toSafeObject();
}

// resendVerification checks if the user with the provided email exists and is not already verified. If valid, it sends a new email verification link to the user.
export async function resendVerification(email, invitationToken = "") {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select("+emailVerificationToken +emailVerificationExpires");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isVerified) {
    throw new ApiError(400, "Email is already verified");
  }

  await sendVerificationEmail(user, invitationToken);
}

// findOrCreateOAuthUser checks if a user with the provided email exists. If not, it creates a new user with the given OAuth provider information. If the user exists, it updates their provider details and marks them as verified. It returns the user object.
export async function findOrCreateOAuthUser({ provider, providerId, email, name, avatar }) {
  let user = await User.findOne({ email: String(email || "").trim().toLowerCase() });

  if (!user) {
    user = await User.create({
      name,
      email: String(email || "").trim().toLowerCase(),
      avatar,
      provider,
      providerId,
      isVerified: true
    });
  } else {
    user.provider = user.provider === "local" ? user.provider : provider;
    user.providerId = user.providerId || providerId;
    user.avatar = user.avatar || avatar;
    user.isVerified = true;
    await user.save({ validateBeforeSave: false });
  }

  return user;
}

// completeOAuthLogin retrieves the latest user information from the database using their ID, issues a new access and refresh token pair, and returns the user's safe object along with the tokens.
export async function completeOAuthLogin(user) {
  const freshUser = await User.findById(user._id);
  const tokens = await issueTokenPair(freshUser);
  return { user: freshUser.toSafeObject(), ...tokens };
}

// startTwoFactorSetup initiates the two-factor authentication setup process for the user by generating a TOTP secret, saving it to the user's record, and returning the secret and QR code data.
export async function startTwoFactorSetup(userId) {
  const user = await User.findById(userId).select("+twoFactorSetupSecret +twoFactorSetupExpires +twoFactorEnabled");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.twoFactorEnabled) {
    throw new ApiError(400, "Two-factor authentication is already enabled");
  }

  const { secret, otpauthUrl } = createTotpSecret(user.email || user.name, "Devflow AI");
  user.twoFactorSetupSecret = encryptValue(secret);
  user.twoFactorSetupExpires = new Date(Date.now() + TWO_FACTOR_SETUP_WINDOW_MS);
  await user.save({ validateBeforeSave: false });

  const qrCode = await QRCode.toDataURL(otpauthUrl);
  return { otpauthUrl, qrCode, user: user.toSafeObject() };
}

// enableTwoFactorForUser enables two-factor authentication for the user by verifying the provided TOTP code, generating recovery codes, and updating the user's record to mark two-factor authentication as enabled.
export async function enableTwoFactorForUser(userId, code) {
  const user = await User.findById(userId).select("+twoFactorSetupSecret +twoFactorSetupExpires +twoFactorEnabled +twoFactorSecret +twoFactorRecoveryCodes +twoFactorFailedAttempts +twoFactorLockUntil");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.twoFactorEnabled) {
    throw new ApiError(400, "Two-factor authentication is already enabled");
  }

  if (!user.twoFactorSetupSecret || !user.twoFactorSetupExpires || user.twoFactorSetupExpires < new Date()) {
    throw new ApiError(401, "Two-factor setup is expired. Please generate a new QR code.");
  }

  const secret = decryptValue(user.twoFactorSetupSecret);
  if (!verifyTotpCode(secret, code)) {
    throw new ApiError(401, "Invalid verification code");
  }

  const recoveryCodes = generateRecoveryCodes();
  user.twoFactorSecret = encryptValue(secret);
  user.twoFactorRecoveryCodes = recoveryCodes.map((codeValue) => hashRecoveryCode(codeValue));
  user.twoFactorEnabled = true;
  user.twoFactorSetupSecret = undefined;
  user.twoFactorSetupExpires = undefined;
  user.twoFactorPendingTokenHash = undefined;
  user.twoFactorChallengeExpires = undefined;
  clearTwoFactorAttempts(user);
  await user.save({ validateBeforeSave: false });

  return { user: user.toSafeObject(), recoveryCodes };
}

// disableTwoFactorForUser disables two-factor authentication for the user by verifying the provided TOTP or recovery code, and updating the user's record to mark two-factor authentication as disabled.
export async function disableTwoFactorForUser(userId, { code, recoveryCode } = {}) {
  const user = await User.findById(userId).select("+twoFactorSecret +twoFactorRecoveryCodes +twoFactorEnabled +twoFactorFailedAttempts +twoFactorLockUntil");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.twoFactorEnabled) {
    throw new ApiError(400, "Two-factor authentication is not enabled");
  }

  const lockout = buildTwoFactorLockout(user);
  if (lockout.locked) {
    throw new ApiError(429, "Too many failed attempts. Please try again later.");
  }

  const secret = decryptValue(user.twoFactorSecret);
  let valid = false;

  if (code) {
    valid = verifyTotpCode(secret, code);
  }

  if (!valid && recoveryCode) {
    const normalizedRecoveryCode = String(recoveryCode).trim();
    const remaining = user.twoFactorRecoveryCodes.filter((hashedCode) => {
      const matches = verifyRecoveryCode(hashedCode, normalizedRecoveryCode);
      if (matches) {
        valid = true;
      }
      return !matches;
    });
    user.twoFactorRecoveryCodes = remaining;
  }

  if (!valid) {
    incrementTwoFactorAttempts(user);
    await user.save({ validateBeforeSave: false });
    throw new ApiError(401, "Invalid 2FA verification code");
  }

  user.twoFactorEnabled = false;
  user.twoFactorSecret = undefined;
  user.twoFactorRecoveryCodes = undefined;
  user.twoFactorPendingTokenHash = undefined;
  user.twoFactorChallengeExpires = undefined;
  clearTwoFactorAttempts(user);
  await user.save({ validateBeforeSave: false });

  return { user: user.toSafeObject() };
}

// verifyTwoFactorChallenge verifies the provided TOTP or recovery code against the user's stored two-factor secret or recovery codes. It updates the user's session and returns the new access and refresh tokens if successful.
export async function verifyTwoFactorChallenge(userId, challengeToken, { code, recoveryCode } = {}) {
  const user = await User.findById(userId).select("+twoFactorPendingTokenHash +twoFactorChallengeExpires +twoFactorEnabled +twoFactorSecret +twoFactorRecoveryCodes +twoFactorFailedAttempts +twoFactorLockUntil +refreshToken");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.twoFactorEnabled) {
    throw new ApiError(400, "Two-factor authentication is not enabled for this user");
  }

  const lockout = buildTwoFactorLockout(user);
  if (lockout.locked) {
    throw new ApiError(429, "Too many failed attempts. Please try again later.");
  }

  if (!user.twoFactorPendingTokenHash || !user.twoFactorChallengeExpires || user.twoFactorChallengeExpires < new Date()) {
    throw new ApiError(401, "Two-factor challenge expired or invalid");
  }

  if (hashToken(challengeToken) !== user.twoFactorPendingTokenHash) {
    incrementTwoFactorAttempts(user);
    await user.save({ validateBeforeSave: false });
    throw new ApiError(401, "Invalid two-factor challenge");
  }

  let isValid = false;
  if (code) {
    const secret = decryptValue(user.twoFactorSecret);
    isValid = verifyTotpCode(secret, code);
  }

  if (!isValid && recoveryCode) {
    const normalizedRecoveryCode = String(recoveryCode).trim();
    const remaining = (user.twoFactorRecoveryCodes || []).filter((hashedCode) => {
      const matches = verifyRecoveryCode(hashedCode, normalizedRecoveryCode);
      if (matches) {
        isValid = true;
      }
      return !matches;
    });
    user.twoFactorRecoveryCodes = remaining;
  }

  if (!isValid) {
    incrementTwoFactorAttempts(user);
    await user.save({ validateBeforeSave: false });
    throw new ApiError(401, "Invalid two-factor verification code");
  }

  clearTwoFactorAttempts(user);
  user.twoFactorPendingTokenHash = undefined;
  user.twoFactorChallengeExpires = undefined;
  await user.save({ validateBeforeSave: false });

  const tokens = await issueTokenPair(user);
  return { user: user.toSafeObject(), ...tokens };
}
