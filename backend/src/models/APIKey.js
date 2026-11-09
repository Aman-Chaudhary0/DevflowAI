import mongoose from "mongoose";

const apiKeySchema = new mongoose.Schema(
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
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 255
    },
    keyPrefix: {
      type: String,
      required: true,
      enum: ["df_test", "df_live"],
      index: true
    },
    keyHash: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    keyLastFour: {
      type: String,
      required: true
    },
    environment: {
      type: String,
      required: true,
      enum: ["test", "live"],
      default: "test"
    },
    permissions: {
      type: [String],
      default: [],
      enum: [
        "projects:read",
        "projects:write",
        "files:read",
        "files:write",
        "tasks:read",
        "tasks:write",
        "ai:read",
        "ai:execute"
      ]
    },
    status: {
      type: String,
      enum: ["active", "revoked", "expired"],
      default: "active",
      index: true
    },
    expiresAt: {
      type: Date,
      sparse: true,
      index: true
    },
    lastUsedAt: {
      type: Date,
      sparse: true
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0
    },
    revokedAt: {
      type: Date,
      sparse: true
    }
  },
  {
    timestamps: true,
    indexes: [
      { owner: 1, createdAt: -1 },
      { owner: 1, status: 1, createdAt: -1 },
      { keyHash: 1 },
      { keyPrefix: 1, keyLastFour: 1 }
    ]
  }
);

export default mongoose.model("APIKey", apiKeySchema);
