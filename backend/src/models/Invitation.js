import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema({
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null, index: true },
  scope: { type: String, enum: ["workspace", "project"], required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  inviter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, enum: ["admin", "member", "viewer", "editor"], required: true },
  tokenHash: { type: String, required: true, unique: true, select: false },
  status: { type: String, enum: ["pending", "accepted", "revoked", "expired", "declined"], default: "pending", index: true },
  expiresAt: { type: Date, required: true, index: true },
  acceptedAt: { type: Date, default: null },
  acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  message: { type: String, default: "", maxlength: 1000 }
}, { timestamps: true });

invitationSchema.index({ scope: 1, workspace: 1, project: 1, email: 1 }, { unique: true, partialFilterExpression: { status: "pending" } });

export default mongoose.models.Invitation || mongoose.model("Invitation", invitationSchema);
