import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 200
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 5000
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true
    },
    status: {
      type: String,
      enum: ["todo", "in_progress", "review", "blocked", "done"],
      default: "todo"
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium"
    },
    dueDate: {
      type: Date,
      default: null
    },
    labels: {
      type: [String],
      default: [],
      validate: {
        validator: (value) => value.every((label) => label.length <= 40),
        message: "Task labels must be 40 characters or fewer"
      }
    },
    position: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

taskSchema.index({ project: 1, status: 1, position: 1 });
taskSchema.index({ project: 1, dueDate: 1 });
taskSchema.index({ assignee: 1, status: 1, dueDate: 1 });

taskSchema.index({ workspace: 1, updatedAt: -1 });

const Task = mongoose.model("Task", taskSchema);

export default Task;
