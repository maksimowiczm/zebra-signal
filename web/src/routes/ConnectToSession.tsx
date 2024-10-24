import { ArrowBackIcon, SettingsIcon } from "@material-icons";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { NavigationBar } from "../components/NavigationBar.tsx";
import { PeerConnectionComponent } from "../components/PeerConnectionComponent.tsx";
import { PeerConnectionConnectingComponent } from "../components/PeerConnectionConnectingComponent.tsx";
import { PeerConnectionErrorComponent } from "../components/PeerConnectionErrorComponent.tsx";
import { IceServersComponent } from "../components/ice/IceServersComponent.tsx";
import { useWebRTCDataChannel } from "../hooks/network/useWebRTCDataChannel.ts";
import { useZebraSignalSocket } from "../hooks/network/useZebraSignalSocket.ts";
import { useIceServers } from "../hooks/useIceServers.tsx";

export function ConnectToSession() {
  const [iceOpened, setIceOpened] = useState(false);

  const { isLoading, iceServers } = useIceServers();
  const [token, setToken] = useState<string | undefined>(undefined);
  const handleCancel = () => setToken(undefined);

  const input = useRef<HTMLInputElement>(null);

  if (isLoading) {
    return <div>todo</div>;
  }

  if (token) {
    return (
      <TokenReady
        iceServers={iceServers}
        token={token}
        handleCancel={handleCancel}
      />
    );
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
              <ArrowBackIcon className="fill-current h-6 w-6" />
              Back
            </button>
          </Link>
        }
        trailingComponent={
          <button
            className="btn btn-ghost items-center"
            onClick={() => setIceOpened(true)}
          >
            <SettingsIcon className="fill-current h-6 w-6" />
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
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setToken(input.current?.value);
            }
          }}
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
  iceServers,
  token,
  handleCancel,
}: {
  iceServers: RTCIceServer[];
  token: string;
  handleCancel: () => void;
}) {
  const { isConnecting, isError, socket } = useZebraSignalSocket(token);

  if (isError) {
    return <PeerConnectionErrorComponent />;
  }

  if (isConnecting) {
    return <PeerConnectionConnectingComponent handleCancel={handleCancel} />;
  }

  return (
    <PeerConnectingComponent
      iceServers={iceServers}
      socket={socket}
      handleCancel={handleCancel}
    />
  );
}

function PeerConnectingComponent({
  iceServers,
  socket,
  handleCancel,
}: {
  iceServers: RTCIceServer[];
  socket: WebSocket;
  handleCancel: () => void;
}) {
  const { isReady, dataChannel } = useWebRTCDataChannel({
    signalingChannel: socket,
    iceServers,
    shouldOffer: true,
  });

  if (isReady) {
    return <PeerConnectionComponent dataChannel={dataChannel} />;
  }

  return <PeerConnectionConnectingComponent handleCancel={handleCancel} />;
}
