import { useEffect, useRef, useState } from "react";

export interface Session {
  token: string;
  expires: number;
}

interface ZebraSignalSocketResultBase {
  session: Session | undefined;
  isError: boolean;
  reset: () => void;
}
interface ZebraSignalSocketReady extends ZebraSignalSocketResultBase {
  isReady: true;
  session: Session;
  socket: WebSocket;
}
interface ZebraSignalSocketNotReady extends ZebraSignalSocketResultBase {
  isReady: false;
  session: Session | undefined;
  socket: undefined;
}
type ZebraSignalSocketResult =
  | ZebraSignalSocketReady
  | ZebraSignalSocketNotReady;

export const useZebraSignalSocket = (): ZebraSignalSocketResult => {
  const [session, setSession] = useState<Session | undefined>(undefined);
  const [error, setError] = useState<boolean>(false);
  const [ready, setReady] = useState<boolean>(false);
  const socket = useRef<WebSocket | undefined>(undefined);

  const refresh = () => {
    setReady(false);

    fetch("/session").then((response) => {
      response
        .json()
        .then((data) => setSession(data))
        .catch(() => setError(true));
    });
  };

  // refresh on mount
  useEffect(() => refresh(), []);

  useEffect(() => {
    if (!session) {
      return;
    }

    const ws = new WebSocket(`/ws?token=${session.token}`);
    socket.current = ws;

    ws.onopen = () => setReady(true);

    return () => ws.close();
  }, [session]);

  return <ZebraSignalSocketResult>{
    session,
    socket: socket.current,
    isReady: ready,
    isError: error,
    reset: refresh,
  };
};
