# Kneekura Design Beginner

**AI-readable design research catalog · not a dump of third-party UI source code.**

にーくらのWeb・AIアプリ・JavaFX研究ツールなどに使えるデザイン資料を、**出典・用途・技術スタック・ライセンス**とともに整理するリポジトリ。

## 方針

- **目的優先**：UIを派手にするためだけに正常な画面を作り直さない。
- **カタログと実装の分離**：外部の作品は原則リンクで記録。実装コードを再配布する前に個別の権利を確認する。
- **AIが探しやすい**：JSONカタログ＋用途別ガイド＋軽量なCLIで、Codexなどが必要な候補に到達できる。
- **Web以外も対象**：Reactに限定せず、JavaFX・ネイティブUI・アイコン・デザイントークンまで研究する。
- **必要最小限の導入**：依存関係、操作性、性能、アクセシビリティ、既存動作への影響を必ず確認する。

## クイックスタート（Node.js 20以降・追加パッケージ不要）

```bash
node tools/catalog.mjs validate
node tools/catalog.mjs list
node tools/catalog.mjs search chat
node tools/catalog.mjs search --tag animation
node tools/catalog.mjs search --stack javafx
node tools/catalog.mjs search --license restricted --json
node tools/catalog.mjs self-test
```

## まず見たいソース

| 用途 | リポジトリ / サイト | 備考 |
| --- | --- | --- |
| 基本UI・配布方式 | [shadcn/ui](https://github.com/shadcn-ui/ui) | Registry設計を参考に |
| アニメーション | [Tween UI](https://github.com/StaticMania/tween-ui) | GSAPを必要な箇所に限定 |
| UI全般 | [ScrollX UI](https://github.com/Adityakishore0/ScrollX-UI) | **再配布制限あり・参照専用** |
| AIチャット参考 | [Morphin](https://morphin.dev/) | 公開RegistryにはLICENSEなし |
| Web演出 | [Magic UI](https://github.com/magicuidesign/magicui) | オープンソース部分と有料部分を区別 |
| JavaFX | [AtlantaFX](https://github.com/mkpaz/atlantafx) | ネイティブテーマ |
| デザイントークン | [DTCG](https://github.com/design-tokens/community-group) | 仕様の参考 |

上記以外にViora UI、Toggle Supply、DesignPass、React Bits、Radix、Lucide、Motion Primitives、Storybook、21st.devも登録済み。詳細は `catalog/sources.json`。

## 構成

- `catalog/sources.json` — 出典、技術、ジャンル、利用条件、採用方法を収録した機械可読カタログ
- `catalog/use-cases.json` — チャット、管理画面、AI部署、JavaFXなど目的別の選択ガイド
- `tools/catalog.mjs` — 検索・検証コマンド（ネットワーク不要）
- `AGENTS.md` — Codexや他のコーディングAIが守る短い作業ルール
- `docs/ARCHITECTURE.md` — 将来のプレビューと独自Registryまでの設計
- `docs/SOURCE_POLICY.md` — ライセンスと出典の扱い
- `docs/ROADMAP.md` — 段階的な開発方針

## Codexに渡す例

> このリポジトリのAGENTS.mdとcatalog/use-cases.jsonを読み、AIチャット画面に合うデザイン候補を比較して。導入前に対象プロジェクトの技術、権利、既存UI、性能を確認し、変更の必要がなければ修正不要と結論してよい。

**注意**：このリポジトリは第三者のコンポーネントを再配布していない。カタログ内の外部リンク先のライセンスを本リポジトリ全体のライセンスと解釈しないこと。
