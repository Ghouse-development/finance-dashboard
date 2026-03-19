"use client";

import { useState } from "react";
import Link from "next/link";
import {
  properties,
  paymentSchedules,
  getRecordForSchedule,
  getStatus,
  getStatusColor,
  formatCurrency,
} from "@/lib/dummy-data";

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
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">入金チェック</h2>

      {/* フィルター */}
      <div className="flex gap-4 mb-6">
        <div>
          <label className="block text-xs text-slate-500 mb-1">対象月</label>
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="border border-slate-300 rounded-md px-3 py-1.5 text-sm"
          />
        </div>
        {filterMonth && (
          <div className="flex items-end">
            <button
              onClick={() => setFilterMonth("")}
              className="text-sm text-slate-500 hover:text-slate-700 underline pb-1.5"
            >
              クリア
            </button>
          </div>
        )}
      </div>

      {/* テーブル */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-3 w-12 font-medium text-slate-600">消込</th>
                <th className="text-left p-3 font-medium text-slate-600">物件名</th>
                <th className="text-left p-3 font-medium text-slate-600">施主名</th>
                <th className="text-left p-3 font-medium text-slate-600">入金区分</th>
                <th className="text-left p-3 font-medium text-slate-600">予定日</th>
                <th className="text-right p-3 font-medium text-slate-600">予定額</th>
                <th className="text-left p-3 font-medium text-slate-600">実入金日</th>
                <th className="text-right p-3 font-medium text-slate-600">実入金額</th>
                <th className="text-right p-3 font-medium text-slate-600">差異</th>
                <th className="text-center p-3 font-medium text-slate-600">通知</th>
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
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (!isChecked) setCheckedModal(s.id);
                        }}
                        disabled={isChecked}
                        className="w-4 h-4 accent-green-600"
                      />
                    </td>
                    <td className="p-3">
                      <Link href={`/property/${s.property_id}`} className="text-blue-600 hover:underline">
                        {prop?.property_name}
                      </Link>
                    </td>
                    <td className="p-3">{prop?.owner_name}</td>
                    <td className="p-3">
                      <span className="inline-block px-2 py-0.5 bg-slate-100 rounded text-xs">{s.category}</span>
                    </td>
                    <td className={`p-3 ${isOverdue ? "text-red-600 font-medium" : ""}`}>
                      {s.scheduled_date}
                    </td>
                    <td className="p-3 text-right font-mono">{formatCurrency(s.scheduled_amount)}</td>
                    <td className="p-3">{record?.actual_date ?? "—"}</td>
                    <td className="p-3 text-right font-mono">
                      {record?.actual_amount != null ? formatCurrency(record.actual_amount) : "—"}
                    </td>
                    <td className={`p-3 text-right font-mono ${diff != null && diff !== 0 ? (diff > 0 ? "text-red-600" : "text-yellow-600") : ""}`}>
                      {diff != null ? (diff === 0 ? "±0" : `${diff > 0 ? "+" : ""}${formatCurrency(diff)}`) : "—"}
                    </td>
                    <td className="p-3 text-center">
                      {record?.notified ? (
                        <span className="text-xs text-green-600 font-medium">送信済</span>
                      ) : (
                        <span className="text-xs text-slate-400">未送信</span>
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
