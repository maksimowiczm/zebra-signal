import { useRef, useState } from "react";
import LockIcon from "../../assets/material_icons/LockIcon.tsx";
import SendIcon from "../../assets/material_icons/SendIcon.tsx";
import VisibilityIcon from "../../assets/material_icons/VisibilityIcon.tsx";
import { Message, MessageType } from "../../hooks/useZebraSignalDataChannel.ts";

export function MessageInputComponent({
  send,
}: { send: (message: Omit<Message, "who">) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!inputRef.current) return;

    send({
      type: isPrivate ? MessageType.PRIVATE : MessageType.PUBLIC,
      content: inputRef.current.value,
      description: undefined,
    });

    inputRef.current.value = "";
  };

  const [isPrivate, setIsPrivate] = useState(false);

  return (
    <div className="join w-full flex py-2 px-2">
      <div className="tooltip" data-tip={isPrivate ? "private" : "public"}>
        <label
          className={`btn no-animation swap join-item ${isPrivate ? "swap-active" : ""}`}
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
      />
      <button className="btn join-item" onClick={handleSend}>
        <SendIcon className="fill-current w-6 h-6" />
      </button>
    </div>
  );
}
