import { useEffect, useRef, useState } from "react";

interface useIndexedDBResultBase {
  isLoading: boolean;
  isError: boolean;
  db: IDBDatabase | undefined;
}

interface useIndexedDBSuccess extends useIndexedDBResultBase {
  isLoading: false;
  isError: false;
  db: IDBDatabase;
}

interface useIndexedDBResultLoading extends useIndexedDBResultBase {
  isLoading: true;
  isError: false;
  db: undefined;
}

interface useIndexedDBResultError extends useIndexedDBResultBase {
  isLoading: false;
  isError: true;
  db: undefined;
}

type useIndexedDBResult =
  | useIndexedDBSuccess
  | useIndexedDBResultLoading
  | useIndexedDBResultError;

export function useIndexedDB({
  databaseName,
  version,
  onUpgradeNeeded,
}: {
  databaseName: string;
  version: number;
  onUpgradeNeeded: (this: IDBOpenDBRequest, ev: IDBVersionChangeEvent) => any;
}): useIndexedDBResult {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const db = useRef<IDBDatabase>();

  useEffect(() => {
    const request = indexedDB.open(databaseName, version);

    const handleError = (e: Event) => {
      setIsError(true);
      console.error(e);
    };
    const handleSuccess = (e: Event) => {
      db.current = (e.target as IDBOpenDBRequest).result;
      setIsLoading(false);
    };

    request.addEventListener("error", handleError);
    request.addEventListener("success", handleSuccess);
    request.addEventListener("upgradeneeded", onUpgradeNeeded);

    return () => {
      request.removeEventListener("error", handleError);
      request.removeEventListener("success", handleSuccess);
      request.removeEventListener("upgradeneeded", onUpgradeNeeded);

      if (db.current) {
        db.current.close();
      }
    };
  }, []);

  return <useIndexedDBResult>{
    isLoading,
    isError,
    db: db.current,
  };
}
