import { useWebSocket } from "./useWebSocket.ts";

export const useZebraSignalSocket = (token: string) =>
  useWebSocket(`/api/ws?token=${token}`);
