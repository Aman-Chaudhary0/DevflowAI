import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      default: null
    },
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      default: null
    },
    provider: {
      type: String,
      enum: ["razorpay"],
      required: true
    },
    providerPaymentId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    providerOrderId: {
      type: String,
      default: null,
      index: true
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: "INR"
    },
    status: {
      type: String,
      enum: ["pending", "captured", "failed", "refunded"],
      default: "pending"
    },
    methodType: {
      type: String,
      default: null
    },
    failureCode: {
      type: String,
      default: null
    },
    failureMessage: {
      type: String,
      default: null
    },
    paidAt: {
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

paymentSchema.index({ workspace: 1, createdAt: -1 });
paymentSchema.index({ subscription: 1, status: 1 });
paymentSchema.index({ provider: 1, providerPaymentId: 1 });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
