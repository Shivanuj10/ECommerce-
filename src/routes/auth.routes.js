const express = require("express");
const authController = require("../controller/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/register", (req, res) => {
  res.render("register", { error: null });
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/register", authController.userRegisterController);

router.post("/login", authController.userLoginController);

router.post("/logout", authController.userLogoutController);

router.get(
  "/profile",
  authMiddleware.authMiddleware,
  authController.userProfileController,
);

module.exports = router;
