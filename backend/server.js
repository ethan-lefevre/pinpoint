require("dotenv").config();
const path = require("path");
const crypto = require("crypto");
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
const verifiedEmailMiddleware = require("./middleware/verifiedEmailMiddleware");
const User = require("./models/User");
const EmailVerificationToken = require("./models/EmailVerificationToken");
const sendVerificationEmail = require("./utils/sendVerificationEmail");
const { jwtSecret, port } = require("./config");
const stripeRoutes = require("./routes/stripe");
const stripeWebhookRoutes = require("./routes/stripeWebhook");

const app = express();

// IMPORTANT: Stripe webhook route must come BEFORE express.json()
app.use("/api/stripe", stripeWebhookRoutes);

app.use(cors({
  origin: 'https://pinpoint-smoky-three.vercel.app',
  credentials: true
}));
app.use(express.json());

// Normal Stripe routes can come after express.json()
app.use("/api/stripe", stripeRoutes);

// Serve files from /public
app.use(express.static(path.join(__dirname, "public")));

// Loading screen at the root domain
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/test", (req, res) => {
  console.log(req.body);
  res.json({ message: "POST received", data: req.body });
});

app.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email: normalizedEmail,
      password: hashedPassword,
      subscribed: false,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionStatus: null,
      emailVerified: false,
    });

    await user.save();

    // 👇 EMAIL IS NOW NON-BLOCKING
    let emailSent = true;
    let emailError = null;

    try {
      await sendVerificationEmail(user);
    } catch (err) {
      console.error("Verification email failed:", err);
      emailSent = false;
      emailError = err.message;
    }

    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: "7d" });

    res.status(201).json({
      message: emailSent
        ? "User created successfully. Please verify your email."
        : "User created successfully, but verification email could not be sent.",
      token,
      subscribed: user.subscribed,
      emailVerified: user.emailVerified,
      emailSent,
      emailError,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      message: error.message || "Signup failed",
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: "7d" });

    res.json({
      message: "Login successful",
      token,
      subscribed: user.subscribed,
      emailVerified: user.emailVerified,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Login failed",
    });
  }
});

app.post("/verify-email", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Missing token" });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const verificationRecord = await EmailVerificationToken.findOne({ tokenHash });

    if (!verificationRecord) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    if (verificationRecord.expiresAt < new Date()) {
      await EmailVerificationToken.deleteOne({ _id: verificationRecord._id });
      return res.status(400).json({ message: "Token expired" });
    }

    const user = await User.findById(verificationRecord.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.emailVerified = true;
    await user.save();

    await EmailVerificationToken.deleteMany({ userId: user._id });

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).json({ message: "Email verification failed" });
  }
});

app.post("/resend-verification-email", authMiddleware, async (req, res) => {
  try {
    const user = req.user;

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    await sendVerificationEmail(user);

    res.json({ message: "Verification email sent" });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({ message: "Failed to resend verification email" });
  }
});

app.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      email: user.email,
      subscribed: user.subscribed,
      subscriptionStatus: user.subscriptionStatus,
      emailVerified: user.emailVerified,
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: "Failed to load profile" });
  }
});

app.get(
  "/results",
  authMiddleware,
  verifiedEmailMiddleware,
  subscriptionMiddleware,
  (req, res) => {
    res.json({
      tournaments,
    });
  }
);

app.get(
  "/letters",
  authMiddleware,
  verifiedEmailMiddleware,
  subscriptionMiddleware,
  (req, res) => {
    res.json(letter);
  }
);

app.get(
  "/rankings",
  authMiddleware,
  verifiedEmailMiddleware,
  subscriptionMiddleware,
  async (req, res) => {
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
  }
);

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