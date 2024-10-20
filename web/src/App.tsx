import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { ConnectToSession } from "./routes/ConnectToSession.tsx";
import { CreateNewSession } from "./routes/CreateNewSession.tsx";
import { Home } from "./routes/Home.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/connect",
    element: <ConnectToSession />,
  },
  {
    path: "/new",
    element: <CreateNewSession />,
  },
]);

function App() {
  return (
    <div className="h-dvh w-dvw flex flex-col">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
