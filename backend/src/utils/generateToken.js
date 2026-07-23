import jwt from "jsonwebtoken";

//  generateAccessToken creates a JWT access token for a user with a specified expiry time.
export function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m"
    }
  );
}

// generateRefreshToken creates a JWT refresh token for a user with a specified expiry time.
export function generateRefreshToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString()
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d"
    }
  );
}

// verifyAccessToken verifies the validity of a given JWT access token using the secret key.
export function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

// verifyRefreshToken verifies the validity of a given JWT refresh token using the secret key.
export function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}
