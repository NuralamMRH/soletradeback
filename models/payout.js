const mongoose = require("mongoose");

const payoutSchema = mongoose.Schema({
  payoutItems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PayoutMoney",
      required: true,
    },
  ],
  totalPrice: {
    type: Number,
  },

  payoutMethod: {
    type: String,
    required: true,
  },
  payoutStatus: {
    type: String,
    enum: ["Pending", "Paid"],
    default: "Pending",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  payoutCreateAt: {
    type: Date,
    default: Date.now,
  },
});

payoutSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

payoutSchema.set("toJSON", {
  virtuals: true,
});

exports.PayOut = mongoose.model("PayOut", payoutSchema);
