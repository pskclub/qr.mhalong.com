import type { Metadata } from "next";
import { Noto_Sans_Thai, Noto_Sans_Mono } from "next/font/google";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const notoSansMono = Noto_Sans_Mono({
  variable: "--font-noto-sans-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "QR Generator for everyone - QRAFT",
  description: "QR Generator for everyone - QRAFT",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${notoSansThai.variable} ${notoSansMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
