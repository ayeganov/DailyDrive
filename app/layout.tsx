"use client";

import React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import {AuthProvider} from "./AuthContext";
import { AlertProvider } from './AlertContext';

const inter = Inter({ subsets: ["latin"] });


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>)
{
  return (
    <html lang="en">
      <body className={inter.className}>
        <AlertProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </AlertProvider>
      </body>
    </html>
  );
}
