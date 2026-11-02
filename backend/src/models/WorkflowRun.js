import mongoose from "mongoose";

const workflowRunSchema = new mongoose.Schema(
  {
    workflow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workflow",
      required: true,
      index: true
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
      index: true
    },
    triggeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true
    },
    triggerType: {
      type: String,
      enum: ["manual", "manual_test", "retry", "internal", "github"],
      default: "manual"
    },
    triggerPayload: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    status: {
      type: String,
      enum: ["pending", "running", "success", "failed", "cancelled"],
      default: "pending"
    },
    startedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    duration: {
      type: Number,
      default: 0
    },
    conditionResults: {
      type: [
        {
          field: String,
          operator: String,
          passed: Boolean,
          expected: mongoose.Schema.Types.Mixed,
          actual: mongoose.Schema.Types.Mixed,
          reason: String
        }
      ],
      default: []
    },
    actionResults: {
      type: [
        {
          actionName: String,
          actionType: String,
          status: String,
          startedAt: Date,
          completedAt: Date,
          result: mongoose.Schema.Types.Mixed,
          error: String
        }
      ],
      default: []
    },
    logs: {
      type: [
        {
          timestamp: Date,
          step: String,
          message: String,
          status: String
        }
      ],
      default: []
    },
    error: {
      type: String,
      default: ""
    },
    idempotencyKey: {
      type: String,
      default: "",
      maxlength: 200
    },
    attemptNumber: {
      type: Number,
      default: 1,
      min: 1
    }
  },
  {
    timestamps: true
  }
);

workflowRunSchema.index({ workflow: 1, createdAt: -1 });
workflowRunSchema.index({ workspace: 1, project: 1, createdAt: -1 });
workflowRunSchema.index({ workflow: 1, idempotencyKey: 1 }, { unique: false });
workflowRunSchema.index({ status: 1, createdAt: -1 });

const WorkflowRun = mongoose.model("WorkflowRun", workflowRunSchema);

export default WorkflowRun;
