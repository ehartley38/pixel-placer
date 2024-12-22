let allowedOrigins;

if (process.env.NODE_ENV === "development") {
  allowedOrigins = ["http://localhost:5173"];
} else if (process.env.NODE_ENV === "production") {
  allowedOrigins = ["https://pixel-placer.netlify.app"];
} else {
  allowedOrigins = [""];
}

export const config = {
  allowedOrigins: allowedOrigins,
};
