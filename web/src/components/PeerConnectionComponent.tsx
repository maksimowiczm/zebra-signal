import { useRef, useState } from "react";
import CheckIcon from "../assets/CheckIcon.tsx";
import ContentCopyIcon from "../assets/ContentCopyIcon.tsx";
import {
  Message,
  MessageType,
  useZebraSignalDataChannel,
} from "../hooks/useZebraSignalDataChannel.ts";

export function PeerConnectionComponent({
  dataChannel,
}: { dataChannel: RTCDataChannel }) {
  const { messages } = useZebraSignalDataChannel({ dataChannel });
  return <MessagesList messages={messages} />;
}

export const MessagesList = ({ messages }: { messages: Message[] }) => (
  <div className="flex flex-col space-y-2">
    {messages.map((message, i) => (
      <MessageComponent key={i} message={message} />
    ))}
  </div>
);

function MessageComponent({ message }: { message: Message }) {
  let copyTimeoutId = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content);

    setIsCopied(true);

    if (copyTimeoutId.current) {
      clearTimeout(copyTimeoutId.current);
    }
    copyTimeoutId.current = setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex flex-col">
      <div className="py-1 text-md">{message.description}</div>
      <div
        className="flex items-center relative cursor-pointer"
        onClick={() => handleCopy(message.content)}
      >
        <input
          className="input input-bordered flex items-center relative cursor-pointer"
          style={{ zIndex: "-1" }}
          defaultValue={message.content}
          type={message.type === MessageType.PUBLIC ? "text" : "password"}
          disabled
        />
        <div className="absolute right-0 pr-2 flex">
          {isCopied ? (
            <CheckIcon fill="oklch(var(--in))" />
          ) : (
            <ContentCopyIcon fill="oklch(var(--su)" />
          )}
        </div>
      </div>
    </div>
  );
}
