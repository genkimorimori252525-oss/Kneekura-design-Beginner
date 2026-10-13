# Example: researching an AI chat screen

Goal: a stable, readable chat page for AI collaboration, with keyboard support and concise status feedback.

1. Run `node tools/catalog.mjs search chat`.
2. Evaluate shadcn/ui and Radix as **foundations**; Morphin as **reference** for chat-specific styling.
3. Check whether the target is React or JavaFX before choosing implementation.
4. Examine the existing layout; only modify proven usability shortcomings.
5. If a prototype is warranted, try one component **in an isolated branch**, test sending/scroll/focus/error states and reduced motion, and compare costs before merging.
6. Record evidence and upstream license notices. Do not copy Morphin Registry code into this catalog.
