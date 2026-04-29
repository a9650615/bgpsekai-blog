## ADDED Requirements

### Requirement: Render every post and page

The system SHALL render every imported post and page as a static HTML route in the Astro build output.

#### Scenario: Post route renders
- **WHEN** the site is built and `/<post-slug>/` is requested for any of the 69 imported posts
- **THEN** the response is HTML containing the post title, body, author byline, publish date, tags, and feature image
- **AND** the page sets `<link rel="canonical">` to the live site URL

#### Scenario: Content page route renders
- **WHEN** the site is built and `/about-me/` is requested
- **THEN** the page renders with its imported title and body using the same layout as posts

### Requirement: Tag and author indexes

The system SHALL render an index page per tag with at least one post and per author with at least one post.

#### Scenario: Tag index lists posts
- **WHEN** `/tag/<slug>/` is requested for any imported tag
- **THEN** the page lists every post carrying that tag, ordered by `pubDate` descending
- **AND** the tag display name (not the slug) appears as the heading

#### Scenario: Author index lists posts
- **WHEN** `/author/<slug>/` is requested for an author with at least one published post
- **THEN** the page lists that author's posts ordered by `pubDate` descending
- **AND** authors with zero posts return HTTP 404

### Requirement: Paginated home

The system SHALL render the home and `/page/N/` paths as paginated post listings of 10 posts per page.

#### Scenario: First page
- **WHEN** `/` is requested
- **THEN** the latest 10 posts are listed in `pubDate` descending order
- **AND** a link to `/page/2/` is shown if more posts exist

#### Scenario: Subsequent pages
- **WHEN** `/page/2/`, `/page/3/`, ..., up to `/page/<last>/` is requested
- **THEN** the corresponding 10-post slice is rendered with prev/next links
- **AND** requests beyond the last page return HTTP 404

### Requirement: Casper-ish layout fidelity

The site SHALL visually approximate the existing Ghost Casper-derived theme.

#### Scenario: Post page structure
- **WHEN** a post page is rendered
- **THEN** the layout has, top-to-bottom: site header, cover image (if present), post title, byline (author + date + reading time), body content, tag chips, and an "Older / Newer" navigation footer
- **AND** the typography (heading sizes, body line-height) and accent colour `#19185d` are visually close to the Ghost site within ±5% on font size and spacing

#### Scenario: Site chrome
- **WHEN** any route is rendered
- **THEN** the page has a header with site title `柏狗屁世界`, navigation containing `首頁` and `巴哈彈幕轉 ASS`, and a footer with copyright and an RSS link

### Requirement: RSS feed

The system SHALL produce `/rss/` returning an RSS 2.0 XML feed compatible with the existing Ghost feed contract.

#### Scenario: RSS structure
- **WHEN** `/rss/` is requested
- **THEN** the response is `Content-Type: application/rss+xml`
- **AND** it contains the latest 20 posts with `title`, `link`, `pubDate`, `description`, `guid`, and one `<category>` element per tag

### Requirement: Sitemap

The system SHALL produce `/sitemap.xml` listing every post, page, tag index, and author index URL.

#### Scenario: Sitemap entries
- **WHEN** `/sitemap.xml` is fetched
- **THEN** every post URL, the two kept page URLs, every populated tag index URL, and every populated author index URL appears as a `<url>` entry
- **AND** each entry has `<lastmod>` set to the most recent `updatedDate` among its content

### Requirement: Baha danmu→ASS tool feature page

The system SHALL implement `/baha-danmu-to-ass/` as a hand-written Astro feature page (NOT a content-collection page) that ports the existing client-side tool — fetch danmaku from Bahamut Anime by SN/URL via a CORS proxy and convert it to an Aegisub ASS subtitle file.

#### Scenario: Feature page route exists
- **WHEN** `/baha-danmu-to-ass/` is requested
- **THEN** the page is served by `src/pages/baha-danmu-to-ass.astro` (or a TypeScript module under `src/pages/`)
- **AND** the page is wrapped in the same `BaseLayout` as other pages (header, footer, AdSense, CF Analytics)
- **AND** the page does NOT render Giscus comments

#### Scenario: Tool UI inputs preserved
- **WHEN** the page is loaded
- **THEN** it presents an input field for a Bahamut video URL or SN, an offset-seconds numeric input (default `0`), a "取得" button, and a status indicator

#### Scenario: Conversion behavior
- **WHEN** the user submits a valid SN
- **THEN** the page fetches danmaku via `https://corsproxy.io/?https://api.gamer.com.tw/anime/v1/danmu.php?videoSn=<sn>&geo=TW%2CHK&limit=9999`
- **AND** generates an ASS file using the existing template (PlayResX 1920, PlayResY 1080, styles `Main` / `Story` / `ED_*` / `Annotation_*` / `Staff_*` / `Draw`)
- **AND** scrolling danmaku use `\move()` and pinned danmaku use `\pos()` matching the current implementation
- **AND** the user is offered the resulting ASS as a downloadable file

#### Scenario: Implementation hygiene
- **WHEN** the feature page is built
- **THEN** the danmaku-parsing logic lives in a TypeScript module under `src/lib/baha-danmu/` with unit-testable functions (parseDanmu, generateAss, formatTime, ...)
- **AND** the inline `<script>` tag from the Ghost version is replaced by a typed module hydrated as an Astro client island
- **AND** no inline GA / amp-* references survive

### Requirement: Astro Content Collection schema

The system SHALL define a Zod schema for `posts` and `pages` collections that validates frontmatter at build time.

#### Scenario: Build fails on invalid frontmatter
- **WHEN** any Markdown file in `src/content/posts/` or `src/content/pages/` has missing required frontmatter
- **THEN** `astro build` exits non-zero with a schema validation error pointing to the offending file
