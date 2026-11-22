"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

// ThemeToggle is a component that allows users to switch between light and dark themes. It uses the useState hook to manage the current theme state and the useEffect hook to update the document's data-theme attribute whenever the theme changes. The component renders a button that toggles the theme when clicked, displaying either a sun or moon icon based on the current theme.  
export function ThemeToggle() {
  const [theme, setTheme] = useState("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("devflow-theme");
    const nextTheme = savedTheme === "light" ? "light" : "dark";

    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("devflow-theme", theme);
  }, [mounted, theme]);

  return (
    <button
      aria-label="Toggle color theme"
      className="icon-btn"
      onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
      title="Toggle theme"
      type="button"
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
