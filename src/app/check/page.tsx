"use client";

import { useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import {
  properties,
  paymentSchedules,
  getRecordForSchedule,
  formatCurrency,
} from "@/lib/dummy-data";

const formatDate = (dateStr: string) => {
  if (!dateStr) return "—";
  const parts = dateStr.split("-");
  return `${parts[1]}/${parts[2]}`;
};

export default function CheckPage() {
  const [filterMonth, setFilterMonth] = useState("");
  const [checkedModal, setCheckedModal] = useState<string | null>(null);

  const filtered = paymentSchedules.filter((s) => {
    if (filterMonth) {
      const d = new Date(s.scheduled_date);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (ym !== filterMonth) return false;
    }
    return true;
  });

  return (
    <div className="px-5 py-4">
      <h2 className="text-lg font-medium mb-3">入金チェック</h2>

      {/* フィルター */}
      <div className="flex gap-4 mb-3">
        <div>
          <label className="block text-xs text-slate-500 mb-1">対象月</label>
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="border border-slate-300 rounded-md px-3 py-1 text-xs"
          />
        </div>
        {filterMonth && (
          <div className="flex items-end">
            <button
              onClick={() => setFilterMonth("")}
              className="text-xs text-slate-500 hover:text-slate-700 underline pb-1"
            >
              クリア
            </button>
          </div>
        )}
      </div>

      {/* テーブル */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th className="py-1.5 px-3 w-8 text-center font-medium text-slate-600">消込</th>
                <th className="text-left py-1.5 px-3 font-medium text-slate-600 whitespace-nowrap">物件名</th>
                <th className="text-center py-1.5 px-3 font-medium text-slate-600 w-14">区分</th>
                <th className="text-center py-1.5 px-3 font-medium text-slate-600 w-16">予定日</th>
                <th className="text-right py-1.5 px-3 font-medium text-slate-600 w-28">予定額</th>
                <th className="text-center py-1.5 px-3 font-medium text-slate-600 w-16">実入金日</th>
                <th className="text-right py-1.5 px-3 font-medium text-slate-600 w-28">実入金額</th>
                <th className="text-right py-1.5 px-3 font-medium text-slate-600 w-20">差異</th>
                <th className="text-center py-1.5 px-3 font-medium text-slate-600 w-16">請求書</th>
                <th className="text-center py-1.5 px-3 font-medium text-slate-600 w-14">通知</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const prop = properties.find((p) => p.id === s.property_id);
                const record = getRecordForSchedule(s.id);
                const isChecked = record?.actual_amount != null;
                const diff = isChecked ? s.scheduled_amount - (record?.actual_amount ?? 0) : null;

                const isOverdue = !isChecked && new Date(s.scheduled_date) < new Date();

                return (
                  <tr key={s.id} className={`border-t border-slate-100 hover:bg-slate-50 ${isOverdue ? "bg-red-50/50" : ""}`}>
                    <td className="py-1.5 px-3 w-8 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (!isChecked) setCheckedModal(s.id);
                        }}
                        disabled={isChecked}
                        className="w-3.5 h-3.5 accent-green-600"
                      />
                    </td>
                    <td className="py-1.5 px-3 whitespace-nowrap">
                      <Link href={`/property/${s.property_id}`} className="text-blue-600 hover:underline">
                        {prop?.property_name}
                      </Link>
                    </td>
                    <td className="py-1.5 px-3 w-14 text-center">
                      <span className="inline-block px-2 py-0.5 bg-slate-100 rounded text-xs">{s.category}</span>
                    </td>
                    <td className={`py-1.5 px-3 w-16 text-center ${isOverdue ? "text-red-600 font-medium" : ""}`}>
                      {formatDate(s.scheduled_date)}
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono w-28">{formatCurrency(s.scheduled_amount)}</td>
                    <td className="py-1.5 px-3 w-16 text-center">{record?.actual_date ? formatDate(record.actual_date) : "—"}</td>
                    <td className="py-1.5 px-3 text-right font-mono w-28">
                      {record?.actual_amount != null ? formatCurrency(record.actual_amount) : "—"}
                    </td>
                    <td className={`py-1.5 px-3 text-right font-mono w-20 ${diff != null && diff !== 0 ? (diff > 0 ? "text-red-600" : "text-yellow-600") : ""}`}>
                      {diff != null ? (diff === 0 ? "±0" : `${diff > 0 ? "+" : ""}${formatCurrency(diff)}`) : "—"}
                    </td>
                    <td className="py-1.5 px-3 text-center w-16">
                      <StatusBadge status={s.bill_status} />
                    </td>
                    <td className="py-1.5 px-3 text-center w-14">
                      {record?.notified ? (
                        <span className="text-xs text-green-600 font-medium whitespace-nowrap">送信済</span>
                      ) : (
                        <span className="text-xs text-slate-400 whitespace-nowrap">未送信</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="p-8 text-center text-slate-400">該当するデータがありません</p>
        )}
      </div>

      {/* 消込モーダル */}
      {checkedModal && (
        <CheckModal
          scheduleId={checkedModal}
          onClose={() => setCheckedModal(null)}
        />
      )}
    </div>
  );
}

function CheckModal({ scheduleId, onClose }: { scheduleId: string; onClose: () => void }) {
  const schedule = paymentSchedules.find((s) => s.id === scheduleId);
  const prop = properties.find((p) => p.id === schedule?.property_id);
  if (!schedule || !prop) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold mb-4">入金消込</h3>
        <div className="bg-slate-50 rounded-lg p-3 mb-4 text-sm space-y-1">
          <p><span className="text-slate-500">物件：</span>{prop.property_name}</p>
          <p><span className="text-slate-500">区分：</span>{schedule.category}</p>
          <p><span className="text-slate-500">予定額：</span>{formatCurrency(schedule.scheduled_amount)}</p>
        </div>
        <div className="space-y-3 text-sm">
          <div>
            <label className="block text-xs text-slate-500 mb-1">実入金日</label>
            <input type="date" className="w-full border border-slate-300 rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">実入金額（税込）</label>
            <input
              type="number"
              className="w-full border border-slate-300 rounded-md px-3 py-2"
              placeholder={String(schedule.scheduled_amount)}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">備考</label>
            <textarea className="w-full border border-slate-300 rounded-md px-3 py-2" rows={2} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">キャンセル</button>
          <button onClick={onClose} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">消込 + 通知送信（ダミー）</button>
        </div>
      </div>
    </div>
  );
}
