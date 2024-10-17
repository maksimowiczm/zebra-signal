import { useState } from "react";
import ArrowBackIcon from "../assets/ArrowBackIcon.tsx";
import SettingsIcon from "../assets/SettingsIcon.tsx";
import { useZebraSignalSocket } from "../hooks/useZebraSignalSocket.ts";

interface ConnectToSessionComponentProps {
  onBack: () => void;
  onIceServers: () => void;
}
export function ConnectToSessionComponent({
  onBack,
  onIceServers,
}: ConnectToSessionComponentProps) {
  return (
    <>
      <div className="flex justify-between">
        <button className="btn btn-ghost items-center" onClick={onBack}>
          <ArrowBackIcon fill={"oklch(var(--bc))"} />
          Back
        </button>
        <button className="btn btn-ghost items-center" onClick={onIceServers}>
          <SettingsIcon fill={"oklch(var(--bc))"} />
          ICE Servers
        </button>
      </div>
      <SessionForm />
    </>
  );
}

function SessionForm() {
  const [sessionToken, setSessionToken] = useState<string>("");
  const [realToken, setRealToken] = useState<string | undefined>(undefined);
  // @ts-ignore
  const { isReady, isError, socket } = useZebraSignalSocket(realToken);

  const handleConnect = () => {
    setRealToken(sessionToken);
  };

  return (
    <div className="flex flex-col h-full w-full justify-center items-center">
      <input
        className="input input-bordered w-full max-w-xs m-5"
        type="text"
        placeholder="Session token"
        value={sessionToken}
        onChange={(e) => setSessionToken(e.target.value)}
      />
      <button className="btn btn-primary" onClick={handleConnect}>
        Connect
      </button>
    </div>
  );
}
