## ADDED Requirements

### Requirement: Import Ghost posts as Markdown

The system SHALL fetch all 69 posts from the Ghost Content API and convert each to a Markdown file with YAML frontmatter compatible with the Astro Content Collection schema.

#### Scenario: Successful import of all posts
- **WHEN** the import script runs against the configured Ghost API
- **THEN** the script writes one Markdown file per post under `src/content/posts/<slug>.md`
- **AND** each file contains frontmatter fields: `title`, `slug`, `pubDate`, `updatedDate`, `author`, `tags`, `featureImage`, `excerpt`, `canonicalUrl`, `metaTitle`, `metaDescription`
- **AND** the post body is converted from Ghost HTML to Markdown using a deterministic transformer

#### Scenario: Posts with Ghost kg-* cards
- **WHEN** a post body contains `kg-card` elements (image card, gallery, bookmark, embed)
- **THEN** the importer maps each card type to either standard Markdown or inline HTML acceptable to MDX
- **AND** no `kg-*` class names remain in the output Markdown body

#### Scenario: Idempotent re-run
- **WHEN** the import script runs a second time with no source content changes
- **THEN** it produces byte-identical Markdown files (excluding mtimes)

### Requirement: Import only `/about-me/` as a content page

The system SHALL import only `/about-me/` as an Astro Content Collection page. It SHALL NOT import the five WordPress-residue pages, and it SHALL NOT import `/baha-danmu-to-ass/` as content (that page is implemented as a hand-written feature page; see `blog-rendering`).

#### Scenario: WordPress residue pages skipped
- **WHEN** the importer encounters a page with slug `sample-page`, `pie-register-forgot-password`, `pie-register-profile`, `registration`, or `login-post`
- **THEN** the importer logs the skip and emits no file for that page

#### Scenario: Tool page skipped from content import
- **WHEN** the importer encounters the page with slug `baha-danmu-to-ass`
- **THEN** the importer logs that this page is reserved for a feature-page implementation
- **AND** emits no file under `src/content/pages/`

#### Scenario: about-me page emits Markdown
- **WHEN** the importer processes the page `about-me`
- **THEN** it writes `src/content/pages/about-me.md` with the same frontmatter shape as posts

### Requirement: Tag slug cleanup

The system SHALL produce a canonical tag list where Ghost hex-encoded slugs are replaced with romanized slugs, while preserving the original Ghost slug as a redirect source.

#### Scenario: Hex-encoded tag slug is cleaned
- **WHEN** the importer encounters a Ghost tag slug matching `^([a-f0-9]{2}-)+[a-f0-9]{2}$`
- **THEN** the importer derives a new slug from the tag name using Hanyu Pinyin (no tones, lowercase, hyphenated)
- **AND** records `{ from: <old-slug>, to: <new-slug> }` in the redirect manifest

#### Scenario: ASCII tag slug is preserved
- **WHEN** a tag slug is already plain ASCII (e.g. `tutorial`, `nodejs`, `webpack`)
- **THEN** the importer reuses the original slug verbatim

#### Scenario: Slug collision after cleanup
- **WHEN** two distinct tags would produce the same cleaned slug
- **THEN** the second one receives a numeric suffix (`-2`, `-3`, ...) and the collision is recorded in `import-report.json`

### Requirement: Mirror all image assets locally

The system SHALL download every distinct image referenced by `feature_image` or `<img src>` in any imported post or page, store it under `src/assets/`, and rewrite the source reference to the local copy.

#### Scenario: Local Ghost-hosted image
- **WHEN** an image URL matches `https://blog.bgpsekai.club/content/images/...`
- **THEN** the file is downloaded preserving its directory structure under `src/assets/blog/`
- **AND** the reference in the Markdown body is rewritten to the local path

#### Scenario: External image (imgur, ddns, etc.)
- **WHEN** an image URL points to `i.imgur.com`, `imgur.com`, `bgpsekai.thisistap.com`, `birdyo.ddns.net`, `images.unsplash.com`, `farm9.staticflickr.com`, or any non-Ghost host
- **THEN** the importer downloads the image into `src/assets/external/<host>/<sha1[:12]>.<ext>`
- **AND** rewrites the reference to the local path

#### Scenario: Failed external download
- **WHEN** an external image returns non-2xx after three retries
- **THEN** the importer leaves the original URL in place, writes an entry to `import-report.json#failed_assets`
- **AND** the build does not fail

#### Scenario: Idempotent asset mirror
- **WHEN** an image already exists at the target local path with matching size
- **THEN** the downloader skips it without re-fetching

### Requirement: Generate redirect manifest

The system SHALL emit `redirects.json` capturing every URL whose path or slug changes between Ghost and Astro.

#### Scenario: Redirect manifest format
- **WHEN** the import pipeline completes
- **THEN** `redirects.json` exists at the project root with entries `{ from: string, to: string, status: 301 | 410 }`
- **AND** entries cover renamed tag slugs, removed WordPress pages, and any path that does not exist on the target site

### Requirement: Ghost API snapshot is committed

The system SHALL commit raw Ghost API responses into the repository so that the transform pipeline can run offline against a frozen source.

#### Scenario: Snapshot files exist after first run
- **WHEN** `ghost-export` completes successfully
- **THEN** the directory `import-cache/` contains at minimum `posts.json`, `pages.json`, `tags.json`, `authors.json`, `settings.json`, and `redirects-source.json`
- **AND** these files are tracked in git
