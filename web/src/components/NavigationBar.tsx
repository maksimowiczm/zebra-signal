import React from "react";

interface NavigationBarProps {
  leadingComponent?: React.ReactNode;
  trailingComponent?: React.ReactNode;
}
export function NavigationBar({
  leadingComponent,
  trailingComponent,
}: NavigationBarProps) {
  return (
    <div className="flex justify-between">
      {leadingComponent ? leadingComponent : <div className="grow" />}
      {trailingComponent ? trailingComponent : <div className="grow" />}
    </div>
  );
}
