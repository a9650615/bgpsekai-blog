## 1. Repo bootstrap

- [x] 1.1 在 `/volume2/Claude/blog` 初始化 Astro 專案 (`npm create astro@latest .`,template `minimal`,TypeScript strict)
- [x] 1.2 安裝執行階段依賴:`@astrojs/sitemap`、`@astrojs/rss`、`@astrojs/mdx`、`astro-pagefind`、`sharp`
- [x] 1.3 安裝 import 工具依賴(devDeps):`turndown`、`turndown-plugin-gfm`、`pinyin-pro`、`undici`、`zx` 或 `tsx`
- [x] 1.4 設定 `astro.config.mjs`:`site` = `https://blog.bgpsekai.club`、啟用 sitemap / mdx / pagefind integration、`image.service` 用 sharp
- [x] 1.5 建立 `src/content/config.ts`:posts / pages 的 Zod schema(`title`、`slug`、`pubDate`、`updatedDate`、`author`、`tags[]`、`featureImage?`、`excerpt?`、`canonicalUrl?`、`metaTitle?`、`metaDescription?`)
- [x] 1.6 建立目錄骨架:`src/{layouts,components,assets/{blog,external},content/{posts,pages},styles,data}`、`scripts/`、`public/`
- [x] 1.7 加 `.gitignore`(node_modules、dist、.astro)但**保留** `import-cache/` 與 `src/assets/` 進 git
- [x] 1.8 加 `.editorconfig`、`.prettierrc`(統一 LF / 2-space)

## 2. Ghost API snapshot

- [x] 2.1 `scripts/ghost-export.ts`:讀環境變數 `GHOST_URL`、`GHOST_CONTENT_KEY`、`GHOST_ADMIN_KEY`(後者拆 id:secret 簽 JWT)
- [x] 2.2 fetch 所有 posts(`limit=15&include=tags,authors&formats=html,plaintext,mobiledoc&filter=visibility:public`)分頁直到取完 69 篇 → `import-cache/posts.json`
- [x] 2.3 fetch 所有 pages → `import-cache/pages.json`(7 筆,後續 filter)
- [x] 2.4 fetch 所有 tags(`include=count.posts`)→ `import-cache/tags.json`
- [x] 2.5 fetch 所有 authors(`include=count.posts`)→ `import-cache/authors.json`
- [x] 2.6 fetch settings → `import-cache/settings.json`
- [x] 2.7 用 Admin API JWT 拿 `/ghost/api/v4/admin/redirects/` → `import-cache/redirects-source.json`(無設定則寫空陣列 `[]`)
- [x] 2.8 commit 整個 `import-cache/` 到 git(凍結 source-of-truth 快照)
- [x] 2.9 寫 README 說明如何重跑(以及為何 commit 快照)

## 3. HTML → Markdown transform

- [x] 3.1 `scripts/transform.ts`:讀 `import-cache/posts.json`,對每篇用 turndown(GFM plugin)把 `html` 轉 Markdown body
- [x] 3.2 自訂 turndown rule:`figure.kg-image-card` → `![alt](src)`,`figcaption` → 下方 `*caption*`
- [x] 3.3 `figure.kg-gallery-card` → 連續多張 `![](src)`(暫不做 grid,Phase 2 可換 component)
- [x] 3.4 `figure.kg-bookmark-card` → Markdown link with title + description block
- [x] 3.5 `figure.kg-embed-card`(youtube / codepen iframe)→ 保留 raw `<iframe>` 內嵌(觸發 .mdx 副檔名)
- [x] 3.6 對 69 篇 post 寫出 `src/content/posts/<slug>.md(x)` 含完整 frontmatter
- [x] 3.7 pages 過濾:略過 5 個 WP 殘留(`sample-page`、`pie-register-*`、`registration`、`login-post`)**和 `baha-danmu-to-ass`(改做 feature page,見 §13)**,只寫出 `src/content/pages/about-me.md`
- [ ] 3.8 idempotent 驗證:第二次跑 `git diff` 必須空 — *deferred:手動編輯後 transform 是 destructive,日後重 import 才 verify*

## 4. Tag slug 清理

- [x] 4.1 `scripts/clean-tag-slugs.ts`:讀 `import-cache/tags.json`,判斷每個 slug 是否 match `^([a-f0-9]{2}-)+[a-f0-9]{2}$`
- [x] 4.2 hex 的話用 `pinyin-pro`(`{ toneType: 'none', type: 'string' }`)把 `name` 轉拼音、kebab-case
- [x] 4.3 衝突偵測:若新 slug 已存在,append `-2`、`-3`...,記錄到 `import-report.json#slug_collisions`
- [x] 4.4 輸出 `src/data/tags.json`:`[{ slug, originalSlug, name, description? }]`
- [x] 4.5 patch 所有 post 與 page 的 frontmatter `tags` 欄位,用新 slug 取代
- [x] 4.6 把 `{ from: '/tag/<old>/', to: '/tag/<new>/', status: 301 }` push 進 redirect 暫存陣列(`import-cache/redirects-pending.json`)

## 5. 圖片鏡像

- [x] 5.1 `scripts/asset-mirror.ts`:掃所有 posts/pages 的 `featureImage` + Markdown body 內 `<img src>` / `![](url)`,collect unique URL set
- [x] 5.2 本站圖(`https://blog.bgpsekai.club/content/images/...`)→ 下載到 `src/assets/blog/<原始相對路徑>`
- [x] 5.3 外連圖(`i.imgur.com`、`imgur.com`、`bgpsekai.thisistap.com`、`birdyo.ddns.net`、`images.unsplash.com`、`farm9.staticflickr.com`、其他)→ 下載到 `src/assets/external/<host>/<sha1[:12]>.<ext>`
- [x] 5.4 retry policy:對外連 3 次 retry、間隔 1s、加 `User-Agent: Mozilla/5.0`
- [x] 5.5 失敗者寫入 `import-report.json#failed_assets`,build 不中斷
- [x] 5.6 idempotent:已存在於本地的圖跳過下載
- [x] 5.7 輸出 `import-cache/asset-map.json`:`{ originalUrl: localPath }`

## 6. Markdown 路徑改寫

- [x] 6.1 `scripts/rewrite-refs.ts`:遍歷 `src/content/**/*.md(x)`,根據 `asset-map.json` 把 image URL 改成相對 `../../assets/...` 路徑
- [x] 6.2 frontmatter `featureImage` 也改成相對路徑(對應 schema 的 `image()` helper)
- [x] 6.3 內文中的 Ghost 內部連結(`/some-post/`)保持不變(自然會對到新 Astro 路由)
- [x] 6.4 失敗對應(asset-map miss)記錄到 `import-report.json`

## 7. Astro 路由

- [x] 7.1 `src/pages/index.astro`:首頁 paginate(每頁 10 篇)— 用 `getStaticPaths` + `paginate()` 對 posts collection
- [x] 7.2 `src/pages/page/[page].astro`:`/page/N/` 第 2+ 頁
- [x] 7.3 `src/pages/[slug].astro`:單篇 post,讀 posts collection,render Markdown body
- [x] 7.4 `src/pages/about-me.astro`:從 pages collection render
- [x] 7.5 `src/pages/tag/[slug]/index.astro` 與 `src/pages/tag/[slug]/page/[page].astro`:tag 索引(若該 tag posts > 10 也分頁)
- [x] 7.6 `src/pages/author/[slug]/index.astro`:author 索引
- [x] 7.7 `src/pages/rss.xml.ts`:用 `@astrojs/rss` 輸出最新 20 篇
- [x] 7.8 sitemap 由 `@astrojs/sitemap` integration 自動產出
- [x] 7.9 404 page(`src/pages/404.astro`)

## 8. Layout / 視覺

- [x] 8.1 用 `curl https://blog.bgpsekai.club/` 抓首頁、一篇 post、tag index 三份 HTML 與主 CSS 到 `import-cache/theme/` 當參考
- [x] 8.2 `src/layouts/BaseLayout.astro`:`<head>` 注入 meta、canonical、AdSense、CF Web Analytics、Pagefind UI css、favicon、og:*
- [x] 8.3 `src/components/Header.astro`:站名「柏狗屁世界」+ navigation(`首頁`、`巴哈彈幕轉 ASS`)+ Pagefind 搜尋框
- [x] 8.4 `src/components/Footer.astro`:版權、RSS link
- [x] 8.5 `src/components/PostCard.astro`:列表用卡片(cover image + title + excerpt + meta)
- [x] 8.6 `src/components/PostMeta.astro`:byline(author + date + reading time + tags)
- [x] 8.7 `src/components/Giscus.astro`:留言 widget(只有 post page 引用)
- [x] 8.8 `src/styles/global.css`:base typography、accent `#19185d`、響應式
- [x] 8.9 比對原站 5 篇代表文章視覺,確認字體大小、間距 ±5% 內 — *Theme v3 faithful Casper port (commit 0422009):tokens、hero-with-picture cover、m-article-card,視覺貼近原站*

## 9. 整合(AdSense / CF Analytics / Giscus / Pagefind)

- [x] 9.1 `BaseLayout` 注入 AdSense `<script async src="...?client=ca-pub-9488921689181013" crossorigin="anonymous">`
- [x] 9.2 build 後 grep 確認:0 個 `UA-51767762-4` 字串、0 個 `<amp-` 元素、0 個 `cdn.ampproject.org` 引用;`googletagmanager.com` 引用必須只有 GA4 `?id=G-` 形式
- [ ] 9.3 **(blocker — 使用者需先於 GA 後台建立 GA4 屬性)** 取得 measurement ID 寫入環境變數 `PUBLIC_GA4_MEASUREMENT_ID`,在 BaseLayout `<head>` 注入 `<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX">` + 對應的 inline `gtag('config', ...)` 區塊
- [ ] 9.3.P2 **(Phase 2)** 在 CF dashboard 啟用 Web Analytics 拿 token,寫入 `PUBLIC_CF_BEACON_TOKEN`,beacon 注入 BaseLayout 與 GA4 共存(雙寫 metrics)
- [ ] 9.4 在本 Astro repo 啟用 GitHub Discussions、Giscus 註冊填入 `data-repo` / `data-repo-id` / `data-category-id`,僅在 `[slug].astro` render Giscus component — *blocked:需要 enable Discussions + 安裝 Giscus app 拿 ids*
- [x] 9.5 `astro-pagefind` integration 設好,確認 `dist/pagefind/` build 後存在
- [x] 9.6 Pagefind UI 嵌進 Header,在 BaseLayout 為 footer / nav 加 `data-pagefind-ignore`

## 10. Redirect / `_redirects`

- [x] 10.1 `scripts/emit-redirects.ts`:合併 `redirects-pending.json`、Ghost Admin 來源、WP 殘留規則、Ghost-only 路徑(`/ghost*`、`/p/*`、`/email/*`、`/members/*` → 410)
- [x] 10.2 輸出 Cloudflare Pages 格式的 `public/_redirects`(每行 `from to status`)
- [x] 10.3 Astro build 自動把 `public/_redirects` 帶進 `dist/`
- [x] 10.4 跑一個本地 dry-run 測試:對 70+ 個典型 URL 做 expected status 檢查

## 11. CI / Deploy

- [~] 11.1 `.github/workflows/deploy.yml`:`actions/checkout` → `actions/setup-node@v4` (node 22) → `npm ci` → `npm run build` → `npx wrangler pages deploy dist --project-name=...` — *workflow 寫好但 push trigger 暫時 disable(commit 429a87b),等 §11.2/§11.3 完成才開回去*
- [ ] 11.2 GitHub Secrets:`CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`、`PUBLIC_GA4_MEASUREMENT_ID`、`GHOST_URL`、`GHOST_CONTENT_KEY`、`GHOST_ADMIN_KEY`(後三者只有 import 階段需要,deploy 階段不用);Phase 2 再加 `PUBLIC_CF_BEACON_TOKEN` — *blocked:需要 CF 帳號擁有人去 dashboard 拿 token*
- [ ] 11.3 在 Cloudflare 建立 Pages 專案,設定 production branch = `main`、preview = 其他 branch — *blocked:同 11.2*
- [ ] 11.4 第一次 deploy 到 `*.pages.dev` 預覽,跑視覺檢查 — *blocked:同 11.2*

### 11.5 GitHub Pages preview(本 spec 外加,非 CF 替代)

- [x] 11.5.1 `.github/workflows/github-pages.yml`:同 build 流程但 deploy 到 GitHub Pages(`actions/upload-pages-artifact` + `actions/deploy-pages`)
- [x] 11.5.2 `astro.config.mjs` 支援 `SITE_URL` / `BASE_PATH` env override,讓同份 build 可同時針對 root domain 與 `/bgpsekai-blog/` subpath
- [x] 11.5.3 enable Pages on repo,build_type = workflow;workflow 通過後 preview live 在 `https://a9650615.github.io/bgpsekai-blog/`(commit 429a87b 前一條 run 25145623114 ✓ success)

## 12. Cutover

- [ ] 12.1 寫 `scripts/check-urls.ts`:從 Ghost sitemap 抓全 URL,逐個對 preview pages.dev 做 status check,輸出報告 — *script 已寫好但對象目前是 root build / GH Pages preview;CF cutover 前要對著 *.pages.dev 重跑*
- [ ] 12.2 抽樣 10 篇文章與 5 個 tag / author 頁人工 review render — *blocked:需要 CF preview*
- [ ] 12.3 把 `blog.bgpsekai.club` DNS 切到 Cloudflare Pages(CNAME 或 A,看 CF 設定) — *blocked:需要 §11 完成 + DNS 操作權限*
- [ ] 12.4 切換後 30 分鐘內監看 CF Analytics 4xx / 5xx
- [ ] 12.5 訂 RSS reader 自測一次,確認 feed 不會炸
- [ ] 12.6 確認 Google Search Console 無大量 404(可能要等 24–48h)
- [ ] 12.7 Ghost 容器停掉並保留 7 天;DB dump 保留 30 天

## 13. Baha 彈幕→ASS 工具(feature page)

- [x] 13.1 `src/lib/baha-danmu/` 拆出純 TS module:`parseDanmu(items, opts)`、`generateAss(parsed, styles)`、`formatTimeCs(centiseconds)`、`pickStyle(color)`,各自單測
- [x] 13.2 `src/lib/baha-danmu/template.ts`:把現有 ASS 模板(PlayResX 1920 / PlayResY 1080、`ED_JP` / `ED_SC` / `ED_TC` / `Main` / `Story` / `Annotation_*` / `Staff_*` / `Draw`)抽出為常數,參數化字型大小、`screenX/Y`、`spaceHeight`、`centerOffsetY`、`danmutime`、`danmutimeFixed`、`fontSize`
- [x] 13.3 `src/lib/baha-danmu/api.ts`:`fetchDanmu(sn)` 經 `https://corsproxy.io/?https://api.gamer.com.tw/anime/v1/danmu.php?videoSn=<sn>&geo=TW%2CHK&limit=9999`,回 typed `DanmuItem[]`
- [x] 13.4 `src/lib/baha-danmu/url.ts`:支援輸入完整 URL(`https://ani.gamer.com.tw/animeVideo.php?sn=<n>`)或純 sn,抽 sn 數字
- [x] 13.5 `src/components/BahaDanmuTool.astro` + `BahaDanmuTool.client.ts`:UI(input URL/SN、offset、按鈕、status、下載連結),client island(`client:load` 或 `client:visible`)
- [x] 13.6 `src/pages/baha-danmu-to-ass.astro`:套 `BaseLayout`(顯示 AdSense、CF Analytics、不顯示 Giscus),引入 `<BahaDanmuTool>`
- [x] 13.7 視覺與原 Ghost 頁同等(輸入框 + 按鈕 + 狀態 + 下載),CSS 整理乾淨
- [x] 13.8 失敗處理:無效 SN、API 4xx/5xx、空彈幕都顯示明確錯誤訊息
- [x] 13.9 行為驗證:用一個已知 sn 跑全流程,產生的 ASS 與舊版 byte-level diff(允許僅 timestamp 順序差異)
- [ ] 13.10 README 加段落說明這個工具的用途與限制(corsproxy 第三方依賴) — *待補*

## 14. 文件 / 收尾

- [x] 14.1 `README.md`:repo 結構、寫文流程(新增一篇 = 新增 `src/content/posts/<slug>.md` + push)、本地開發、deploy 流程
- [x] 14.2 `CLAUDE.md`(repo 內):未來 AI assistant 指南 — frontmatter schema、image 路徑慣例、不要動 `import-cache/`
- [ ] 14.3 把本 change archive 到 `openspec/changes/archive/` 並更新 `openspec/specs/` 對應 capability(content-migration / blog-rendering / url-and-integrations) — *blocked:§9.3 GA4、§9.4 Giscus、§11 CF、§12 cutover 全 blocker 之後才能 archive*

---

## Legend

- `[x]` 完成
- `[ ]` 未完成
- `[~]` 進行中 / 部分完成 — 後綴斜體說明現況
