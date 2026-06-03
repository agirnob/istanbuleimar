import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eimar - İmar Bilgi Platformu",
  description: "İstanbul belediyeleri imar ve parsel bilgi platformu",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
