import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

let socket;

export const connectSocket = () => {
  if (!socket) {
    console.log("Connecting to socket server...");

    socket = io(SOCKET_URL, {});

    socket.on("connect", () => {
      console.log("Connected to socket.io server");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from socket.io server");
    });

    
  }

  return socket;
};

export const getSocket = () => socket;
