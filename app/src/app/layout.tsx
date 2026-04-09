import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "The Biker Genome | Bike Accessories Store",
    template: "%s | The Biker Genome",
  },
  description:
    "Premium bike accessories, helmets, riding gear & more. Shop online or visit our store in Kolkata.",
  keywords: [
    "bike accessories",
    "helmets",
    "riding gear",
    "motorcycle accessories",
    "Kolkata",
  ],
  openGraph: {
    title: "The Biker Genome | Bike Accessories Store",
    description:
      "Premium bike accessories, helmets, riding gear & more. Shop online or visit our store.",
    type: "website",
    locale: "en_IN",
    siteName: "The Biker Genome",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
