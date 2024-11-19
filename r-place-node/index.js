import app from "./app.js";
import http from "http";
import { Server as SocketIOServer } from "socket.io"; // Importing socket.io
import { registerSocketEvents } from "./controllers/socketHandlers.js";
import { config } from "./utils/config.js";

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  reconnection: true,
  cors: {
    origin: config.allowedOrigins,
  },
});

registerSocketEvents(io);

const port = process.env.PORT || 8080;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
