## ADDED Requirements

### Requirement: Page Structure
`/baha-danmu-to-ass/` 頁面 SHALL 按以下順序排列區塊：
1. Hero（站名 + 工具描述，`showCta={false}`）
2. 簡介段落（1-2 段說明工具用途與目標使用者）
3. BahaDanmuTool form island（現有元件）
4. 使用教學（step-by-step）
5. 常見問題 FAQ
6. 已知限制
7. 更新日誌（Changelog）

#### Scenario: 頁面載入
- **WHEN** 使用者造訪 `/baha-danmu-to-ass/`
- **THEN** 頁面依序顯示上述 7 個區塊，每個區塊有 `<h2>` 標題，id anchor 可直連

---

### Requirement: 使用教學區
頁面 SHALL 包含使用教學區（`<section id="tutorial">`），以數字步驟說明完整操作流程。

#### Scenario: 教學內容
- **WHEN** 使用者閱讀使用教學區
- **THEN** 教學 SHALL 涵蓋：(1) 取得巴哈動漫瘋影片 URL 或 SN；(2) 貼入輸入框按「取得」；(3) 等待下載完成；(4) 將 ASS 掛到 PotPlayer 或 mpv 播放

#### Scenario: PotPlayer 掛字幕說明
- **WHEN** 教學描述掛字幕步驟
- **THEN** SHALL 說明「開啟影片 → 右鍵 → 字幕 → 載入第二字幕 → 選 ASS 檔」

#### Scenario: mpv 掛字幕說明
- **WHEN** 教學描述 mpv 掛字幕
- **THEN** SHALL 說明 `mpv --sub-file=danmu.ass video.mp4` 指令

---

### Requirement: FAQ 區
頁面 SHALL 包含 FAQ 區（`<section id="faq">`），每個 FAQ 項目用 `<details><summary>` 呈現。

#### Scenario: FAQ 項目列表
- **WHEN** 使用者閱讀 FAQ
- **THEN** SHALL 至少包含以下問題：
  1. 按「取得」後沒反應 / 出錯怎麼辦？
  2. 下載的 ASS 是空的（0 條彈幕）？
  3. 「時間差」欄位怎麼用？
  4. 支援哪些播放器？
  5. corsproxy.io 是什麼？安全嗎？

---

### Requirement: 已知限制區
頁面 SHALL 包含已知限制區（`<section id="limitations">`），列出工具的技術限制。

#### Scenario: 限制內容
- **WHEN** 使用者閱讀已知限制
- **THEN** SHALL 說明：
  1. 需透過 corsproxy.io 中繼（直接 fetch 被 CORS 擋）
  2. 巴哈 API 對未登入使用者可能限制彈幕數量
  3. ASS 格式僅支援滾動式彈幕（無定位彈幕）
  4. 彈幕時間戳精度為秒級

---

### Requirement: 更新日誌區
頁面 SHALL 包含更新日誌區（`<section id="changelog">`），用 `<details>` 折疊。

#### Scenario: Changelog 格式
- **WHEN** 使用者展開更新日誌
- **THEN** SHALL 以日期倒序列出改動項目，格式為 `YYYY-MM-DD: 改動描述`

#### Scenario: 初始 Changelog 內容
- **WHEN** 此 change 實作完成
- **THEN** Changelog SHALL 至少包含：工具首次上線日期、遷移到 Astro 日期、本次內容擴充日期

---

### Requirement: BahaDanmuTool 元件清理
`BahaDanmuTool.astro` SHALL 移除內部的 `<h1>` 和 `<section class="baha-danmu-tool__notes">` 區塊，因為標題由 Hero 提供、notes 由頁面 FAQ 取代。

#### Scenario: 元件不再重複標題
- **WHEN** BahaDanmuTool 渲染
- **THEN** 不 SHALL 輸出 `<h1>` 元素

#### Scenario: aria-labelledby 替代
- **WHEN** `<h1>` 移除後
- **THEN** `<section class="baha-danmu-tool">` SHALL 改用 `aria-label="巴哈彈幕轉 ASS 工具"` 取代 `aria-labelledby`

---

### Requirement: 樣式一致性
所有新增內容區 SHALL 包裹在 `.prose` class 容器內，使用全域 CSS token（`--titles-color`、`--primary-foreground-color`、`--link-color` 等），不新增 hardcoded 顏色。

#### Scenario: Dark mode
- **WHEN** `data-theme="dark"` 時
- **THEN** 所有新增內容 SHALL 自動套用 dark token，無額外 override
