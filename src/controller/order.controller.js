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

module.exports = {
  placeOrderController,
};
