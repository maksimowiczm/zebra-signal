import React from "react";

interface MenuItem {
  onClick: () => void;
  content: React.JSX.Element;
}
interface Props {
  menuItems: MenuItem[];
}
export function MenuComponent({ menuItems }: Props) {
  return (
    <div className="flex justify-end w-full">
      {menuItems.map(({ onClick, content }, i) => (
        <button
          key={i}
          className="btn btn-ghost items-center"
          onClick={onClick}
        >
          {content}
        </button>
      ))}
    </div>
  );
}
