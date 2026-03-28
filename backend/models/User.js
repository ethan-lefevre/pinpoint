const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  subscribed: {
    type: Boolean,
    default: false,
  },

  stripeCustomerId: {
    type: String,
    default: null,
  },

  stripeSubscriptionId: {
    type: String,
    default: null,
  },

  subscriptionStatus: {
    type: String,
    default: null,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  emailVerified: {
  type: Boolean,
  default: false,
},
});

module.exports = mongoose.model("User", userSchema);