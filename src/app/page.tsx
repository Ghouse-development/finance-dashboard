"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  properties,
  paymentSchedules,
  getRecordForSchedule,
  getStatus,
  getStatusColor,
  formatCurrency,
  getPaidAmount,
} from "@/lib/dummy-data";

const CashflowChart = dynamic(() => import("@/components/CashflowChart"), { ssr: false });

export default function Dashboard() {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // 同期ボタン状態
  const [syncState, setSyncState] = useState<"idle" | "loading" | "done">("idle");

  function handleSync() {
    if (syncState === "loading") return;
    setSyncState("loading");
    setTimeout(() => setSyncState("done"), 2000);
  }

  // 今月の入金予定
  const thisMonthSchedules = paymentSchedules.filter((s) => {
    const d = new Date(s.scheduled_date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const thisMonthTotal = thisMonthSchedules.reduce((sum, s) => sum + s.scheduled_amount, 0);

  // 入金済み（今月）
  const thisMonthPaid = thisMonthSchedules.reduce((sum, s) => {
    const record = getRecordForSchedule(s.id);
    return sum + (record?.actual_amount ?? 0);
  }, 0);

  // 未入金（今月期限）
  const thisMonthUnpaid = thisMonthSchedules.filter((s) => {
    const status = getStatus(s);
    return status === "未入金";
  });
  const thisMonthUnpaidTotal = thisMonthUnpaid.reduce((sum, s) => sum + s.scheduled_amount, 0);

  // 来月以降の予定
  const futureSchedules = paymentSchedules.filter((s) => {
    const d = new Date(s.scheduled_date);
    return d > new Date(currentYear, currentMonth + 1, 0);
  });
  const futureTotal = futureSchedules.reduce((sum, s) => sum + s.scheduled_amount, 0);

  // 直近の入金状況（全件を予定日順）
  const recentSchedules = [...paymentSchedules]
    .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime());

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">ダッシュボード</h2>

        {/* 同期ボタン */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">最終同期：2026/03/19 09:00</span>
          <button
            onClick={handleSync}
            disabled={syncState === "loading"}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              syncState === "done"
                ? "bg-green-600 text-white"
                : syncState === "loading"
                ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {syncState === "loading" && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            )}
            {syncState === "idle" && "ダンドリワークから取込"}
            {syncState === "loading" && "取込中…"}
            {syncState === "done" && "取込完了"}
          </button>
        </div>
      </div>

      {/* KPIカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          title="今月の入金予定"
          value={formatCurrency(thisMonthTotal)}
          sub={`${thisMonthSchedules.length} 件`}
          color="bg-blue-50 border-blue-200"
        />
        <KpiCard
          title="入金済み"
          value={formatCurrency(thisMonthPaid)}
          sub={thisMonthTotal > 0 ? `${Math.round((thisMonthPaid / thisMonthTotal) * 100)}%` : "—"}
          color="bg-green-50 border-green-200"
        />
        <KpiCard
          title="未入金（今月期限）"
          value={formatCurrency(thisMonthUnpaidTotal)}
          sub={`${thisMonthUnpaid.length} 件`}
          color="bg-yellow-50 border-yellow-200"
        />
        <KpiCard
          title="来月以降の予定"
          value={formatCurrency(futureTotal)}
          sub={`${futureSchedules.length} 件`}
          color="bg-slate-50 border-slate-200"
        />
      </div>

      {/* CFグラフ */}
      <div className="mb-8">
        <CashflowChart />
      </div>

      {/* 直近の入金状況 */}
      <div className="bg-white rounded-lg border border-slate-200 mb-8">
        <h3 className="text-lg font-semibold p-4 border-b border-slate-200">直近の入金状況</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-3 font-medium text-slate-600">物件名</th>
                <th className="text-left p-3 font-medium text-slate-600">入金区分</th>
                <th className="text-left p-3 font-medium text-slate-600">予定日</th>
                <th className="text-right p-3 font-medium text-slate-600">金額</th>
                <th className="text-center p-3 font-medium text-slate-600">状態</th>
              </tr>
            </thead>
            <tbody>
              {recentSchedules.map((s) => {
                const prop = properties.find((p) => p.id === s.property_id);
                const status = getStatus(s);
                return (
                  <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="p-3">
                      <Link href={`/property/${s.property_id}`} className="text-blue-600 hover:underline">
                        {prop?.property_name}
                      </Link>
                    </td>
                    <td className="p-3">{s.category}</td>
                    <td className="p-3">{s.scheduled_date}</td>
                    <td className="p-3 text-right">{formatCurrency(s.scheduled_amount)}</td>
                    <td className="p-3 text-center">
                      <PaymentStatusBadge status={status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 物件別入金進捗 */}
      <div className="bg-white rounded-lg border border-slate-200">
        <h3 className="text-lg font-semibold p-4 border-b border-slate-200">物件別入金進捗</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-3 font-medium text-slate-600">物件名</th>
                <th className="text-right p-3 font-medium text-slate-600">契約金額</th>
                <th className="text-right p-3 font-medium text-slate-600">入金済</th>
                <th className="p-3 font-medium text-slate-600 w-64">進捗</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((prop) => {
                const paid = getPaidAmount(prop.id);
                const pct = Math.round((paid / prop.contract_amount) * 100);
                return (
                  <tr key={prop.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="p-3">
                      <Link href={`/property/${prop.id}`} className="text-blue-600 hover:underline">
                        {prop.property_name}
                      </Link>
                    </td>
                    <td className="p-3 text-right">{formatCurrency(prop.contract_amount)}</td>
                    <td className="p-3 text-right">{formatCurrency(paid)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-blue-500 h-3 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-600 w-10 text-right">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, sub, color }: { title: string; value: string; sub: string; color: string }) {
  return (
    <div className={`rounded-lg border p-4 ${color}`}>
      <p className="text-sm text-slate-600 mb-1">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{sub}</p>
    </div>
  );
}

function PaymentStatusBadge({ status }: { status: "入金済" | "未入金" | "予定" }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {status}
    </span>
  );
}
