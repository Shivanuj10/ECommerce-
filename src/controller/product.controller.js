const productModel = require("../models/products.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, images } = req.body;
    console.log("The data of product is : ", req.body);

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

module.exports = {
  createProduct,
};
