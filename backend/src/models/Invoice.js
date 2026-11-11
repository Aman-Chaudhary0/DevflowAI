import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
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
      required: true,
      index: true
    },
    provider: {
      type: String,
      enum: ["razorpay"],
      required: true
    },
    providerInvoiceId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    invoiceNumber: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: "INR"
    },
    subtotal: {
      type: Number,
      required: true
    },
    tax: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["draft", "open", "paid", "failed", "void", "refunded"],
      default: "open"
    },
    billingPeriodStart: {
      type: Date,
      required: true
    },
    billingPeriodEnd: {
      type: Date,
      required: true
    },
    paidAt: {
      type: Date,
      default: null
    },
    dueAt: {
      type: Date,
      default: null
    },
    invoiceUrl: {
      type: String,
      default: null
    },
    receiptUrl: {
      type: String,
      default: null
    },
    description: {
      type: String,
      default: ""
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

invoiceSchema.index({ workspace: 1, createdAt: -1 });
invoiceSchema.index({ subscription: 1, status: 1 });
invoiceSchema.index({ provider: 1, providerInvoiceId: 1 });

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;
