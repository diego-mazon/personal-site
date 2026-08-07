## Project context

This is Diego Mazon's personal site: portfolio, blog, and interactive demos.
Diego is a data scientist (physics PhD background) working in causal inference,
experimental design, and quantitative methodology. Site content should reflect
that — not generic placeholder text.

- **Blog posts are sourced from Diego's own reference documents**, maintained
  separately in a Claude.ai Project (causal inference design references,
  Bayesian/frequentist notes, etc.), not written fresh by an agent. If asked
  to add a post and no source content is provided, ask Diego for the source
  material rather than drafting new technical content from scratch.
- **The `demos` page currently embeds `CausalDecisionTree.jsx`**, a real
  artifact built and iterated on separately (mirrored in the Claude.ai
  Project as `causal_decision_tree.jsx`). Treat components under
  `src/components/demos/` as artifacts to sync from that source, not to
  rewrite locally — check with Diego before modifying their content.
- **Tailwind (`@tailwindcss/vite`) is intentionally scoped to `demos.astro`
  only**, via `src/styles/tailwind-utilities.css`, and deliberately imports
  only the `theme` and `utilities` layers (no `base`/preflight). This is so
  Tailwind utility classes work for demo components without resetting styles
  on the rest of the site, which uses its own hand-written `global.css`. Keep
  this scoping if adding more Tailwind-based demos — don't import Tailwind
  globally in `BaseLayout.astro` without discussing the tradeoff first.
- `package-lock.json` was removed after a manual `package.json` edit (no
  reliable npm registry access at edit time) — run `npm install` once to
  regenerate and commit it for reproducible builds.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
