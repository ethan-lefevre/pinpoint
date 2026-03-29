const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Regular signup (optional - keep if you still want free/basic signup)
router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword,
      subscribed: false,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "User created",
      token,
      user: {
        _id: user._id,
        email: user.email,
        subscribed: user.subscribed,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Signup AFTER Stripe payment
router.post("/signup-after-payment", async (req, res) => {
  try {
    const { email, password, stripeCustomerId, stripeSubscriptionId } = req.body;

    if (!email || !password || !stripeCustomerId || !stripeSubscriptionId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword,
      subscribed: true,
      stripeCustomerId,
      stripeSubscriptionId,
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        _id: user._id,
        email: user.email,
        subscribed: user.subscribed,
      },
    });
  } catch (err) {
    console.error("Signup after payment error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;