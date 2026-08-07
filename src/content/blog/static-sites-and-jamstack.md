---
title: "Why static, in 2026"
description: "The case for a boring, static personal site."
pubDate: 2026-07-20
tags: ["astro", "notes"]
---

No backend, no database, no server to patch. A static site is just files: HTML,
CSS, JS, prerendered at build time and served from a CDN.

For a personal site — portfolio, blog, a handful of demos — that's the whole
job. Astro fits well here:

1. Pages are plain `.astro` or `.md` files by default, so most of the site
   ships **zero** client-side JavaScript.
2. Where interactivity is actually needed — like the demos on this site — a
   framework component (React, in this case) can be dropped in and hydrated
   only where it's used.
3. The output is static files, which deploy to GitHub Pages without any
   custom infrastructure.

The [demos page](/personal-site/demos) has a couple of small React components
as an example of that second point.
