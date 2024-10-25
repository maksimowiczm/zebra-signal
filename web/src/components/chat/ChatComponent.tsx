import { useZebraSignalDataChannel } from "../../hooks/network/useZebraSignalDataChannel.ts";
import { MessageInputComponent } from "./MessageInputComponent.tsx";
import { MessagesListComponent } from "./MessagesListComponent.tsx";

export function ChatComponent({
  isConnected,
  messages,
  send,
}: ReturnType<typeof useZebraSignalDataChannel>) {
  return (
    <div className="h-full w-full flex justify-center">
      <div className="w-full lg:w-2/3 flex flex-col">
        <MessagesListComponent messages={messages} />
        {
          // @ts-ignore this is xD
          <MessageInputComponent isConnected={isConnected} send={send} />
        }
      </div>
    </div>
  );
}
