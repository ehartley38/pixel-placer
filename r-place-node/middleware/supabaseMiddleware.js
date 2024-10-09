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

  // TODO - Put more thought into this. Apply it to the relevant routes. Figure out if
  // The service key is the right thing to use
  // Should I be decoding the JWT instead?

  next();
};

// export const supabaseMiddleware = async (req, res, next) => {
//   const jwt = getToken(req);

//   if (!jwt) {
//     return res.status(401).json({ Error: "No JWT provided" });
//   }

//   const {
//     data: { user },
//   } = await supabase.auth.getUser(jwt);
//   console.log(user);

//   // console.log(user);

//   if (!user) {
//     return res.status(401).json({ Error: "No user found" });
//   }

//   // TODO - Put more thought into this. Apply it to the relevant routes. Figure out if
//   // The service key is the right thing to use
//   // Should I be decoding the JWT instead?
//   req.user = user;

//   next();
// };
