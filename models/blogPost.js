const mongoose = require("mongoose");

const blogSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  richDescription: {
    type: String,
    default: "",
  },
  image: {
    type: String,
    default: "",
  },
  images: [
    {
      type: String,
    },
  ],
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

blogSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

blogSchema.set("toJSON", {
  virtuals: true,
});

exports.BlogPost = mongoose.model("BlogPost", blogSchema);
