"use client";

import { useState } from "react";
import {
  masterSchedulesMarch,
  masterSchedulesApril,
  formatCurrency,
} from "@/lib/dummy-data";
import type { MasterScheduleRow } from "@/lib/dummy-data";

const monthOptions = [
  { value: "2026-03", label: "2026年3月" },
  { value: "2026-04", label: "2026年4月" },
];

function getDataForMonth(month: string): MasterScheduleRow[] {
  if (month === "2026-03") return masterSchedulesMarch;
  if (month === "2026-04") return masterSchedulesApril;
  return [];
}

export default function MasterPage() {
  const [selectedMonth, setSelectedMonth] = useState("2026-03");
  const [excludedMap, setExcludedMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    [...masterSchedulesMarch, ...masterSchedulesApril].forEach((row) => {
      if (row.isExcluded) map[row.id] = true;
    });
    return map;
  });

  const allRows = getDataForMonth(selectedMonth);
  const carryoverRows = allRows.filter((r) => r.carryoverFrom !== null);
  const normalRows = allRows.filter((r) => r.carryoverFrom === null);

  // KPI
  const totalAmount = allRows.reduce((sum, r) => sum + r.amount, 0);
  const carryoverAmount = carryoverRows.reduce((sum, r) => sum + r.amount, 0);
  const newAmount = normalRows.reduce((sum, r) => sum + r.amount, 0);

  const displayMonth = monthOptions.find((m) => m.value === selectedMonth)?.label ?? selectedMonth;

  const toggleExcluded = (id: string) => {
    setExcludedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold">入金予定マスター</h2>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border border-slate-300 rounded-md px-3 py-1 text-xs"
        >
          {monthOptions.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      {/* KPIサマリー */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="bg-white rounded-lg border border-slate-200 p-3">
          <p className="text-xs text-slate-500 mb-1">{displayMonth} 入金予定合計</p>
          <p className="text-lg font-bold">{formatCurrency(totalAmount)}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-3">
          <p className="text-xs text-slate-500 mb-1">うち繰越案件</p>
          <p className="text-lg font-bold text-orange-600">{formatCurrency(carryoverAmount)}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-3">
          <p className="text-xs text-slate-500 mb-1">{displayMonth} 新規予定</p>
          <p className="text-lg font-bold">{formatCurrency(newAmount)}</p>
        </div>
      </div>

      {/* テーブル */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-2 px-3 font-medium text-slate-600 w-10">除外</th>
                <th className="text-left py-2 px-3 font-medium text-slate-600">物件名</th>
                <th className="text-left py-2 px-3 font-medium text-slate-600">担当</th>
                <th className="text-left py-2 px-3 font-medium text-slate-600">入金区分</th>
                <th className="text-right py-2 px-3 font-medium text-slate-600">入金予定額</th>
                <th className="text-left py-2 px-3 font-medium text-slate-600">入金予定日</th>
                <th className="text-left py-2 px-3 font-medium text-slate-600">コメント</th>
              </tr>
            </thead>
            <tbody>
              {/* 繰越セクション */}
              {carryoverRows.length > 0 && (
                <>
                  <tr>
                    <td colSpan={7} className="bg-orange-50 border-t border-orange-200 px-3 py-1.5">
                      <span className="text-xs font-bold text-orange-700">
                        繰越案件　{carryoverRows.length}件　—　{carryoverRows[0].carryoverFrom}月の除外フラグから自動繰越
                      </span>
                    </td>
                  </tr>
                  {carryoverRows.map((row) => (
                    <ScheduleRow
                      key={row.id}
                      row={row}
                      isExcluded={!!excludedMap[row.id]}
                      onToggleExcluded={() => toggleExcluded(row.id)}
                      isCarryover
                    />
                  ))}
                </>
              )}
              {/* 通常案件 */}
              {normalRows.map((row) => (
                <ScheduleRow
                  key={row.id}
                  row={row}
                  isExcluded={!!excludedMap[row.id]}
                  onToggleExcluded={() => toggleExcluded(row.id)}
                  isCarryover={false}
                />
              ))}
            </tbody>
          </table>
        </div>
        {allRows.length === 0 && (
          <p className="p-8 text-center text-slate-400">該当するデータがありません</p>
        )}
      </div>
    </div>
  );
}

function ScheduleRow({
  row,
  isExcluded,
  onToggleExcluded,
  isCarryover,
}: {
  row: MasterScheduleRow;
  isExcluded: boolean;
  onToggleExcluded: () => void;
  isCarryover: boolean;
}) {
  return (
    <tr className={`border-t border-slate-100 hover:bg-blue-50 transition-colors ${isCarryover ? "bg-orange-50/30" : ""}`}>
      <td className="py-2 px-3">
        <div className="flex flex-col items-center gap-0.5">
          <input
            type="checkbox"
            checked={isExcluded}
            onChange={onToggleExcluded}
            className="w-3.5 h-3.5 rounded border-slate-300"
          />
          {isExcluded && (
            <span className="text-[10px] text-red-600 font-medium whitespace-nowrap">→ 翌月に繰越</span>
          )}
        </div>
      </td>
      <td className="py-2 px-3">
        <div className="flex items-center gap-1.5">
          <span>{row.propertyName}</span>
          {isCarryover && (
            <span className="inline-block px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-[10px] font-bold">繰越</span>
          )}
        </div>
        {isCarryover && row.carryoverFrom && (
          <p className="text-[11px] text-slate-500 mt-0.5">{row.carryoverFrom}月除外理由：月ずれ容認</p>
        )}
      </td>
      <td className="py-2 px-3">{row.staffName}</td>
      <td className="py-2 px-3">
        <span className="inline-block px-2 py-0.5 bg-slate-100 rounded text-xs">{row.paymentType}</span>
      </td>
      <td className="py-2 px-3 text-right font-mono">{formatCurrency(row.amount)}</td>
      <td className="py-2 px-3">{row.scheduledDate}</td>
      <td className="py-2 px-3">
        {row.salesComment ? (
          <div className="bg-orange-50 border border-orange-200 rounded-md px-2 py-1 max-w-[200px]">
            <p className="text-[10px] text-orange-500 font-medium mb-0.5">営業コメント</p>
            <p className="text-xs text-orange-800">{row.salesComment}</p>
          </div>
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </td>
    </tr>
  );
}
