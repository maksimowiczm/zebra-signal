import { useEffect, useState } from "react";
import { useIceServers } from "./useIceServers.tsx";

type AuthenticationMethod = "BASIC" | "NONE";

interface UseIceServerFormResultBase {
  authenticationMethod: AuthenticationMethod;
  setAuthenticationMethod: (method: AuthenticationMethod) => void;
  isAuthenticationMethodInvalid: boolean;

  url: string;
  setUrl: (url: string) => void;
  isUrlInvalid: boolean;

  handleAddIceServer: () => boolean;
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
  const [isUrlInvalid, setIsUrlInvalid] = useState(false);
  const [authenticationMethod, setAuthenticationMethod] =
    useState<AuthenticationMethod>("NONE");
  const [isAuthenticationMethodInvalid, setIsAuthenticationMethodInvalid] =
    useState(false);
  useEffect(() => {
    if (url.startsWith("turn:")) {
      setAuthenticationMethod("BASIC");
    }
  }, [url]);

  const [username, setUsername] = useState("");
  const [credential, setCredential] = useState("");

  const handleAddIceServer = () => {
    if (!url.startsWith("turn:") && !url.startsWith("stun:")) {
      setIsUrlInvalid(true);
      return false;
    }

    if (url.startsWith("turn:") && authenticationMethod !== "BASIC") {
      setIsAuthenticationMethodInvalid(true);
      return false;
    }

    const iceServer: RTCIceServer = {
      urls: [url],
      username: authenticationMethod === "BASIC" ? username : undefined,
      credential: authenticationMethod === "BASIC" ? credential : undefined,
    };

    addIceServer(iceServer);

    return true;
  };

  const base = {
    url,
    setUrl,
    isUrlInvalid,

    authenticationMethod,
    setAuthenticationMethod,
    isAuthenticationMethodInvalid,

    handleAddIceServer,
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
