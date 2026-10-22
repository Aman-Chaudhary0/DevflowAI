import mongoose from "mongoose";

const projectFileSchema = new mongoose.Schema(
  {
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
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255
    },
    storageKey: {
      type: String,
      required: true,
      trim: true,
      maxlength: 512
    },
    storageProvider: {
      type: String,
      enum: ["local", "imagekit", "s3", "google-drive"],
      default: "imagekit"
    },
    url: {
      type: String,
      default: ""
    },
    mimeType: {
      type: String,
      default: "application/octet-stream",
      maxlength: 200
    },
    size: {
      type: Number,
      min: 0,
      max: 500 * 1024 * 1024,
      default: 0
    },
    folder: {
      type: String,
      default: "/",
      maxlength: 500
    }
  },
  {
    timestamps: true
  }
);

projectFileSchema.index({ project: 1, createdAt: -1 });
projectFileSchema.index({ workspace: 1, project: 1, createdAt: -1 });

const ProjectFile = mongoose.model("ProjectFile", projectFileSchema);

export default ProjectFile;
