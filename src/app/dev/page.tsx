"use client";

import { useState } from "react";
import { ButtonShowcase } from "./components/button-showcase";
import { PlaygroundNav } from "./components/playground-nav";
import { PlaygroundHeader } from "./components/playground-header";

const showcases = [
  { id: "button", title: "Button", component: ButtonShowcase },
  // Add more showcases here as you build them
];

export default function PlaygroundPage() {
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState("button");

  const filteredShowcases = showcases.filter((showcase) =>
    showcase.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar Navigation */}
      <PlaygroundNav
        showcases={showcases}
        activeId={activeId}
        setActiveId={setActiveId}
        search={search}
        setSearch={setSearch}
      />

      {/* Main Content */}
      <div className="flex-1 lg:pl-64">
        <PlaygroundHeader />

        <div className="container mx-auto py-10 px-6 space-y-16">
          {filteredShowcases.map(({ id, component: Component }) => (
            <div key={id} id={id}>
              <Component />
            </div>
          ))}

          {filteredShowcases.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">
                No components found matching &quot;{search}&quot;
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
