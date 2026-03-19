"use client";

import { useState } from "react";
import {
  properties,
  paymentSchedules,
  getStatusColor,
  getStatus,
  formatCurrency,
} from "@/lib/dummy-data";

export default function MasterPage() {
  const [filterMonth, setFilterMonth] = useState("");
  const [filterProperty, setFilterProperty] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered = paymentSchedules.filter((s) => {
    if (filterMonth) {
      const d = new Date(s.scheduled_date);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (ym !== filterMonth) return false;
    }
    if (filterProperty && s.property_id !== filterProperty) return false;
    return true;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">入金予定マスター</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          + 新規登録
        </button>
      </div>

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
        <div>
          <label className="block text-xs text-slate-500 mb-1">物件</label>
          <select
            value={filterProperty}
            onChange={(e) => setFilterProperty(e.target.value)}
            className="border border-slate-300 rounded-md px-3 py-1.5 text-sm"
          >
            <option value="">全物件</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>{p.property_name}</option>
            ))}
          </select>
        </div>
        {(filterMonth || filterProperty) && (
          <div className="flex items-end">
            <button
              onClick={() => { setFilterMonth(""); setFilterProperty(""); }}
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
                <th className="text-left p-3 font-medium text-slate-600">契約番号</th>
                <th className="text-left p-3 font-medium text-slate-600">物件名</th>
                <th className="text-left p-3 font-medium text-slate-600">施主名</th>
                <th className="text-left p-3 font-medium text-slate-600">入金区分</th>
                <th className="text-left p-3 font-medium text-slate-600">入金予定日</th>
                <th className="text-right p-3 font-medium text-slate-600">入金予定額</th>
                <th className="text-right p-3 font-medium text-slate-600">入金割合</th>
                <th className="text-left p-3 font-medium text-slate-600">備考</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const prop = properties.find((p) => p.id === s.property_id);
                if (!prop) return null;
                const ratio = ((s.scheduled_amount / prop.contract_amount) * 100).toFixed(1);
                return (
                  <tr
                    key={s.id}
                    onClick={() => setEditingId(s.id)}
                    className="border-t border-slate-100 hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <td className="p-3 font-mono text-xs">{prop.contract_number}</td>
                    <td className="p-3">{prop.property_name}</td>
                    <td className="p-3">{prop.owner_name}</td>
                    <td className="p-3">
                      <span className="inline-block px-2 py-0.5 bg-slate-100 rounded text-xs">
                        {s.category}
                      </span>
                    </td>
                    <td className="p-3">{s.scheduled_date}</td>
                    <td className="p-3 text-right font-mono">{formatCurrency(s.scheduled_amount)}</td>
                    <td className="p-3 text-right">{ratio}%</td>
                    <td className="p-3 text-slate-400">{s.notes || "—"}</td>
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

      {/* 編集モーダル（簡易版） */}
      {editingId && (
        <EditModal
          scheduleId={editingId}
          onClose={() => setEditingId(null)}
        />
      )}
    </div>
  );
}

function EditModal({ scheduleId, onClose }: { scheduleId: string; onClose: () => void }) {
  const schedule = paymentSchedules.find((s) => s.id === scheduleId);
  const prop = properties.find((p) => p.id === schedule?.property_id);
  if (!schedule || !prop) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold mb-4">入金予定 編集</h3>
        <div className="space-y-3 text-sm">
          <Field label="物件名" value={prop.property_name} />
          <Field label="契約番号" value={prop.contract_number} />
          <Field label="施主名" value={prop.owner_name} />
          <div>
            <label className="block text-xs text-slate-500 mb-1">入金区分</label>
            <select className="w-full border border-slate-300 rounded-md px-3 py-2" defaultValue={schedule.category}>
              {["申込金", "契約金", "着工金", "中間金", "引渡金"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">入金予定日</label>
            <input type="date" className="w-full border border-slate-300 rounded-md px-3 py-2" defaultValue={schedule.scheduled_date} />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">入金予定額（税込）</label>
            <input type="number" className="w-full border border-slate-300 rounded-md px-3 py-2" defaultValue={schedule.scheduled_amount} />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">備考</label>
            <textarea className="w-full border border-slate-300 rounded-md px-3 py-2" rows={2} defaultValue={schedule.notes} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">キャンセル</button>
          <button onClick={onClose} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">保存（ダミー）</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 mb-1">{label}</label>
      <p className="px-3 py-2 bg-slate-50 rounded-md">{value}</p>
    </div>
  );
}

