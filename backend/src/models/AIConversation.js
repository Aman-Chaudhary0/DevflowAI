import mongoose from "mongoose";

const aiConversationSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, trim: true, required: true, maxlength: 120, default: "New chat" },
  model: { type: String, required: true },
  pinned: { type: Boolean, default: false }
}, { timestamps: true });

aiConversationSchema.index({ owner: 1, updatedAt: -1 });

export const AIConversation = mongoose.model("AIConversation", aiConversationSchema);
export default AIConversation;
