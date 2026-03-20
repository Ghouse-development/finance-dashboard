"use client";

import { useState } from "react";
import { paymentOutData, formatCurrency } from "@/lib/dummy-data";
import PaymentOutTable from "@/components/PaymentOutTable";

type TabKey = "all" | "diff" | "unissued" | "ok";

const tabs: { key: TabKey; label: string }[] = [
  { key: "all", label: "全件" },
  { key: "diff", label: "差異あり" },
  { key: "unissued", label: "未着・未発行" },
  { key: "ok", label: "照合済み" },
];

function filterByTab(tab: TabKey) {
  if (tab === "all") return paymentOutData;
  if (tab === "diff") return paymentOutData.filter((d) => d.status === "diff");
  if (tab === "unissued") return paymentOutData.filter((d) => d.status === "unissued" || d.status === "next-month");
  if (tab === "ok") return paymentOutData.filter((d) => d.status === "ok");
  return paymentOutData;
}

export default function PaymentOutPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  const filtered = filterByTab(activeTab);

  // KPI計算
  const thisMonthDue = paymentOutData
    .filter((d) => d.dueDate.startsWith("2026/03"))
    .reduce((sum, d) => sum + d.orderedAmount, 0);

  const diffCount = paymentOutData.filter((d) => d.status === "diff").length;

  const unissuedCount = paymentOutData.filter(
    (d) => d.status === "unissued" || d.status === "next-month"
  ).length;

  const okItems = paymentOutData.filter((d) => d.status === "ok");
  const okCount = okItems.length;
  const okAmount = okItems.reduce((sum, d) => sum + d.orderedAmount, 0);

  return (
    <div className="px-5 py-4">
      <h2 className="text-lg font-bold mb-3">出金管理</h2>

      {/* KPIカード */}
      <div className="grid grid-cols-4 gap-3 mb-3">
        <div className="bg-white rounded-lg border border-slate-200 p-3">
          <p className="text-xs text-slate-500 mb-1">今月支払予定合計</p>
          <p className="text-lg font-bold">{formatCurrency(thisMonthDue)}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-3">
          <p className="text-xs text-slate-500 mb-1">差異あり件数</p>
          <p className="text-lg font-bold text-red-600">{diffCount}件</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-3">
          <p className="text-xs text-slate-500 mb-1">未着件数</p>
          <p className="text-lg font-bold text-yellow-600">{unissuedCount}件</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-3">
          <p className="text-xs text-slate-500 mb-1">照合済み</p>
          <p className="text-lg font-bold text-green-600">{okCount}件 / {formatCurrency(okAmount)}</p>
        </div>
      </div>

      {/* タブ */}
      <div className="flex gap-1 mb-3 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* テーブル */}
      <PaymentOutTable data={filtered} />
    </div>
  );
}
