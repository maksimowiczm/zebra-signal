import { ArrowBackIcon, SettingsIcon } from "@material-icons";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { NavigationBar } from "../components/NavigationBar.tsx";
import { PeerConnectionComponent } from "../components/PeerConnectionComponent.tsx";
import { PeerConnectionConnectingComponent } from "../components/PeerConnectionConnectingComponent.tsx";
import { PeerConnectionErrorComponent } from "../components/PeerConnectionErrorComponent.tsx";
import { ProgressBarComponent } from "../components/ProgressBarComponent.tsx";
import { QRCodeComponent } from "../components/QRCodeComponent.tsx";
import { IceServersComponent } from "../components/ice/IceServersComponent.tsx";
import { useWebRTCDataChannel } from "../hooks/network/useWebRTCDataChannel.ts";
import { Session, useZebraSession } from "../hooks/network/useZebraSession.ts";
import { useZebraSignalSocket } from "../hooks/network/useZebraSignalSocket.ts";
import { useIceServers } from "../hooks/useIceServers.tsx";
import { useSnackbar } from "../hooks/useSnackbar.tsx";

export function CreateNewSession() {
  const { isLoading, isError, session, refetchSession } = useZebraSession();

  if (isError) {
    return (
      <CreateNewSessionContainer>
        <SessionError />
      </CreateNewSessionContainer>
    );
  }

  if (isLoading) {
    return (
      <CreateNewSessionContainer>
        <SessionLoading />
      </CreateNewSessionContainer>
    );
  }

  return <SessionReady session={session} refetchSession={refetchSession} />;
}

function CreateNewSessionContainer({
  children,
}: { children: React.ReactNode }) {
  const [iceOpened, setIceOpened] = useState(false);

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
      <div className="relative flex flex-col justify-center h-full items-center">
        {children}
      </div>
    </>
  );
}

function SessionLoading({ token = "zebra" }: { token?: string }) {
  return (
    <div className="relative flex justify-center items-center">
      <div>
        <QRWrapper token={token} isLoading={true} />
        <div className="blur">
          <ProgressBarComponent length={1_000_000_000} />
        </div>
      </div>
    </div>
  );
}

const SessionError = () => (
  <div>Failed to fetch session. Is the server running?</div>
);

function SessionReady({
  session,
  refetchSession,
}: {
  session: Session;
  refetchSession: () => void;
}) {
  const { isConnecting, isError, socket } = useZebraSignalSocket(session.token);

  if (isError) {
    return (
      <CreateNewSessionContainer>
        <PeerConnectionErrorComponent />
      </CreateNewSessionContainer>
    );
  }

  if (isConnecting) {
    return (
      <CreateNewSessionContainer>
        <SessionLoading token={session.token} />
      </CreateNewSessionContainer>
    );
  }

  return (
    <SocketReady
      socket={socket}
      session={session}
      refetchSession={refetchSession}
    />
  );
}

function SocketReady({
  socket,
  session,
  refetchSession,
}: { socket: WebSocket; session: Session; refetchSession: () => void }) {
  // WebRTC
  const { iceServers } = useIceServers();
  const { isReady, dataChannel, isConnecting } = useWebRTCDataChannel({
    signalingChannel: socket,
    iceServers,
    shouldOffer: false,
  });
  const [shouldRefresh, setShouldRefresh] = useState(true);

  useEffect(() => {
    if (shouldRefresh && isConnecting) {
      setShouldRefresh(false);
    }
  }, [isConnecting]);

  // Auto refresh
  const timeoutId = useRef<ReturnType<typeof setTimeout>>();
  const [timeLeft, setTimeLeft] = useState(session.expires * 1000 - Date.now());
  useEffect(() => {
    if (isReady) {
      clearTimeout(timeoutId.current);
    }
  }, [isReady]);

  useEffect(() => {
    setTimeLeft(session.expires * 1000 - Date.now());
  }, [session]);

  useEffect(() => {
    if (!shouldRefresh) {
      return;
    }

    const id = setTimeout(() => refetchSession(), timeLeft);
    timeoutId.current = id;
    return () => clearTimeout(id);
  }, [timeLeft, shouldRefresh]);

  // WebRTC ready
  if (isReady) {
    return <PeerConnectionComponent dataChannel={dataChannel} />;
  }

  if (isConnecting) {
    return <PeerConnectionConnectingComponent handleCancel={refetchSession} />;
  }

  return <SessionTokenDisplay token={session.token} timeLeft={timeLeft} />;
}

function SessionTokenDisplay({
  token,
  timeLeft,
}: { token: string; timeLeft: number }) {
  const snackbar = useSnackbar();

  const handleClick = async () => {
    await navigator.clipboard.writeText(token);
    snackbar("Copied to clipboard", "success");
  };

  return (
    <CreateNewSessionContainer>
      <div onClick={handleClick} className="cursor-pointer">
        <QRWrapper token={token} />
        <ProgressBarComponent length={timeLeft} />
      </div>
    </CreateNewSessionContainer>
  );
}

function QRWrapper({
  token,
  isLoading = false,
}: { token: string; isLoading?: boolean }) {
  return (
    <div className="flex flex-col justify-center relative">
      <QRCodeComponent
        className={`flex justify-center p-2 ${isLoading ? "blur" : ""}`}
        fill="oklch(var(--bc)"
        padding={0}
        errorCorrectionLevel="L"
        message={token}
      />
      <div
        className={`text-center tracking-widest text-2xl ${isLoading ? "blur" : ""}`}
      >
        {token}
      </div>
      {isLoading && (
        <div className="absolute w-full h-full flex items-center justify-center">
          <div className="loading loading-spinner loading-lg text-primary" />
        </div>
      )}
    </div>
  );
}
