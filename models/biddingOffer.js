const mongoose = require("mongoose");

const biddingOfferSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  itemCondition: {
    type: String,
    enum: ["New", "Used", "New with Defects"],
    default: "New",
  },
  selectedAttributeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AttributeOption",
    required: true,
  },
  offeredPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Accepted", "Rejected", "End"],
    default: "Pending",
  },
  offerCreateDate: {
    type: Date,
    default: Date.now,
  },
  validUntil: {
    type: Date,
    required: true,
  },
});

biddingOfferSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

biddingOfferSchema.set("toJSON", {
  virtuals: true,
});

exports.BiddingOffer = mongoose.model("BiddingOffer", biddingOfferSchema);
