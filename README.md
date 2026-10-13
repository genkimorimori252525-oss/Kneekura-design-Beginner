# Kneekura Design Beginner

**Private-use oriented, AI-first design research for Kneekura projects.**

にーくらの各開発プロジェクトで、**AIが適切なUIデザインを探し、技術的に適用できるか判断する**ための個人用デザイン研究リポジトリ。

> 現在のGitHubリポジトリは公開設定だが、配布用プロジェクトではない。設計とCIが落ち着いたら非公開にする予定。公開・非公開の切り替えは所有者が判断する。ソースコードや有料素材を外部サイトからまとめて転載する用途にはしない。

## AIが使うための4つの索引

- **目的別**：AIチャット、管理画面、研究ツール、Minecraft GUI、Android UIなど9用途（`catalog/use-cases.json`）。
- **ジャンル別**：チャット、フォーム、ナビゲーション、アニメーション、ノードグラフなど14ジャンル（`catalog/genres.json`）。
- **実装環境別**：React／HTML／Vue／JavaFX／Android Compose／Android Views／Minecraft Forge／Fabric（`catalog/targets.json`）。
- **互換性別**：コードを使えるか（`direct / adapt / incompatible / unverified / tool-only`）と、見た目を参考にできるか（`high / medium / low / none`）を**別々に**判定（`catalog/compatibility.json`）。

コードが非互換でも、レイアウトや配色の参考になるケースは多い。一方、ReactコンポーネントをJavaFXやForgeへ直接移植できると誤判定してはいけない。

## Codexなどのエージェント向けクイックスタート

追加パッケージ不要。Node.js 20以降。

```bash
node tools/catalog.mjs validate
node tools/catalog.mjs self-test
node tools/catalog.mjs recommend ai-chat --target react-web --json
node tools/catalog.mjs recommend minecraft-gui --target minecraft-forge-gui
node tools/catalog.mjs search --genre motion --target react-web --code direct
node tools/catalog.mjs search --target javafx-desktop --code incompatible
node tools/catalog.mjs search chat --json
```

**最重要**：`AGENTS.md`、`docs/AI_WORKFLOW.md`、`catalog/targets.json` を読む。実装する前に利用先のコードを確認し、**無理に修正点を探さない**。既存UIが目的を満たしていれば「変更不要」を正解とする。

## 登録例

| ライブラリ | 主に対応する環境 | AIにとっての役割 |
| --- | --- | --- |
| [shadcn/ui](https://github.com/shadcn-ui/ui) | React Web | UI基盤・フォーム |
| [Tween UI](https://github.com/StaticMania/tween-ui) | React Web | アニメーション |
| [Toggle Supply](https://github.com/jaretpeerson/toggleSupply) | HTML/CSS/JS、Reactへ適応 | 軽量演出 |
| [AtlantaFX](https://github.com/mkpaz/atlantafx) | JavaFX | デスクトップテーマ |
| [AndroidX Compose](https://github.com/androidx/androidx) | Android Compose | AndroidネイティブUI |
| [Material Components Android](https://github.com/material-components/material-components-android) | Android Views | 既存View画面（2026年時点で保守モード） |
| [LibGui](https://github.com/CottonMC/LibGui) | Minecraft Fabric | GUIの参考、Forgeには直接非対応 |

元画像のMorphin、Viora UI、Tween UI、ScrollX UI、Toggle Supply、DesignPassも登録済み。詳しくは `catalog/sources.json`。

## フォルダ

- `catalog/` — 20件のソース、ジャンル、ターゲット、技術互換性、用途別選択肢
- `tools/catalog.mjs` — AIが実行できる検索・目的別推薦・整合性検証
- `AGENTS.md` — AIの判断ルール
- `docs/AI_WORKFLOW.md` — AIが既存プロジェクトへデザインを導入する判断順序
- `docs/ARCHITECTURE.md` — 個人研究用の内部アーキテクチャ
- `docs/SOURCE_POLICY.md` — 出典と権利、公開設定と個人利用の区別
- `docs/ROADMAP.md` — 研究機能の今後
- `examples/` — 実際の検討方法（他社コードのコピーではない）

**本リポジトリはUI製品、再配布用パッケージ、デザイン販売サイトではない。** カタログ内の`reference-only`は「この公開リポジトリへ他社コードを保存しない」という方針であり、各自の許諾された個人利用を一律に否定するものではない。
