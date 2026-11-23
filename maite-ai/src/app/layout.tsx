// src/app/layout.tsx
import "./globals.css";
import AuthBootstrap from "@/Components/AuthBootstrap";

export const metadata = { title: "Maite" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600&family=Yeseva+One&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthBootstrap />
        {children}
      </body>
    </html>
  );
}
