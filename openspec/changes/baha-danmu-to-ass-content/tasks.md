## 1. 元件清理

- [x] 1.1 移除 `BahaDanmuTool.astro` 內的 `<h1>` 元素，改 `<section>` 為 `aria-label="巴哈彈幕轉 ASS 工具"`
- [x] 1.2 移除 `BahaDanmuTool.astro` 內的 `<section class="baha-danmu-tool__notes">` 區塊及對應 scoped CSS
- [x] 1.3 確認 `npx astro check` 0 errors

## 2. 頁面結構重組

- [x] 2.1 在 `baha-danmu-to-ass.astro` 的 Hero 與 BahaDanmuTool 之間加入簡介段落（1-2 段，`.prose` 包裹）
- [x] 2.2 在 BahaDanmuTool 之後加入使用教學區（`<section id="tutorial">`、`<h2 class="section-title">`、步驟列表）
- [x] 2.3 加入 FAQ 區（`<section id="faq">`），每項用 `<details><summary>` pattern，至少 5 題
- [x] 2.4 加入已知限制區（`<section id="limitations">`），列出 4 項技術限制
- [x] 2.5 加入更新日誌區（`<section id="changelog">`），用 `<details>` 折疊，初始 3 筆記錄

## 3. 驗證

- [x] 3.1 `npx astro check` 0 errors
- [x] 3.2 `npx astro build` 成功，170+ pages
- [x] 3.3 Dev server 開啟 `/baha-danmu-to-ass/` 確認 7 個區塊順序正確
- [x] 3.4 確認 dark mode 下所有新增區塊顏色正確（走 CSS token）
- [x] 3.5 確認 BahaDanmuTool form 功能不受影響（輸入 SN、取得、下載仍可操作）
