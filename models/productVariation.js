const mongoose = require("mongoose");

const productVariationSchema = mongoose.Schema({
  attributeOption: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AttributeOption",
    required: true,
  },
  basePrice: {
    type: Number,
    default: 0,
  },
});

productVariationSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

productVariationSchema.set("toJSON", {
  virtuals: true,
});
