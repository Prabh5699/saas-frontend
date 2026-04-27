"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

function getInitialTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";

  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;

  const current = document.documentElement.getAttribute("data-theme");
  if (current === "light" || current === "dark") return current;

  return "dark";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    setTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "fixed bottom-5 right-5 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-card/80 text-sm text-foreground shadow-lg backdrop-blur-md transition hover:bg-card",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      )}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Light mode" : "Dark mode"}
    >
      {theme === "dark" ? (
        <span aria-hidden className="text-lg leading-none">
          ☀️
        </span>
      ) : (
        <span aria-hidden className="text-lg leading-none">
          🌙
        </span>
      )}
    </button>
  );
}
