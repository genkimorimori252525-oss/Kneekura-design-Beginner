# Kneekura Design Beginner

**AIがデザインを探し、比較し、選び、理由を残すための個人用研究庫**

このリポジトリは配布用UIキットではありません。趣味・研究プロジェクトで使うAIコーディングエージェントが主役。現在は開発とCIのためにGitHubで公開していますが、後日非公開にする想定です（リポジトリの公開設定は所有者が管理）。

## 3つの役割

1. **Research / 探す** — 20件の外部資料をジャンル・実装環境・コード互換性で検索（`catalog/sources.json`, `tools/catalog.mjs`）。
2. **Preview / 見比べる** — 15種類の**オリジナル**UIプロトタイプをローカルで閲覧・操作・2件比較（`gallery/`）。他社コード・画像の一括コピーはしません。
3. **Choose / AIが決める** — 目的、好み、ハード制約で候補を絞り、**AI自身が採用・仮採用・変更不要を決定**。判断理由、代替案、妥協点、目視の有無を記録（`tools/design-select.mjs`）。

数値による推薦順は**機械的な事前絞り込み**であって、AIの審美眼を偽装したものではありません。CodexなどのLLMエージェントが成果物とプロジェクトを理解して最終選択します。どのデザインも合わなければ採用しなくてかまいません。

## 最初に実行するコマンド

Node.js 20以降・依存追加なし。

```bash
# 既存の資料検索（外部コードは取り込まない）
node tools/catalog.mjs recommend ai-chat --target react-web --json
node tools/catalog.mjs search --genre motion --target react-web --code direct

# AI用のデザイン候補比較（ハード制約を尊重）
node tools/design-select.mjs validate
node tools/design-select.mjs shortlist examples/brief-agent-workspace.json --json
node tools/design-select.mjs components --genre chat --json

# 15種類のオリジナルUIの実際の見た目をローカルで比較
node tools/serve-gallery.mjs
# → http://127.0.0.1:4173/
```

## AIによる決定記録（API不要）

`shortlist` が返すのは候補であり、確定デザインではありません。**AIが**ブラウザプレビュー（閲覧できる場合）・用途・実装制約を評価して `--design` を指定します。

```bash
# 画面プレビューを見ていないとき → 仮採用と明示
node tools/design-select.mjs choose examples/brief-agent-workspace.json \
  --design graph-linear \
  --reason "Dense linear pipeline is preferable for diagnostic status inspection." \
  --tradeoff "Complex branching will need another visualization." \
  --review metadata \
  --out decisions/agent-graph-review.json

# 記録された判断が元の要件や制約と一致するか確認
node tools/design-select.mjs verify decisions/agent-graph-review.json
```

PowerShellでは複数行の `\` を使わず、1行で実行してください。ブラウザ画面を**実際に観察できた場合だけ** `--review preview --evidence "観察した具体的事実"` を使えます。プレビューが見られない環境では無理に最終確定せず、`PROVISIONAL_SELECTION` として残します。

既存UIが十分なら `--no-change` で `NO_CHANGE_NEEDED` を記録できます。第三者のソースコード互換性と「見た目だけ参考にできるか」は別判定です。

## AIが読むファイル

- `AGENTS.md` — 選択手順・プロジェクト優先・過剰修正防止
- `docs/SELECTION_ENGINE.md` — 選択エンジンの保証範囲とCLI仕様
- `docs/AI_WORKFLOW.md` — 既存アプリの調査 → AI選択 → 最小実装 → 検証
- `catalog/design-patterns.json` — オリジナル15案の特性・長所・弱点・試作品の色
- `catalog/component-needs.json` — 12種類のUI部品の機能要件と候補
- `catalog/genres.json`、`catalog/targets.json`、`catalog/compatibility.json` — 14ジャンル、8実行環境、外部ソースの160組の互換性評価
- `catalog/use-cases.json` — 9つの目的別指針
- `gallery/` — オフラインの原作コードによるプレビュー。CDN・ログイン・API不要

## 実装・検証

```bash
node tools/catalog.mjs validate
node tools/catalog.mjs self-test
node tools/design-select.mjs validate
node tools/design-select.mjs self-test
node tools/gallery-smoke.mjs
```

**重要な区別**：`gallery/` は見た目・操作感を比較するための**ブラウザ試作品**です。ReactやForge、JavaFX、Androidでそのまま動く配布コンポーネントではありません。実アプリの表示、操作、アクセシビリティ、性能を確認したという意味でもありません。

リポジトリの収集数を増やすことより、「AIが適切なデザインを採用するか、採用しないか判断できること」を最優先します。
