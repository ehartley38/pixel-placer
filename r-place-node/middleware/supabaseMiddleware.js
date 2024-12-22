import { supabase } from "../utils/supabaseClient.js";
import jwt from "jsonwebtoken";

const jwtSecret = process.env.SUPABASE_JWT_SECRET;

const getToken = (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    return req.headers.authorization.split(" ")[1];
  }
  return null;
};

// Decode the JWT
export const supabaseMiddleware = async (req, res, next) => {
  const token = getToken(req);

  if (!token) {
    return res.status(401).json({ Error: "No JWT provided" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
  } catch (err) {
    console.log("Invalid token:", err.message);
    return res.status(401).json({ Error: "Invalid token" });
  }

  next();
};
