const mongoose = require("mongoose");

const attributeOptionSchema = mongoose.Schema({
  attributeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Attribute",
    required: true,
  },
  optionName: {
    type: String,
    required: true,
  },
});

attributeOptionSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

attributeOptionSchema.set("toJSON", {
  virtuals: true,
});

exports.AttributeOption = mongoose.model(
  "AttributeOption",
  attributeOptionSchema
);
