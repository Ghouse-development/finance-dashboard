import StatusBadge, { type BillStatus } from "./StatusBadge";
import { formatCurrency } from "@/lib/dummy-data";

type ContractorPayment = {
  contractor: string;
  work_type: string;
  amount: number;
  due_date: string;
  status: BillStatus;
};

const DUMMY_CONTRACTOR_PAYMENTS: ContractorPayment[] = [
  { contractor: "K-STYLE株式会社",       work_type: "外壁工事",    amount: 1540000, due_date: "2026/04/30", status: "confirmed" },
  { contractor: "カネマル株式会社",       work_type: "建材・金物",  amount: 890000,  due_date: "2026/04/30", status: "pending"   },
  { contractor: "株式会社こころ建築工房", work_type: "木工事",      amount: 2200000, due_date: "2026/05/31", status: "pending"   },
  { contractor: "小倉サンダイン株式会社", work_type: "屋根工事",    amount: 760000,  due_date: "2026/04/30", status: "diff"      },
  { contractor: "北野電気",              work_type: "電気設備工事", amount: 480000,  due_date: "2026/05/31", status: "confirmed" },
];

export default function ContractorPaymentTable() {
  const total = DUMMY_CONTRACTOR_PAYMENTS.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="bg-white rounded-lg border border-slate-200">
      <h3 className="text-lg font-semibold p-4 border-b border-slate-200">業者別支払予定</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-3 font-medium text-slate-600">業者名</th>
              <th className="text-left p-3 font-medium text-slate-600">工種</th>
              <th className="text-right p-3 font-medium text-slate-600">請求金額（税込）</th>
              <th className="text-left p-3 font-medium text-slate-600">支払予定日</th>
              <th className="text-center p-3 font-medium text-slate-600">ステータス</th>
            </tr>
          </thead>
          <tbody>
            {DUMMY_CONTRACTOR_PAYMENTS.map((p, i) => (
              <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="p-3">{p.contractor}</td>
                <td className="p-3">{p.work_type}</td>
                <td className="p-3 text-right font-mono">{formatCurrency(p.amount)}</td>
                <td className="p-3">{p.due_date}</td>
                <td className="p-3 text-center">
                  <StatusBadge status={p.status} />
                </td>
              </tr>
            ))}
            <tr className="border-t-2 border-slate-300 bg-slate-50 font-semibold">
              <td className="p-3" colSpan={2}>合計</td>
              <td className="p-3 text-right font-mono">{formatCurrency(total)}</td>
              <td className="p-3" colSpan={2} />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
