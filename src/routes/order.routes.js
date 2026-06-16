const express = require("express");
const router = express.Router();
const orderController = require("../controller/order.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post(
  "/",
  authMiddleware.authMiddleware,
  orderController.placeOrderController,
);

module.exports = router;
