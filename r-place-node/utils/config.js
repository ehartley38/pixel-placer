let allowedOrigins;

if (process.env.NODE_ENV === "development") {
  allowedOrigins = ["http://localhost:5173"];
} else if (process.env.NODE_ENV === "production") {
  allowedOrigins = ["http://localhost:5173"];
} else {
  allowedOrigins = [""];
}

export const config = {
  allowedOrigins: allowedOrigins,
};
