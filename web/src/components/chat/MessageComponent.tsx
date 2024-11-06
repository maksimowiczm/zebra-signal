import { CheckIcon, ContentCopyIcon } from "@material-icons";
import React, { useState } from "react";
import {
  Message,
  MessageType,
  Who,
} from "../../hooks/network/useZebraSignalDataChannel.ts";

type MessageComponentProps = Message & {
  shouldHaveHeader: boolean;
};
export function MessageComponent({
  who,
  type,
  content,
  description,
  shouldHaveHeader,
}: MessageComponentProps) {
  const header = shouldHaveHeader
    ? who === Who.YOU
      ? "You"
      : "Them"
    : undefined;

  content = content.trim();

  if (type === MessageType.PRIVATE) {
    return (
      <PrivateMessageComponent
        header={header}
        who={who}
        content={content}
        description={description}
      />
    );
  }

  return (
    <ChatMessage who={who}>
      {shouldHaveHeader && header && <MessageHeader>{header}</MessageHeader>}
      <div className="chat-bubble">
        <MessageContent>{content}</MessageContent>
      </div>
    </ChatMessage>
  );
}

function PrivateMessageComponent({
  header,
  who,
  content,
  description,
}: Omit<Message, "type"> & { header: string | undefined }) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1000);
  };

  if (header && description) {
    header = `${header} - ${description}`;
  }

  const privateContent = "●".repeat(content.length);

  const position =
    who === Who.YOU
      ? "justify-start -left-[36px]"
      : "justify-end -right-[36px]";

  return (
    <ChatMessage who={who}>
      {header && <MessageHeader>{header}</MessageHeader>}
      <div
        className="chat-bubble cursor-pointer relative"
        onDoubleClick={handleCopy}
      >
        <MessageContent>{privateContent}</MessageContent>
        <div className={`absolute inset-0 flex items-center ${position}`}>
          <CopyIcon isCopied={isCopied} handleCopy={handleCopy} />
        </div>
      </div>
    </ChatMessage>
  );
}

function ChatMessage({
  who,
  children,
}: { who: Who; children: React.ReactNode }) {
  return (
    <div className={`chat ${who === Who.YOU ? "chat-end" : "chat-start"}`}>
      {children}
    </div>
  );
}

function MessageHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="chat-header break-words text-lg lg:text-xl">{children}</div>
  );
}

function MessageContent({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="break-words text-lg lg:text-xl"
      // firefox fix
      style={{ overflowWrap: "anywhere" }}
    >
      {children}
    </span>
  );
}

function CopyIcon({
  isCopied,
  handleCopy,
}: { isCopied: boolean; handleCopy: () => void }) {
  return !isCopied ? (
    <div
      className="rounded-full p-1 hover:bg-base-300 tooltip"
      data-tip="Copy"
      onClick={handleCopy}
    >
      <ContentCopyIcon className="fill-base-content w-6 h-6" />
    </div>
  ) : (
    <div className="rounded-full p-1">
      <CheckIcon className="fill-success w-6 h-6" />
    </div>
  );
}
