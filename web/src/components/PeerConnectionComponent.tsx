import { useEffect } from "react";

export function PeerConnectionComponent({
  dataChannel,
}: { dataChannel: RTCDataChannel }) {
  dataChannel.onmessage = async (event) => {
    console.log(event.data);
  };

  useEffect(() => {
    const i = setInterval(() => {
      dataChannel.send("ping");
    }, 1000);

    return () => clearInterval(i);
  }, []);

  return <div>Just ping ponging around</div>;
}
