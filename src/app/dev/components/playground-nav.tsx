"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShowcaseItem {
  id: string;
  title: string;
}

interface PlaygroundNavProps {
  showcases: ShowcaseItem[];
  activeId: string;
  setActiveId: (id: string) => void;
  search: string;
  setSearch: (search: string) => void;
}

export function PlaygroundNav({
  showcases,
  activeId,
  setActiveId,
  search,
  setSearch,
}: PlaygroundNavProps) {
  const handleNavClick = (id: string) => {
    setActiveId(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-20 w-64 border-r bg-background hidden lg:block">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold tracking-tight">
            Component
            <br />
            Playground
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Explore variants & states
          </p>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search components..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-auto p-4">
          <div className="space-y-1">
            {showcases.map((showcase) => (
              <button
                key={showcase.id}
                onClick={() => handleNavClick(showcase.id)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                  activeId === showcase.id
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                {showcase.title}
              </button>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t text-xs text-muted-foreground">
          <p>Add components in</p>
          <code className="bg-muted px-1 py-0.5 rounded">/dev/components/</code>
        </div>
      </div>
    </aside>
  );
}
