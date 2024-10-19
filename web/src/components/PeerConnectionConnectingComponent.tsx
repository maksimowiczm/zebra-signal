import ArrowBackIcon from "../assets/ArrowBackIcon.tsx";
import { NavigationBar } from "./NavigationBar.tsx";

interface PeerConnectionConnectingComponentProps {
  handleCancel: () => void;
}
export function PeerConnectionConnectingComponent({
  handleCancel,
}: PeerConnectionConnectingComponentProps) {
  return (
    <>
      <NavigationBar
        leadingComponent={
          <button className="btn btn-ghost items-center" onClick={handleCancel}>
            <ArrowBackIcon fill={"oklch(var(--bc))"} />
            Cancel
          </button>
        }
      />
      <div className="h-full w-full flex flex-col justify-center items-center">
        <progress className="progress w-2/3 max-w-screen-sm"></progress>
        <span className="mt-5 text-xl">Establishing peer connection</span>
      </div>
    </>
  );
}
