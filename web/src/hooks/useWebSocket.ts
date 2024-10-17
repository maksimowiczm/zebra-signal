import { useEffect, useRef, useState } from "react";

type UseWebSocketResult =
  | {
      isReady: false;
      socket: undefined;
      isError: false;
    }
  | {
      isReady: true;
      socket: WebSocket;
      isError: false;
    }
  | {
      isReady: false;
      socket: undefined;
      isError: true;
    };

export const useWebSocket = (url: string | undefined): UseWebSocketResult => {
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const socket = useRef<WebSocket | undefined>(undefined);

  useEffect(() => {
    setIsError(false);
    setIsReady(false);

    if (!url) {
      return;
    }

    const ws = new WebSocket(url);
    socket.current = ws;

    ws.onopen = () => setIsReady(true);
    ws.onerror = () => setIsError(true);

    return () => ws.close();
  }, [url]);

  return <UseWebSocketResult>{
    isReady,
    socket: socket.current,
    isError,
  };
};
