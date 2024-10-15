import React, { useContext, useEffect, useState } from "react";
import { IceServersContext } from "../../context/useIceServers.tsx";
import { useWebRTCPeerConnection } from "../../hooks/useWebRTCPeerConnection.ts";
import { Session, useZebraSignalSocket } from "../../hooks/useWebSocket.ts";
import { QRCodeComponent } from "../QRCodeComponent.tsx";
import { PeerConnectionComponent } from "./PeerConnectionComponent.tsx";

export function SessionComponent() {
  const { isReady, socket, session, reset, isError } = useZebraSignalSocket();

  let child: React.JSX.Element;

  if (isError) {
    child = <SessionError />;
  } else if (isReady) {
    child = <SessionReady socket={socket} session={session} reset={reset} />;
  } else {
    child = <SessionLoading token={session?.token} />;
  }

  return (
    <div className="relative flex flex-col justify-center h-full items-center">
      {child}
      <button className="btn btn-primary bottom-0 absolute m-5" onClick={reset}>
        Reset
      </button>
    </div>
  );
}

const SessionLoading = ({ token = "zebra" }: { token?: string }) => (
  <div className="relative flex justify-center items-center">
    <div className="blur bottom-0 left-0">
      <QRWrapper token={token} />
    </div>
    <div className="absolute loading loading-spinner loading-lg text-primary" />
  </div>
);

const SessionError = () => (
  <div>Failed to fetch session. Is the server running?</div>
);

function SessionReady({
  socket,
  session,
  reset,
}: { socket: WebSocket; session: Session; reset: () => void }) {
  const { iceServers } = useContext(IceServersContext);
  const { dataChannel, isReady, isConnecting } = useWebRTCPeerConnection({
    signalingChannel: socket,
    iceServers: iceServers.map(({ url }) => ({ urls: url })),
  });

  if (isConnecting) {
    return <SessionLoading token={session.token} />;
  }

  if (isReady) {
    return <PeerConnectionComponent dataChannel={dataChannel} />;
  }

  return <SessionContent session={session} reset={reset} />;
}

function SessionContent({
  session,
  reset,
}: { session: Session; reset: () => void }) {
  const [timeLeft, setTimeLeft] = useState(session.expires * 1000 - Date.now());

  useEffect(() => {
    setTimeLeft(session.expires * 1000 - Date.now());
  }, [session]);

  useEffect(() => {
    const id = setTimeout(reset, timeLeft);
    return () => clearTimeout(id);
  }, [timeLeft]);

  return (
    <div>
      <QRWrapper token={session.token} />
      <ProgressBar length={timeLeft} />
    </div>
  );
}

function ProgressBar({ length }: { length: number }) {
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [start, setStart] = useState(length);

  const firstFrame = (frame: number) => {
    setStart(frame);
    setProgress(0);
  };
  useEffect(() => {
    requestAnimationFrame(firstFrame);
  }, []);

  const step = (frame: number) =>
    setProgress(Math.max(start + length - frame, 0));
  useEffect(() => {
    requestAnimationFrame(step);
  }, [progress]);

  return <progress className="progress" max={length} value={progress || 0} />;
}

const QRWrapper = ({ token }: { token: string }) => (
  <div className="flex flex-col justify-center">
    <QRCodeComponent
      className="flex justify-center p-2"
      fill="oklch(var(--bc)"
      padding={0}
      errorCorrectionLevel="L"
      message={token}
    />
    <div className="text-center tracking-widest text-2xl">{token}</div>
  </div>
);
