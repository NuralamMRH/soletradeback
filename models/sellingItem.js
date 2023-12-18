const mongoose = require("mongoose");

const sellingSchema = mongoose.Schema({
  sellerId: {
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
  sellingPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Accepted", "Rejected"],
    default: "Pending",
  },
  sellingAt: {
    type: Date,
    default: Date.now,
  },
});

sellingSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

sellingSchema.set("toJSON", {
  virtuals: true,
});

exports.SellingItem = mongoose.model("SellingItem", sellingSchema);
