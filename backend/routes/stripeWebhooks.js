const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const User = require("../models/User");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        if (session.mode === "subscription") {
          const userId = session.metadata?.userId || session.client_reference_id;

          const user = await User.findById(userId);
          if (user) {
            user.subscribed = true;
            user.stripeCustomerId = session.customer || null;
            user.stripeSubscriptionId = session.subscription || null;
            user.subscriptionStatus = "active";
            await user.save();
          }
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;

        const user = await User.findOne({
          stripeCustomerId: subscription.customer,
        });

        if (user) {
          user.stripeSubscriptionId = subscription.id;
          user.subscriptionStatus = subscription.status;
          user.subscribed = ["active", "trialing"].includes(subscription.status);
          await user.save();
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    res.status(500).json({ message: "Webhook handler failed" });
  }
});

module.exports = router;