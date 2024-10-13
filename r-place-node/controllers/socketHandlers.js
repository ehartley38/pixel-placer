export const registerSocketEvents = (io) => {
  io.on("connection", (socket) => {
    
    socket.on("pixels-update-batch", (data) => {
      io.emit("canvas-update-batch", data);
    });

    socket.on("get-connections", () => {
      socket.emit("connections-count", io.engine.clientsCount);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
};
