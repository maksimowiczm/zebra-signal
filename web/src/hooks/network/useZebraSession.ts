import { useEffect, useRef, useState } from "react";

export interface Session {
  token: string;
  expires: number;
}

type ZebraSessionResult =
  // fetching
  | {
      isLoading: true;
      session: undefined;
      isError: false;
      refetchSession: undefined;
    }
  // error
  | {
      isLoading: false;
      session: undefined;
      isError: true;
      refetchSession: () => void;
    }
  // success
  | {
      isLoading: false;
      session: Session;
      isError: false;
      refetchSession: () => void;
    };

export const useZebraSession = (): ZebraSessionResult => {
  const session = useRef<Session | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  const fetchSession = () => {
    session.current = undefined;
    setIsError(false);
    setIsLoading(true);

    fetch("/api/session").then((response) => {
      response
        .json()
        .then((data) => {
          session.current = data;
          setIsLoading(false);
        })
        .catch(() => setIsError(true));
    });
  };

  // fetch on mount
  useEffect(fetchSession, []);

  return <ZebraSessionResult>{
    isLoading,
    session: session.current,
    isError,
    refetchSession: isLoading ? () => {} : fetchSession,
  };
};
