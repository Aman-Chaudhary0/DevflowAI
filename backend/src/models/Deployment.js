import mongoose from "mongoose";

const deploymentLogSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now },
    level: {
      type: String,
      enum: ["info", "warn", "error", "debug"],
      default: "info"
    },
    source: {
      type: String,
      enum: ["provider", "worker", "system"],
      default: "provider"
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000
    }
  },
  { _id: false }
);

const deploymentSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true
    },
    repository: {
      provider: {
        type: String,
        enum: ["github", "gitlab", "bitbucket", "none"],
        default: "github"
      },
      name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
      },
      url: {
        type: String,
        default: "",
        trim: true,
        maxlength: 500
      }
    },
    provider: {
      type: String,
      enum: ["vercel"],
      default: "vercel",
      index: true
    },
    providerProjectId: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200
    },
    providerDeploymentId: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200
    },
    deploymentUrl: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500
    },
    environment: {
      type: String,
      enum: ["production", "preview", "development"],
      default: "preview",
      index: true
    },
    branch: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    commitSha: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100
    },
    commitMessage: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000
    },
    status: {
      type: String,
      enum: ["queued", "initializing", "building", "deploying", "ready", "failed", "cancelled"],
      default: "queued",
      index: true
    },
    buildStatus: {
      type: String,
      enum: ["pending", "running", "success", "failed", "cancelled"],
      default: "pending"
    },
    buildStartedAt: {
      type: Date,
      default: null
    },
    buildCompletedAt: {
      type: Date,
      default: null
    },
    duration: {
      type: Number,
      default: 0,
      min: 0
    },
    logs: {
      type: [deploymentLogSchema],
      default: []
    },
    lastLogCursor: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200
    },
    sourceDeployment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deployment",
      default: null,
      index: true
    },
    rollbackFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deployment",
      default: null,
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    deploymentConfiguration: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    error: {
      type: String,
      default: "",
      maxlength: 2000
    }
  },
  {
    timestamps: true
  }
);

deploymentSchema.index({ workspace: 1, createdAt: -1 });
deploymentSchema.index({ project: 1, environment: 1, createdAt: -1 });
deploymentSchema.index({ project: 1, status: 1, createdAt: -1 });
deploymentSchema.index({ provider: 1, providerDeploymentId: 1 }, { unique: false });

const Deployment = mongoose.models.Deployment || mongoose.model("Deployment", deploymentSchema);

export default Deployment;
