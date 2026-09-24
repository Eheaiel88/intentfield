"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY } from "@/lib/theme";

type Theme = "light" | "dark";
const themeEvent = "intentfield:theme-change";
const getTheme = (): Theme =>
  document.documentElement.dataset.theme === "light" ? "light" : "dark";
const getServerTheme = (): Theme => "dark";

function restoreTheme() {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    document.documentElement.dataset.theme =
      saved === "light" ? "light" : "dark";
  } catch {
    // The control still works when browser storage is unavailable.
  }
}

function subscribe(onChange: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key === THEME_STORAGE_KEY || event.key === null) {
      restoreTheme();
      onChange();
    }
  }
  window.addEventListener(themeEvent, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(themeEvent, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Retain the selected appearance for this page even without persistence.
  }
  window.dispatchEvent(new Event(themeEvent));
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, getServerTheme);
  // React's development remount can reset the root attribute after the head script.
  useLayoutEffect(restoreTheme, []);

  return (
    <div className="theme-toggle" role="group" aria-label="Color theme">
      {(["light", "dark"] as const).map((value) => (
        <button
          key={value}
          type="button"
          aria-label={`${value === "light" ? "Light" : "Dark"} mode`}
          aria-pressed={theme === value}
          title={`${value === "light" ? "Light" : "Dark"} mode`}
          onClick={() => setTheme(value)}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            aria-hidden="true"
          >
            {value === "light" ? (
              <>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5" />
              </>
            ) : (
              <path d="M20.5 14.5A9 9 0 0 1 9.5 3.5a9 9 0 1 0 11 11Z" />
            )}
          </svg>
          <span>{value === "light" ? "Light" : "Dark"}</span>
        </button>
      ))}
    </div>
  );
}
