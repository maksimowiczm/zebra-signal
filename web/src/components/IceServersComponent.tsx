import { useContext, useRef, useState } from "react";
import ArrowBackIcon from "../assets/material_icons/ArrowBackIcon.tsx";
import DeleteForeverIcon from "../assets/material_icons/DeleteForeverIcon.tsx";
import DeleteIcon from "../assets/material_icons/DeleteIcon.tsx";
import { IceServersContext } from "../context/IceServersContext.tsx";

interface IceServersComponentProps {
  onBack: () => void;
}
export function IceServersComponent({ onBack }: IceServersComponentProps) {
  const { addIceServer } = useContext(IceServersContext);

  return (
    <>
      <div className="flex justify-between mb-5">
        <button className="btn btn-ghost items-center" onClick={onBack}>
          <ArrowBackIcon fill={"oklch(var(--bc))"} />
          Back
        </button>
      </div>
      <div>
        <div className="pb-5">
          <div className="text-3xl">ICE Servers</div>
          <div className="text">
            Manage your STUN/TURN servers for WebRTC connections
          </div>
        </div>
        <div className="text-xl font-bold py-1">Add ICE Server</div>
        <IceServerForm handleAdd={addIceServer} />
        <IceServersList />
      </div>
    </>
  );
}

function IceServerForm({
  handleAdd,
}: {
  handleAdd: (url: string) => void;
}) {
  const [error, setError] = useState(false);
  const [url, setUrl] = useState("");
  const handleAddClick = () => {
    if (url === "") {
      setError(true);
      return;
    }

    handleAdd(url);
    setUrl("");
  };

  return (
    <div className="join w-full flex pb-6">
      <input
        className={`input input-bordered join-item grow ${error ? "input-error" : ""}`}
        placeholder="ICE Server URL"
        value={url}
        onChange={(e) => {
          setUrl(e.target.value);
          setError(false);
        }}
      />
      <button
        className="btn btn-primary join-item rounded-r-full"
        onClick={handleAddClick}
      >
        Add
      </button>
    </div>
  );
}

interface IceServerProps {
  url: string;
  handleDelete: () => void;
}

function IceServersList() {
  const { iceServers, removeIceServer, setDefault, isDefault } =
    useContext(IceServersContext);

  const dialog = useRef<HTMLDialogElement | null>(null);

  return (
    <>
      <div className="flex justify-between items-center">
        <div className="text-xl font-bold py-1">ICE Servers List</div>
        <button
          className="btn btn-ghost"
          onClick={() => dialog.current?.showModal()}
          disabled={isDefault}
        >
          Use default
        </button>
      </div>
      <div className="py-1">
        {iceServers.map(({ id, url }) => (
          <IceServer
            key={id}
            url={url}
            handleDelete={() => removeIceServer(id)}
          />
        ))}
      </div>
      <dialog ref={dialog} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-2xl">Are you sure?</h3>
          <p className="py-4 text-justify text-lg">
            Are you sure you want to restore to default ICE servers? This action
            cannot be undone. All custom ICE servers will be removed.
          </p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-error m-1">Cancel</button>
              <button className="btn btn-success m-1" onClick={setDefault}>
                Confirm
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}

function IceServer({ url, handleDelete }: IceServerProps) {
  const [deleteHover, setDeleteHover] = useState(false);

  return (
    <div className="flex flex-row justify-around min-w-80 card bg-base-300 p-4 shadow-xl my-2">
      <div className="grow">{url}</div>
      <div
        className="cursor-pointer"
        onClick={() => {
          setDeleteHover(false); // Mobile hack fix
          handleDelete();
        }}
        onMouseEnter={() => setDeleteHover(true)}
        onMouseLeave={() => setDeleteHover(false)}
      >
        {deleteHover ? (
          <DeleteForeverIcon fill={"oklch(var(--er))"} />
        ) : (
          <DeleteIcon fill={"oklch(var(--bc))"} />
        )}
      </div>
    </div>
  );
}
