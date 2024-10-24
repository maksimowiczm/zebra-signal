import React, { createContext, useContext, useEffect, useState } from "react";
import { decryptData, encryptData, useCipher } from "./useCipher.ts";
import { useIndexedDB } from "./useIndexedDB.ts";

interface IceServersContextPropsBase {
  isLoading: boolean;
  iceServers: RTCIceServer[] | undefined;
  addIceServer: ((server: RTCIceServer) => void) | undefined;
  removeIceServer: ((server: RTCIceServer) => void) | undefined;
  setDefault: (() => void) | undefined;
}

interface IceServersContextPropsLoading extends IceServersContextPropsBase {
  isLoading: true;
  iceServers: undefined;
  addIceServer: undefined;
  removeIceServer: undefined;
  setDefault: undefined;
}

interface IceServersContextPropsSuccess extends IceServersContextPropsBase {
  isLoading: false;
  iceServers: RTCIceServer[];
  addIceServer: (server: RTCIceServer) => void;
  removeIceServer: (server: RTCIceServer) => void;
  setDefault: () => void;
}

type IceServersContextProps =
  | IceServersContextPropsLoading
  | IceServersContextPropsSuccess;

const IceServersContext = createContext<IceServersContextProps>({
  isLoading: true,
  iceServers: undefined,
  addIceServer: undefined,
  removeIceServer: undefined,
  setDefault: undefined,
});

const defaultIce: RTCIceServer[] = [
  {
    urls: ["stun:stun.l.google.com:19302"],
    username: undefined,
    credential: undefined,
  },
];

export function IceServersProvider({
  children,
}: { children: React.ReactNode }) {
  const { key } = useCipher();
  const [iceServers, setIceServers] = useState<RTCIceServer[]>([]);

  const { isLoading, isError, db } = useIndexedDB({
    databaseName: "iceServersDB",
    version: 1,
    onUpgradeNeeded: (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      db.createObjectStore("iceServersStore");
    },
  });

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (isError) {
      console.error("Error loading ice servers");
      setIceServers(defaultIce);
      return;
    }

    const request = db!!
      .transaction("iceServersStore", "readonly")
      .objectStore("iceServersStore")
      .get("iceServers");

    const handleSuccess = async (e: Event) => {
      const data = (e.target as IDBRequest).result;
      const decryptedData = await decryptData(key!, data);
      const iceServers = decryptedData ? JSON.parse(decryptedData) : null;

      if (iceServers) {
        setIceServers(iceServers);
      } else {
        setIceServers(defaultIce);
      }
    };

    const handleError = (e: Event) => {
      console.error(e);
      setIceServers(defaultIce);
    };

    request.addEventListener("error", handleError);
    request.addEventListener("success", handleSuccess);

    return () => {
      request.removeEventListener("error", handleError);
      request.removeEventListener("success", handleSuccess);
    };
  }, [isLoading, isError]);

  const addIceServer = async (server: RTCIceServer) => {
    const newIceServers = [...iceServers, server];
    setIceServers(newIceServers);

    if (!key) {
      console.error("No key found for encryption");
      return;
    }

    const encryptedIceServers = await encryptData(
      key,
      JSON.stringify(newIceServers),
    );

    const request = db!!
      .transaction("iceServersStore", "readwrite")
      .objectStore("iceServersStore")
      .put(encryptedIceServers, "iceServers");

    request.addEventListener("error", (e) => {
      console.error(e);
      setIceServers(iceServers);
    });

    request.addEventListener("success", () => {
      console.log("Ice servers added to indexedDB");
    });
  };

  const removeIceServer = (server: RTCIceServer) => {
    const newIceServers = iceServers.filter(
      (iceServer) => iceServer.urls[0] !== server.urls[0],
    );
    setIceServers(newIceServers);
  };

  const setDefault = () => {
    setIceServers(defaultIce);
  };

  return isLoading ? (
    <IceServersContext.Provider
      value={{
        isLoading,
        iceServers: undefined,
        addIceServer: undefined,
        removeIceServer: undefined,
        setDefault: undefined,
      }}
    >
      {children}
    </IceServersContext.Provider>
  ) : (
    <IceServersContext.Provider
      value={{
        isLoading,
        iceServers,
        addIceServer,
        removeIceServer,
        setDefault,
      }}
    >
      {children}
    </IceServersContext.Provider>
  );
}

export const useIceServers = () => {
  const context = useContext(IceServersContext);
  if (context === undefined) {
    throw new Error("useIceServers must be used within a IceServersProvider");
  }
  return context;
};
