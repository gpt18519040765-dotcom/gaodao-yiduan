import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "高导易断",
  description: "以易理为镜，辅助判断当下处境",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
