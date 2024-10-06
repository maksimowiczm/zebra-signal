import "./main.css";
import {
  attributesModule,
  classModule,
  eventListenersModule,
  init,
  propsModule,
  styleModule,
} from "snabbdom";
import App from "./App.ts";

export const patch = init([
  classModule,
  propsModule,
  eventListenersModule,
  styleModule,
  attributesModule,
]);

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element not found");
}

patch(container, App());
