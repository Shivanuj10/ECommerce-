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
    const { items } = req.body;
    const { productId, quantity } = items[0];

    const product = await productModel.findById(productId);
    console.log("The product is : ", items);
    console.log("Request body:", req.body);
    console.log("Product ID:", { productId });

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

    await cart.populate("items.productId", "name price images");

    res.status(200).json({
      cart,
      message: "Item added to cart successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getCartController,
  addToCartController,
};
