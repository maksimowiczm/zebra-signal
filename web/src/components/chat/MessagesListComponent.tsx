import { useEffect, useRef, useState } from "react";
import KeyboardArrowDownIcon from "../../assets/KeyboardArrowDownIcon.tsx";
import { Message } from "../../hooks/useZebraSignalDataChannel.ts";
import { MessageComponent } from "./MessageComponent.tsx";

export function MessagesListComponent({ messages }: { messages: Message[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(true);

  const handleScrollBottom = () =>
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });

  function isFocused() {
    if (!containerRef.current) {
      return false;
    }

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

    return scrollTop + clientHeight + 50 >= scrollHeight;
  }

  // Scroll to bottom when new message is added
  useEffect(() => {
    if (containerRef.current && focused) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="grow w-full overflow-y-hidden relative">
      <div
        ref={containerRef}
        className="w-full p-1 h-full overflow-y-scroll overflow-x-hidden"
        onScroll={() => setFocused(isFocused())}
      >
        {messages.map((message, i) => (
          <MessageComponent
            key={i}
            shouldHaveHeader={i === 0 || messages[i - 1].who !== message.who}
            {...message}
          />
        ))}
      </div>
      {!focused && (
        <div
          className={
            "sticky bottom-3 left-1/2 z-10 " +
            "cursor-pointer rounded-full bg-base-200 hover:bg-base-300 " +
            "overflow-y-visible max-h-8 max-w-8"
          }
          onClick={handleScrollBottom}
        >
          <KeyboardArrowDownIcon fill="oklch(var(--nc))" />
        </div>
      )}
    </div>
  );
}
