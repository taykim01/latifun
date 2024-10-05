import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/presentation/shadcn/toaster";

const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  variable: "--pretendard",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Latifun",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="kr">
      <body className={pretendard.variable}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
