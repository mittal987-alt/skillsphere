import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";

export const useSocket = () => {
  const { token } = useSelector(
    (state: RootState) => state.auth
  );

  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    const s = io("http://localhost:5000", {
      auth: {
        token,
      },
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [token]);

  return socket;
};