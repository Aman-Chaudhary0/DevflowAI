import mongoose from "mongoose";

const workspaceMemberSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    role: {
      type: String,
      enum: ["owner", "admin", "member", "viewer"],
      default: "member"
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ["active", "pending", "invited", "blocked"],
      default: "active"
    }
  },
  {
    timestamps: true
  }
);

workspaceMemberSchema.index({ workspace: 1, user: 1 }, { unique: true });
workspaceMemberSchema.index({ user: 1, workspace: 1 });
workspaceMemberSchema.index({ workspace: 1, role: 1 });

const WorkspaceMember = mongoose.model("WorkspaceMember", workspaceMemberSchema);

export default WorkspaceMember;
