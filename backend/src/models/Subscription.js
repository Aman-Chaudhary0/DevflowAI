import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      unique: true,
      index: true
    },
    plan: {
      type: String,
      enum: ["free", "pro", "team"],
      required: true
    },
    provider: {
      type: String,
      enum: ["razorpay"],
      required: true
    },
    providerCustomerId: {
      type: String,
      required: true,
      index: true
    },
    providerSubscriptionId: {
      type: String,
      default: null,
      index: true
    },
    status: {
      type: String,
      enum: ["incomplete", "trialing", "active", "past_due", "canceled", "unpaid", "expired"],
      default: "incomplete"
    },
    billingInterval: {
      type: String,
      enum: ["monthly"],
      default: "monthly"
    },
    currency: {
      type: String,
      default: "INR"
    },
    amount: {
      type: Number,
      required: true
    },
    currentPeriodStart: {
      type: Date,
      default: null
    },
    currentPeriodEnd: {
      type: Date,
      default: null
    },
    trialStart: {
      type: Date,
      default: null
    },
    trialEnd: {
      type: Date,
      default: null
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false
    },
    canceledAt: {
      type: Date,
      default: null
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    endedAt: {
      type: Date,
      default: null
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

subscriptionSchema.index({ workspace: 1, status: 1 });
subscriptionSchema.index({ provider: 1, providerCustomerId: 1 });
subscriptionSchema.index({ provider: 1, providerSubscriptionId: 1 });

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
