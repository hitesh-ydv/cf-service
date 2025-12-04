import { io } from "socket.io-client";

export const socket = io("https://call-forward.onrender.com", {
  transports: ["websocket"],
  autoConnect: true
});
