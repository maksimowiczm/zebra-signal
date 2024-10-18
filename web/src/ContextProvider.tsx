import React from "react";
import { IceServersProvider } from "./context/IceServersContext.tsx";

export function ContextProvider({ children }: { children: React.ReactNode }) {
  return <IceServersProvider>{children}</IceServersProvider>;
}
