"use client";

import { type PaymentOut, type PaymentOutStatus, formatCurrency } from "@/lib/dummy-data";

const statusLabels: Record<PaymentOutStatus, string> = {
  ok: "照合済み",
  diff: "差異あり",
  unissued: "請求書未着",
  "next-month": "翌月払い",
};

const statusColors: Record<PaymentOutStatus, string> = {
  ok: "bg-green-100 text-green-800",
  diff: "bg-red-100 text-red-800",
  unissued: "bg-slate-100 text-slate-600",
  "next-month": "bg-yellow-100 text-yellow-800",
};

function DiffCell({ ordered, billed }: { ordered: number; billed: number | null }) {
  if (billed === null) {
    return <span className="text-slate-400">—</span>;
  }
  const diff = ordered - billed;
  if (diff === 0) {
    return <span className="text-slate-400">±0</span>;
  }
  if (diff < 0) {
    return <span className="text-red-600 font-medium">{formatCurrency(diff)}</span>;
  }
  return <span className="text-green-600 font-medium">+{formatCurrency(diff)}</span>;
}

export default function PaymentOutTable({ data }: { data: PaymentOut[] }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left py-1.5 px-3 font-medium text-slate-600">業者名</th>
              <th className="text-left py-1.5 px-3 font-medium text-slate-600">物件名</th>
              <th className="text-left py-1.5 px-3 font-medium text-slate-600">工種</th>
              <th className="text-right py-1.5 px-3 font-medium text-slate-600">発注金額</th>
              <th className="text-right py-1.5 px-3 font-medium text-slate-600">請求金額</th>
              <th className="text-right py-1.5 px-3 font-medium text-slate-600">差異</th>
              <th className="text-left py-1.5 px-3 font-medium text-slate-600">支払予定日</th>
              <th className="text-left py-1.5 px-3 font-medium text-slate-600">ステータス</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="py-1.5 px-3">{row.contractor}</td>
                <td className="py-1.5 px-3">{row.property}</td>
                <td className="py-1.5 px-3">{row.workType}</td>
                <td className="py-1.5 px-3 text-right font-mono">{formatCurrency(row.orderedAmount)}</td>
                <td className="py-1.5 px-3 text-right font-mono">
                  {row.billedAmount !== null ? formatCurrency(row.billedAmount) : <span className="text-slate-400">—</span>}
                </td>
                <td className="py-1.5 px-3 text-right font-mono">
                  <DiffCell ordered={row.orderedAmount} billed={row.billedAmount} />
                </td>
                <td className="py-1.5 px-3">{row.dueDate}</td>
                <td className="py-1.5 px-3">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusColors[row.status]}`}>
                    {statusLabels[row.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 && (
        <p className="p-8 text-center text-slate-400">該当するデータがありません</p>
      )}
    </div>
  );
}
