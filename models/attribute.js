const mongoose = require("mongoose");

const attributeSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

attributeSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

attributeSchema.set("toJSON", {
  virtuals: true,
});

exports.Attribute = mongoose.model("Attribute", attributeSchema);
