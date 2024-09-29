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

io.on("connection", (socket) => {
  console.log("A userASD connected:", socket.id);

  // socket.on("pixel-update", (data) => {
  //   io.emit("canvas-update", data);
  // });

  socket.on("pixels-update-batch", (data) => {
    io.emit("canvas-update-batch", data);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

const port = process.env.PORT || 8080;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
