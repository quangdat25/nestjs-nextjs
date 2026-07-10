import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Bếp Mây | Đồ ăn & thức uống mỗi ngày",
  description: "Đặt món ngon và thức uống tươi mới tại Bếp Mây.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
