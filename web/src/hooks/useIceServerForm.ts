import { useState } from "react";
import { useIceServers } from "./useIceServers.tsx";

type AuthenticationMethod = "BASIC" | "NONE";

interface UseIceServerFormResultBase {
  authenticationMethod: AuthenticationMethod;
  setAuthenticationMethod: (method: AuthenticationMethod) => void;

  url: string;
  setUrl: (url: string) => void;

  handleAddIceServer: () => void;
}

interface UseIceServerFormNoneAuthenticationResult
  extends UseIceServerFormResultBase {
  authenticationMethod: "NONE";
}

interface UseIceServerFormBasicAuthenticationResult
  extends UseIceServerFormResultBase {
  authenticationMethod: "BASIC";

  username: string;
  setUsername: (username: string) => void;

  credential: string;
  setCredential: (password: string) => void;
}

type UseIceServerFormResult =
  | UseIceServerFormNoneAuthenticationResult
  | UseIceServerFormBasicAuthenticationResult;

export function useIceServerForm(): UseIceServerFormResult {
  const { addIceServer } = useIceServers();

  const [url, setUrl] = useState("");
  const [authenticationMethod, setAuthenticationMethod] =
    useState<AuthenticationMethod>("NONE");

  const [username, setUsername] = useState("");
  const [credential, setCredential] = useState("");

  const handleAddIceServer = () => {
    const iceServer: RTCIceServer = {
      urls: [url],
      username: authenticationMethod === "BASIC" ? username : undefined,
      credential: authenticationMethod === "BASIC" ? credential : undefined,
    };

    addIceServer(iceServer);
  };

  const base = {
    url,
    setUrl,
    setAuthenticationMethod,
    handleAddIceServer,
    authenticationMethod,
  };

  if (authenticationMethod === "NONE") {
    return {
      ...base,
      authenticationMethod: "NONE",
    };
  }

  if (authenticationMethod === "BASIC") {
    return {
      ...base,
      authenticationMethod: "BASIC",

      username,
      setUsername,

      credential,
      setCredential,
    };
  }

  throw new Error("Invalid authentication method");
}
