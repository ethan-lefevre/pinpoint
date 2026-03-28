const crypto = require("crypto");
const { Resend } = require("resend");
const EmailVerificationToken = require("../models/EmailVerificationToken");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendVerificationEmail(user) {
  await EmailVerificationToken.deleteMany({ userId: user._id });

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  await EmailVerificationToken.create({
    userId: user._id,
    tokenHash,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
  });

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${rawToken}`;

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: [user.email],
    subject: "Verify your PinPoint account",
    html: `
      <h2>Verify your email</h2>
      <p>Click the link below to verify your account:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>This link expires in 24 hours.</p>
    `,
  });

  if (error) {
    throw new Error(error.message || "Failed to send verification email");
  }
}

module.exports = sendVerificationEmail;