"use client";

import type { Messages } from "../messages";

type Tab = "dashboard" | "inventory" | "user";

type TabNavigationProps = {
  t: Messages;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

const getTabIcon = (tab: Tab) => {
  switch (tab) {
    case "dashboard":
      return (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 11.5L12 4l9 7.5M5 10v10a1 1 0 001 1h12a1 1 0 001-1V10M9 21v-5a3 3 0 016 0v5"
          />
        </svg>
      );

    case "inventory":
      return (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      );

    case "user":
      return (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      );
  }
};

export default function TabNavigation({ t, activeTab, onTabChange }: TabNavigationProps) {
  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "dashboard", label: t.dashboard || "Dashboard" },
    { id: "inventory", label: t.inventory || "Inventory" },
    { id: "user", label: t.user || "User" },
  ];

  return (
    <>
      {/* Desktop/Browser Navigation */}
      <nav className="mb-6 hidden border-b border-[#d6dbd3] sm:block">
        <div className="flex gap-2 sm:gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition ${activeTab === tab.id
                ? "border-[#315c4c] text-[#315c4c]"
                : "border-transparent text-[#68746d] hover:text-[#45534b]"
                }`}
              aria-selected={activeTab === tab.id}
              role="tab"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile PWA Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#d6dbd3] bg-white shadow-[0_-4px_12px_rgba(32,42,39,0.1)] sm:hidden safe-area-inset-bottom">
        <div className="flex justify-around">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-3 px-2 transition ${activeTab === tab.id
                ? "text-[#315c4c]"
                : "text-[#68746d] hover:text-[#45534b]"
                }`}
              aria-selected={activeTab === tab.id}
              role="tab"
            >
              <span className={activeTab === tab.id ? "text-[#315c4c]" : "text-[#68746d]"}>
                {getTabIcon(tab.id)}
              </span>
              <span className="text-xs font-semibold">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
