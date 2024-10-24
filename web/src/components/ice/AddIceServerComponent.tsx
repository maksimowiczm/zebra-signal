import { ArrowBackIcon } from "@material-icons";
import React from "react";
import { useIceServerForm } from "../../hooks/useIceServerForm.ts";
import { NavigationBar } from "../NavigationBar.tsx";

export function AddIceServerComponent({ onBack }: { onBack: () => void }) {
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
      <div className="grow flex justify-center items-center">
        <IceServerForm onSubmitted={onBack} />
      </div>
    </>
  );
}

function IceServerForm({
  onSubmitted,
}: {
  onSubmitted: () => void;
}) {
  const iceServerForm = useIceServerForm();

  const {
    setUrl,
    authenticationMethod,
    setAuthenticationMethod,
    handleAddIceServer,
  } = iceServerForm;

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === "Basic") {
      setAuthenticationMethod("BASIC");
    } else if (e.target.value === "None") {
      setAuthenticationMethod("NONE");
    }
  };

  return (
    <form
      className="flex flex-col h-full w-full px-4 pt-4 pb-2 md:w-1/2 lg:w-1/3"
      onSubmit={(e) => {
        e.preventDefault();
        handleAddIceServer();
        onSubmitted();
      }}
    >
      <div className="text-2xl">Add ICE Server</div>
      <div className="grow flex flex-col justify-center">
        <div>
          <div className="label">
            <label htmlFor="url" className="label-text">
              URL
            </label>
          </div>
          <input
            id="url"
            type="text"
            className="input input-bordered w-full"
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>
        <div>
          <div className="label">
            <label htmlFor="method" className="label-text">
              Authentication
            </label>
          </div>
          <select
            id="method"
            className="select select-bordered w-full"
            onChange={handleMethodChange}
          >
            <option>None</option>
            <option>Basic</option>
          </select>
        </div>
        {authenticationMethod === "BASIC" && (
          <BasicAuthentication
            setUsername={iceServerForm.setUsername}
            setCredential={iceServerForm.setCredential}
          />
        )}
      </div>
      <div className="flex w-full mb-5">
        <button type="submit" className="btn btn-primary grow">
          Add
        </button>
      </div>
    </form>
  );
}

function BasicAuthentication({
  setUsername,
  setCredential,
}: {
  setUsername: (username: string) => void;
  setCredential: (password: string) => void;
}) {
  return (
    <>
      <div>
        <div className="label">
          <label htmlFor="username" className="label-text">
            Username
          </label>
        </div>
        <input
          id="username"
          type="text"
          className="input input-bordered w-full"
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div>
        <div className="label">
          <label htmlFor="credential" className="label-text">
            Credential
          </label>
        </div>
        <input
          id="credential"
          type="password"
          className="input input-bordered w-full"
          onChange={(e) => setCredential(e.target.value)}
          required
        />
      </div>
    </>
  );
}
