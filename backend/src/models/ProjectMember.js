import mongoose from "mongoose";

const projectMemberSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
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
      enum: ["owner", "admin", "editor", "viewer"],
      default: "viewer"
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

projectMemberSchema.index({ project: 1, user: 1 }, { unique: true });
projectMemberSchema.index({ user: 1, project: 1 });
projectMemberSchema.index({ project: 1, role: 1 });

const ProjectMember = mongoose.model("ProjectMember", projectMemberSchema);

export default ProjectMember;
