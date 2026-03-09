const tournaments = require("./data/results")
const getRankings = require("./data/rankings")
const letter = require("./data/letter")
const express = require("express");
const cors = require("cors");
const connectDB = require("./database.js");
const bcrypt = require("bcryptjs");
const authMiddleware = require("./middleware/authMiddleware");
const subscriptionMiddleware = require("./middleware/subscriptionMiddleware");
const app = express();
const PORT = 5000;

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.post("/test", (req, res) => {
  console.log(req.body);
  res.json({ message: "POST received", data: req.body });
});

const User = require("./models/User");

app.post("/signup", async (req, res) => {

  try {

    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword
    });

    await user.save();

    res.json({
      message: "User created successfully"
    });

  } catch (error) {

    res.status(500).json({
      error: "Signup failed"
    });

  }

});

const jwt = require("jsonwebtoken");

app.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      "supersecretkey",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      subscribed: user.subscribed
    });

  } catch (error) {

    res.status(500).json({
      error: "Login failed"
    });

  }

});

app.get("/profile", authMiddleware, async (req, res) => {

  const user = await User.findById(req.user.id);

  res.json({
    email: user.email,
    subscribed: user.subscribed
  });

});

app.get("/results", authMiddleware, subscriptionMiddleware, (req,res)=>{

res.json({
tournaments
})

})

app.get("/letters", authMiddleware, subscriptionMiddleware, (req,res)=>{

res.json(letter)

})

app.post("/subscribe", authMiddleware, async (req, res) => {

  try {

    const user = await User.findById(req.user._id);

    user.subscribed = true;

    await user.save();

    res.json({
      message: "Subscription activated",
      subscribed: true
    });

  } catch (error) {

    res.status(500).json({
      error: "Subscription failed"
    });

  }

});

app.get("/rankings", authMiddleware, subscriptionMiddleware, async (req, res) => {

try {

const rankings = await getRankings()

res.json({
rankings,
lastUpdated: new Date()
})

} catch (error) {

console.error(error)
res.status(500).json({ error: "Failed to load rankings" })

}

})

const SPREADSHEET_ID = "1WDeGNx56qBRUHx3olQI8-5x8EasGJQu0C5nAAdlZVgU"

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});