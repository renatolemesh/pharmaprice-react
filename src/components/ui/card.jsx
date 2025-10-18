import React from "react";

export function Card({ className = "", children }) {
  return (
    <div className={`rounded-lg border bg-card text-card-foreground shadow ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children }) {
  return <div className="p-4 border-b border-border">{children}</div>;
}

export function CardTitle({ children }) {
  return <h2 className="text-lg font-semibold">{children}</h2>;
}

export function CardContent({ children }) {
  return <div className="p-4">{children}</div>;
}
