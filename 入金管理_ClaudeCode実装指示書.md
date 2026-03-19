# 入金管理アプリ｜ClaudeCode 実装指示書
作成日：2026/03/17

---

## このアプリについて

施主からの入金（5回払い）を物件ごとに管理し、入金確認→Google Chatへの通知までを一元化するWebアプリ。
G-Forceとは独立した新規プロジェクトとして構築し、後でG-Forceに繋ぎ込む前提。

---

## 技術スタック

| 項目 | 内容 |
|------|------|
| フレームワーク | Next.js 14（App Router） + TypeScript |
| データベース | Supabase（新規プロジェクト・独立） |
| スタイル | Tailwind CSS |
| デプロイ | GitHub → Vercel |
| 通知 | Google Chat Webhook（URLは後で設定） |

---

## 実装の順番（この順番で進めること）

### Step 1：プロジェクト作成
```bash
npx create-next-app@latest nyukin-kanri --typescript --tailwind --app --src-dir
```

### Step 2：Supabase のテーブルを作成

以下の SQL を Supabase の SQL Editor で実行する。

```sql
-- 物件マスター（暫定。後でG-Forceの物件テーブルに置き換える）
create table properties (
  id uuid primary key default gen_random_uuid(),
  contract_number text not null unique,   -- 契約番号（例：GF-2025-001）
  property_name text not null,            -- 物件名（例：山田邸（堺市））
  owner_name text not null,               -- 施主名
  contract_amount integer not null,       -- 契約金額（税込・円）
  start_date date,                        -- 着工日
  delivery_date date,                     -- 引渡予定日
  created_at timestamptz default now()
);

-- 入金予定マスター
create table payment_schedules (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  round integer not null,                 -- 入金回次（1〜5）
  category text not null,                 -- 申込金／契約金／着工金／中間金／引渡金
  scheduled_date date not null,           -- 入金予定日
  scheduled_amount integer not null,      -- 入金予定額（税込・円）
  notes text,                             -- 備考
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 入金実績（消込）
create table payment_records (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid references payment_schedules(id) on delete cascade,
  actual_date date,                       -- 実入金日
  actual_amount integer,                  -- 実入金額（税込・円）
  checked_at timestamptz,                 -- 消込日時
  notified boolean default false,         -- Google Chat通知済みフラグ
  notes text,                             -- 備考
  created_at timestamptz default now()
);
```

### Step 3：環境変数を設定（`.env.local`）

```
NEXT_PUBLIC_SUPABASE_URL=＜SupabaseのプロジェクトURL＞
NEXT_PUBLIC_SUPABASE_ANON_KEY=＜SupabaseのAnonキー＞
GOOGLE_CHAT_WEBHOOK_URL=＜後で設定・今は空欄でOK＞
```

### Step 4：画面を実装する（この順番で）

#### 4-1. レイアウト・ナビゲーション
- 左サイドバー or 上部タブで以下4画面に遷移できるナビを作る
  - ダッシュボード（`/`）
  - 入金予定マスター（`/master`）
  - 入金チェック（`/check`）
  - 物件別詳細（`/property/[id]`）

#### 4-2. ダッシュボード（`/`）
- KPIカード4枚（今月の入金予定合計・入金済み・未入金・来月以降）
- テーブル：直近の入金状況（物件名・入金区分・予定日・金額・状態バッジ）
- テーブル：物件別入金進捗（物件名・契約金額・入金済み・プログレスバー）
- 状態バッジ：「入金済」（緑）「未入金」（黄）「予定」（青）

#### 4-3. 入金予定マスター（`/master`）
- フィルター：対象月・物件名
- テーブル：契約番号・物件名・施主名・入金区分・予定日・予定額・入金割合・備考
- 新規登録ボタン → モーダルで1件追加
- 行クリック → 編集モーダル
- 入金割合は「予定額 ÷ 契約金額 × 100」で自動計算して表示

#### 4-4. 入金チェック（`/check`）
- フィルター：対象月
- テーブル：消込チェックボックス・物件名・施主名・入金区分・予定日・予定額・実入金日・実入金額・差異・通知状態
- チェックボックスをONにしたとき：
  1. 実入金日・実入金額の入力を促すモーダルを表示
  2. 保存すると `payment_records` に登録
  3. `notified` を `true` に更新
  4. Google Chat Webhook に通知送信（WEBHOOK_URLが空の場合はスキップしてコンソールログに出す）
- 差異 = 予定額 − 実入金額。±0以外は赤または黄で表示

#### 4-5. 物件別詳細（`/property/[id]`）
- 上部：物件概要カード（物件名・施主名・契約番号・契約金額・着工日・引渡予定日）
- 中段：入金サマリーカード（入金済み合計・残り・入金回数・消化率）
- 下部：タイムライン（第1回〜第5回を縦に並べ、状態バッジ付きで表示）

---

## ダミーデータ（開発中の表示確認用）

Supabase に以下のダミーデータを INSERT して動作確認すること。
（実データは絶対に使わないこと）

```sql
insert into properties (contract_number, property_name, owner_name, contract_amount, start_date, delivery_date)
values
  ('GF-2025-001', 'ダミー山田邸（堺市）', 'ダミー山田 太郎', 32508080, '2025-12-01', '2026-06-30'),
  ('GF-2025-002', 'ダミー田中邸（奈良市）', 'ダミー田中 花子', 28000000, '2025-10-15', '2026-04-30'),
  ('GF-2025-003', 'ダミー鈴木邸（豊中市）', 'ダミー鈴木 一郎', 30500000, '2026-01-10', '2026-07-31');
```

---

## 後回しにしてよい項目（今は作らない）

- 認証・ログイン機能（後でG-Force連携時に追加）
- 銀行IB CSVとの照合機能（財務チーム確認後に追加）
- 承認フロー（財務チーム確認後に追加）
- マネーフォワード連携（後フェーズ）

---

## 完成後のデプロイ手順

1. GitHubに新規リポジトリを作成（例：`nyukin-kanri`）
2. コードをプッシュ
3. Vercelでリポジトリを連携・環境変数を設定してデプロイ
4. 動作確認後、上席Bに共有してレビューを依頼

---

## G-Force への繋ぎ込み時にやること（将来）

- `properties` テーブルの参照先をG-Forceの物件テーブルに切り替える
- 担当営業・施主名などをG-Forceから自動取得するよう更新
- G-ForceのナビゲーションにURLリンクとして追加（または統合）
- Supabaseのテーブルをg-forceの本番DBに移行（上席Bと共同作業）
