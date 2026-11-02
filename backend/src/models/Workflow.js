import mongoose from "mongoose";

const workflowSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true
    },
    status: {
      type: String,
      enum: ["draft", "active", "paused", "archived"],
      default: "draft"
    },
    trigger: {
      type: {
        type: String,
        enum: ["manual", "internal", "github"],
        default: "manual"
      },
      event: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120
      },
      configuration: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      },
      enabled: {
        type: Boolean,
        default: true
      }
    },
    conditions: {
      type: [
        {
          field: { type: String, trim: true, maxlength: 80 },
          operator: {
            type: String,
            enum: ["equals", "not_equals", "contains", "does_not_contain", "greater_than", "less_than", "exists", "does_not_exist"]
          },
          value: mongoose.Schema.Types.Mixed,
          logic: {
            type: String,
            enum: ["AND", "OR"],
            default: "AND"
          }
        }
      ],
      default: []
    },
    actions: {
      type: [
        {
          name: { type: String, required: true, trim: true, maxlength: 120 },
          type: {
            type: String,
            required: true,
            trim: true,
            maxlength: 80
          },
          configuration: { type: mongoose.Schema.Types.Mixed, default: {} },
          enabled: { type: Boolean, default: true },
          timeout: { type: Number, default: 60000, min: 1000, max: 300000 }
        }
      ],
      default: []
    },
    executionSettings: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        timeoutMs: 60000,
        maxActions: 10,
        stopOnFailure: true
      }
    },
    lastRunAt: {
      type: Date,
      default: null
    },
    nextRunAt: {
      type: Date,
      default: null
    },
    totalRuns: {
      type: Number,
      default: 0
    },
    successfulRuns: {
      type: Number,
      default: 0
    },
    failedRuns: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

workflowSchema.index({ workspace: 1, status: 1, updatedAt: -1 });
workflowSchema.index({ workspace: 1, createdBy: 1, updatedAt: -1 });
workflowSchema.index({ project: 1, status: 1, updatedAt: -1 });
workflowSchema.index({ createdBy: 1, updatedAt: -1 });

const Workflow = mongoose.model("Workflow", workflowSchema);

export default Workflow;
