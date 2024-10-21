import React from "react";
import { IceServersProvider } from "./contexts/IceServersContext.tsx";
import { SnackbarProvider } from "./hooks/useSnackbar.tsx";

export function ContextProvider({ children }: { children: React.ReactNode }) {
  return (
    <SnackbarProvider>
      <IceServersProvider>{children}</IceServersProvider>
    </SnackbarProvider>
  );
}
