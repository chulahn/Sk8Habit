import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Header from "./components/Header";

export const metadata: Metadata = {
  title: "Skate Your Day",
  description: "Habit tracking with points, friends, a leaderboard, and shop rewards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
