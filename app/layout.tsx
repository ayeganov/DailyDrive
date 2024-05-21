import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {AuthProvider} from "./AuthContext";

const inter = Inter({ subsets: ["latin"] });


export const metadata: Metadata = {
  title: "DailyDrive",
  description: "Created for my family to keep track of chores and rewards.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="bubblegum-sans-regular text-8xl p-8">Daily Drive</div>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
