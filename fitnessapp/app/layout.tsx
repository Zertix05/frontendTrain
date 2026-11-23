"use client";

import { Box } from "@mui/material";
import Navbar from "./components/Navbar";
import Footer from './components/Footer'

import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <Box width="400px" sx={{ width: { xl: "1488px" } }} m="auto">
          <Navbar />
          {children}
          <Footer />
        </Box>
      </body>
    </html>
  );
}
