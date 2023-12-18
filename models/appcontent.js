const mongoose = require("mongoose");

const appContentSchema = mongoose.Schema({
  appLogo: {
    type: String,
    default: "",
  },
  homeSlider: [
    {
      type: String,
    },
  ],
});

appContentSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

appContentSchema.set("toJSON", {
  virtuals: true,
});

exports.AppContent = mongoose.model("AppContent", appContentSchema);
