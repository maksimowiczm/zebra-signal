import { useWebSocket } from "./useWebSocket.ts";

type ZebraSignalSocketResult =
  | {
      isReady: false;
      isError: false;
      socket: undefined;
    }
  | {
      isReady: true;
      isError: false;
      socket: WebSocket;
    }
  | {
      isReady: false;
      isError: true;
      socket: undefined;
    };

export const useZebraSignalSocket = (
  token: string | undefined,
): ZebraSignalSocketResult => {
  const { isReady, socket, isError } = useWebSocket(
    token && `/api/ws?token=${token}`,
  );

  return <ZebraSignalSocketResult>{
    isReady,
    socket,
    isError,
  };
};
