import mongoose from "mongoose";

const playgroundSchema = new mongoose.Schema(
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
    html: {
      type: String,
      default: "",
      maxlength: 102400 // 100 KB per source
    },
    css: {
      type: String,
      default: "",
      maxlength: 102400
    },
    javascript: {
      type: String,
      default: "",
      maxlength: 102400
    }
  },
  { timestamps: true }
);

playgroundSchema.index({ owner: 1, createdAt: -1 });

const Playground = mongoose.model("Playground", playgroundSchema);
export default Playground;
