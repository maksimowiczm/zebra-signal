import { ConversionPathIcon, QrCode2Icon, SettingsIcon } from "@material-icons";
import React from "react";
import { Link, LinkProps } from "react-router-dom";
import { NavigationBar } from "../components/NavigationBar.tsx";

export function Home() {
  return (
    <>
      <NavigationBar
        trailingComponent={
          <button className="btn btn-ghost items-center">
            <SettingsIcon className="fill-current h-6 w-6" />
            ICE Servers
          </button>
        }
      />
      <div className="flex justify-center items-center w-full h-full">
        <div className="grow max-w-screen-md flex flex-col md:flex-row justify-center items-center">
          <MenuItem to="/new">
            <QrCode2Icon fill="oklch(var(--bc))" />
            <MenuItemLabel label={"Create new session"} />
          </MenuItem>
          <MenuItem to="/connect">
            <ConversionPathIcon fill="oklch(var(--bc))" />
            <MenuItemLabel label={"Connect to the session"} />
          </MenuItem>
        </div>
      </div>
    </>
  );
}

function MenuItem(props: LinkProps & React.RefAttributes<HTMLAnchorElement>) {
  return (
    <Link
      className="w-3/5 md:w-1/2 flex flex-col justify-between items-center rounded-3xl cursor-pointer px-4 m-4 hover:bg-base-200"
      {...props}
    ></Link>
  );
}

function MenuItemLabel({ label }: { label: string }) {
  return (
    <div className="text-xl font-bold pb-2 text-center select-none">
      {label}
    </div>
  );
}
