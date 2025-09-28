# SUSHIGETA

プレゼント交換アプリ - 参加者を任意のグループに分けて、ランダムに交換相手を決定するWebアプリケーション

## 機能

- 参加者の管理（追加・削除・重複チェック）
- ドラッグ&ドロップによるグループ分け
- 自動交換ペア生成（禁則条件対応）
- 多言語対応（日本語・英語）
- レスポンシブデザイン

## 技術スタック

### フロントエンド
- **Vue 3** - Progressive JavaScript Framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool
- **Vuetify** - Vue UI Library
- **Vue I18n** - Internationalization

### 開発・テスト
- **Vitest** - Unit testing framework
- **@vue/test-utils** - Vue component testing utilities
- **@testing-library/vue** - Simple and complete testing utilities
- **Playwright** - End-to-end testing
- **Storybook** - Component documentation and testing

### コード品質
- **ESLint** - Linting tool
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **lint-staged** - Pre-commit linting

## 開発環境のセットアップ

### 必要なソフトウェア
- Node.js 18+ 
- npm または yarn

### インストール

```bash
# 依存関係をインストール
npm install

# Huskyを初期化（初回のみ）
npm run prepare

# Playwrightブラウザをインストール（初回のみ）
npx playwright install
```

### 開発サーバー起動

```bash
npm run dev
```

## 利用可能なスクリプト

### 開発
- `npm run dev` - 開発サーバー起動
- `npm run build` - プロダクションビルド
- `npm run preview` - ビルド結果のプレビュー

### テスト
- `npm run test` - 単体テスト実行
- `npm run test:watch` - テスト監視モード
- `npm run test:coverage` - カバレッジ付きテスト
- `npm run test:e2e` - E2Eテスト実行

### コード品質
- `npm run lint` - ESLint実行（自動修正あり）
- `npm run format` - Prettier実行
- `npm run type-check` - TypeScript型チェック

### Storybook
- `npm run storybook` - Storybook開発サーバー起動
- `npm run build-storybook` - Storybookビルド

## プロジェクト構造

```
src/
├── components/          # 再利用可能なコンポーネント
├── test/               # テスト関連ファイル
└── main.ts             # アプリケーションエントリーポイント

tests/
└── e2e/                # E2Eテスト

.storybook/             # Storybook設定
```

## 貢献

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。
