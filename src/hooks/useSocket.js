import { useEffect } from "react";
import { socket } from "../socket";

export const useSocket = (event, callback) => {
  useEffect(() => {
    if (!socket) return;

    socket.on(event, callback);

    return () => {
      socket.off(event, callback);
    };
  }, [event, callback]);
};
