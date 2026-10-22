import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
      index: true
    },
    entityType: {
      type: String,
      enum: ["workspace", "project", "task", "document", "file", "user"],
      required: true
    },
    entityId: {
      type: String,
      default: "",
      trim: true,
      maxlength: 128
    },
    action: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

activitySchema.index({ workspace: 1, createdAt: -1 });
activitySchema.index({ project: 1, createdAt: -1 });
activitySchema.index({ actor: 1, createdAt: -1 });

const Activity = mongoose.model("Activity", activitySchema);

export default Activity;
