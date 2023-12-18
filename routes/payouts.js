const express = require("express");
const { PayOut } = require("../models/payout");
const { PayoutMoney } = require("../models/payput-item");
const router = express.Router();

router.get(`/`, async (req, res) => {
  const payoutList = await PayOut.find()
    .populate("user", "name")
    .populate({
      path: "payoutItems",
      populate: [
        {
          path: "sellingItemId",
          populate: {
            path: "productId",
            select: "name",
          },
          populate: {
            path: "selectedAttributeId",
            select: "optionName",
            populate: "attributeId",
          },
        },
      ],
    })
    .sort({ payoutCreateAt: -1 });

  if (!payoutList) {
    res.status(500).json({ success: false });
  }
  res.send(payoutList);
});

router.get(`/:id`, async (req, res) => {
  try {
    const payOut = await PayOut.findById(req.params.id)
      .populate("user", "name")
      .populate({
        path: "payoutItems",
        populate: [
          {
            path: "sellingItemId",
            populate: {
              path: "productId",
              select: "name",
            },
            populate: {
              path: "selectedAttributeId",
              select: "optionName",
              populate: "attributeId",
            },
          },
        ],
      });

    if (!payOut) {
      return res
        .status(404)
        .json({ message: "The payOut with the given Id was not found." });
    }

    return res.status(200).send(payOut);
  } catch (error) {
    // console.error("Error fetching product:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/", async (req, res) => {
  const payOutIds = await Promise.all(
    req.body.payoutItems.map(async (payoutItem) => {
      let newPayoutItem = new PayoutMoney({
        quantity: payoutItem.quantity,
        sellingItemId: payoutItem.sellingItemId,
      });

      newPayoutItem = await newPayoutItem.save();

      return newPayoutItem._id;
    })
  );

  const totalPrices = await Promise.all(
    payOutIds.map(async (payOutId) => {
      const payoutItem = await PayoutMoney.findById(payOutId).populate({
        path: "sellingItemId",
        select: "sellingPrice",
      });

      const totalPrice =
        payoutItem.sellingItemId.sellingPrice * payoutItem.quantity;
      return totalPrice;
    })
  );

  const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

  let payOutOrder = new PayOut({
    payoutItems: payOutIds,
    totalPrice: totalPrice,
    payoutMethod: req.body.payoutMethod,
    payoutStatus: req.body.payoutStatus,
    payoutCreateAt: req.body.payoutCreateAt,
    user: req.body.user,
  });
  payOutOrder = await payOutOrder.save();

  if (!payOutOrder)
    return res.status(400).send("the payOutOrder cannot be created!");

  res.send(payOutOrder);
});

router.put("/:id", async (req, res) => {
  const payOut = await PayOut.findByIdAndUpdate(
    req.params.id,
    {
      payoutMethod: req.body.payoutMethod,
      payoutStatus: req.body.payoutStatus,
    },
    { new: true }
  );

  if (!payOut) return res.status(400).send("the payOut cannot be update!");

  res.send(payOut);
});

router.delete("/:id", (req, res) => {
  PayOut.findByIdAndDelete(req.params.id)
    .then(async (payout) => {
      if (payout) {
        await payout.payoutItems.map(async (payoutItem) => {
          await PayoutMoney.findByIdAndDelete(payoutItem);
        });
        return res
          .status(200)
          .json({ success: true, message: "The payoutItem is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "order not found!" });
      }
    })
    .catch((err) => {
      console.error("Error deleting payoutItem:", err);
      return res.status(500).json({ success: false, error: err });
    });
});

router.get("/get/totalpayouts", async (req, res) => {
  const totalPayouts = await PayOut.aggregate([
    { $group: { _id: null, totalPayouts: { $sum: "$totalPrice" } } },
  ]);

  if (!totalPayouts) {
    return res.status(400).send("The total Payouts cannot be generated");
  }

  res.send({ totalPayouts: totalPayouts.pop().totalPayouts });
});

router.get(`/get/count`, async (req, res) => {
  try {
    const payoutCount = await PayOut.countDocuments();

    if (!payoutCount) {
      return res.status(500).json({ success: false });
    }

    res.send({
      payoutCount: payoutCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

router.get(`/get/userpayout/:userid`, async (req, res) => {
  const userPayoutList = await PayOut.find({ user: req.params.userid })
    .populate({
      path: "payoutItems",
      populate: [
        {
          path: "sellingItemId",
          populate: {
            path: "productId",
            select: "name",
          },
          populate: {
            path: "selectedAttributeId",
            select: "optionName",
            populate: "attributeId",
          },
        },
      ],
    })
    .sort({ payoutCreateAt: -1 });

  if (!userPayoutList) {
    res.status(500).json({ success: false });
  }
  res.send(userPayoutList);
});

module.exports = router;
