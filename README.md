# bgpsekai-blog

`blog.bgpsekai.club`(柏狗屁世界)的 Astro v5 靜態站,從原本的 Ghost 4.9
自架站遷移而來。Ghost 雖然好,但本站只用到最基本的 post / page / tag /
author / RSS 能力 — 連 members、newsletter、custom routes 都沒用,卻得
維護一個 Node app + DB。改成「Markdown + git push + Cloudflare Pages」
之後,月費歸零、無維運負擔,寫一篇文 = 開 VS Code 寫 Markdown 再 commit。

技術棧:**Astro v5**(Content Collections / MDX)+ **TypeScript strict**
+ `@astrojs/sitemap` / `@astrojs/rss` / `@astrojs/mdx` /
`astro-pagefind` / `sharp`,部署目標是 **Cloudflare Pages**,CI 用
**GitHub Actions**(push `main` 自動 build + deploy)。

## Quick start

```sh
npm install                # 安裝 dependencies
npm run dev                # http://localhost:4321/
npm test                   # 跑 baha-danmu lib 的 40 個 unit test
npm run check              # astro check (TypeScript / Astro 類型檢查)
npm run build              # 產生 dist/ + Pagefind index
npm run preview            # 本地預覽 build 完的站
```

需要 Node 22+(CI 也用 22)。`.env` 用來放 import / GA4 等敏感變數,
範例見「Import pipeline」與「Deploy」段落。

## Repo structure

```
.
├── astro.config.mjs          # site URL、integrations、image service
├── src/
│   ├── content/
│   │   ├── config.ts         # posts / pages 的 Zod schema
│   │   ├── posts/<slug>.md   # 69 篇文章(URL slug = 檔名)
│   │   └── pages/about-me.md # /about-me/
│   ├── pages/                # Astro 路由(index、[slug]、tag/、author/…)
│   ├── layouts/BaseLayout.astro       # head / AdSense / GA4 / og:* 注入
│   ├── components/                    # Header、Footer、PostCard、Giscus…
│   ├── lib/baha-danmu/                # Bahamut 彈幕 → ASS 純 TS module
│   ├── data/tags.json                 # 87 個 tag 的 slug / name / 描述
│   ├── styles/global.css              # base typography
│   └── assets/{blog,external}/        # 鏡像下來的圖(Astro Image 來源)
├── scripts/                  # 一次性 import pipeline(見下節)
├── import-cache/             # Ghost API 凍結快照(commit 進 git)
├── public/                   # 直接複製到 dist 的靜態檔(_redirects 等)
└── openspec/                 # OpenSpec change / spec 文件
```

## 寫一篇新文章

1. 在 `src/content/posts/<slug>.md` 新增檔案。**檔名就是 URL slug**
   (例:`my-new-post.md` → `https://blog.bgpsekai.club/my-new-post/`)。
2. 寫 frontmatter,範例:

   ```yaml
   ---
   title: "標題"
   pubDate: 2026-04-29T12:00:00+08:00
   author: sheepdragon
   tags:
     - bai-jia
     - tutorial
   featureImage: ../../assets/blog/content/images/2026/04/cover.jpg
   excerpt: "一句話摘要,顯示在卡片與 og:description。"
   ---

   正文用 Markdown / MDX 寫⋯
   ```

3. `git add src/content/posts/my-new-post.md` → `git commit` → `git push`
   到 `main`。GitHub Actions 會自動 build 並部署到 Cloudflare Pages。

### 寫文時的雷區

- **不要在 frontmatter 加 `slug` 欄位**。Astro v5 的 `type: 'content'`
  把 `slug` 視為 reserved field,會在 Zod 驗證前砍掉它,加了既不會生效
  也可能 build fail。URL slug 由**檔名**決定;routes 用 `entry.slug` 取得。
  詳細坑點看 `CLAUDE.md` Section 2。
- **featureImage** 路徑慣例:
  - 本站圖 → `../../assets/blog/...`(由 `scripts/asset-mirror.ts` 鏡像)
  - 外連圖 → 手動下載放 `src/assets/external/<host>/<sha1>.<ext>`,再
    把 frontmatter 路徑指過去。**不要直接 frontmatter 寫外連 URL**,
    因為 Astro `<Image>` 需要 build-time 可解析的本地檔案。
- **tags** 統一用 `src/data/tags.json` 裡定義過的 slug。要新增 tag,
  先去 `tags.json` 加一筆 `{ slug, name, description? }`,再寫進 frontmatter。
- 要嵌 iframe / `<script>` 等 raw HTML,把副檔名改 `.mdx` 即可。

## Import pipeline(`scripts/`)

**警告**:這些是**一次性遷移**腳本,平常寫文章用不到、也不該跑。
只有在「Ghost 站還沒退役、需要重新抓最新內容」時才會跑。

| Script | 職責 |
| --- | --- |
| `ghost-export.ts`     | 讀 Ghost Content + Admin API,dump 成 JSON 到 `import-cache/` |
| `transform.ts`        | `import-cache/posts.json` 的 HTML → Markdown(turndown + 自訂 rule) |
| `clean-tag-slugs.ts`  | hex slug(`e5-bf-83-...`)→ pinyin slug;產生 `src/data/tags.json` |
| `asset-mirror.ts`     | 下載所有 `featureImage` / 內文圖到 `src/assets/`(本站 + 外連) |
| `rewrite-refs.ts`     | Markdown 內 image URL → 本地相對路徑 |
| `emit-redirects.ts`   | 合併 redirect 規則 → `public/_redirects`(Cloudflare 格式) |
| `_lib.ts`             | 共用 utility(JWT 簽 Admin token、JSON I/O、log…) |

要重跑請先設 `.env`(範例):

```env
GHOST_URL=https://blog.bgpsekai.club
GHOST_CONTENT_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
GHOST_ADMIN_KEY=<keyId>:<secret>
```

然後 `npx tsx scripts/ghost-export.ts`(或對應的單支腳本)。每支腳本
都是 idempotent — 重跑 `git diff` 應該為空,有差就代表 Ghost 端內容變了。
**注意**:`scripts/transform.ts` 重跑會覆蓋 `src/content/posts/*.md`,
若你期間有手動編輯 markdown,改動會被吃掉。詳見 `CLAUDE.md` Section 1
的 source-of-truth 規則。

## Deploy

`main` 分支 push 後,GitHub Actions(`.github/workflows/deploy.yml`)
會跑 `npm ci → npm run build → wrangler pages deploy dist`。

**GitHub Secrets** 必須設定:

- `CLOUDFLARE_API_TOKEN` — Pages deploy 權限的 token
- `CLOUDFLARE_ACCOUNT_ID` — Cloudflare account 的數字 ID
- `PUBLIC_GA4_MEASUREMENT_ID` — GA4 Measurement ID(`G-XXXXXXXXXX`)
  注:沒設這個 secret,build 不會 fail,只會 skip 注入 `gtag.js`(見
  `BaseLayout.astro` 的 conditional 區塊)。

Phase 2 才需要:`PUBLIC_CF_BEACON_TOKEN`(Cloudflare Web Analytics)。

過渡期還有一個 **GitHub Pages preview**(`.github/workflows/github-pages.yml`)
部署到 `https://a9650615.github.io/bgpsekai-blog/`,build 時透過
`SITE_URL` / `BASE_PATH` env 把站台搬到子路徑。**注意**:GitHub Pages 不
支援 `_redirects`,所以 16 個 hex→pinyin tag、5 個 WP residue、RSS alias、
Ghost-only 410 全部在預覽站不會運作 — 那些只在 CF Pages 上線後才生效。

## 整合

| 服務 | 設定方式 |
| --- | --- |
| AdSense                 | client `ca-pub-9488921689181013` 已 hard-code 在 `BaseLayout.astro`,所有頁面注入。 |
| GA4                     | Conditional on `PUBLIC_GA4_MEASUREMENT_ID` env;沒設就 skip 注入。 |
| Giscus(GitHub Discussions) | `src/components/Giscus.astro` 內有 TODO 標記:把 `data-repo-id` / `data-category-id` 換成本 repo 推上 GitHub 後 Giscus 註冊頁拿到的真值。**僅 post page 啟用**(`showGiscus={true}`)。 |
| Pagefind                | `astro-pagefind` integration build 時自動 index 所有 post 內容,UI 嵌在 Header。 |
| Cloudflare Web Analytics | Phase 2 — 待 GA4 上線後再加,作為 sanity check。 |

## Spec / docs

完整 migration 設計、決策、tasks 都在
`openspec/changes/migrate-ghost-to-astro/`(`proposal.md` /
`design.md` / `tasks.md` + 三份 capability spec)。

OpenSpec 流程簡介:每一次重大變更先寫一個 change proposal(由
`openspec propose` 或 `opsx:propose` skill 產生),包含 spec deltas
與 tasks 清單。實作期間勾 tasks。實作完了再 archive change 並把
delta 合併進 `openspec/specs/`。`openspec validate --all --strict`
是 lint。

## Known limitations

- **33 張外連 dead image**:來自 `bgpsekai.thisistap.com`(WP 舊站)、
  `birdyo.ddns.net`(自架圖床)、`blog.bgpsekai.club` 自身(早期被刪
  的 thumbnail),均為 2017–2018 老圖,清單記在
  `import-cache/import-report.json#failed_assets`。Astro build 不會
  因此失敗,但 render 時這幾張會破圖。修復 = 找原圖補上、或改用同站
  其它圖、或從文章移除引用。
- 中文 tag 的 Pinyin slug 在同音衝突時 append `-2`、`-3`(見
  `import-report.json#slug_collisions`)。
- Pagefind 對繁中分詞效果尚可但不完美,Phase 2 評估是否要自訂 segmenter。

## License

私人 blog repo,內容版權所有 © sheepdragon / 柏狗屁世界。原始碼 MIT。
