import app from "./app.js";
import http from "http";
import { Server as SocketIOServer } from "socket.io"; // Importing socket.io
import { registerSocketEvents } from "./controllers/socketHandlers.js";

const server = http.createServer(app);

// TODO - Update Cors
const io = new SocketIOServer(server, {
  reconnection: true,
  cors: {
    origin: "*",
  },
});

registerSocketEvents(io);

const port = process.env.PORT || 8080;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
