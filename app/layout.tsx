// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2025  Philipp Emanuel Weidmann <pew@worldwidemann.com>

import { Theme } from "@radix-ui/themes";
import type { Metadata } from "next";
import { Cinzel_Decorative, Grenze } from "next/font/google";
import "@radix-ui/themes/styles.css";
import "./globals.css";

const grenze = Grenze({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-grenze",
});

const cinzelDecorative = Cinzel_Decorative({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-cinzel-decorative",
});

export const metadata: Metadata = {
  title: "Waidrin",
  description: "Next-generation AI roleplay system",
  icons: {
    icon: "/images/icon.png",
    apple: "/images/icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${grenze.variable} ${cinzelDecorative.variable}`}>
        <Theme appearance="dark" accentColor="plum">
          {children}
        </Theme>
      </body>
    </html>
  );
}
