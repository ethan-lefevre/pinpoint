const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const authMiddleware = require("../middleware/authMiddleware");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-checkout-session", authMiddleware, async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/?success=true`,
      cancel_url: `${process.env.CLIENT_URL}/subscribe`,
      allow_promotion_codes: true,
      client_reference_id: user._id.toString(),
      customer_email: user.email,
      metadata: {
        userId: user._id.toString(),
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    res.status(500).json({
      message: err.raw?.message || err.message || "Failed to create checkout session",
    });
  }
});

router.post("/create-billing-portal-session", authMiddleware, async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!user.stripeCustomerId) {
      return res.status(400).json({
        message: "No Stripe customer found for this account",
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.CLIENT_URL}/account`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Billing portal error:", err);
    res.status(500).json({
      message: err.raw?.message || err.message || "Failed to create billing portal session",
    });
  }
});

module.exports = router;