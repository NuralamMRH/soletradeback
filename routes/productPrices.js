const express = require("express");
const { ProductPrice } = require("../models/productVariation");

const router = express.Router();

router.get(`/`, async (req, res) => {
  const productPriceList = await ProductPrice.find()
    .populate("productId")
    .populate("attributeOptionId");

  if (!productPriceList) {
    res.status(500).json({ success: false });
  }
  res.status(200).send(productPriceList);
});

router.get("/:id", async (req, res) => {
  try {
    const productPrice = await ProductPrice.findById(req.params.id)
      .populate("productId")
      .populate("attributeOptionId");

    if (!productPrice) {
      return res.status(404).json({
        message: "The Product Price with the given ID was not found.",
      });
    }

    return res.status(200).send(productPrice);
  } catch (error) {
    // console.error("Error fetching product:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/", async (req, res) => {
  let productPrice = new ProductPrice({
    productId: req.body.productId,
    attributeOptionId: req.body.attributeOptionId,
    price: req.body.price,
  });
  productPrice = await productPrice.save();

  if (!productPrice)
    return res.status(400).send("the attribute cannot be created!");

  res.send(productPrice);
});

router.put("/:id", async (req, res) => {
  const productPrice = await ProductPrice.findByIdAndUpdate(
    req.params.id,
    {
      attributeOptionId: req.body.attributeOptionId,
      price: req.body.price,
    },
    { new: true }
  );

  if (!productPrice)
    return res.status(400).send("the attributeOption cannot be created!");

  res.send(productPrice);
});

router.delete("/:id", async (req, res) => {
  try {
    const productPrice = await ProductPrice.findOneAndDelete({
      _id: req.params.id,
    });

    if (productPrice) {
      return res
        .status(200)
        .json({ success: true, message: "The attributeOption is deleted!" });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "attributeOption not found!" });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
