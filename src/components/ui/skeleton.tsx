import React from "react";

function Skeleton({ className, style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={className}
      style={{
        borderRadius: "1rem",
        background: "rgba(51,65,85,0.5)",
        animation: "pulse 1.8s cubic-bezier(0.4,0,0.6,1) infinite",
        ...style,
      }}
      {...props}
    />
  );
}

export { Skeleton };
