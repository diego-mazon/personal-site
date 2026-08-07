# personal-site

David Mazon's personal site: a portfolio landing page, a Markdown-based blog,
and a page of interactive demos. Built with [Astro](https://astro.build), no
backend or database — everything is prerendered to static files.

## Structure

```text
/
├── public/                      # static assets (favicon, etc.)
├── src/
│   ├── components/
│   │   └── demos/               # .jsx React components, hydrated client-side
│   │       ├── Counter.jsx
│   │       └── ColorMixer.jsx
│   ├── content/
│   │   └── blog/                # Markdown blog posts
│   ├── content.config.ts        # blog collection schema
│   ├── layouts/
│   │   └── BaseLayout.astro     # shared head/nav/footer
│   ├── pages/
│   │   ├── index.astro          # portfolio landing page
│   │   ├── demos.astro          # interactive demos page
│   │   └── blog/
│   │       ├── index.astro      # post listing
│   │       └── [slug].astro     # individual post
│   └── styles/
│       └── global.css
├── astro.config.mjs
└── .github/workflows/deploy.yml # builds + deploys to GitHub Pages on push to main
```

## Commands

Run from the project root:

| Command             | Action                                        |
| :------------------- | :--------------------------------------------- |
| `npm install`         | Install dependencies                          |
| `npm run dev`         | Start local dev server at `localhost:4321`    |
| `npm run build`       | Build the static site to `./dist/`            |
| `npm run preview`     | Preview the production build locally          |

## Adding a blog post

Add a new Markdown file under `src/content/blog/`, e.g.
`src/content/blog/my-post.md`:

```md
---
title: "My Post"
description: "One-line summary."
pubDate: 2026-08-01
tags: ["notes"]
---

Body content in Markdown.
```

It'll appear automatically on `/blog`, sorted by `pubDate`.

## Adding an interactive demo

Drop a new `.jsx` component in `src/components/demos/`, then import and
render it in `src/pages/demos.astro` with a `client:*` directive (e.g.
`client:load` or `client:visible`) so it hydrates in the browser.

## Deployment

This repo deploys to GitHub Pages via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml),
which runs on every push to `main`. In the repo's Settings → Pages, set
**Source** to "GitHub Actions".

The site is configured as a **project page**:

- `site: 'https://dmazon.github.io'`
- `base: '/personal-site'`

If you rename the repo, or want a user/root page (`dmazon.github.io`)
instead, update both values in [`astro.config.mjs`](astro.config.mjs) —
for a root page, drop `base` entirely.
