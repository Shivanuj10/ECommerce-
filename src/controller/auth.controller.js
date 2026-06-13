const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userRegisterController = async (req, res) => {
  try {
    const { username, email, password, address } = req.body;

    let isExists = await userModel.findOne({
      email: email,
    });

    if (isExists) {
      return res.status(400).json({
        message: "Email already exists. Please use a different email address.",
        status: "failed",
      });
    }

    const user = await userModel.create({
      username,
      email,
      password,
      address,
    });

    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3d" },
    );

    res.cookie("token", token);
    res.status(201).json({
      user: {
        username: user.username,
        email: user.email,
        password: user.password,
        address: user.address,
      },
      token: token,
      message: "User registered successfully now you can login",
    });
  } catch (err) {
    console.error("The error in this is : ", err);
  }
};

const userLoginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await userModel
      .findOne({
        email: email,
      })
      .select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // const match = await bcrypt.compare(password, user.password);
    // if (!match) {
    //   return res.render("login", { error: "Incorrect password." });
    // }

    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3d" },
    );

    res.cookie("token", token, { httpOnly: true });

    res.status(200).json({
      user: {
        email: user.email,
        name: user.username,
      },
      token: token,
      message: "Login successful now you can view your profile",
    });
  } catch (err) {
    res.render("login", { error: err.message });
  }
};

const userLogoutController = async (req, res) => {
  try {
    // Clear the cookie
    res.clearCookie("token");

    res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const userProfileController = async (req, res) => {
  try {
    // req.user is set by protect middleware
    const user = await userModel.findById(req.user._id);

    res.status(200).json({
      user: {
        username: user.username,
        email: user.email,
        address: user.address,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  userRegisterController,
  userLoginController,
  userLogoutController,
  userProfileController,
};
