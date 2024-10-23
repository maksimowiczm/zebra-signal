import { ArrowBackIcon, DeleteForeverIcon, DeleteIcon } from "@material-icons";
import { useEffect, useRef, useState } from "react";
import { AddIcon } from "../../assets/material_icons/AddIcon.tsx";
import { useIceServers } from "../../hooks/useIceServers.tsx";
import { useSnackbar } from "../../hooks/useSnackbar.tsx";
import { NavigationBar } from "../NavigationBar.tsx";
import { AddIceServerComponent } from "./AddIceServerComponent.tsx";
import { DeleteDialog } from "./DeleteDialog.tsx";
import { UseDefaultDialog } from "./UseDefaultDialog.tsx";

interface IceServersComponentProps {
  onBack: () => void;
}
export function IceServersComponent({ onBack }: IceServersComponentProps) {
  const [addVisible, setAddVisible] = useState(false);

  if (addVisible) {
    return <AddIceServerComponent onBack={() => setAddVisible(false)} />;
  }

  return (
    <>
      <NavigationBar
        leadingComponent={
          <button className="btn btn-ghost items-center" onClick={onBack}>
            <ArrowBackIcon className="fill-current h-6 w-6" />
            Back
          </button>
        }
      />
      <IceServersList handleAdd={() => setAddVisible(true)} />
    </>
  );
}

function IceServersList({
  handleAdd,
}: {
  handleAdd: () => void;
}) {
  const dialog = useRef<HTMLDialogElement | null>(null);
  const { iceServers, removeIceServer } = useIceServers();

  const { setDefault } = useIceServers();
  const snackbar = useSnackbar();
  const handleDefault = () => {
    setDefault();
    snackbar("ICE servers restored to default", "info");
  };

  return (
    <div className="p-5">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-3xl">ICE Servers</div>
          <div className="text">
            Manage your STUN/TURN servers for WebRTC connections
          </div>
        </div>
        <button
          className="btn btn-ghost"
          onClick={() => dialog.current?.showModal()}
          disabled={false}
        >
          Use default
        </button>
      </div>
      <div className="py-1">
        <div
          className="flex flex-row justify-around min-w-80 card bg-base-300 p-4 shadow-xl my-2 items-center cursor-pointer hover:bg-base-200"
          onClick={handleAdd}
        >
          <div className="grow font-bold">Add new ICE server</div>
          <div className="p-2">
            <AddIcon className="fill-current w-6 h-6" />
          </div>
        </div>
        {iceServers.map((server) => (
          <IceServer
            key={server.urls[0]}
            url={server.urls[0]}
            handleDelete={() => removeIceServer(server)}
          />
        ))}
      </div>
      <UseDefaultDialog ref={dialog} handleConfirm={handleDefault} />
    </div>
  );
}

interface IceServerProps {
  url: string;
  handleDelete: () => void;
}

function IceServer({ url, handleDelete }: IceServerProps) {
  const [deleteHover, setDeleteHover] = useState(false);
  const deleteDialog = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const handleDialogClose = () => setDeleteHover(false);

    deleteDialog.current?.addEventListener("close", handleDialogClose);

    return () => {
      deleteDialog.current?.removeEventListener("close", handleDialogClose);
    };
  }, []);

  return (
    <div className="flex flex-row justify-around min-w-80 card bg-base-300 p-4 shadow-xl my-2 items-center">
      <div className="grow">{url}</div>

      <div
        className="cursor-pointer hover:bg-base-100 p-2 rounded-full"
        onClick={() => deleteDialog.current?.showModal()}
        onMouseEnter={() => setDeleteHover(true)}
        onMouseLeave={() => setDeleteHover(false)}
      >
        {deleteHover ? (
          <DeleteForeverIcon className="fill-error w-6 h-6" />
        ) : (
          <DeleteIcon className="fill-current w-6 h-6" />
        )}
      </div>
      <DeleteDialog ref={deleteDialog} handleConfirm={handleDelete} />
    </div>
  );
}
