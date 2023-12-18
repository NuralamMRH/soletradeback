const express = require("express");
const { AttributeOption } = require("../models/attributeOption");
const router = express.Router();

router.get(`/`, async (req, res) => {
  const attributeOptionList = await AttributeOption.find().populate(
    "attributeId"
  );

  if (!attributeOptionList) {
    res.status(500).json({ success: false });
  }
  res.status(200).send(attributeOptionList);
});

router.get("/:id", async (req, res) => {
  try {
    const attributeOption = await AttributeOption.findById(
      req.params.id
    ).populate("attributeId");

    if (!attributeOption) {
      return res.status(404).json({
        message: "The attributeOption with the given ID was not found.",
      });
    }

    return res.status(200).send(attributeOption);
  } catch (error) {
    // console.error("Error fetching product:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/", async (req, res) => {
  let attributeOption = new AttributeOption({
    optionName: req.body.optionName,
    attributeId: req.body.attributeId,
  });
  attributeOption = await attributeOption.save();

  if (!attributeOption)
    return res.status(400).send("the attribute cannot be created!");

  res.send(attributeOption);
});

router.put("/:id", async (req, res) => {
  const attributeOption = await AttributeOption.findByIdAndUpdate(
    req.params.id,
    {
      optionName: req.body.optionName,
      attributeId: req.body.attributeId,
    },
    { new: true }
  );

  if (!attributeOption)
    return res.status(400).send("the attributeOption cannot be created!");

  res.send(attributeOption);
});

router.delete("/:id", async (req, res) => {
  try {
    const attributeOption = await AttributeOption.findOneAndDelete({
      _id: req.params.id,
    });

    if (attributeOption) {
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
