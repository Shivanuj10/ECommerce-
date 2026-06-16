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

router.put(
  "/:productId",
  authMiddleware.authMiddleware,
  cartController.updateCartController,
);

router.delete(
  "/clear",
  authMiddleware.authMiddleware,
  cartController.clearCartController,
);

router.delete(
  "/:productId",
  authMiddleware.authMiddleware,
  cartController.removeCartController,
);

module.exports = router;
