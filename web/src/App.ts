import { h } from "snabbdom";
import { SessionComponent } from "./components/SessionComponents.ts";

export default function App() {
  return h("div.h-dvh.w-dvw.flex.flex-col.justify-center.items-center.p-5", [
    SessionComponent(),
  ]);
}
