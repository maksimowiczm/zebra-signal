import protobuf from "protobufjs";
import { useEffect, useState } from "react";

export enum MessageType {
  PUBLIC = 1,
  PRIVATE = 2,
}
export interface Message {
  type: MessageType;
  content: string;
  description: string;
}

interface Props {
  dataChannel: RTCDataChannel;
}

interface ZebraSignalDataChannelResult {
  messages: Message[];
}

export const useZebraSignalDataChannel = ({
  dataChannel,
}: Props): ZebraSignalDataChannelResult => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    dataChannel.onmessage = async (event) => {
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

        setMessages((prev) => [...prev, message]);
      });
    };
  }, [dataChannel, messages]);

  return {
    messages,
  };
};
