import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
  type: { type: String, enum: ["Bug Report", "Feature Request", "Improvement", "General Feedback"], required: true },
  title: { type: String, required: true, trim: true, minlength: 3, maxlength: 160 },
  description: { type: String, required: true, trim: true, minlength: 10, maxlength: 5000 },
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  feature: { type: String, trim: true, maxlength: 80, default: "Other" },
  satisfaction: { type: Number, min: 0, max: 4, default: null },
  status: { type: String, enum: ["received", "reviewing", "planned", "resolved", "closed"], default: "received", index: true }
}, { timestamps: true });

feedbackSchema.index({ createdBy: 1, createdAt: -1 });

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;
