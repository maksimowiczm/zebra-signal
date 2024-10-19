import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ContextProvider } from "./ContextProvider.tsx";

createRoot(document.getElementById("root")!).render(
  // StrictMode breaks zebra signal socket, you can connect only once, disable it for now
  // <StrictMode>
  <ContextProvider>
    <App />
  </ContextProvider>,
  // </StrictMode>,
);
