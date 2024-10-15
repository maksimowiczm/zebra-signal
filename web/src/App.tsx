import { useState } from "react";
import QrCodeIcon from "./assets/QrCodeIcon.tsx";
import SettingsIcon from "./assets/SettingsIcon.tsx";
import { MenuComponent } from "./components/navigation/MenuComponent.tsx";
import { SessionComponent } from "./components/session/SessionComponent.tsx";
import { SettingsComponent } from "./components/settings/SettingsComponent.tsx";
import { IceServersProvider } from "./context/useIceServers.tsx";

function App() {
  return (
    <div className="h-dvh w-dvw flex flex-col p-5 overflow-y-scroll">
      <IceServersProvider>
        <Content />
      </IceServersProvider>
    </div>
  );
}

function Content() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return isSettingsOpen ? (
    <>
      <MenuComponent
        menuItems={[
          {
            onClick: () => setIsSettingsOpen(false),
            content: (
              <>
                <QrCodeIcon fill={"oklch(var(--bc))"} />
                Back to session
              </>
            ),
          },
        ]}
      />
      <SettingsComponent />
    </>
  ) : (
    <>
      <MenuComponent
        menuItems={[
          {
            onClick: () => setIsSettingsOpen(true),
            content: (
              <>
                <SettingsIcon fill={"oklch(var(--bc))"} />
                Ice Servers
              </>
            ),
          },
        ]}
      />
      <SessionComponent />
    </>
  );
}

export default App;
