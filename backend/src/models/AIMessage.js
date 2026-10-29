import mongoose from "mongoose";

const aiMessageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: "AIConversation", required: true },
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true, maxlength: 20000 },
  model: { type: String, default: null },
  requestId: { type: String, default: null },
  parentMessage: { type: mongoose.Schema.Types.ObjectId, ref: "AIMessage", default: null }
}, { timestamps: { createdAt: true, updatedAt: false } });

aiMessageSchema.index({ conversation: 1, createdAt: 1, _id: 1 });
aiMessageSchema.index({ conversation: 1, requestId: 1 }, { unique: true, partialFilterExpression: { role: "user", requestId: { $type: "string" } } });

export const AIMessage = mongoose.model("AIMessage", aiMessageSchema);
export default AIMessage;
