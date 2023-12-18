const express = require("express");
const { Attribute } = require("../models/attribute");
const router = express.Router();

router.get(`/`, async (req, res) => {
  const attributeList = await Attribute.find();

  if (!attributeList) {
    res.status(500).json({ success: false });
  }
  res.status(200).send(attributeList);
});

router.get("/:id", async (req, res) => {
  try {
    const attribute = await Attribute.findById(req.params.id);

    if (!attribute) {
      return res
        .status(404)
        .json({ message: "The attribute with the given ID was not found." });
    }

    return res.status(200).send(attribute);
  } catch (error) {
    // console.error("Error fetching product:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/", async (req, res) => {
  let attribute = new Attribute({
    name: req.body.name,
  });
  attribute = await attribute.save();

  if (!attribute)
    return res.status(400).send("the attribute cannot be created!");

  res.send(attribute);
});

router.put("/:id", async (req, res) => {
  const attribute = await Attribute.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
    },
    { new: true }
  );

  if (!attribute)
    return res.status(400).send("the attribute cannot be created!");

  res.send(attribute);
});

router.delete("/:id", async (req, res) => {
  try {
    const attribute = await Attribute.findOneAndDelete({ _id: req.params.id });

    if (attribute) {
      return res
        .status(200)
        .json({ success: true, message: "The category is deleted!" });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Attribute not found!" });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
