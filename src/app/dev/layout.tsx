"use client";

import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { ThemeProvider } from "./components/theme-provider";

export default function DevLayout({ children }: { children: ReactNode }) {
  if (process.env.NODE_ENV === "production") {
    redirect("/");
  }

  return <ThemeProvider>{children}</ThemeProvider>;
}
