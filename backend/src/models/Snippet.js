import mongoose from "mongoose";

const snippetSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      default: null,
      index: true
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 200
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ""
    },
    code: {
      type: String,
      required: true,
      maxlength: 51200 // 50 KB
    },
    language: {
      type: String,
      trim: true,
      maxlength: 50,
      default: "javascript"
    },
    framework: {
      type: String,
      trim: true,
      maxlength: 80,
      default: ""
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 20 && arr.every((t) => t.length <= 50),
        message: "Too many tags or tag too long"
      }
    },
    isFavorite: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

snippetSchema.index({ owner: 1, createdAt: -1 });
snippetSchema.index({ owner: 1, language: 1, createdAt: -1 });
snippetSchema.index({ owner: 1, isFavorite: 1, createdAt: -1 });

const Snippet = mongoose.model("Snippet", snippetSchema);
export default Snippet;
