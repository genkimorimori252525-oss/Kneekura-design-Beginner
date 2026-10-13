# AI chat design selection — example only

Goal: a clear, stable conversation interface. Evaluate compatibility **before** suggesting code.

- React web app: `node tools/catalog.mjs recommend ai-chat --target react-web --json`. shadcn/ui may fit technically, Morphin could inspire chat-specific UI, but each actual component's source/terms must be checked.
- Native JavaFX app: `node tools/catalog.mjs recommend ai-chat --target javafx-desktop --json`. A React source is `incompatible` as importable code even when `visual=medium/high`. Use JavaFX-native controls/theme instead.
- Minecraft Forge 1.20.1 screen: `node tools/catalog.mjs recommend minecraft-gui --target minecraft-forge-gui --json`. Fabric LibGui code is not a drop-in Forge dependency; treat its layouts as visual references only.

In every case, first inspect the existing UI. If it already meets the functional goal, the correct design decision can be `NO_CHANGE_NEEDED`.
