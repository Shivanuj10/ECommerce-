const express = require("express");
const adminMiddleware = require("../middleware/admin.middleware");
const productController = require("../controller/product.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.post(
  "/addproducts",
  authMiddleware.authMiddleware,
  adminMiddleware.adminMiddleware,
  productController.createProduct,
);

module.exports = router;
