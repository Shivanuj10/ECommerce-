const express = require("express");
const router = express.Router();
const cartController = require("../controller/cart.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.get(
  "/",
  authMiddleware.authMiddleware,
  cartController.getCartController,
);

router.post(
  "/",
  authMiddleware.authMiddleware,
  cartController.addToCartController,
);

module.exports = router;
