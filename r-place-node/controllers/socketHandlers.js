export const registerSocketEvents = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("pixel-update", (data) => {
      console.log("Pixel update received:", data);
      io.emit("canvas-update", data);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
};
