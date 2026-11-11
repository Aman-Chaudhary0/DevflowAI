import mongoose from "mongoose";

const webhookEventSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ["razorpay"],
      required: true
    },
    eventId: {
      type: String,
      required: true
    },
    eventType: {
      type: String,
      required: true
    },
    processingStatus: {
      type: String,
      enum: ["pending", "processed", "failed"],
      default: "pending"
    },
    receivedAt: {
      type: Date,
      default: Date.now
    },
    processedAt: {
      type: Date,
      default: null
    },
    errorMessage: {
      type: String,
      default: null
    },
    payloadReference: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

webhookEventSchema.index({ provider: 1, eventId: 1 }, { unique: true });
webhookEventSchema.index({ processingStatus: 1, createdAt: -1 });

const WebhookEvent = mongoose.model("WebhookEvent", webhookEventSchema);

export default WebhookEvent;
