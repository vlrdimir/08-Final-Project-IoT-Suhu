import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ProviderTanstack from "./provider-tanstack";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IoT Temperature Monitoring",
  description: "Monitoring temperatur dengan IoT",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {/* <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
        </ThemeProvider> */}
        <ProviderTanstack>{children}</ProviderTanstack>
      </body>
    </html>
  );
}
