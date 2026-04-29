## Why

`blog.bgpsekai.club`(柏狗屁世界)目前跑 Ghost 4.9 自架,需要持續維護 Node app + DB,但盤點後實際完全沒用到 Ghost 的 members、newsletter、custom_template、code injection、custom routes 等高級功能 — 純粹是 post / page / tag / author / RSS。改成 Astro + Cloudflare Pages 後月費歸零、無維運負擔,且未來寫文 = 開 VS Code 寫 Markdown + `git push`。

## What Changes

- 一刀切從 Ghost 4.9 匯出全部 69 篇 posts 與 2 個有效 pages(`/about-me/`、`/baha-danmu-to-ass/`),轉成 Markdown 連同 frontmatter commit 進 git
- 鏡像所有圖片到本地 `src/assets/`(含本站圖、imgur、bgpsekai.thisistap.com、birdyo.ddns.net 等外連,避免日後失聯;精確張數以 `import-cache/asset-map.json` 為準),用 Astro `<Image>` 優化
- 建立 Astro 站台,沿用 Casper-ish 視覺(從現有頁面 HTML / CSS 取參考,不 port handlebars 主題)
- 保留所有原有 URL 結構:`/`、`/{slug}/`、`/tag/{slug}/`、`/author/{slug}/`、`/page/N/`、`/rss/`、`/sitemap.xml`
- 87 個 tag 中許多被 hex-encoded(例:`e5-bf-83-e6-83-85-e6-9c-ad-e8-a8-98` = 心情札記),全部重新生成乾淨 Pinyin slug,從舊 URL 設 301 redirect
- **BREAKING**: 砍掉 5 個 WordPress 殘留 page(`/sample-page/`、`/pie-register-forgot-password/`、`/pie-register-profile/`、`/registration/`、`/login-post/`),301 到首頁
- **BREAKING**: 移除 GA Universal(`UA-51767762-4`,Google 已 2023-07-01 停止收資料、2024-07-01 永久刪除屬性);新建 GA4 屬性(`G-XXXXXXXXXX`,由使用者於 GA 後台建立後提供 measurement ID)取代;Phase 2 加 Cloudflare Web Analytics 當 sanity check 對照
- 保留 AdSense client `ca-pub-9488921689181013`,注入到 base layout
- 加 Giscus 留言(GitHub Discussions)— 僅在 post page 顯示
- 加 Pagefind 站內搜尋(build-time index、純靜態)
- 部署到 Cloudflare Pages,GitHub Actions push 自動 build
- 切換完成後 Ghost 站關閉(VPS / container 退役)

## Capabilities

### New Capabilities

- `content-migration`: 從 Ghost Content / Admin API 抓 posts、pages、tags、authors、settings、redirects,鏡像所有圖片資產到 `src/assets/`,輸出 Astro Content Collection 可消費的 Markdown,並產生 redirect 清單
- `blog-rendering`: Astro 站呈現 posts、pages、tag/author 索引、首頁 paginate、RSS、sitemap,沿用 Casper-ish 視覺
- `url-and-integrations`: URL 保留與 redirect/410 規則、Cloudflare Web Analytics、AdSense 注入、Giscus 留言、Pagefind 搜尋

### Modified Capabilities

(無 — 此為 greenfield 遷移,沒有既有 spec)

## Impact

- **新 repo**:Astro project(從零建立,部署目標 Cloudflare Pages)
- **舊系統**:Ghost 4.9 自架站於切換後關閉,VPS 釋放
- **DNS**:`blog.bgpsekai.club` 由原 Ghost host 切到 Cloudflare Pages
- **第三方**:接入 GA4(取代已 sunset 的 UA,使用者新建屬性提供 `G-XXXXXXXXXX`)、Giscus / GitHub Discussions(新);停用 GA Universal(舊);保留 AdSense;Phase 2 再加 Cloudflare Web Analytics
- **SEO**:URL 全保留,僅改變 slug 的部分(中文 hex tag、5 個 WP 頁)透過 301/410 處理
- **依賴**:新增 `astro`、`@astrojs/sitemap`、`@astrojs/rss`、`@astrojs/mdx`、`astro-pagefind`、`turndown`、`turndown-plugin-gfm`、`pinyin-pro`、`undici`、`sharp`
- **內容快照**:Ghost API dump 一次性 commit 進 `import-cache/`,以後純 Markdown source-of-truth
