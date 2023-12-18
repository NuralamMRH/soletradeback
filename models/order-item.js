const mongoose = require("mongoose");

const orderItemSchema = mongoose.Schema({
  quantity: {
    type: Number,
    default: 1,
  },
  biddingOfferId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BiddingOffer",
    required: true,
  },
});

exports.OrderItem = mongoose.model("OrderItem", orderItemSchema);
