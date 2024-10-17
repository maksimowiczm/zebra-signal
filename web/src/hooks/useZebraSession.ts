import { useEffect, useState } from "react";

export interface Session {
  token: string;
  expires: number;
}

type ZebraSessionResult =
  | {
      isLoading: true;
      session: undefined;
      sessionError: false;
      refresh: undefined;
    }
  | {
      isLoading: false;
      session: Session;
      sessionError: false;
      refresh: () => void;
    }
  | {
      isLoading: false;
      session: undefined;
      sessionError: true;
      refresh: undefined;
    };

export const useZebraSession = (): ZebraSessionResult => {
  const [session, setSession] = useState<Session | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sessionError, setSessionError] = useState<boolean>(false);

  const refresh = () => {
    setIsLoading(true);

    fetch("/api/session").then((response) => {
      response
        .json()
        .then((data) => {
          setSession(data);
          setSessionError(false);
          setIsLoading(false);
        })
        .catch(() => setSessionError(true));
    });
  };

  // refresh on mount
  useEffect(refresh, []);

  return <ZebraSessionResult>{
    isLoading,
    session,
    sessionError,
    refresh,
  };
};
