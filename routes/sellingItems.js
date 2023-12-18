const express = require("express");
const { SellingItem } = require("../models/sellingItem");

const router = express.Router();

router.get(`/`, async (req, res) => {
  const sellingList = await SellingItem.find()
    .populate("sellerId", "name")
    .populate("productId", "name")
    .populate({
      path: "selectedAttributeId",
      select: "optionName",
      populate: {
        path: "attributeId",
        select: "name",
      },
    })
    .sort({ sellingAt: -1 });

  if (!sellingList) {
    res.status(500).json({ success: false });
  }
  res.send(sellingList);
});

router.get(`/:id`, async (req, res) => {
  try {
    const sellingItem = await SellingItem.findById(req.params.id)
      .populate("sellerId", "name")
      .populate("productId", "name")
      .populate({
        path: "selectedAttributeId",
        select: "optionName",
        populate: {
          path: "attributeId",
          select: "name",
        },
      });

    if (!sellingItem) {
      return res.status(404).json({
        message: "The selling item with the given Id was not found.",
      });
    }

    return res.status(200).send(sellingItem);
  } catch (error) {
    // console.error("Error fetching product:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/", async (req, res) => {
  let sellingItem = new SellingItem({
    sellerId: req.body.sellerId,
    productId: req.body.productId,
    selectedAttributeId: req.body.selectedAttributeId,
    sellingPrice: req.body.sellingPrice,
    itemCondition: req.body.itemCondition,
    status: req.body.status,
    sellingAt: req.body.sellingAt,
  });
  sellingItem = await sellingItem.save();

  if (!sellingItem)
    return res.status(400).send("The selling Item cannot be created!");

  res.send(sellingItem);
});

router.put("/:id", async (req, res) => {
  const sellingItem = await SellingItem.findByIdAndUpdate(
    req.params.id,
    {
      sellingPrice: req.body.sellingPrice,
      status: req.body.status,
    },
    { new: true }
  );

  if (!sellingItem)
    return res.status(400).send("The selling Item cannot be update!");

  res.send(sellingItem);
});

router.delete("/:id", async (req, res) => {
  try {
    const sellingItem = await SellingItem.findOneAndDelete({
      _id: req.params.id,
    });

    if (sellingItem) {
      return res
        .status(200)
        .json({ success: true, message: "The selling Item is deleted!" });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Bidding Offer not found!" });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.get(`/get/count`, async (req, res) => {
  try {
    const totalSales = await SellingItem.countDocuments();

    if (!totalSales) {
      return res.status(500).json({ success: false });
    }

    res.send({
      totalSales: totalSales,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

router.get(`/get/sells/:userid`, async (req, res) => {
  const userSellingItems = await SellingItem.find({
    sellerId: req.params.userid,
  })
    .populate("sellerId", "name")
    .populate("productId", "name")
    .populate({
      path: "selectedAttributeId",
      select: "optionName",
      populate: {
        path: "attributeId",
        select: "name",
      },
    })
    .sort({ validUntil: -1 });

  if (!userSellingItems) {
    res.status(500).json({ success: false });
  }
  res.send(userSellingItems);
});

module.exports = router;
