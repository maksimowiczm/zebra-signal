import { h } from "snabbdom";

export const ic_check = (fill: string) =>
  h(
    "svg",
    {
      attrs: {
        xmlns: "http://www.w3.org/2000/svg",
        height: "24px",
        viewBox: "0 -960 960 960",
        width: "24px",
        fill,
      },
    },
    [
      h("path", {
        attrs: {
          d: "M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z",
        },
      }),
    ],
  );
