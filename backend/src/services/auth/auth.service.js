import bcrypt from "bcryptjs";
import crypto from "crypto";
import { User } from "../../models/User.js";
import { ApiError } from "../../utils/ApiError.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/generateToken.js";
import { sendEmail } from "../../utils/sendEmail.js";

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function issueTokenPair(user) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  user.refreshToken = await bcrypt.hash(refreshToken, 12);
  await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
}

function buildUrl(path, token) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  return `${frontendUrl}${path}?token=${token}`;
}

async function sendVerificationEmail(user) {
  const token = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  const verificationUrl = buildUrl("/verify-email", token);
  await sendEmail({
    to: user.email,
    subject: "Verify your Devflow AI email",
    text: `Verify your email: ${verificationUrl}`,
    html: `<p>Verify your Devflow AI account:</p><p><a href="${verificationUrl}">Verify email</a></p>`
  });
}

export async function registerUser({ name, email, password }) {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "Email is already registered");
  }

  const user = await User.create({ name, email, password });
  await sendVerificationEmail(user);
  const tokens = await issueTokenPair(user);

  return { user: user.toSafeObject(), ...tokens };
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email }).select("+password +refreshToken");
  if (!user || !user.password) {
    throw new ApiError(401, "Invalid email or password");
  }

  const passwordMatches = await user.comparePassword(password);
  if (!passwordMatches) {
    throw new ApiError(401, "Invalid email or password");
  }

  const tokens = await issueTokenPair(user);
  return { user: user.toSafeObject(), ...tokens };
}

export async function logoutUser(userId) {
  await User.findByIdAndUpdate(userId, { $unset: { refreshToken: "" } });
}

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

export async function getCurrentUser(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return user.toSafeObject();
}

export async function requestPasswordReset(email) {
  const user = await User.findOne({ email }).select("+passwordResetToken +passwordResetExpires");
  if (!user) {
    return;
  }

  const token = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = buildUrl("/reset-password", token);
  await sendEmail({
    to: user.email,
    subject: "Reset your Devflow AI password",
    text: `Reset your password: ${resetUrl}`,
    html: `<p>Reset your Devflow AI password:</p><p><a href="${resetUrl}">Reset password</a></p>`
  });
}

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

export async function resendVerification(email) {
  const user = await User.findOne({ email }).select("+emailVerificationToken +emailVerificationExpires");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isVerified) {
    throw new ApiError(400, "Email is already verified");
  }

  await sendVerificationEmail(user);
}

export async function findOrCreateOAuthUser({ provider, providerId, email, name, avatar }) {
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name,
      email,
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

export async function completeOAuthLogin(user) {
  const freshUser = await User.findById(user._id);
  const tokens = await issueTokenPair(freshUser);
  return { user: freshUser.toSafeObject(), ...tokens };
}
