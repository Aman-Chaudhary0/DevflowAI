import mongoose from "mongoose";

const TOOLS = ["chat", "code-generator", "code-review", "documentation", "bug-fixer", "backend-generator", "sql-generator"];
const STATUSES = ["pending", "processing", "completed", "failed", "cancelled"];

const aiExecutionSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: "AIConversation", default: null },
    message: { type: mongoose.Schema.Types.ObjectId, ref: "AIMessage", default: null },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },
    tool: { type: String, enum: TOOLS, required: true },
    provider: { type: String, default: null },
    model: { type: String, default: null },
    status: { type: String, enum: STATUSES, required: true, default: "pending" },
    inputTokens: { type: Number, min: 0, default: null },
    outputTokens: { type: Number, min: 0, default: null },
    totalTokens: { type: Number, min: 0, default: null },
    usageSource: { type: String, enum: ["provider", "unavailable"], default: "unavailable" },
    requestDurationMs: { type: Number, min: 0, default: null },
    errorCode: { type: String, default: null },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

// Pagination-friendly indexes
aiExecutionSchema.index({ owner: 1, createdAt: -1 });
aiExecutionSchema.index({ owner: 1, tool: 1, createdAt: -1 });
aiExecutionSchema.index({ owner: 1, status: 1, createdAt: -1 });
aiExecutionSchema.index({ project: 1, createdAt: -1 }, { sparse: true });
aiExecutionSchema.index({ conversation: 1, createdAt: -1 }, { sparse: true });

export const AIExecution = mongoose.model("AIExecution", aiExecutionSchema);
export default AIExecution;
