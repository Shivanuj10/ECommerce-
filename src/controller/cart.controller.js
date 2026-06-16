const cartModel = require("../models/cart.model");
const productModel = require("../models/products.model");

const getCartController = async (req, res) => {
  try {
    const cart = await cartModel
      .findOne({
        userId: req.user._id,
      })
      .populate("items.productId", "name price images");

    if (!cart) {
      return res.status(200).json({
        message: "Cart is empty",
        items: [],
      });
    }

    res.status(200).json({ cart });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

const addToCartController = async (req, res) => {
  try {
    // const { items } = req.body;

    const { productId, quantity } = req.body;

    const product = await productModel.findById(productId);
    // console.log("The product is : ", items);
    console.log("Request body:", req.body);
    console.log("Product ID:", quantity);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        message: "Not enough stock available",
      });
    }

    let cart = await cartModel.findOne({
      userId: req.user._id,
    });

    if (!cart) {
      cart = await cartModel.create({
        userId: req.user._id,
        items: [{ productId, quantity }],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId,
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }
      await cart.save();
    }
    // const qty = Number(quantity);
    product.stock -= quantity;

    await product.save();

    await cart.populate("items.productId", "name price images");

    res.status(200).json({
      cart,
      message: "Item added to cart successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const removeCartController = async (req, res) => {
  try {
    const { productId } = req.params;
    console.log("The product id is is it running this : ", productId);

    const cart = await cartModel.findOne({ userId: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId,
    );

    await cart.save();

    res.status(200).json({
      cart,
      message: "Item removed from cart successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const clearCartController = async (req, res) => {
  try {
    const cart = await cartModel.findOne({ userId: req.user._id });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    cart.items = [];
    console.log("Cart items is : ", cart.items);

    await cart.save();

    res.status(200).json({
      cart,
      message: "Cart cleared successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateCartController = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;

    const cart = await cartModel.findOne({
      userId: req.user._id,
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId,
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    await cart.populate("items.productId", "name price images");

    res.status(200).json({
      cart,
      message: "Cart updated successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getCartController,
  addToCartController,
  removeCartController,
  clearCartController,
  updateCartController,
};
