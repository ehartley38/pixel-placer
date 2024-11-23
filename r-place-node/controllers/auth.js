import { Router } from "express";

const authRouter = Router();
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;

authRouter.post("/verify-turnstile", async (req, res) => {
  const { turnstileToken, email } = req.body;

  if (!turnstileToken || !email) {
    return res
      .status(400)
      .json({ success: false, message: "Missing Turnstile token or email" });
  }

  try {
    const verifyResponse = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: TURNSTILE_SECRET_KEY,
          response: turnstileToken,
        }),
      }
    );

    const outcome = await verifyResponse.json();

    if (!outcome.success) {
      return res
        .status(400)
        .json({ success: false, message: "Turnstile verification failed" });
    } else {
      res
        .status(200)
        .json({ success: true, message: "Turnstile verification successful" });
    }
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

export default authRouter
