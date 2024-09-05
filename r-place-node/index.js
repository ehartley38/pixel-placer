import app from "./app.js";

import http from "http";

const server = http.createServer(app);
const port = process.env.PORT || 8080;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});