import mongoose from "mongoose";

const integrationSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      sparse: true,
      index: true
    },
    provider: {
      type: String,
      required: true,
      enum: [
        "github",
        "slack",
        "discord",
        "vercel",
        "openai",
        "gemini",
        "google",
        "imagekit",
        "docker",
        "mongodb",
        "redis",
        "figma"
      ],
      index: true
    },
    status: {
      type: String,
      enum: ["connected", "disconnected", "error", "pending"],
      default: "pending",
      index: true
    },
    encryptedCredentials: {
      type: String,
      sparse: true
    },
    scopes: {
      type: [String],
      default: []
    },
    externalAccountId: {
      type: String,
      sparse: true
    },
    externalAccountName: {
      type: String,
      sparse: true
    },
    connectedAt: {
      type: Date,
      sparse: true
    },
    lastSyncedAt: {
      type: Date,
      sparse: true
    },
    lastError: {
      type: String,
      sparse: true
    },
    settings: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true,
    indexes: [
      { owner: 1, provider: 1 },
      { owner: 1, createdAt: -1 },
      { workspaceId: 1, provider: 1 },
      { provider: 1, status: 1 }
    ]
  }
);

// Ensure one integration per user per provider
integrationSchema.index({ owner: 1, provider: 1 }, { unique: true });

export default mongoose.model("Integration", integrationSchema);
