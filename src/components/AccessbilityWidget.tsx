// components/AccessibilityWidget.tsx
"use client"; // Keep this if using App Router

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes"; // 1. Import useTheme
import {
  Accessibility,
  Sun,
  Moon,
  Link,
  ImageOff,
  RefreshCcw,
  X,
  Plus,
  Minus,
  Type,
} from "lucide-react";

// 2. Remove isDarkMode from our settings, next-themes handles it now
type Settings = {
  fontSize: number;
  areLinksHighlighted: boolean;
  isReadableFont: boolean;
  areImagesHidden: boolean;
};

const initialSettings: Settings = {
  fontSize: 16,
  areLinksHighlighted: false,
  isReadableFont: false,
  areImagesHidden: false,
};

export default function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const widgetRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme(); // 3. Get theme and setTheme from the hook

  // Effect to load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("a11ySettings");
    if (savedSettings) {
      // We parse only our own settings, not the theme
      const { isDarkMode, ...rest } = JSON.parse(savedSettings);
      setSettings(rest);
    }
  }, []);

  // Effect to apply settings to the DOM
  useEffect(() => {
    const body = document.body;

    // 4. REMOVE the dark mode logic from here. next-themes handles the <html> tag.
    document.documentElement.style.fontSize = `${settings.fontSize}px`;
    body.classList.toggle("highlight-links", settings.areLinksHighlighted);
    body.classList.toggle("readable-font", settings.isReadableFont);
    body.classList.toggle("images-hidden", settings.areImagesHidden);

    localStorage.setItem("a11ySettings", JSON.stringify(settings));
  }, [settings]);

  // ... (useEffect for click outside remains the same) ...
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        widgetRef.current &&
        !widgetRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAction = (
    action: keyof Settings | "increaseText" | "decreaseText" | "toggleTheme"
  ) => {
    if (action === "toggleTheme") {
      // 5. Use setTheme to toggle between light and dark
      setTheme(theme === "dark" ? "light" : "dark");
      return;
    }

    setSettings((prev) => {
      switch (action) {
        case "increaseText":
          return { ...prev, fontSize: Math.min(prev.fontSize + 2, 24) };
        case "decreaseText":
          return { ...prev, fontSize: Math.max(prev.fontSize - 2, 12) };
        case "areLinksHighlighted":
          return { ...prev, areLinksHighlighted: !prev.areLinksHighlighted };
        case "isReadableFont":
          return { ...prev, isReadableFont: !prev.isReadableFont };
        case "areImagesHidden":
          return { ...prev, areImagesHidden: !prev.areImagesHidden };
        default:
          return prev;
      }
    });
  };

  const resetSettings = () => {
    setSettings(initialSettings);
    setTheme("system"); // 6. Reset theme to system default
  };

  const options = [
    { id: "increaseText", icon: <Plus size={24} />, label: "Bigger Text" },
    { id: "decreaseText", icon: <Minus size={24} />, label: "Smaller Text" },
    // 7. Update the theme toggle button
    {
      id: "toggleTheme",
      icon: theme === "dark" ? <Sun size={24} /> : <Moon size={24} />,
      label: "Light-Dark",
    },
    {
      id: "areLinksHighlighted",
      icon: <Link size={24} />,
      label: "Highlight Links",
    },
    { id: "isReadableFont", icon: <Type size={24} />, label: "Readable Font" },
    {
      id: "areImagesHidden",
      icon: <ImageOff size={24} />,
      label: "Hide Images",
    },
  ];

  // ... The rest of your JSX remains the same as before
  return (
    <>
      {/* Accessibility Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition-transform hover:scale-110"
        aria-label="Open Accessibility Options"
      >
        <Accessibility size={28} />
      </button>

      {/* Accessibility Panel */}
      <div
        ref={widgetRef}
        className={`fixed top-0 right-0 z-50 h-full w-80 transform bg-gray-50 shadow-2xl transition-transform duration-300 ease-in-out dark:bg-gray-800 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="a11y-panel-title"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between bg-indigo-600 p-4 text-white">
            <h2 id="a11y-panel-title" className="text-lg font-bold">
              Accessibility Options
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close Accessibility Options"
            >
              <X size={24} />
            </button>
          </div>

          {/* Options Grid */}
          <div className="grid flex-grow grid-cols-2 gap-4 p-4">
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleAction(opt.id as any)}
                className="flex flex-col items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white p-4 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                {opt.icon}
                <span>{opt.label}</span>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 dark:border-gray-600">
            <button
              onClick={resetSettings}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-200 py-3 font-bold text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500"
            >
              <RefreshCcw size={18} />
              <span>Reset All Settings</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
