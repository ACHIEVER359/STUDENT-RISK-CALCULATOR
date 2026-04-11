import type { Metadata } from "next";
import "./globals.css";
import ToastContainer from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "Scholar Sense | AI Academic Analyzer",
  description: "AI-Based Academic & Psychological Metric Analyzer for Teachers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}