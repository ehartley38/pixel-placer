import { Router } from "express";
import { supabase } from "../utils/supabaseClient.js";

const authRouter = Router();
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;

authRouter.post("/sendOTP", async (req, res) => {
  const { email, turnstileToken } = req.body;

  if (!email || !turnstileToken) {
    return res.status(400).json({
      success: false,
      message: "Missing email or turnstile token in request",
    });
  }

  try {
    // Verify turnstile
    let verifyResponse;
    let response;

    if (process.env.NODE_ENV === "production") {
      verifyResponse = await fetch(
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

      response = await verifyResponse.json();
    } else {
      response = {success: "true"}
    }

    if (!response.success) {
      return res
        .status(400)
        .json({ success: false, message: "Turnstile verification failed" });
    } else {
      const { data } = await supabase.auth.signInWithOtp({ email });


      return res
        .status(200)
        .json({ success: true, message: "Magic link sent" });
    }
  } catch (err) {
    console.log(err);

    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
});

authRouter.post("/verify-turnstile", async (req, res) => {
  const { turnstileToken } = req.body;

  if (!turnstileToken) {
    return res
      .status(400)
      .json({ success: false, message: "Missing Turnstile token" });
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

    const response = await verifyResponse.json();

    if (!response.success) {
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
      .json({ success: false, message: "Server error", error: err.message });
  }
});

export default authRouter;
