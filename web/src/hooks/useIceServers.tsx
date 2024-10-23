import React, { createContext, useContext, useEffect, useState } from "react";

interface IceServersContextProps {
  iceServers: RTCIceServer[];
  addIceServer: (server: RTCIceServer) => void;
  removeIceServer: (server: RTCIceServer) => void;
  setDefault: () => void;
  isDefault: boolean;
}
const IceServersContext = createContext<IceServersContextProps>({
  iceServers: [],
  addIceServer: () => {},
  removeIceServer: () => {},
  setDefault: () => {},
  isDefault: false,
});

const LOCAL_STORAGE_KEY = "ice-servers";
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
  const [iceServers, setIceServers] = useState<RTCIceServer[]>([]);

  useEffect(() => {
    const savedIceServers = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedIceServers) {
      setIceServers(JSON.parse(savedIceServers));
    } else {
      setIceServers(defaultIce);
    }
  }, []);

  const addIceServer = (server: RTCIceServer) => {
    const newIceServers = [...iceServers, server];
    setIceServers(newIceServers);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newIceServers));
  };

  const removeIceServer = (server: RTCIceServer) => {
    const newIceServers = iceServers.filter(
      (iceServer) => iceServer.urls[0] !== server.urls[0],
    );
    setIceServers(newIceServers);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newIceServers));
  };

  const setDefault = () => {
    setIceServers(defaultIce);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return (
    <IceServersContext.Provider
      value={{
        iceServers,
        addIceServer,
        removeIceServer,
        setDefault,
        isDefault: JSON.stringify(iceServers) === JSON.stringify(defaultIce),
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
