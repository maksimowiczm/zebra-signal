import protobuf from "protobufjs";
import { useEffect, useState } from "react";

export enum Who {
  YOU = "you",
  REMOTE = "remote",
}

export enum MessageType {
  PUBLIC = 1,
  PRIVATE = 2,
}

export interface Message {
  who: Who;
  type: MessageType;
  content: string;
  description: string | undefined;
}

interface Props {
  dataChannel: RTCDataChannel;
}

type ZebraSignalDataChannelResult =
  | {
      isConnected: true;
      send: (message: Omit<Message, "who">) => void;
      messages: Message[];
    }
  | {
      isConnected: false;
      send: undefined;
      messages: Message[];
    };

export const useZebraSignalDataChannel = ({
  dataChannel,
}: Props): ZebraSignalDataChannelResult => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (dataChannel.readyState === "open") {
      setIsConnected(true);
    }

    const onOpen = () => setIsConnected(true);
    const onClose = () => setIsConnected(false);
    const onError = () => setIsConnected(false);

    dataChannel.addEventListener("open", onOpen);
    dataChannel.addEventListener("close", onClose);
    dataChannel.addEventListener("error", onError);

    return () => {
      dataChannel.removeEventListener("open", onOpen);
      dataChannel.removeEventListener("close", onClose);
      dataChannel.removeEventListener("error", onError);
    };
  }, [dataChannel]);

  const send = (message: Message) => {
    protobuf.load("/proto/message.proto", (err, root) => {
      if (err) {
        console.error(err);
        return;
      }

      const ZebraMessage = root?.lookupType("zebra.Message");
      const payload = ZebraMessage?.create(message);

      if (!payload) {
        console.error("Failed to create payload");
        return;
      }

      const buffer = ZebraMessage?.encode(payload).finish();

      if (!buffer) {
        console.error("Failed to encode payload");
        return;
      }

      try {
        dataChannel.send(buffer);

        message.who = Who.YOU;
        setMessages((prev) => [...prev, message]);
      } catch (error) {
        console.error("Failed to send message");
      }
    });
  };

  useEffect(() => {
    const onMessage = async (event: MessageEvent) => {
      let arrayBuffer: ArrayBuffer;
      if (event.data instanceof ArrayBuffer) {
        arrayBuffer = event.data;
      } else if (event.data instanceof Blob) {
        arrayBuffer = await event.data.arrayBuffer();
      } else {
        return;
      }

      const buffer = new Uint8Array(arrayBuffer);

      protobuf.load("/proto/message.proto", (err, root) => {
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

        const message = ZebraMessage?.toObject(decoded) as Message;

        message.who = Who.REMOTE;

        setMessages((prev) => [...prev, message]);
      });
    };

    dataChannel.addEventListener("message", onMessage);

    return () => {
      dataChannel.removeEventListener("message", onMessage);
    };
  }, [dataChannel, messages]);

  return <ZebraSignalDataChannelResult>{
    isConnected,
    messages,
    send: isConnected ? send : undefined,
  };
};
