import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "入金管理",
  description: "施主入金管理アプリ",
};

const navItems = [
  { href: "/", label: "ダッシュボード", icon: "📊" },
  { href: "/master", label: "入金予定マスター", icon: "📋" },
  { href: "/check", label: "入金チェック", icon: "✅" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} antialiased`}>
        <div className="flex min-h-screen">
          {/* サイドバー */}
          <aside className="w-60 bg-slate-800 text-white flex flex-col shrink-0">
            <div className="p-4 border-b border-slate-700">
              <h1 className="text-lg font-bold">入金管理</h1>
              <p className="text-xs text-slate-400 mt-1">G-Force 連携予定</p>
            </div>
            <nav className="flex-1 p-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-slate-700 text-xs text-slate-500">
              開発中（ダミーデータ）
            </div>
          </aside>

          {/* メインコンテンツ */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
