## Why

`/baha-danmu-to-ass/` 頁面目前只有工具 form（輸入 SN → 下載 ASS），加上三行使用說明。對第一次來的使用者來說，缺乏足夠的上下文：不知道「彈幕轉 ASS」是什麼、為什麼需要、怎麼用在播放器上、遇到問題怎麼辦。加入結構化內容讓頁面 self-contained，降低站長被問「怎麼用」的頻率。

## What Changes

- 在工具 form 上方加入**使用教學區**：步驟圖文說明（貼 URL → 下載 ASS → 掛到 PotPlayer/mpv）
- 將現有三行說明擴充為**常見問題 FAQ 區**：corsproxy 故障、空陣列、時間差用途、支援哪些播放器
- 在頁面底部加入**已知限制區**：API 登入限制、corsproxy 依賴、彈幕格式演變
- 在頁面底部加入**更新日誌 (Changelog) 區**：記錄工具歷次修改（從 lib README 已有的 40 test 歷史推導）
- 頁面整體結構改為：Hero → 簡介 → 工具 Form → 使用教學 → FAQ → 已知限制 → 更新日誌

## Capabilities

### New Capabilities
- `baha-tool-content`: 工具頁面的結構化內容區塊（使用教學、FAQ、已知限制、更新日誌），以 Astro 靜態 markup 實作，不影響工具 island 的 client-side 行為

### Modified Capabilities

## Impact

- `src/pages/baha-danmu-to-ass.astro` — 頁面結構重組，form 前後加內容區
- `src/components/BahaDanmuTool.astro` — 可能微調：移除元件內的重複說明（h1 + 三行 notes），改由頁面層級提供
- `src/styles/global.css` — 可能新增少量 prose/section 樣式（大部分可複用現有 `.prose` + `.section-title`）
- 不影響 `src/lib/baha-danmu/` 核心邏輯（CLAUDE.md 列為 don't-touch）
- 不影響 `BahaDanmuTool.client.ts` 行為
