# CLAUDE.md

寫給未來 session 進來幫忙這個 repo 的 Claude / AI assistant。先讀
`README.md` 拿到 repo 大綱與寫文流程,本檔聚焦在「**容易踩雷**」
「**reserved 字段**」「**scope 規則**」這類非顯而易見的知識。
不重複 README 的內容。

---

## Section 1 — Source of truth(改動的優先順序)

| 來源 | 角色 | 是否該手改? |
| --- | --- | --- |
| `import-cache/*.json`     | Ghost API **凍結快照** | **不要手改**。要更新請重跑 `scripts/ghost-export.ts`(且要 Ghost 站還活著)。 |
| `src/content/posts/*.md`  | 站台真正讀取的 source | **可以手改**(寫文 / 修錯字 / 改排版)。 |
| `src/data/tags.json`      | tag 清單 | 可以手改(新增 tag、改 description)。 |
| `src/assets/`             | 圖片本體 | 通常透過 `asset-mirror.ts` 產生,但手放也可以。 |

衝突原則:**手動 markdown 永遠贏**。`import-cache` 是凍結快照,
僅供日後重跑 transform 時參考;不會主動覆蓋手改。

但 — `scripts/transform.ts` **若被重跑**會 regenerate
`src/content/posts/*.md`,期間的手動修改會被覆蓋。所以:

- 平常寫文 / 修文:**直接改 markdown**,不要碰 scripts。
- 要連 Ghost API 重 import 整個內容:必須清楚意識到「會覆蓋」,
  事先 commit 手改、之後 review diff、必要時 cherry-pick 回來。
- Ghost 站關閉之後(§12 cutover 之後):`import-cache` 變成
  歷史檔案,完全沒理由再重跑 ghost-export。

---

## Section 2 — Astro 5 quirks(**重要重要,踩過好幾次的雷**)

### 2.1 Content collection 的 `slug` 是 reserved field

`type: 'content'` collection 會把 frontmatter 裡的 `slug` 欄位
**從 data 砍掉**再餵給 Zod 驗證。這意味著:

- `src/content/config.ts` 的 schema **不能**寫 `slug: z.string()` —
  Zod 看不到那個欄位,會要求 missing required,build fail。
- 路由內**不要**用 `entry.data.slug`(它會是 `undefined`),要用
  `entry.slug`(Astro 自動從 frontmatter `slug` 或檔名取得)。
- 但仍然可以(也應該)在 frontmatter 寫 `slug:`,Astro 會把它當作
  URL slug override(讓 hex slug 等檔名搬不過來的字串繼續當 URL)。

```yaml
---
title: "..."
slug: e4-b8-80-e6-ae-b5-...   # OK — Astro 用這個當 URL,不會丟給 Zod
pubDate: 2017-01-01
# slug 不能宣告在 schema,也不能在 route 裡 entry.data.slug
---
```

### 2.2 檔名不能以 `-` 開頭

Astro 5 的 glob loader 對 leading-dash 檔名做 schema 驗證會直接爆
(內部誤判為 CLI flag 或 fragment)。本 repo 有 7 個 hex 中文 slug
post **檔名**已被 rename 去掉 leading dash,例如:

- 檔名:`e4-b8-80-e6-ae-b5-...md`(無 leading dash)
- frontmatter:`slug: -e4-b8-80-e6-ae-b5-...`(保留原 leading dash
  讓 Ghost URL 完整保留)

**新增文章**也請避免檔名以 `-` 開頭。

### 2.3 `getStaticPaths` scope isolation

Astro 在 `getStaticPaths()` 內部執行時是隔離 scope,**不能存取
module-level const / let / 變數**。常數要寫進函數本體裡,例:

```ts
// 錯
const POSTS_PER_PAGE = 10;
export const getStaticPaths = async () => {
  // ...POSTS_PER_PAGE 在這裡會是 undefined
};

// 對
export const getStaticPaths = async () => {
  const POSTS_PER_PAGE = 10;
  // ...
};
```

Module-level 的 `import` 是 OK 的,只有變數受影響。

### 2.4 CJK 圖片檔名要 decode 成 literal Unicode

Ghost 對 URL 裡的中文檔名做了 percent-encode(例:`%E4%B8%8A%E8%AA%B2`)。
本地必須存 literal Unicode 字串(`上課`),不然 Astro `<Image>` 找
不到檔案。`scripts/asset-mirror.ts` 已透過
`decodeURIComponent(parsed.pathname)` 處理,寫新腳本或手放圖時也
要遵守此慣例。

---

## Section 3 — Frontmatter schema 快表

定義在 `src/content/config.ts`(posts 與 pages 共用 `baseSchema`)。

| 欄位 | 型別 | Required | 範例 / 備註 |
| --- | --- | --- | --- |
| `title`            | string  | yes | `"標題"` |
| `pubDate`          | date    | yes | `2026-04-29T12:00:00+08:00`(會 coerce) |
| `updatedDate`      | date    | no  | 更新日期 |
| `author`           | string  | yes | `sheepdragon` |
| `tags`             | string[]| default `[]` | 必須是 `src/data/tags.json` 已定義的 slug |
| `featureImage`     | image() | no  | 相對路徑,見 Section 4 |
| `excerpt`          | string  | no  | 顯示在卡片與 og:description |
| `canonicalUrl`     | url     | no  | 外部 canonical;BaseLayout 目前**未消費** |
| `metaTitle`        | string  | no  | `<title>` 與 og:title override |
| `metaDescription`  | string  | no  | description meta override |
| `slug`             | —       | —   | **不要在 schema 加,但仍可寫進 frontmatter** 當 URL slug override |

加新欄位記得同步改 `baseSchema` 與用到的 routes / components。

---

## Section 4 — Image conventions

- `featureImage` 與 markdown body 內的圖**都用相對路徑**
  指向 `src/assets/` 樹,讓 Astro `<Image>` 在 build 時生成 webp +
  多尺寸版本。範例路徑:
  - `../../assets/blog/content/images/2020/10/cover.jpg`(本站圖)
  - `../../assets/external/i.imgur.com/abc123def456.jpg`(外連)
- **不要** frontmatter 直接寫 `https://...`,因 `image()` schema 需要
  build-time resolveable。要用外連,先下載放 `src/assets/external/`。
- body 內 markdown `![](path)` 也用相對路徑。Astro markdown 處理器
  會把它接到 `<Image>` 處理鏈(MDX 也可以直接用 `<Image>` component)。
- 33 張 dead link 列在 `import-cache/import-report.json#failed_assets`,
  hosts 集中在 `bgpsekai.thisistap.com` / `birdyo.ddns.net` /
  `blog.bgpsekai.club`(自身 5 張被刪)。**不阻擋 build**,但 render
  時破圖;要修就找替代圖或從文章移除。

---

## Section 5 — Routes 結構

```
src/pages/
├── index.astro              # / — 最新 10 篇 post
├── page/[page].astro        # /page/2/、/page/3/...
├── [slug].astro             # /<post-slug>/ — 單篇 post,顯示 Giscus
├── about-me.astro           # /about-me/ — 從 pages collection 讀
├── baha-danmu-to-ass.astro  # /baha-danmu-to-ass/ — feature page
├── tag/[slug]/index.astro   # /tag/<slug>/ — tag 索引第 1 頁
├── tag/[slug]/page/[page].astro  # /tag/<slug>/page/N/
├── author/[slug]/index.astro     # /author/<slug>/
├── rss.xml.ts               # /rss.xml — 最新 20 篇 RSS
└── 404.astro                # 404 頁
```

Sitemap 由 `@astrojs/sitemap` integration 自動產出 → `/sitemap-index.xml`。
`public/_redirects` 由 `scripts/emit-redirects.ts` 產生(舊 hex tag →
新 pinyin tag、5 個 WP 殘留 → `/`、Ghost-only paths → 410)。

---

## Section 6 — 整合

| 整合 | 開關 / 設定 | 程式位置 |
| --- | --- | --- |
| AdSense  | 永遠開,client ID `ca-pub-9488921689181013` hard-code | `BaseLayout.astro` `<head>` |
| GA4      | Conditional on env `PUBLIC_GA4_MEASUREMENT_ID`;**沒設就 skip 注入**(build 不 fail) | `BaseLayout.astro` 的 `{ga4Id && ...}` 區塊 |
| Giscus   | `<BaseLayout showGiscus={true}>` 才注入(目前只有 `[slug].astro`) | `src/components/Giscus.astro`(內有 TODO 待替換 `data-repo-id` / `data-category-id`) |
| Pagefind | `astro-pagefind` integration 自動 build-time index;UI 嵌在 `Header.astro` | `astro.config.mjs` integrations + `<Search />` import |
| CF Web Analytics | Phase 2 未實作 | (未) |

GA4 是 §9.3 blocker — 使用者必須先在 GA 後台建立 GA4 屬性、拿到
`G-XXXXXXXXXX`、寫入 GitHub Secrets 才能完成這個 task。Phase 2 才上
Cloudflare Web Analytics 當 sanity check。

site chrome(Header / Footer / 搜尋框)都加了 `data-pagefind-ignore`,
不會出現在搜尋結果片段。

---

## Section 7 — Don't touch list

下面這些目錄 / 檔案**不要主動改動**(除非任務明確要求):

- `import-cache/`  — Ghost API 凍結快照,改了破壞 reproducibility。
  要更新只能透過重跑 `scripts/ghost-export.ts`。
- `openspec/`      — OpenSpec spec / change 文件,有自己的流程
  (`openspec propose` / `apply` / `archive`)。修 spec 要走 change
  proposal,**不要直接編輯** `openspec/specs/`。
- `.claude/`       — Claude Code 個別 session 配置 + skills,屬於
  使用者私有設定。
- `src/lib/baha-danmu/README.md` — 已有完整文件(40 個 unit test 的
  說明、ASS template 來源、限制⋯),不要 duplicate / overwrite。
- `.env`           — 含 Ghost API secret,別 commit、別印出。

---

## Section 8 — Test / verify

每次大改後跑這幾個指令確認沒退步:

```sh
npm test                          # baha-danmu 40 個 unit test
npx astro check                   # TypeScript / Astro 類型檢查
npx astro build                   # 完整 build(含 Pagefind index)
openspec validate --all --strict  # 確認 OpenSpec 文件合法
```

`astro check` 與 `astro build` 期間會重新驗證 content collection
schema,如果有 frontmatter 違規(例如 `slug:` 被當成 unknown key),
這裡就會抓到。`openspec validate` 在動 spec 文件後尤其要跑。

---

## Section 9 — Future migrations / changes

要新增大功能(例:加 dark mode、改 layout、引入 newsletter…)請走
OpenSpec 流程而不是直接動程式碼:

1. 跑 `openspec propose <change-id>` 或 `opsx:propose` skill,讓它
   產生一個新 change folder 在 `openspec/changes/<change-id>/`,內含
   `proposal.md` / `design.md` / `tasks.md` / `specs/*.md`。
2. 與使用者 review proposal、調整 decisions。
3. 跑 `openspec validate --all --strict` 確認文件合法。
4. 開始實作,依 `tasks.md` 順序勾 checkbox。
5. 全部勾完後跑 `opsx:archive`(or `openspec archive <id>`)— 它會
   把 spec deltas merge 進 `openspec/specs/` 並把 change 移到
   `openspec/changes/archive/`。

當前還有一個進行中的 change:**`migrate-ghost-to-astro`**,§9 GA4 /
§11 部署 / §12 cutover 還沒完成,**還不能 archive**(§14.3 也別動)。

如果是小修小補(typo、單一 component refactor、加一個 unit test),
不需要走 OpenSpec,直接 commit 即可。判準:有沒有改 capability 的
public contract — 沒有就直接動,有就走 propose。
