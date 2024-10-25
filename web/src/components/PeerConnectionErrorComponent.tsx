import { ArrowBackIcon, SettingsIcon } from "@material-icons";
import { useState } from "react";
import { Link } from "react-router-dom";
import { NavigationBar } from "./NavigationBar.tsx";
import { IceServersComponent } from "./ice/IceServersComponent.tsx";

export function PeerConnectionErrorComponent({
  onRetry,
}: {
  onRetry: () => void;
}) {
  const [iceOpened, setIceOpened] = useState(false);

  if (iceOpened) {
    return <IceServersComponent onBack={onRetry} />;
  }

  return (
    <>
      <NavigationBar
        leadingComponent={
          <Link to="/">
            <button className="btn btn-ghost items-center">
              <ArrowBackIcon className="fill-current h-6 w-6" />
              Back
            </button>
          </Link>
        }
        trailingComponent={
          <button
            className="btn btn-ghost items-center"
            onClick={() => setIceOpened(true)}
          >
            <SettingsIcon className="fill-current h-6 w-6" />
            ICE Servers
          </button>
        }
      />
      <div className="flex flex-col h-full w-full justify-center items-center my-5">
        <h1 className="text-2xl">Error connecting to session</h1>
        <div className="grow" />
        <p className="text-lg lg:w-1/2 mt-2 px-4 text-justify">
          We couldn't connect to the session. This can happen due to network or
          firewall restrictions, or if extra routing is required for your
          connection. Please check your internet connection, or try again from a
          different network if possible.
        </p>
        <div className="grow" />
        <button className="btn btn-primary" onClick={onRetry}>
          Try again
        </button>
      </div>
    </>
  );
}
