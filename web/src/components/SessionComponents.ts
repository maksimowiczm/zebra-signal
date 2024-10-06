import { type VNode, h } from "snabbdom";
import { ic_check } from "../assets/ic_check.ts";
import { ic_content_copy } from "../assets/ic_content_copy.ts";
import { patch } from "../main.ts";
import {
  type Message,
  MessageType,
  type Session,
  setupSession,
} from "../utils/session.ts";
import { Spacer } from "./Spacer.ts";
import { QRCode } from "@maksimowicz/qrcode-svg";

interface PeerSession {
  messages: Message[];
}

interface SessionState {
  connectionSession: Session | null;
  peerSession: PeerSession | undefined;
  isConnecting: boolean;
}

export function SessionComponent(): VNode {
  let state: SessionState = {
    connectionSession: null,
    isConnecting: false,
    peerSession: undefined,
  };
  let vnode = SessionView(state, onReset);
  setup();

  function update(newState: SessionState) {
    state = newState;
    if (!vnode) {
      throw new Error("vnode is null");
    }
    vnode = patch(vnode, SessionView(state, onReset));
  }

  function onReset() {
    cleanup();
    state.connectionSession = null;
    state.isConnecting = false;
    state.peerSession = undefined;
    update(state);
    setup();
  }

  function cleanup() {
    const { connectionSession } = state;

    if (connectionSession) {
      // todo it doesnt close the socket ???????
      connectionSession.socket.close();
      connectionSession.peerConnection.close();
    }
  }

  function setup() {
    setupSession({
      onConnecting: () => {
        update({ ...state, isConnecting: true });
      },
      onOpen: async () => {
        update({
          ...state,
          isConnecting: false,
          peerSession: { messages: [] },
        });
      },
      onMessage: (e) => {
        const messages = state.peerSession?.messages || [];
        update({ ...state, peerSession: { messages: [...messages, e] } });
      },
    }).then(async (session) => {
      update({ ...state, connectionSession: session });
    });
  }

  return vnode;
}

function SessionView(state: SessionState, onReset: () => void): VNode {
  const child = (() => {
    if (!state.connectionSession) {
      return SessionLoading();
    }

    if (state.isConnecting) {
      return SessionLoading(state.connectionSession.token);
    }

    if (state.peerSession) {
      return PeerSession(state.peerSession);
    }

    return SessionContent(state.connectionSession, onReset);
  })();

  return h("div.relative.flex.flex-col.h-full.items-center", [
    Spacer(),
    child,
    Spacer(),
    h(
      "button.absolute.btn.btn-primary.bottom-0",
      { on: { click: onReset } },
      "Reset",
    ),
  ]);
}

function SessionLoading(token = "zebra"): VNode {
  return h("div.relative.flex.justify-center.items-center", [
    h("div.blur.bottom-0.left-0", {}, [QR(token)]),
    h("div.absolute.loading.loading-spinner.loading-lg.text-primary"),
  ]);
}

function SessionContent(session: Session, onReset: () => void): VNode {
  const timeLeft = session.expires * 1000 - Date.now();
  const resetTimeoutId = setTimeout(onReset, timeLeft);

  return h("div", { hook: { destroy: () => clearTimeout(resetTimeoutId) } }, [
    QR(session.token),
    ProgressBar(timeLeft),
  ]);
}

function QR(token: string): VNode {
  const svgNode = QRCode({
    message: token,
    errorCorrectionLevel: "L",
    padding: 0,
  });
  svgNode.style.fill = "oklch(var(--bc)";

  return h("div.flex.flex-col.justify-center", [
    h("div.flex.justify-center.p-2", {
      hook: {
        insert: (vNode) => {
          vNode.elm?.appendChild(svgNode);
        },
      },
    }),
    h("div.text-center.tracking-widest.text-2xl", token),
  ]);
}

function ProgressBar(length: number): VNode {
  let start: number;
  let vNode = view(length);

  function view(progress: number): VNode {
    return h("progress.progress", { props: { value: progress, max: length } });
  }

  function firstFrame(frame: number) {
    start = frame;
    render(0);
  }

  function step(frame: number) {
    render(Math.max(start + length - frame, 0));
  }

  function render(progress: number) {
    vNode = patch(vNode, view(progress));
    requestAnimationFrame(step);
  }

  requestAnimationFrame(firstFrame);

  return vNode;
}

function PeerSession(session: PeerSession): VNode {
  const messages = session.messages.map((message) => MessageComponent(message));
  return h("div.flex.flex-col.space-y-2", messages);
}

function MessageComponent(message: Message): VNode {
  let copyTimeoutId: ReturnType<typeof setTimeout> | undefined;

  async function handleCopy() {
    await navigator.clipboard.writeText(message.content);
    render({ copied: true });

    copyTimeoutId = setTimeout(() => render({ copied: false }), 2000);
  }

  function view({ copied }: { copied: boolean }) {
    return h(
      "div.flex.flex-col",
      { hook: { destroy: () => clearTimeout(copyTimeoutId) } },
      [
        h("div.py-1.text-md", message.description),
        h(
          "div.flex.items-center.relative.cursor-pointer",
          { on: { click: handleCopy } },
          [
            h(
              "input.input.input-bordered.flex.items-center.relative.cursor-pointer",
              {
                props: {
                  defaultValue: message.content,
                  disabled: true,
                  type:
                    message.type === MessageType.PUBLIC ? "text" : "password",
                },
                style: { zIndex: "-1" },
              },
              undefined,
            ),
            h("div.absolute.right-0.pr-2", [
              copied
                ? ic_check("oklch(var(--in))")
                : ic_content_copy("oklch(var(--su)"),
            ]),
          ],
        ),
      ],
    );
  }

  let vNode = view({ copied: false });

  function render(props: { copied: boolean }) {
    vNode = patch(vNode, view(props));
  }

  return vNode;
}
