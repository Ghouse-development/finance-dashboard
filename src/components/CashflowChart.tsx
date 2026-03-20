"use client";

import { useState } from "react";
import {
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { CASHFLOW_QUARTER, CASHFLOW_HALF, CASHFLOW_YEAR } from "@/lib/dummy-data";

type Period = "quarter" | "half" | "year";

const dataMap: Record<Period, typeof CASHFLOW_QUARTER> = {
  quarter: CASHFLOW_QUARTER,
  half: CASHFLOW_HALF,
  year: CASHFLOW_YEAR,
};

function toMan(value: number) {
  return `${(value / 10000).toLocaleString()}万`;
}

export default function CashflowChart() {
  const [period, setPeriod] = useState<Period>("quarter");

  const chartData = dataMap[period].map((d) => ({
    ...d,
    net: d.income - d.payment,
  }));

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">月別キャッシュフロー</span>
        <div className="flex gap-1">
          {(["quarter", "half", "year"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-2 py-0.5 text-xs rounded-md ${
                period === p
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {p === "quarter" ? "四半期" : p === "half" ? "半期" : "年間"}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={toMan} tick={{ fontSize: 11 }} width={60} />
          <Tooltip
            formatter={(value, name) => [
              toMan(Number(value)),
              name === "income" ? "入金" : name === "payment" ? "支払" : "差引",
            ]}
          />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            formatter={(value: string) =>
              value === "income" ? "入金" : value === "payment" ? "支払" : "差引"
            }
          />
          <Bar dataKey="income" fill="#22c55e" barSize={14} radius={[3, 3, 0, 0]} />
          <Bar dataKey="payment" fill="#f97316" barSize={14} radius={[3, 3, 0, 0]} />
          <Line
            dataKey="net"
            type="monotone"
            stroke="#3b82f6"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={{ r: 3 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
