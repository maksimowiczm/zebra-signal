import { useEffect, useRef, useState } from "react";

interface Props {
  signalingChannel: WebSocket;
  iceServers?: RTCIceServer[];
}

interface WebRTCPeerResultBase {
  peerConnection: RTCPeerConnection | undefined;
  isReady: boolean;
  isConnecting: boolean;
  dataChannel: RTCDataChannel | undefined;
}
interface WebRTCPeerResultNotReady extends WebRTCPeerResultBase {
  isReady: false;
  dataChannel: undefined;
}
interface WebRTCPeerResultReady extends WebRTCPeerResultBase {
  isReady: true;
  isConnecting: false;
  dataChannel: RTCDataChannel;
}
type WebRTCPeerResult = WebRTCPeerResultNotReady | WebRTCPeerResultReady;

export const useWebRTCPeerConnection = ({
  signalingChannel,
  iceServers = [{ urls: "stun:stun.l.google.com:19302" }],
}: Props): WebRTCPeerResult => {
  const dataChannel = useRef<RTCDataChannel | undefined>(undefined);
  const peerConnection = useRef<RTCPeerConnection | undefined>(undefined);
  const [isReady, setIsReady] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    isReady && setIsConnecting(false);
  }, [isReady]);

  useEffect(() => {
    const configuration = { iceServers };
    const pc = new RTCPeerConnection(configuration);
    peerConnection.current = pc;

    pc.ondatachannel = (e) => {
      dataChannel.current = e.channel;
      e.channel.onopen = () => setIsReady(true);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && event.candidate.candidate) {
        signalingChannel.send(JSON.stringify(event.candidate));
      }
    };

    signalingChannel.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      setIsConnecting(true);

      if (message.type === "offer") {
        await handleOffer(message, pc, signalingChannel);
      } else {
        await handleCandidate(message, pc);
      }
    };

    return () => pc.close();
  }, [signalingChannel]);

  return <WebRTCPeerResultNotReady | WebRTCPeerResultReady>{
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
    return peerConnection.addIceCandidate(candidate);
  } catch (e) {
    console.error("Error adding ice candidate", e);
  }
}
