// 型定義
export type Property = {
  id: string;
  contract_number: string;
  property_name: string;
  owner_name: string;
  contract_amount: number;
  start_date: string;
  delivery_date: string;
};

export type PaymentSchedule = {
  id: string;
  property_id: string;
  round: number;
  category: string;
  scheduled_date: string;
  scheduled_amount: number;
  notes: string;
};

export type PaymentRecord = {
  id: string;
  schedule_id: string;
  actual_date: string | null;
  actual_amount: number | null;
  checked_at: string | null;
  notified: boolean;
  notes: string;
};

// ダミーデータ
export const properties: Property[] = [
  {
    id: "p1",
    contract_number: "GF-2025-001",
    property_name: "ダミー山田邸（堺市）",
    owner_name: "ダミー山田 太郎",
    contract_amount: 32508080,
    start_date: "2025-12-01",
    delivery_date: "2026-06-30",
  },
  {
    id: "p2",
    contract_number: "GF-2025-002",
    property_name: "ダミー田中邸（奈良市）",
    owner_name: "ダミー田中 花子",
    contract_amount: 28000000,
    start_date: "2025-10-15",
    delivery_date: "2026-04-30",
  },
  {
    id: "p3",
    contract_number: "GF-2025-003",
    property_name: "ダミー鈴木邸（豊中市）",
    owner_name: "ダミー鈴木 一郎",
    contract_amount: 30500000,
    start_date: "2026-01-10",
    delivery_date: "2026-07-31",
  },
];

const categories = ["申込金", "契約金", "着工金", "中間金", "引渡金"];

export const paymentSchedules: PaymentSchedule[] = [
  // 山田邸
  { id: "s1", property_id: "p1", round: 1, category: "申込金", scheduled_date: "2025-11-01", scheduled_amount: 1000000, notes: "" },
  { id: "s2", property_id: "p1", round: 2, category: "契約金", scheduled_date: "2025-11-15", scheduled_amount: 5501616, notes: "" },
  { id: "s3", property_id: "p1", round: 3, category: "着工金", scheduled_date: "2025-12-01", scheduled_amount: 10002020, notes: "" },
  { id: "s4", property_id: "p1", round: 4, category: "中間金", scheduled_date: "2026-03-15", scheduled_amount: 10002020, notes: "" },
  { id: "s5", property_id: "p1", round: 5, category: "引渡金", scheduled_date: "2026-06-30", scheduled_amount: 6002424, notes: "" },
  // 田中邸
  { id: "s6", property_id: "p2", round: 1, category: "申込金", scheduled_date: "2025-09-15", scheduled_amount: 1000000, notes: "" },
  { id: "s7", property_id: "p2", round: 2, category: "契約金", scheduled_date: "2025-10-01", scheduled_amount: 4600000, notes: "" },
  { id: "s8", property_id: "p2", round: 3, category: "着工金", scheduled_date: "2025-10-15", scheduled_amount: 8400000, notes: "" },
  { id: "s9", property_id: "p2", round: 4, category: "中間金", scheduled_date: "2026-02-15", scheduled_amount: 8400000, notes: "" },
  { id: "s10", property_id: "p2", round: 5, category: "引渡金", scheduled_date: "2026-04-30", scheduled_amount: 5600000, notes: "" },
  // 鈴木邸
  { id: "s11", property_id: "p3", round: 1, category: "申込金", scheduled_date: "2025-12-10", scheduled_amount: 1000000, notes: "" },
  { id: "s12", property_id: "p3", round: 2, category: "契約金", scheduled_date: "2026-01-01", scheduled_amount: 5100000, notes: "" },
  { id: "s13", property_id: "p3", round: 3, category: "着工金", scheduled_date: "2026-01-10", scheduled_amount: 9150000, notes: "" },
  { id: "s14", property_id: "p3", round: 4, category: "中間金", scheduled_date: "2026-04-15", scheduled_amount: 9150000, notes: "" },
  { id: "s15", property_id: "p3", round: 5, category: "引渡金", scheduled_date: "2026-07-31", scheduled_amount: 6100000, notes: "" },
];

export const paymentRecords: PaymentRecord[] = [
  // 山田邸：1〜3回目は入金済み
  { id: "r1", schedule_id: "s1", actual_date: "2025-10-30", actual_amount: 1000000, checked_at: "2025-10-30T10:00:00Z", notified: true, notes: "" },
  { id: "r2", schedule_id: "s2", actual_date: "2025-11-14", actual_amount: 5501616, checked_at: "2025-11-14T10:00:00Z", notified: true, notes: "" },
  { id: "r3", schedule_id: "s3", actual_date: "2025-12-01", actual_amount: 10002020, checked_at: "2025-12-01T10:00:00Z", notified: true, notes: "" },
  // 田中邸：1〜4回目は入金済み
  { id: "r4", schedule_id: "s6", actual_date: "2025-09-14", actual_amount: 1000000, checked_at: "2025-09-14T10:00:00Z", notified: true, notes: "" },
  { id: "r5", schedule_id: "s7", actual_date: "2025-10-01", actual_amount: 4600000, checked_at: "2025-10-01T10:00:00Z", notified: true, notes: "" },
  { id: "r6", schedule_id: "s8", actual_date: "2025-10-15", actual_amount: 8400000, checked_at: "2025-10-15T10:00:00Z", notified: true, notes: "" },
  { id: "r7", schedule_id: "s9", actual_date: "2026-02-16", actual_amount: 8350000, checked_at: "2026-02-16T10:00:00Z", notified: true, notes: "50,000円不足" },
  // 鈴木邸：1〜2回目は入金済み
  { id: "r8", schedule_id: "s11", actual_date: "2025-12-09", actual_amount: 1000000, checked_at: "2025-12-09T10:00:00Z", notified: true, notes: "" },
  { id: "r9", schedule_id: "s12", actual_date: "2026-01-02", actual_amount: 5100000, checked_at: "2026-01-02T10:00:00Z", notified: true, notes: "" },
];

// ヘルパー関数
export function getProperty(id: string): Property | undefined {
  return properties.find((p) => p.id === id);
}

export function getSchedulesForProperty(propertyId: string): PaymentSchedule[] {
  return paymentSchedules.filter((s) => s.property_id === propertyId);
}

export function getRecordForSchedule(scheduleId: string): PaymentRecord | undefined {
  return paymentRecords.find((r) => r.schedule_id === scheduleId);
}

export function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString()}`;
}

export function getStatus(schedule: PaymentSchedule): "入金済" | "未入金" | "予定" {
  const record = getRecordForSchedule(schedule.id);
  if (record?.actual_amount != null) return "入金済";
  const today = new Date();
  const scheduledDate = new Date(schedule.scheduled_date);
  if (scheduledDate <= today) return "未入金";
  return "予定";
}

export function getStatusColor(status: "入金済" | "未入金" | "予定"): string {
  switch (status) {
    case "入金済": return "bg-green-100 text-green-800";
    case "未入金": return "bg-yellow-100 text-yellow-800";
    case "予定": return "bg-blue-100 text-blue-800";
  }
}

export function getPaidAmount(propertyId: string): number {
  const schedules = getSchedulesForProperty(propertyId);
  return schedules.reduce((sum, s) => {
    const record = getRecordForSchedule(s.id);
    return sum + (record?.actual_amount ?? 0);
  }, 0);
}
