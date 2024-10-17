import React from "react";
import ConversionPathIcon from "../assets/ConversionPathIcon.tsx";
import QrCode2Icon from "../assets/QrCode2Icon.tsx";
import SettingsIcon from "../assets/SettingsIcon.tsx";

interface HomeComponentProps {
  onCreateSession: () => void;
  onConnectToSession: () => void;
  onIceServers: () => void;
}
export function HomeComponent({
  onCreateSession,
  onConnectToSession,
  onIceServers,
}: HomeComponentProps) {
  return (
    <>
      <div className="flex justify-end">
        <button className="btn btn-ghost items-center" onClick={onIceServers}>
          <SettingsIcon fill={"oklch(var(--bc))"} />
          ICE Servers
        </button>
      </div>
      <div className="flex justify-center items-center w-full h-full">
        <div className="grow max-w-screen-md flex flex-col md:flex-row justify-center items-center">
          <MenuItem onClick={onCreateSession}>
            <QrCode2Icon fill="oklch(var(--bc))" />
            <MenuItemLabel label={"Create new session"} />
          </MenuItem>
          <MenuItem onClick={onConnectToSession}>
            <ConversionPathIcon fill="oklch(var(--bc))" />
            <MenuItemLabel label={"Connect to the session"} />
          </MenuItem>
        </div>
      </div>
    </>
  );
}

const MenuItem = (props: React.HTMLProps<HTMLDivElement>) => (
  <div
    className="w-3/5 md:w-1/2 flex flex-col justify-between items-center rounded-3xl cursor-pointer px-4 m-4 hover:bg-base-200"
    {...props}
  ></div>
);

const MenuItemLabel = ({ label }: { label: string }) => (
  <div className="text-xl font-bold pb-2 text-center select-none">{label}</div>
);
