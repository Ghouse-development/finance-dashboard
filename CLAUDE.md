# 入金管理アプリ（finance-dashboard）

## プロジェクト概要

施主からの入金（5回払い）を物件ごとに管理し、入金確認→Google Chatへの通知までを一元化するWebアプリ。
G-Forceとは独立した新規プロジェクトとして構築し、後でG-Forceに繋ぎ込む前提。

## 技術スタック

| 項目 | 内容 |
|------|------|
| フレームワーク | Next.js 16（App Router） + TypeScript |
| データベース | Supabase（未設定・今後作成） |
| スタイル | Tailwind CSS v4 |
| デプロイ | GitHub → Vercel（未設定） |
| 通知 | Google Chat Webhook（URLは後で設定） |

## ディレクトリ構成

```
src/
├── app/
│   ├── layout.tsx          # サイドバー付き共通レイアウト
│   ├── page.tsx            # ダッシュボード（/）
│   ├── master/page.tsx     # 入金予定マスター（/master）
│   ├── check/page.tsx      # 入金チェック（/check）
│   └── property/[id]/page.tsx  # 物件別詳細（/property/[id]）
└── lib/
    └── dummy-data.ts       # 型定義・ダミーデータ・ヘルパー関数
```

## 実装済み画面（Step 4完了・ダミーデータ版）

| パス | 画面名 | 状態 |
|------|--------|------|
| `/` | ダッシュボード | KPIカード4枚 + 入金状況テーブル + 物件別進捗 |
| `/master` | 入金予定マスター | フィルター + テーブル + 編集モーダル |
| `/check` | 入金チェック | 消込チェック + 差異表示 + 消込モーダル |
| `/property/[id]` | 物件別詳細 | 物件概要 + サマリー + タイムライン |

※ 現在はすべてハードコードのダミーデータで表示。保存・通知処理は未実装。

## 次のタスク（優先順）

1. Supabaseプロジェクト作成・テーブル作成（SQLは実装指示書に記載済み）
2. 環境変数設定（.env.local）
3. ダミーデータ → Supabase接続に切り替え
4. CRUD操作の実装（登録・編集・削除）
5. 入金チェックの消込ロジック実装
6. Google Chat Webhook通知の実装
7. GitHubリポジトリ作成 → Vercelデプロイ

## 後回しにする項目（今は作らない）

- 認証・ログイン機能（G-Force連携時に追加）
- 銀行IB CSVとの照合機能
- 承認フロー
- マネーフォワード連携

## 設計ドキュメント

- `入金管理_画面設計書.md` — 画面設計・データ設計・未確定事項
- `入金管理_ClaudeCode実装指示書.md` — 実装手順・SQL・ダミーデータ

## コマンド

```bash
npm run dev    # 開発サーバー起動（http://localhost:3000）
npm run build  # 本番ビルド
npx tsc --noEmit  # 型チェック
```
