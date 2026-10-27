import mongoose from "mongoose";

const schema = new mongoose.Schema({
  stateHash: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  verifier: { type: String, required: true },
  expiresAt: { type: Date, required: true, expires: 0 }
}, { timestamps: true });

export default mongoose.models.GitHubOAuthState || mongoose.model("GitHubOAuthState", schema);
