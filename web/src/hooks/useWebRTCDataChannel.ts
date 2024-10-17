import { useEffect, useRef, useState } from "react";

interface Props {
  signalingChannel: WebSocket;
  iceServers: RTCIceServer[];
  /// If owner is true then we are responsible for creating the offer and handling signaling channel
  owner?: boolean;
}

type WebRTCPeerResult =
  // Not connected
  | {
      peerConnection: undefined;
      isReady: false;
      isConnecting: false;
      dataChannel: undefined;
    }
  // Connecting
  | {
      peerConnection: undefined;
      isReady: false;
      isConnecting: true;
      dataChannel: undefined;
    }
  // Peer connection created, waiting for data channel
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
  owner = false,
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

    signalingChannel.onmessage = async (event) => {
      // If we are not ready we are connecting
      !isReady && setIsConnecting(true);

      const message = JSON.parse(event.data);

      // If we are the owner we only care about answers
      if (owner && message.type === "answer") {
        return await handleAnswer(message, pc);
      }

      // If we are not the owner we only care about offers
      if (!owner && message.type === "offer") {
        return await handleOffer(message, pc, signalingChannel);
      }

      // Handle ice candidates
      if (message.type === "candidate") {
        return await handleCandidate(message, pc);
      }
    };

    // If we are the owner we need to create the data channel
    if (owner) {
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
    }
    // If we are not the owner we need to wait for the data channel to be created
    if (!owner) {
      pc.ondatachannel = (e) => onDataChannel(e.channel);
    }

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
    console.error("Error adding ice candidate", e);
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
