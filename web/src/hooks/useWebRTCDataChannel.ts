import { useEffect, useRef, useState } from "react";

interface Props {
  signalingChannel: WebSocket;
  iceServers: RTCIceServer[];
}

type WebRTCPeerResult =
  // Created
  | {
      peerConnection: undefined;
      isReady: false;
      isConnecting: false;
      dataChannel: undefined;
    }
  // Waiting for an offer or answer
  | {
      peerConnection: RTCPeerConnection;
      isReady: false;
      isConnecting: false;
      dataChannel: undefined;
    }
  // Peer is connecting, waiting for data channel
  | {
      peerConnection: RTCPeerConnection;
      isReady: false;
      isConnecting: true;
      dataChannel: undefined;
    }
  // Ready
  | {
      peerConnection: RTCPeerConnection;
      isReady: true;
      isConnecting: false;
      dataChannel: RTCDataChannel;
    };

export const useWebRTCDataChannel = ({
  signalingChannel,
  iceServers,
}: Props): WebRTCPeerResult => {
  const dataChannel = useRef<RTCDataChannel | undefined>(undefined);
  const peerConnection = useRef<RTCPeerConnection | undefined>(undefined);
  const [isReady, setIsReady] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const cleanup = () => {
    dataChannel.current?.close();
    peerConnection.current?.close();
    peerConnection.current = undefined;
    dataChannel.current = undefined;
    setIsReady(false);
    setIsConnecting(false);
  };

  useEffect(() => {
    isReady && setIsConnecting(false);
  }, [isReady]);

  const onDataChannel = (dc: RTCDataChannel) => {
    dataChannel.current = dc;
    dc.onopen = () => setIsReady(true);
    dc.onerror = cleanup;
  };

  useEffect(() => {
    const configuration = { iceServers };
    const pc = new RTCPeerConnection(configuration);
    peerConnection.current = pc;

    pc.onconnectionstatechange = () => {
      if (
        pc.connectionState === "disconnected" ||
        pc.connectionState === "closed"
      ) {
        cleanup();
      }

      if (pc.connectionState === "connected") {
        signalingChannel.close();
      }
    };

    pc.onicecandidate = (event) => {
      if (!event.candidate) {
        return;
      }

      const message = {
        type: "candidate",
        candidate: event.candidate.candidate,
        sdpMid: event.candidate.sdpMid,
        sdpMLineIndex: event.candidate.sdpMLineIndex,
      };

      signalingChannel.send(JSON.stringify(message));
    };

    signalingChannel.onmessage = (event) => {
      // Ignore if we are connected
      if (isReady) {
        return;
      }
      // If we are not ready we have just started connecting
      setIsConnecting(true);

      const message = JSON.parse(event.data);

      if (message.type === "answer") {
        return handleAnswer(message, pc);
      }

      // If we got offer we listen for a data channel
      if (message.type === "offer") {
        pc.ondatachannel = (e) => onDataChannel(e.channel);
        return handleOffer(message, pc, signalingChannel);
      }

      if (message.type === "candidate") {
        return handleCandidate(message, pc);
      }
    };

    // Create a data channel and offer
    // We might not need it if we are the one who got the offer
    const dc = pc.createDataChannel("dead_inside");
    onDataChannel(dc);

    pc.createOffer()
      .then(async (offer) => {
        signalingChannel.send(JSON.stringify(offer));
        await pc.setLocalDescription(offer);
      })
      .catch((e) => {
        console.error("Error creating offer", e);
      });

    return cleanup;
  }, [signalingChannel]);

  return <WebRTCPeerResult>{
    peerConnection: peerConnection.current,
    isReady,
    dataChannel: dataChannel.current,
    isConnecting,
  };
};

async function handleOffer(
  offer: RTCSessionDescriptionInit,
  peerConnection: RTCPeerConnection,
  signalingChannel: WebSocket,
) {
  try {
    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    signalingChannel.send(JSON.stringify(answer));
    await peerConnection.setLocalDescription(answer);
  } catch (e) {
    console.error("Error handling offer", e);
  }
}

async function handleCandidate(
  candidate: RTCIceCandidate,
  peerConnection: RTCPeerConnection,
) {
  try {
    await peerConnection.addIceCandidate(candidate);
  } catch (e) {
    console.warn("Error adding ice candidate", e);
  }
}

async function handleAnswer(
  answer: RTCSessionDescriptionInit,
  peerConnection: RTCPeerConnection,
) {
  try {
    await peerConnection.setRemoteDescription(answer);
  } catch (e) {
    console.error("Error handling answer", e);
  }
}
