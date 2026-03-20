"use client";

import {
  BarChart,
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

const CASHFLOW_DATA = [
  { month: "10月", income: 0,        payment: 1200000 },
  { month: "11月", income: 5000000,  payment: 3800000 },
  { month: "12月", income: 9700000,  payment: 5200000 },
  { month: "1月",  income: 2000000,  payment: 4100000 },
  { month: "2月",  income: 9700000,  payment: 6200000 },
  { month: "3月",  income: 12580000, payment: 7100000 },
].map((d) => ({
  ...d,
  net: d.income - d.payment,
}));

function toMan(value: number) {
  return `${(value / 10000).toLocaleString()}万`;
}

export default function CashflowChart() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <h3 className="text-lg font-semibold mb-4">月別キャッシュフロー</h3>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={CASHFLOW_DATA} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={toMan} tick={{ fontSize: 12 }} width={70} />
          <Tooltip
            formatter={(value, name) => [
              toMan(Number(value)),
              name === "income" ? "入金" : name === "payment" ? "支払" : "差引",
            ]}
          />
          <Legend
            formatter={(value: string) =>
              value === "income" ? "入金" : value === "payment" ? "支払" : "差引"
            }
          />
          <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="payment" fill="#f97316" radius={[4, 4, 0, 0]} />
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
