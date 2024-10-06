import protobuf from "protobufjs";

export enum MessageType {
  PUBLIC = 1,
  PRIVATE = 2,
}
export interface Message {
  type: MessageType;
  content: string;
  description: string;
}

export interface Session {
  token: string;
  expires: number;
  peerConnection: RTCPeerConnection;
  socket: WebSocket;
}

async function fetchSession(): Promise<{
  token: string;
  expires: number;
}> {
  const response = await fetch("/session");
  return await response.json();
}

interface SessionListener {
  readonly onMessage?: (e: Message) => void;
  readonly onConnecting?: () => void;
  readonly onOpen?: () => void;
  readonly onClose?: () => void;
  readonly onError?: (e: Event) => void;
}

export async function setupSession(
  sessionListener?: SessionListener,
): Promise<Session> {
  const session = await fetchSession();
  const socket = new WebSocket(`/ws?token=${session.token}`);

  const iceServers = [{ urls: "stun:stun.l.google.com:19302" }];
  const configuration = { iceServers };
  const peerConnection = new RTCPeerConnection(configuration);

  peerConnection.addEventListener("datachannel", (e) => {
    handleDataChannel(e, sessionListener);
  });

  peerConnection.addEventListener("icecandidate", (event) => {
    if (!event.candidate || event.candidate.candidate === "") {
      return;
    }

    socket.send(JSON.stringify(event.candidate));
  });

  socket.addEventListener("message", async (event) => {
    const message = JSON.parse(event.data);

    if (message.type === "offer") {
      sessionListener?.onConnecting?.();
      await handleOffer(message, peerConnection, socket);
    } else {
      await handleCandidate(message, peerConnection);
    }
  });

  return { ...session, peerConnection, socket };
}

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

function handleDataChannel(
  event: RTCDataChannelEvent,
  listener?: {
    onMessage?: (e: Message) => void;
    onOpen?: () => void;
    onClose?: () => void;
    onError?: (e: Event) => void;
  },
) {
  const dataChannel = event.channel;
  dataChannel.addEventListener("message", (e) =>
    handleDataChannelMessage(e, listener),
  );
  dataChannel.addEventListener("open", () => listener?.onOpen?.());
  dataChannel.addEventListener("close", () => listener?.onClose?.());
  dataChannel.addEventListener("error", (e) => listener?.onError?.(e));
}

async function handleDataChannelMessage(
  event: MessageEvent,
  listener?: { onMessage?: (e: Message) => void },
) {
  let arrayBuffer: ArrayBuffer;
  if (event.data instanceof ArrayBuffer) {
    arrayBuffer = event.data;
  } else if (event.data instanceof Blob) {
    arrayBuffer = await event.data.arrayBuffer();
  } else {
    return;
  }

  const buffer = new Uint8Array(arrayBuffer);

  protobuf.load("proto/message.proto", (err, root) => {
    if (err) {
      console.error(err);
      return;
    }

    const ZebraMessage = root?.lookupType("zebra.Message");
    const decoded = ZebraMessage?.decode(buffer);

    if (!decoded) {
      console.error("Failed to decode message");
      return;
    }

    const message = ZebraMessage?.toObject(decoded) as {
      type: number;
      content: string;
    } as Message;

    listener?.onMessage?.(message);
  });
}
