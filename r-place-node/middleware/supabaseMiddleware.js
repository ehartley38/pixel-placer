import { supabase } from "../utils/supabaseClient.js";

const getToken = (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    return req.headers.authorization.split(" ")[1];
  }
  return null;
};

export const supabaseMiddleware = async (req, res, next) => {
  const jwt = getToken(req);

  if (!jwt) {
    return res.status(401).json({ Error: "No JWT provided" });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser(jwt);

  if (!user) {
    return res.status(401).json({ Error: "No user found" });
  }

  // TODO - Put more thought into this. Apply it to the relevant routes. Figure out if
  // The service key is the right thing to use
  // Should I be decoding the JWT instead?
  req.user = user;

  next();
};
