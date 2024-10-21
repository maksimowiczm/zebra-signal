import { useZebraSignalDataChannel } from "../hooks/network/useZebraSignalDataChannel.ts";
import { ChatComponent } from "./chat/ChatComponent.tsx";

export function PeerConnectionComponent({
  dataChannel,
}: { dataChannel: RTCDataChannel }) {
  const zebra = useZebraSignalDataChannel({ dataChannel });

  return <ChatComponent {...zebra} />;
}
