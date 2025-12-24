"use client";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MantineProvider
      theme={{
        fontFamily: "var(--font-sora), 'Helvetica Neue', sans-serif",
        headings: { fontFamily: "var(--font-sora), 'Helvetica Neue', sans-serif" },
        defaultRadius: "md",
        primaryColor: "indigo",
      }}
      defaultColorScheme="dark"
    >
      <Notifications />
      {children}
    </MantineProvider>
  );
}
