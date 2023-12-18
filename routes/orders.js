const { Order } = require("../models/order");
const express = require("express");
const { OrderItem } = require("../models/order-item");
const { BiddingOffer } = require("../models/biddingOffer");
const router = express.Router();

router.get(`/`, async (req, res) => {
  const orderList = await Order.find()
    .populate("user", "name")
    .populate({
      path: "orderItems",
      populate: [
        {
          path: "biddingOfferId",
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
    .sort({ orderCreateAt: -1 });

  if (!orderList) {
    res.status(500).json({ success: false });
  }
  res.send(orderList);
});

router.get(`/:id`, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name")
      .populate({
        path: "orderItems",
        populate: [
          {
            path: "biddingOfferId",
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

    if (!order) {
      return res
        .status(404)
        .json({ message: "The order with the given OderId was not found." });
    }

    return res.status(200).send(order);
  } catch (error) {
    // console.error("Error fetching product:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/", async (req, res) => {
  const orderItemsIds = await Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        biddingOfferId: orderItem.biddingOfferId,
      });

      newOrderItem = await newOrderItem.save();

      return newOrderItem._id;
    })
  );

  const totalPrices = await Promise.all(
    orderItemsIds.map(async (orderItemId) => {
      const orderItem = await OrderItem.findById(orderItemId).populate({
        path: "biddingOfferId",
        select: "offeredPrice",
      });

      const totalPrice =
        orderItem.biddingOfferId.offeredPrice * orderItem.quantity;
      return totalPrice;
    })
  );

  const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

  let order = new Order({
    orderItems: orderItemsIds,
    totalPrice: totalPrice,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    itemCondition: req.body.itemCondition,
    paymentMethod: req.body.paymentMethod,
    paymentStatus: req.body.paymentStatus,
    paymentDate: req.body.paymentDate,
    orderCreateAt: req.body.orderCreateAt,
    user: req.body.user,
    shippingStatus: req.body.shippingStatus,
  });
  order = await order.save();

  if (!order) return res.status(400).send("the order cannot be created!");

  res.send(order);
});

router.put("/:id", async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      paymentStatus: req.body.paymentStatus,
      shippingStatus: req.body.shippingStatus,
    },
    { new: true }
  );

  if (!order) return res.status(400).send("the order cannot be update!");

  res.send(order);
});

router.delete("/:id", (req, res) => {
  Order.findByIdAndDelete(req.params.id)
    .then(async (order) => {
      if (order) {
        await order.orderItems.map(async (orderItem) => {
          await OrderItem.findByIdAndDelete(orderItem);
        });
        return res
          .status(200)
          .json({ success: true, message: "The order is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "order not found!" });
      }
    })
    .catch((err) => {
      console.error("Error deleting order:", err);
      return res.status(500).json({ success: false, error: err });
    });
});

router.get("/get/totalsales", async (req, res) => {
  const totalSales = await Order.aggregate([
    { $group: { _id: null, totalsales: { $sum: "$totalPrice" } } },
  ]);

  if (!totalSales) {
    return res.status(400).send("The order sales cannot be generated");
  }

  res.send({ totalsales: totalSales.pop().totalsales });
});

router.get(`/get/count`, async (req, res) => {
  try {
    const orderCount = await Order.countDocuments();

    if (!orderCount) {
      return res.status(500).json({ success: false });
    }

    res.send({
      orderCount: orderCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

router.get(`/get/userorders/:userid`, async (req, res) => {
  const userOrderList = await Order.find({ user: req.params.userid })
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: "category",
      },
    })
    .populate({
      path: "selectedAttributeId",
      select: "optionName",
      populate: {
        path: "attributeId",
        select: "name",
      },
    })
    .sort({ dateOrdered: -1 });

  if (!userOrderList) {
    res.status(500).json({ success: false });
  }
  res.send(userOrderList);
});

module.exports = router;
