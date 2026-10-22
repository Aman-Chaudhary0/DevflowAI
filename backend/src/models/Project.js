import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 2,
      maxlength: 80,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ["active", "planning", "archived", "completed"],
      default: "active"
    },
    visibility: {
      type: String,
      enum: ["private", "internal", "public"],
      default: "private"
    },
    repository: {
      provider: {
        type: String,
        enum: ["none", "github", "gitlab", "bitbucket"],
        default: "none"
      },
      name: {
        type: String,
        default: ""
      },
      url: {
        type: String,
        default: ""
      },
      defaultBranch: {
        type: String,
        default: "main"
      }
    },
    settings: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

projectSchema.index({ workspace: 1, slug: 1 }, { unique: true });
projectSchema.index({ workspace: 1, status: 1, updatedAt: -1 });
projectSchema.index({ owner: 1, updatedAt: -1 });

const Project = mongoose.model("Project", projectSchema);

export default Project;
