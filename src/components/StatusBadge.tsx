export type BillStatus = "confirmed" | "pending" | "diff";

const config: Record<BillStatus, { label: string; className: string }> = {
  confirmed: { label: "照合済み", className: "bg-green-100 text-green-800" },
  pending:   { label: "確認待ち", className: "bg-yellow-100 text-yellow-800" },
  diff:      { label: "差異あり", className: "bg-red-100 text-red-800" },
};

export default function StatusBadge({ status }: { status: BillStatus }) {
  const { label, className } = config[status];
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
