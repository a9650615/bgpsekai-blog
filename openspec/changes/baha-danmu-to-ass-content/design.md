## Context

`/baha-danmu-to-ass/` 目前僅有工具 form（`BahaDanmuTool` island）和三行使用說明。使用者需要額外上下文才能理解工具用途與操作方式。頁面結構為 `Hero → BahaDanmuTool`，內容單薄。

lib 層（`src/lib/baha-danmu/`）有完整的 README（API 限制、ASS template 來源、40 個 unit test），但這些資訊未對外呈現。CLAUDE.md 明確列該 README 為 don't-touch。

## Goals / Non-Goals

**Goals:**
- 讓工具頁面 self-contained：使用者不需要額外指引即可理解用途、操作、限制
- 加入使用教學（step-by-step）、FAQ、已知限制、更新日誌四個區塊
- 保持頁面載入速度：全部靜態 markup，不額外載入 JS
- 與現有主題 CSS token 一致（Casper tokens 已在 global.css）

**Non-Goals:**
- 不修改 `BahaDanmuTool.client.ts` 或 `src/lib/baha-danmu/` 核心邏輯
- 不做 i18n（頁面維持繁體中文）
- 不做 CMS 化（內容直接寫在 .astro，不需進 content collection）
- 不加入影片嵌入或動畫截圖（純文字 + code block 說明）

## Decisions

1. **內容放在 page 層級而非 component 內**：`BahaDanmuTool.astro` 保持為純 form island。使用教學、FAQ、changelog 放在 `baha-danmu-to-ass.astro` 頁面中，用 `.prose` + `.section-title` 呈現。理由：component 職責單一，頁面層級負責編排。

2. **移除 BahaDanmuTool.astro 內的重複 h1 和 notes section**：Hero 已顯示標題，notes 將由頁面 FAQ 取代。避免重複內容。

3. **Changelog 手動維護**：不自動從 git log 產生。以「對使用者有意義的改動」為粒度寫，一個 `<details>` 折疊區。

4. **FAQ 使用 `<details><summary>` pattern**：語義正確、無需 JS、SEO 友好。

5. **樣式複用**：使用 `.prose` class 包裹內容區（已支援 h2-h6、p、ul、code、blockquote、details）。只加少量 tool-specific 的 scoped style。

## Risks / Trade-offs

- **內容維護負擔**：Changelog 和 FAQ 需要手動更新。但工具更新頻率低（數月一次），可接受。
- **頁面長度增加**：加四個區塊後頁面會變長。以 sticky ToC 或 anchor link 緩解（non-goal for v1，但結構預留 id anchor）。
- **BahaDanmuTool h1 移除可能影響 aria**：元件有 `aria-labelledby="baha-tool-heading"`，移除 h1 需改為 `aria-label` 或 sr-only heading。
