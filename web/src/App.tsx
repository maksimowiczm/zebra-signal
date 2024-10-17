import { useState } from "react";
import { ConnectToSessionComponent } from "./components/ConnectToSessionComponent.tsx";
import { CreateSessionComponent } from "./components/CreateSessionComponent.tsx";
import { HomeComponent } from "./components/HomeComponent.tsx";
import { SettingsComponent } from "./components/SettingsComponent.tsx";

function App() {
  const nothing = () => {};

  const [index, setIndex] = useState(0);
  const views = [
    {
      name: "Home",
      component: (
        <HomeComponent
          onCreateSession={nothing}
          onConnectToSession={nothing}
          onIceServers={nothing}
        />
      ),
    },
    {
      name: "Ice Servers",
      component: <SettingsComponent />,
    },
    {
      name: "Create Session",
      component: (
        <CreateSessionComponent
          onBack={nothing}
          onConnection={nothing}
          onIceServers={nothing}
        />
      ),
    },
    {
      name: "Connect to Session",
      component: (
        <ConnectToSessionComponent onBack={nothing} onIceServers={nothing} />
      ),
    },
  ];
  const handleNext = () => setIndex((index + 1) % views.length);
  const handlePrev = () => setIndex((index - 1 + views.length) % views.length);

  return (
    <div className="h-dvh w-dvw flex flex-col p-5 overflow-y-scroll">
      <div>
        <button onClick={handlePrev} className="btn">
          Prev
        </button>
        <span className="mx-5">{views[index].name}</span>
        <button onClick={handleNext} className="btn">
          Next
        </button>
      </div>
      {views[index].component}
    </div>
  );
}

export default App;
