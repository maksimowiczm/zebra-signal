import { useContext, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ArrowBackIcon from "../assets/material_icons/ArrowBackIcon.tsx";
import SettingsIcon from "../assets/material_icons/SettingsIcon.tsx";
import { IceServersComponent } from "../components/IceServersComponent.tsx";
import { NavigationBar } from "../components/NavigationBar.tsx";
import { PeerConnectionComponent } from "../components/PeerConnectionComponent.tsx";
import { PeerConnectionConnectingComponent } from "../components/PeerConnectionConnectingComponent.tsx";
import { PeerConnectionErrorComponent } from "../components/PeerConnectionErrorComponent.tsx";
import { IceServersContext } from "../context/IceServersContext.tsx";
import { useWebRTCDataChannel } from "../hooks/useWebRTCDataChannel.ts";
import { useZebraSignalSocket } from "../hooks/useZebraSignalSocket.ts";

export function ConnectToSession() {
  const [iceOpened, setIceOpened] = useState(false);
  const [token, setToken] = useState<string | undefined>(undefined);
  const handleCancel = () => setToken(undefined);

  const input = useRef<HTMLInputElement>(null);

  if (token) {
    return <TokenReady token={token} handleCancel={handleCancel} />;
  }

  if (iceOpened) {
    return <IceServersComponent onBack={() => setIceOpened(false)} />;
  }

  return (
    <>
      <NavigationBar
        leadingComponent={
          <Link to="/">
            <button className="btn btn-ghost items-center">
              <ArrowBackIcon fill={"oklch(var(--bc))"} />
              Back
            </button>
          </Link>
        }
        trailingComponent={
          <button
            className="btn btn-ghost items-center"
            onClick={() => setIceOpened(true)}
          >
            <SettingsIcon fill={"oklch(var(--bc))"} />
            ICE Servers
          </button>
        }
      />
      <div className="flex flex-col h-full w-full justify-center items-center">
        <input
          ref={input}
          className="input input-bordered w-full max-w-xs m-5"
          type="text"
          placeholder="Session token"
        />
        <button
          className="btn btn-primary"
          onClick={() => setToken(input.current?.value)}
        >
          Connect
        </button>
      </div>
    </>
  );
}

function TokenReady({
  token,
  handleCancel,
}: { token: string; handleCancel: () => void }) {
  const { isConnecting, isError, socket } = useZebraSignalSocket(token);

  if (isError) {
    return <PeerConnectionErrorComponent />;
  }

  if (isConnecting) {
    return <PeerConnectionConnectingComponent handleCancel={handleCancel} />;
  }

  return (
    <PeerConnectingComponent socket={socket} handleCancel={handleCancel} />
  );
}

function PeerConnectingComponent({
  socket,
  handleCancel,
}: { socket: WebSocket; handleCancel: () => void }) {
  const { iceServers } = useContext(IceServersContext);

  const { isReady, dataChannel } = useWebRTCDataChannel({
    signalingChannel: socket,
    iceServers: iceServers.map(({ url }) => ({
      urls: url,
    })),
  });

  if (isReady) {
    return <PeerConnectionComponent dataChannel={dataChannel} />;
  }

  return <PeerConnectionConnectingComponent handleCancel={handleCancel} />;
}
