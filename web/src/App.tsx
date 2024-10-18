import { useState } from "react";
import { ConnectToSessionComponent } from "./components/ConnectToSessionComponent.tsx";
import { CreateSessionComponent } from "./components/CreateSessionComponent.tsx";
import { HomeComponent } from "./components/HomeComponent.tsx";
import { IceServersComponent } from "./components/IceServersComponent.tsx";

type View = "HOME" | "CREATE" | "CONNECT" | "ICE_SERVERS";

function App() {
  const [currentView, setCurrentView] = useState<View>("HOME");
  // Cache one step back
  const [previousView, setPreviousView] = useState<View | undefined>(undefined);

  const handleRedirect = (view: View) => {
    setPreviousView(currentView);
    setCurrentView(view);
  };
  const handleBack = () => {
    if (previousView) {
      setCurrentView(previousView);
      setPreviousView(undefined);
    } else {
      setCurrentView("HOME");
    }
  };

  const routes = {
    HOME: (
      <HomeComponent
        onCreateSession={() => handleRedirect("CREATE")}
        onConnectToSession={() => handleRedirect("CONNECT")}
        onIceServers={() => handleRedirect("ICE_SERVERS")}
      />
    ),
    ICE_SERVERS: <IceServersComponent onBack={handleBack} />,
    CREATE: (
      <CreateSessionComponent
        onBack={handleBack}
        onIceServers={() => handleRedirect("ICE_SERVERS")}
      />
    ),
    CONNECT: (
      <ConnectToSessionComponent
        onBack={handleBack}
        onIceServers={() => handleRedirect("ICE_SERVERS")}
      />
    ),
  };

  return (
    <div className="h-dvh w-dvw flex flex-col p-5 overflow-y-scroll">
      {routes[currentView]}
    </div>
  );
}

export default App;
