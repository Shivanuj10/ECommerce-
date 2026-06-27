const productModel = require("../models/products.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;
    console.log("The data of product is : ", req.body);

    const images = req.files.map((file) => file.path);

    const product = await productModel.create({
      name,
      description,
      price,
      stock,
      category,
      images,
      createdBy: req.user._id,
    });

    res.status(201).json({
      product,
      message: "Product created successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await productModel
      .find()
      .populate("createdBy", "username email");

    res.status(201).json({
      count: products.length,
      products,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const getSpecificProduct = async (req, res) => {
  try {
    const product = await productModel
      .findById(req.params.id)
      .populate("createdBy", "username email");

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({ product });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const deleteProductController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    for (const imageUrl of product.images) {
      const publicId = imageUrl.split("/").slice(-2).join("/").split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    await productModel.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const updateProductController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    let images = product.images;

    if (req.files && req.files.length > 0) {
      for (const imageUrl of product.images) {
        const publicId = imageUrl.split("/").slice(-2).join("/").split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }

      images = req.files.map((file) => file.path);
    }

    const updatedProduct = await productModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    res.status(200).json({
      product: updatedProduct,
      message: "Product updated successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getSpecificProduct,
  deleteProductController,
  updateProductController,
};
