import { useEffect, useRef, useState } from "react";

type UseWebSocketResult =
  | {
      isConnecting: true;
      socket: WebSocket | undefined;
      isError: false;
    }
  | {
      isConnecting: false;
      socket: WebSocket;
      isError: false;
    }
  | {
      isConnecting: false;
      socket: undefined;
      isError: true;
    };

export const useWebSocket = (url: string): UseWebSocketResult => {
  const [isConnecting, setIsConnecting] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const socket = useRef<WebSocket | undefined>(undefined);

  useEffect(() => {
    const ws = new WebSocket(url);
    socket.current = ws;

    const onOpen = () => setIsConnecting(false);
    const onError = () => setIsError(true);

    ws.addEventListener("open", onOpen);
    ws.addEventListener("error", onError);

    return () => {
      ws.removeEventListener("open", onOpen);
      ws.removeEventListener("error", onError);
      ws.close();
    };
  }, [url]);

  return <UseWebSocketResult>{
    isConnecting,
    socket: socket.current,
    isError,
  };
};
