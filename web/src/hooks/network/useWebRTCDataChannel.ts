import { useEffect, useRef, useState } from "react";

const DATA_CHANNEL_NAME = "ZEBRA";
const DATA_CHANNEL_ID = 0;

interface Props {
  signalingChannel: WebSocket;
  iceServers: RTCIceServer[];
  // If true, we will create an offer, otherwise we will wait for an offer
  shouldOffer: boolean;
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
  shouldOffer,
}: Props): WebRTCPeerResult => {
  const dataChannel = useRef<RTCDataChannel | undefined>(undefined);
  const peerConnection = useRef<RTCPeerConnection | undefined>(undefined);
  const [isReady, setIsReady] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleDataChannel = (dc: RTCDataChannel) => {
    const handleOpen = () => {
      setIsReady(true);
    };
    const handleClose = () => {
      // todo
    };
    const handleError = (e: Event) => {
      console.error("Data channel error", e);
    };

    dataChannel.current?.close();
    dataChannel.current?.removeEventListener("open", handleOpen);
    dataChannel.current?.removeEventListener("close", handleClose);
    dataChannel.current?.removeEventListener("error", handleError);

    dataChannel.current = dc;
    dc.addEventListener("open", handleOpen);
    dc.addEventListener("close", handleClose);
    dc.addEventListener("error", handleError);
  };

  const handleIceCandidate = (event: RTCPeerConnectionIceEvent) => {
    try {
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
    } catch (e) {
      console.warn("Error sending ice candidate", e);
    }
  };

  const handleMessage = (event: MessageEvent) => {
    if (!peerConnection.current) {
      return;
    }

    const pc = peerConnection.current;

    // Ignore if we are connected
    if (isReady) {
      return;
    }
    // If we are not ready we have just started connecting
    setIsConnecting(true);

    const message = JSON.parse(event.data);

    if (message.type === "candidate") {
      return handleCandidate(message, pc);
    }

    if (message.type === "answer" && shouldOffer) {
      return handleAnswer(message, pc);
    }

    // If we got offer we listen for a data channel
    if (message.type === "offer" && !shouldOffer) {
      pc.ondatachannel = (e) => handleDataChannel(e.channel);
      return handleOffer(message, pc, signalingChannel);
    }
  };

  const handleConnectionStateChange = () => {
    if (!peerConnection.current) {
      return;
    }

    const pc = peerConnection.current;

    if (
      pc.connectionState === "disconnected" ||
      pc.connectionState === "closed"
    ) {
    }

    // Close the signaling channel if we are connected
    if (pc.connectionState === "connected") {
      signalingChannel.close();
    }
  };

  useEffect(() => {
    const pc = new RTCPeerConnection({ iceServers });
    peerConnection.current = pc;

    pc.addEventListener("connectionstatechange", handleConnectionStateChange);
    pc.addEventListener("icecandidate", handleIceCandidate);
    signalingChannel.addEventListener("message", handleMessage);

    const dc = pc.createDataChannel(DATA_CHANNEL_NAME, {
      id: DATA_CHANNEL_ID,
      ordered: true,
      negotiated: true,
    });
    handleDataChannel(dc);

    if (shouldOffer) {
      pc.createOffer()
        .then(async (offer) => {
          signalingChannel.send(JSON.stringify(offer));
          await pc.setLocalDescription(offer);
        })
        .catch((e) => {
          console.error("Error creating offer", e);
        });
    }

    return () => {
      pc.close();
      signalingChannel.removeEventListener("message", handleMessage);
      pc.removeEventListener("icecandidate", handleIceCandidate);
      pc.removeEventListener(
        "connectionstatechange",
        handleConnectionStateChange,
      );
    };
  }, [signalingChannel]);

  return <WebRTCPeerResult>{
    peerConnection: peerConnection.current,
    isReady,
    dataChannel: dataChannel.current,
    isConnecting: isReady ? false : isConnecting,
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
