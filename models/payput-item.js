const mongoose = require("mongoose");

const payoutMoneySchema = mongoose.Schema({
  quantity: {
    type: Number,
    default: 1,
  },
  sellingItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SellingItem",
    required: true,
  },
});

exports.PayoutMoney = mongoose.model("PayoutMoney", payoutMoneySchema);
