import type { Metadata } from "next";
import { themeScript } from "@/lib/theme";
import "./globals.css";
export const metadata: Metadata = {
  title: "IntentField — Build wealth from within",
  description:
    "The inner work of building wealth. A story, a method, and a direction you can make your own.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
