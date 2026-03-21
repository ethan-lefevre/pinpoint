const tournaments = require("./data/results");
const getRankings = require("./data/rankings");
const letter = require("./data/letter");
const express = require("express");
const cors = require("cors");
const connectDB = require("./database.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./middleware/authMiddleware");
const subscriptionMiddleware = require("./middleware/subscriptionMiddleware");
const User = require("./models/User");
const { jwtSecret, port } = require("./config");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.post("/test", (req, res) => {
  console.log(req.body);
  res.json({ message: "POST received", data: req.body });
});

app.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email: normalizedEmail,
      password: hashedPassword,
    });

    await user.save();

    res.json({
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      error: "Signup failed",
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    console.log("LOGIN ATTEMPT");
    console.log("email from body:", JSON.stringify(email));
    console.log("normalized email:", JSON.stringify(normalizedEmail));
    console.log("password from body:", JSON.stringify(password));

    const user = await User.findOne({ email: normalizedEmail });

    console.log("user found:", !!user);

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("db email:", user.email);
    console.log("db hash:", user.password);

    const validPassword = await bcrypt.compare(password, user.password);

    console.log("password valid:", validPassword);

    if (!validPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: "7d" });

    res.json({
      message: "Login successful",
      token,
      subscribed: user.subscribed,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Login failed",
    });
  }
});

app.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      email: user.email,
      subscribed: user.subscribed,
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: "Failed to load profile" });
  }
});

app.get("/results", authMiddleware, subscriptionMiddleware, (req, res) => {
  res.json({
    tournaments,
  });
});

app.get("/letters", authMiddleware, subscriptionMiddleware, (req, res) => {
  res.json(letter);
});

app.post("/subscribe", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.subscribed = true;
    await user.save();

    res.json({
      message: "Subscription activated",
      subscribed: true,
    });
  } catch (error) {
    console.error("Subscription error:", error);
    res.status(500).json({
      error: "Subscription failed",
    });
  }
});

app.get("/rankings", authMiddleware, subscriptionMiddleware, async (req, res) => {
  try {
    const rankings = await getRankings();

    res.json({
      rankings,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Rankings error:", error);
    res.status(500).json({ error: "Failed to load rankings" });
  }
});

async function startServer() {
  try {
    await connectDB();

    app.listen(port, "0.0.0.0", () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

startServer();