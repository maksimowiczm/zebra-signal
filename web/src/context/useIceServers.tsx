import React, { createContext, useEffect, useState } from "react";

export interface IceServer {
  id: string;
  url: string;
}

interface IceServersContextProps {
  iceServers: IceServer[];
  addIceServer: (url: string) => void;
  removeIceServer: (id: string) => void;
  setDefault: () => void;
  isDefault: boolean;
}
export const IceServersContext = createContext<IceServersContextProps>({
  iceServers: [],
  addIceServer: () => {},
  removeIceServer: () => {},
  setDefault: () => {},
  isDefault: false,
});
const LOCAL_STORAGE_KEY = "ice-servers";
export function IceServersProvider({
  children,
}: { children: React.ReactNode }) {
  const [iceServers, setIceServers] = useState<IceServer[]>([]);
  const defaultIce = [{ id: "1", url: "stun:stun.l.google.com:19302" }];

  useEffect(() => {
    const savedIceServers = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedIceServers) {
      setIceServers(JSON.parse(savedIceServers));
    } else {
      setIceServers(defaultIce);
    }
  }, []);

  const addIceServer = (url: string) => {
    const id = Math.random().toString(36).slice(2);
    const newIceServers = [...iceServers, { id, url }];
    setIceServers(newIceServers);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newIceServers));
  };
  const removeIceServer = (id: string) => {
    const newIceServers = iceServers.filter((iceServer) => iceServer.id !== id);
    setIceServers(newIceServers);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newIceServers));
  };
  const setDefault = () => {
    setIceServers([...defaultIce]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return (
    <IceServersContext.Provider
      value={{
        iceServers,
        addIceServer,
        removeIceServer,
        setDefault,
        isDefault:
          iceServers[0]?.url === defaultIce[0].url && iceServers.length === 1,
      }}
    >
      {children}
    </IceServersContext.Provider>
  );
}
