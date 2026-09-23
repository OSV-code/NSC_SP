import type { Metadata } from "next";
import { Noto_Sans_Devanagari, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

const devnagari = Noto_Sans_Devanagari({
  variable: "--font-devnagari",
  subsets: ["devanagari"],
});

export const metadata: Metadata = {
  title: "Vidyarthi Sahayata | विद्यार्थी सहायता",
  description: "A student membership and grievance platform for Maharashtra.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sourceSans.variable} ${devnagari.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
