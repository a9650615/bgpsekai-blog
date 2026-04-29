## Context

`blog.bgpsekai.club`(柏狗屁世界)目前跑 Ghost 4.9 自架。Ghost 是 headless CMS + Express 後端,需要 Node 程序、DB(MySQL)與 storage,即使流量很低也要維護。盤點後發現此站僅使用 Ghost 最基本能力(post / page / tag / author / RSS),完全沒用到 members、newsletter、custom routes、custom templates、per-post code injection 等。

外部依賴:Cloudflare(CDN)、Google AdSense、Google Analytics Universal(該屬性已停止收資料)。內容組成:**69 posts、2 valid pages**(另 5 個是 WP 遷移殘留)、**87 tags、4 authors、數百張圖**(本站圖 + imgur / bgpsekai.thisistap.com / birdyo.ddns.net 等外連,精確數字以 `import-cache/asset-map.json` 為準)。Code injection 全站層級有 GA + AdSense + amp-auto-ads;0 篇 post 有 per-post injection。

主機環境:本工作區位於 Synology NAS(DSM、kernel 5.10.55+、Node 22.19.0)。`openspec` CLI v1.3.1 在此環境運作正常(`validate --all --strict` / `status --change` 通過)。Astro / Node toolchain 亦已驗證可運行。

## Goals / Non-Goals

**Goals:**
- 把 Ghost 站完整以靜態 Astro 站取代,部署在 Cloudflare Pages,月費 = 0
- 保留所有現有 URL,SEO 0 損失(除明確要砍的 5 個 WP 殘留頁)
- 鏡像全部圖片,移除對 imgur 等不穩外連的依賴
- 寫文流程 = `git push`,不再需要 CMS UI
- 視覺維持 Casper-ish,讀者體感不變

**Non-Goals:**
- 不重構視覺(沿用)
- 不導入 members、newsletter、付費內容(原站也沒在用)
- 不保留 Ghost 後台或讓兩站並行(一刀切)
- 不保留 AMP(Ghost AMP 整合一併拋棄)
- 不為了零風險而保留 hex 編碼 tag slug(借遷移機會清理)

## Decisions

### D1: Astro + Content Collections(Markdown 為唯一 source of truth)

**選擇**:Astro v5+、`src/content/posts/` 與 `src/content/pages/` 各為一個 collection、Markdown 為主(複雜內容用 MDX)、`astro.config.mjs` 啟用 `@astrojs/sitemap`、`@astrojs/rss`、`@astrojs/mdx`、`astro-pagefind`。

**為什麼**:Astro Content Collections 在 build 時做 schema 驗證 + type-safe import,符合「Markdown 為唯一 source of truth」的決策。Ghost 4.9 內容簡單,`html → markdown via turndown` 就夠;極少數 kg-card(image gallery、bookmark)若無法乾淨轉換,改成 inline HTML block 內嵌進 MDX。

**替代方案**:
- Eleventy:更輕量,但未來擴充(island components)較弱。已在探索階段排除。
- Astro `type: 'data'`(JSON):放棄 Markdown 作者體驗。捨。

### D2: 一刀切而非 Ghost-as-headless

**選擇**:把 Ghost 內容一次性 dump 成 Markdown commit 進 git,Ghost 站隨 DNS 切換立即關閉。

**為什麼**:此站僅一位主要作者、發文頻率不高,git workflow 完全足夠。保留 Ghost 當 headless 沒省到 VPS 錢,且維持兩個來源風險高(同步邏輯 bug、Ghost 升級疑慮)。

**替代方案**:Ghost as headless + Astro build 時 fetch — 若未來作者群擴大或非技術作者加入再考慮。

### D3: 圖片 100% 本地化

**選擇**:所有 `<img src>` 與 `feature_image`(共 268 張,其中 99 張外連)在 import 階段全部下載到 `src/assets/`,Markdown body 改成相對路徑,由 Astro `<Image>` 在 build 時做 WebP 轉換與多尺寸生成。

**為什麼**:imgur 與 ddns 隨時可能失效,過去三年已有歷史教訓。本地化一次,以後不再受第三方 host 政策影響。

**權衡**:repo 體積估增 50–100 MB。可接受,Cloudflare Pages 對 repo 大小寬鬆。失控時可改用 Cloudflare R2 + custom domain,屬 Phase 2。

### D4: 中文 tag slug 重新生成 + 301

**選擇**:hex-encoded slug(`e5-bf-83-...`)依 tag 中文 `name` 跑 `pinyin-pro`(無聲調、kebab-case)產生新 slug;舊 slug 寫進 `redirects.json` 全部 301 到新 slug。同音衝突時 append `-2`、`-3`...。

**為什麼**:目前 slug 既不可讀也不利分享。借遷移機會清理是淨值正向。301 保留 SEO juice。

### D5: AdSense 保留、UA 換 GA4(Phase 2 加 CF Web Analytics)

**選擇**:在 base layout `<head>` 注入 AdSense `ca-pub-9488921689181013`(用戶要求保留)。GA Universal `UA-51767762-4` 已被 Google 永久 sunset(2023-07-01 停收資料、2024-07-01 屬性刪除),沿用 = 死碼 — 改新建 GA4 屬性(`G-XXXXXXXXXX`,由使用者於 GA 後台建立後提供 measurement ID),用 `gtag.js` 注入。

**Phase 2**:加 Cloudflare Web Analytics(免 cookie、無 PII、防 adblocker)雙寫,當 GA4 的 sanity check。

**權衡**:GA4 在嚴格的 GDPR / 個資法解讀下需要 cookie consent banner。本站讀者以台灣為主、流量低,先以「IP anonymize + 不收 PII」最低限度合規,暫不上 banner;若日後流量結構變化或要對歐盟讀者合規,再補 banner(屬 Phase 2)。

### D6: 部署 Cloudflare Pages,CI 用 GitHub Actions

**選擇**:GitHub repo 為 source of truth,push 到 `main` 觸發 GitHub Actions:`npm ci → astro build → pagefind` → `wrangler pages deploy`。

**為什麼**:免費、CI 跑在 GitHub 比 Cloudflare 內建 build runner 更快也更可控。Wrangler 可在 Action 內直接部署。

**替代方案**:Netlify、Vercel — 都可,但 CF Pages 對中文用戶 CDN 命中率最佳。

### D7: 留言用 Giscus(僅 post page)

**選擇**:GitHub Discussions + Giscus,**僅嵌到 post page**、不嵌到 tag / author / index。

**為什麼**:現站沒留言系統,加上是 nice-to-have,選最零維運的方案。Disqus 有廣告與隱私問題,排除。

### D8: 搜尋用 Pagefind

**選擇**:`astro-pagefind` integration 在 build 後產生 `dist/pagefind/`,header 嵌一個搜尋框使用 `pagefind-ui.js`。Site chrome 加 `data-pagefind-ignore` 排除。

**為什麼**:純靜態、無後端、結果即時、中文 tokenization 可接受,index 體積與檢索速度皆勝 Lunr / MiniSearch。

### D9: Import 腳本架構(可獨立 idempotent 重跑)

```
scripts/
├── ghost-export.ts    # ① fetch posts/pages/tags/authors/settings/redirects → import-cache/
├── transform.ts       # ② Ghost HTML → Markdown (turndown + custom rules)
├── clean-tag-slugs.ts # ③ hex slug → Pinyin slug,輸出 src/data/tags.json + 累積 redirect
├── asset-mirror.ts    # ④ 下載所有圖片到 src/assets/
├── rewrite-refs.ts    # ⑤ Markdown 內 image URL → 本地相對路徑
└── emit-redirects.ts  # ⑥ 合併產生 public/_redirects(Cloudflare 格式)
```

每支腳本單獨 idempotent。輸出產物全部進 git。`import-cache/` 也 commit 進 repo,讓後續 transform 完全 offline。

### D10: 5 個 WP 殘留 page 的處置 — 301 而非 410

**選擇**:預設用 `301 → /`(較友善,使用者點到還能找到主站)而非 410 Gone。

**權衡**:嚴格上 410 更語義正確(該頁永久不存在),但對搜尋引擎與意外點到的人都不友善。301 到首頁是業界較常見做法。

**Open**:若用戶後來偏好 410,僅需修 `emit-redirects.ts` 的對應條目。

## Risks / Trade-offs

- **Risk**: Ghost API 在切換期間掛 → 無法 re-import → **Mitigation**: 第一次 dump 完整 raw response 到 `import-cache/` 並 commit,後續轉換離線跑
- **Risk**: 中文 tag Pinyin slug 衝突(同音不同字) → **Mitigation**: 衝突時加數字後綴(`xinqing-zhaji-2`),記在 `import-report.json`
- **Risk**: kg-card 內嵌的特殊 widget(gallery、bookmark)轉 Markdown 後排版崩 → **Mitigation**: 對少數複雜 card 退化為 inline HTML(MDX),接受該文章樣式略異;少數情況下手工修正
- **Risk**: imgur 下載被 rate limit → **Mitigation**: import 時加 delay + 3 次 retry + User-Agent header,失敗者保留原 URL 並記錄
- **Risk**: AdSense 政策可能不喜「新建站」立刻顯示廣告 → **Mitigation**: client ID 沿用、網域不變、視為同站,理論上 AdSense 不視為新站
- **Risk**: Cloudflare Pages `_redirects` 格式對複雜模式(splat、status code)的支援度不同於其他平台 → **Mitigation**: 用 splat + 明確 status code 寫法,部署後跑全 URL 檢查
- **Trade-off**: 一刀切後若靜態站某文 render 異常,只能 git revert + 修 transform 腳本,不能臨時用 Ghost 後台改 — 用戶接受此 trade-off,因為刀切完才釋放維運成本
- **Risk**: 87 個 tag 中英混合的 slug 處理一致性 → **Mitigation**: 純 ASCII 一律保留原 slug;hex 一律重生;混合(理論上不應該存在)記錄到報告人工 review

## Migration Plan

1. **Build 階段**(在新 Astro repo 內,Ghost 站持續服務):
   1. 跑 `ghost-export` 把 Content + Admin API 全部 dump 進 `import-cache/`(commit)
   2. 跑 `transform`、`clean-tag-slugs`、`asset-mirror`、`rewrite-refs`、`emit-redirects`(全部 commit)
   3. 本地 `astro dev` 逐文檢查 render
   4. `astro build` + `pagefind` → 部署到 Cloudflare Pages preview branch
2. **Cutover**:
   1. CF Pages production 設好 custom domain(先用 `*.pages.dev` 完整測試)
   2. 跑 link checker 對照 Ghost 站 sitemap,確認 200 / 301 / 410 都正確
   3. 把 `blog.bgpsekai.club` DNS 從 Ghost host 切到 Cloudflare Pages
   4. 等 DNS propagate(< 1h),抽樣再驗證一次
   5. 監看 Cloudflare Analytics 30 分鐘,沒爆 4xx/5xx 就關 Ghost
3. **回滾**:DNS 切回原 Ghost host(只要 VPS 還在),~1h 內恢復。Ghost 容器在 cutover 後保留 7 天;DB dump 保留 30 天。

## Open Questions

- ~~Giscus repo / GitHub Discussions category 用哪個現有 repo 還是新開?~~ **Resolved**:使用本 Astro repo 自己的 GitHub Discussions(該 repo push 到 GitHub 後啟用 Discussions、註冊 Giscus 拿 `data-repo-id` / `data-category-id`)
- **Blocker(§9 前)**:GA4 measurement ID(`G-XXXXXXXXXX`)— 使用者需於 Google Analytics 後台新建 GA4 屬性後提供,寫入 `PUBLIC_GA4_MEASUREMENT_ID`
- **Phase 2**:Cloudflare Web Analytics site token — 使用者在 CF dashboard 啟用後提供,寫入 `PUBLIC_CF_BEACON_TOKEN`(與 GA4 共存,當 sanity check)
- author bio 是否要顯示在 author index 與 byline?(Ghost 4 個 author 的 bio 還未檢查內容)
- 內文中的 Ghost 內部連結(`/some-other-post/`)是否要在 build 時驗證避免死連?(建議加,屬 nice-to-have)
- Pagefind 對繁中分詞效果是否足夠,還是要加自訂 stop-word / segmenter?— Phase 2 再評估
