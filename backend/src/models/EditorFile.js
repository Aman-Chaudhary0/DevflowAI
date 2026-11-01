import mongoose from "mongoose";

const editorFileSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 255
    },
    path: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    language: {
      type: String,
      trim: true,
      maxlength: 50,
      default: "plaintext"
    },
    content: {
      type: String,
      default: "",
      maxlength: 102400 // 100 KB
    }
  },
  { timestamps: true }
);

// Unique path per owner (project-scoped or personal)
editorFileSchema.index({ owner: 1, project: 1, path: 1 }, { unique: true });
editorFileSchema.index({ owner: 1, createdAt: -1 });

const EditorFile = mongoose.model("EditorFile", editorFileSchema);
export default EditorFile;
