import mongoose from "mongoose";

const taskCommentSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 4000
    }
  },
  {
    timestamps: true
  }
);

taskCommentSchema.index({ task: 1, createdAt: -1 });
taskCommentSchema.index({ project: 1, createdAt: -1 });

const TaskComment = mongoose.model("TaskComment", taskCommentSchema);

export default TaskComment;
