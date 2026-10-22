import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema(
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
      unique: true,
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
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    avatar: {
      type: String,
      default: ""
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

workspaceSchema.index({ owner: 1, updatedAt: -1 });

const Workspace = mongoose.model("Workspace", workspaceSchema);

export default Workspace;
