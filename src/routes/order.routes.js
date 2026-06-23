const express = require("express");
const router = express.Router();
const orderController = require("../controller/order.controller");
const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");

router.post(
  "/",
  authMiddleware.authMiddleware,
  orderController.placeOrderController,
);

router.get(
  "/my-orders",
  authMiddleware.authMiddleware,
  orderController.getMyOrdersController,
);

router.get(
  "/:id",
  authMiddleware.authMiddleware,
  orderController.getSingleOrderController,
);

router.put(
  "/:id/cancel",
  authMiddleware.authMiddleware,
  orderController.cancelOrderController,
);

router.get(
  "/",
  authMiddleware.authMiddleware,
  adminMiddleware.adminMiddleware,
  orderController.getAllOrdersController,
);

module.exports = router;
