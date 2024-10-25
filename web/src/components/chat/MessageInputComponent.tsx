import { LockIcon, SendIcon, VisibilityIcon } from "@material-icons";
import { useRef, useState } from "react";
import {
  Message,
  MessageType,
} from "../../hooks/network/useZebraSignalDataChannel.ts";

type MessageInputComponentProps =
  | {
      isConnected: false;
      send: undefined;
    }
  | {
      isConnected: true;
      send: (message: Omit<Message, "who">) => void;
    };

export function MessageInputComponent({
  send,
  isConnected,
}: MessageInputComponentProps) {
  const [isPrivate, setIsPrivate] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!isConnected || !inputRef.current) return;

    send({
      type: isPrivate ? MessageType.PRIVATE : MessageType.PUBLIC,
      content: inputRef.current.value,
      description: undefined,
    });

    inputRef.current.value = "";
  };

  return (
    <div className="join w-full flex py-2 px-2">
      <div
        className={isConnected ? "tooltip" : ""}
        data-tip={isPrivate ? "private" : "public"}
      >
        <label
          className={
            `btn ${!isConnected ? "btn-disabled" : ""} ` +
            `no-animation swap join-item ${isPrivate ? "swap-active" : ""}`
          }
          onClick={() => setIsPrivate((p) => !p)}
        >
          <VisibilityIcon className="swap-off fill-current w-6 h-6" />
          <LockIcon className="swap-on tooltip fill-current w-6 h-6" />
        </label>
      </div>
      <input
        className="input input-bordered join-item grow"
        ref={inputRef}
        type="text"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSend();
          }
        }}
        placeholder={!isConnected ? "Disconnected " : ""}
        disabled={!isConnected}
      />
      <button
        className="btn join-item"
        onClick={handleSend}
        disabled={!isConnected}
      >
        <SendIcon className="fill-current w-6 h-6" />
      </button>
    </div>
  );
}
