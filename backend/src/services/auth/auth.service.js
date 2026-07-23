import bcrypt from "bcryptjs";
import crypto from "crypto";
import { User } from "../../models/User.js";
import { ApiError } from "../../utils/ApiError.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/generateToken.js";
import { sendEmail } from "../../utils/sendEmail.js";

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

// buildUrl constructs a URL for the frontend application by appending a specified path and token as query parameters. 
function buildUrl(path, token) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  return `${frontendUrl}${path}?token=${token}`;
}

//  sendVerificationEmail sends an email to the user with a verification link containing a unique token for email verification.
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

// registerUser handles the user registration process. It checks for existing users, creates a new user, sends a verification email, and issues an access and refresh token pair. 
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

// loginUser authenticates a user by verifying their email and password. If successful, it issues a new access and refresh token pair and returns the user's safe object along with the tokens.
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

// logoutUser removes the refresh token from the user's record in the database, effectively logging the user out by invalidating their session.
export async function logoutUser(userId) {
  await User.findByIdAndUpdate(userId, { $unset: { refreshToken: "" } });
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

// findOrCreateOAuthUser checks if a user with the provided email exists. If not, it creates a new user with the given OAuth provider information. If the user exists, it updates their provider details and marks them as verified. It returns the user object.
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

// completeOAuthLogin retrieves the latest user information from the database using their ID, issues a new access and refresh token pair, and returns the user's safe object along with the tokens.
export async function completeOAuthLogin(user) {
  const freshUser = await User.findById(user._id);
  const tokens = await issueTokenPair(freshUser);
  return { user: freshUser.toSafeObject(), ...tokens };
}
