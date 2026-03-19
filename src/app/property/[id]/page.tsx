"use client";

import { use } from "react";
import Link from "next/link";
import {
  getProperty,
  getSchedulesForProperty,
  getRecordForSchedule,
  getStatus,
  getStatusColor,
  formatCurrency,
  getPaidAmount,
} from "@/lib/dummy-data";

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const property = getProperty(id);

  if (!property) {
    return (
      <div className="p-6">
        <p className="text-slate-500">物件が見つかりません。</p>
        <Link href="/" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
          ダッシュボードに戻る
        </Link>
      </div>
    );
  }

  const schedules = getSchedulesForProperty(property.id);
  const paidAmount = getPaidAmount(property.id);
  const remaining = property.contract_amount - paidAmount;
  const paidCount = schedules.filter((s) => getStatus(s) === "入金済").length;
  const pct = Math.round((paidAmount / property.contract_amount) * 100);

  return (
    <div className="p-6">
      <Link href="/" className="text-sm text-slate-500 hover:text-slate-700 mb-4 inline-block">
        ← ダッシュボードに戻る
      </Link>

      {/* 物件概要カード */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">{property.property_name}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <InfoItem label="施主名" value={property.owner_name} />
          <InfoItem label="契約番号" value={property.contract_number} />
          <InfoItem label="契約金額（税込）" value={formatCurrency(property.contract_amount)} />
          <InfoItem label="着工日" value={property.start_date} />
          <InfoItem label="引渡予定日" value={property.delivery_date} />
          <InfoItem label="担当営業" value="—（G-Force連携後に自動取得）" />
        </div>
      </div>

      {/* 入金サマリーカード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard label="入金済み（合計）" value={formatCurrency(paidAmount)} color="bg-green-50 border-green-200" />
        <SummaryCard label="未入金（残り）" value={formatCurrency(remaining)} color="bg-yellow-50 border-yellow-200" />
        <SummaryCard label="入金回数" value={`${paidCount} 回 / 5 回`} color="bg-blue-50 border-blue-200" />
        <SummaryCard label="消化率" value={`${pct}%`} color="bg-slate-50 border-slate-200" />
      </div>

      {/* タイムライン */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold mb-6">入金タイムライン</h3>
        <div className="space-y-0">
          {schedules
            .sort((a, b) => a.round - b.round)
            .map((s, i) => {
              const record = getRecordForSchedule(s.id);
              const status = getStatus(s);
              const isLast = i === schedules.length - 1;

              return (
                <div key={s.id} className="flex gap-4">
                  {/* タイムラインドット＋ライン */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      status === "入金済" ? "bg-green-500 text-white" :
                      status === "未入金" ? "bg-yellow-400 text-white" :
                      "bg-blue-400 text-white"
                    }`}>
                      {s.round}
                    </div>
                    {!isLast && <div className="w-0.5 h-full bg-slate-200 min-h-[40px]" />}
                  </div>

                  {/* コンテンツ */}
                  <div className={`flex-1 pb-6 ${isLast ? "" : ""}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">第{s.round}回：{s.category}</span>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                        {status}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 space-y-0.5">
                      <p>予定日：{s.scheduled_date}　/　予定額：{formatCurrency(s.scheduled_amount)}</p>
                      {record?.actual_date && (
                        <p>
                          実入金日：{record.actual_date}　/　実入金額：{formatCurrency(record.actual_amount ?? 0)}
                          {record.actual_amount != null && record.actual_amount !== s.scheduled_amount && (
                            <span className="text-red-600 ml-2">
                              （差異：{formatCurrency(s.scheduled_amount - record.actual_amount)}）
                            </span>
                          )}
                        </p>
                      )}
                      {record?.notes && <p className="text-slate-400">備考：{record.notes}</p>}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className={`rounded-lg border p-4 ${color}`}>
      <p className="text-xs text-slate-600 mb-1">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
