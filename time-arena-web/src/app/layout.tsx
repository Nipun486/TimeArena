import "./globals.css";
import type { ReactNode } from "react";
import ClientLayout from "./ClientLayout";

export const metadata = {
  title: "Time Arena",
  description: "Gamified task management with scoring",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white antialiased min-h-screen">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
