import GitHubStrategyPackage from "passport-github2";
import GoogleStrategyPackage from "passport-google-oauth20";
import { findOrCreateOAuthUser } from "../services/auth/auth.service.js";

const GoogleStrategy = GoogleStrategyPackage.Strategy;
const GitHubStrategy = GitHubStrategyPackage.Strategy;

export function configurePassport(passport) {
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback"
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
              return done(new Error("Google account has no email"));
            }

            const user = await findOrCreateOAuthUser({
              provider: "google",
              providerId: profile.id,
              email,
              name: profile.displayName || email.split("@")[0],
              avatar: profile.photos?.[0]?.value || ""
            });

            done(null, user);
          } catch (error) {
            done(error);
          }
        }
      )
    );
  }

  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          callbackURL: process.env.GITHUB_CALLBACK_URL || "http://localhost:5000/api/auth/github/callback"
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
              return done(new Error("GitHub account has no public email"));
            }

            const user = await findOrCreateOAuthUser({
              provider: "github",
              providerId: profile.id,
              email,
              name: profile.displayName || profile.username || email.split("@")[0],
              avatar: profile.photos?.[0]?.value || ""
            });

            done(null, user);
          } catch (error) {
            done(error);
          }
        }
      )
    );
  }
}
