## ADDED Requirements

### Requirement: URL preservation

The site SHALL serve every URL the live Ghost site currently serves at the same path, except where this proposal specifies a redirect or removal.

#### Scenario: Post URLs unchanged
- **WHEN** any of the 69 imported posts is requested at its existing `/<slug>/` URL
- **THEN** the path resolves to the new Astro page with HTTP 200

#### Scenario: Tag URL with new slug serves content
- **WHEN** a tag with a renamed slug is requested at `/tag/<new-slug>/`
- **THEN** the response is HTTP 200 with that tag's posts

#### Scenario: Author URLs unchanged
- **WHEN** `/author/<slug>/` is requested for any author who has at least one post
- **THEN** the response is HTTP 200

### Requirement: Redirects for renamed paths

The site SHALL apply HTTP 301 redirects for all renamed URLs and any other transitional paths declared in `redirects.json`, served via Cloudflare Pages `_redirects` file.

#### Scenario: Renamed tag slug
- **WHEN** an old hex-encoded tag URL like `/tag/e5-bf-83-e6-83-85-e6-9c-ad-e8-a8-98/` is requested
- **THEN** the response is HTTP 301 to `/tag/<new-clean-slug>/`

#### Scenario: WordPress residue paths
- **WHEN** any of `/sample-page/`, `/pie-register-forgot-password/`, `/pie-register-profile/`, `/registration/`, `/login-post/` is requested
- **THEN** the response is HTTP 301 to `/`
- **AND** the entry is recorded in `redirects.json` with `status: 301`

#### Scenario: Ghost-only internal paths
- **WHEN** Ghost-internal paths such as `/ghost`, `/ghost/*`, `/p/*`, `/email/*`, `/members/*` are requested
- **THEN** the response is HTTP 410 Gone

### Requirement: AdSense injection

The site SHALL inject the existing AdSense client `ca-pub-9488921689181013` script into the base layout `<head>` of every page.

#### Scenario: Script presence
- **WHEN** any rendered page is inspected
- **THEN** its `<head>` contains a `<script>` tag loading `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9488921689181013` with `async` and `crossorigin="anonymous"`

#### Scenario: AMP integration removed
- **WHEN** the migrated site is inspected
- **THEN** no `<amp-*>` element and no script from `cdn.ampproject.org` is present (the AMP integration is dropped along with Ghost)

### Requirement: GA4 analytics

The site SHALL include a Google Analytics 4 measurement tag (`gtag.js`) configured with a measurement ID supplied via the `PUBLIC_GA4_MEASUREMENT_ID` environment variable, and SHALL NOT include Google Analytics Universal.

#### Scenario: GA4 tag present
- **WHEN** a page loads in a browser
- **THEN** the `<head>` contains `<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>`
- **AND** an inline `<script>` block defines `dataLayer`, declares `gtag`, calls `gtag('js', new Date())` and `gtag('config', 'G-XXXXXXXXXX')`
- **AND** `G-XXXXXXXXXX` matches the value of `PUBLIC_GA4_MEASUREMENT_ID` at build time

#### Scenario: GA Universal absent
- **WHEN** any page is inspected
- **THEN** no `gtag('config', 'UA-51767762-4')` call is present anywhere in the build output
- **AND** no script source references `googletagmanager.com/gtag/js?id=UA-`

#### Scenario: Build fails on missing GA4 ID
- **WHEN** `astro build` runs without `PUBLIC_GA4_MEASUREMENT_ID` set (or set to an empty / placeholder value)
- **THEN** the build exits non-zero with a clear error message naming the missing variable

### Requirement: Cloudflare Web Analytics (Phase 2)

The site SHALL be capable of additionally serving the Cloudflare Web Analytics beacon alongside GA4 once the `PUBLIC_CF_BEACON_TOKEN` environment variable is provided. This is a Phase 2 requirement and MAY be deferred until after the initial cutover.

#### Scenario: CF beacon coexists with GA4
- **WHEN** `PUBLIC_CF_BEACON_TOKEN` is set at build time and Phase 2 is active
- **THEN** every page contains both the GA4 `gtag.js` tag and `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"..."}'></script>`
- **AND** neither tag blocks the other

#### Scenario: CF beacon absent before Phase 2
- **WHEN** `PUBLIC_CF_BEACON_TOKEN` is unset
- **THEN** no `static.cloudflareinsights.com` reference appears in the build output
- **AND** the build still succeeds (Phase 2 token is optional)

### Requirement: Giscus comments on posts only

The system SHALL embed a Giscus comment thread on every post page, configured against a designated GitHub repository with Discussions enabled.

#### Scenario: Comments embed loaded on posts
- **WHEN** a post page is rendered
- **THEN** the page contains the Giscus `<script src="https://giscus.app/client.js">` configured with `data-repo`, `data-repo-id`, `data-category`, `data-category-id`, `data-mapping="pathname"`, and `data-theme` set for light/dark auto

#### Scenario: Comments hidden elsewhere
- **WHEN** the home, a tag index, an author index, an `/about-me/` page, or `/baha-danmu-to-ass/` is rendered
- **THEN** no Giscus script is included on that page

### Requirement: Pagefind site search

The site SHALL ship a build-time Pagefind index covering every post and page, accessible from the site header.

#### Scenario: Index built
- **WHEN** the production build completes
- **THEN** the directory `dist/pagefind/` exists with at minimum `pagefind.js`, `pagefind-ui.js`, and `pagefind-entry.json`

#### Scenario: Search UI works
- **WHEN** a user types a query into the header search box on any page
- **THEN** matching posts appear in a dropdown showing title and a snippet of matching context
- **AND** clicking a result navigates to that post

#### Scenario: Search excludes site chrome
- **WHEN** the index is built
- **THEN** elements with `data-pagefind-ignore` (header navigation, footer, comment widgets) do not appear in search snippets
