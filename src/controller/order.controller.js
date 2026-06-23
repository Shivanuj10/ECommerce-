const orderModel = require("../models/orderModel");
const cartModel = require("../models/cart.model");
const productModel = require("../models/products.model");

const placeOrderController = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Request body is missing" });
    }
    const { shippingAddress } = req.body;

    const cart = await cartModel
      .findOne({
        userId: req.user._id,
      })
      .populate("items.productId");

    console.log("The cart is this : ", cart);

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.productId;

      if (!product) {
        return res.status(404).json({
          message: "One or more products not found",
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name}`,
        });
      }

      orderItems.push({
        productId: product._id,
        quantity: item.quantity,
        price: product.price,
      });

      totalAmount += product.price * item.quantity;

      await productModel.findByIdAndUpdate(product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    const order = await orderModel.create({
      userId: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress,
    });

    cart.items = [];
    await cart.save();

    res.status(201).json({
      order,
      message: "Order placed successfully",
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getMyOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ userId: req.user._id })
      .populate("items.productId", "name price images")
      .sort({ createdAt: -1 });

    if (orders.length === 0) {
      return res.status(200).json({
        message: "No orders found",
        orders: [],
      });
    }

    res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSingleOrderController = async (req, res) => {
  try {
    const order = await orderModel
      .findById(req.params.id)
      .populate("items.productId", "name price images")
      .populate("userId", "username, email");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.status(200).json({ order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find()
      .populate("items.productId", "name price")
      .populate("userId", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const cancelOrderController = async (req, res) => {
  try {
    const order = await orderModel.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    if (!["pending", "processing"].includes(order.status)) {
      return res.status(400).json({
        message: `Order cannot be cancelled as it is already ${order.status}`,
      });
    }

    for (const item of order.items) {
      await productModel.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }

    order.status = "cancelled";
    await order.save();

    res.status(200).json({
      order,
      message: "Order cancelled successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  placeOrderController,
  getMyOrdersController,
  getSingleOrderController,
  getAllOrdersController,
  cancelOrderController,
};
