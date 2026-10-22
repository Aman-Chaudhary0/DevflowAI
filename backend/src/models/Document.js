import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 200
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 1,
      maxlength: 120,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    },
    content: {
      type: String,
      required: true,
      default: "",
      maxlength: 500000
    },
    contentFormat: {
      type: String,
      enum: ["markdown", "plaintext"],
      default: "markdown"
    },
    visibility: {
      type: String,
      enum: ["private", "workspace", "public"],
      default: "workspace"
    }
  },
  {
    timestamps: true
  }
);

documentSchema.index({ project: 1, slug: 1 }, { unique: true });
documentSchema.index({ project: 1, updatedAt: -1 });

documentSchema.index({ workspace: 1, updatedAt: -1 });

const Document = mongoose.model("Document", documentSchema);

export default Document;
