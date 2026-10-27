import mongoose from "mongoose";

const integrationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
  githubUserId: { type: String, required: true },
  login: { type: String, required: true },
  avatarUrl: { type: String, default: "" },
  tokenCiphertext: { type: String, required: true, select: false },
  tokenIv: { type: String, required: true, select: false },
  tokenTag: { type: String, required: true, select: false },
  refreshCiphertext: { type: String, default: "", select: false },
  refreshIv: { type: String, default: "", select: false },
  refreshTag: { type: String, default: "", select: false },
  tokenExpiresAt: { type: Date, default: null },
  scopes: { type: [String], default: [] },
  repositories: { type: [mongoose.Schema.Types.Mixed], default: [] },
  connectedAt: { type: Date, default: Date.now },
  lastSyncedAt: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.models.GitHubIntegration || mongoose.model("GitHubIntegration", integrationSchema);
