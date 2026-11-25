# Portfolio

A plain HTML portfolio styled with Tailwind CSS.

## Getting started

Install dependencies, then start Tailwind's watcher:

```sh
npm install
npm run dev
```

Open `index.html` in a local web server to view the page. The watcher rebuilds
`dist/styles.css` when source files change. Run `npm run build` before
committing: GitHub Pages deploys `main` as-is, with no build step, so the
compiled `dist/styles.css` must be committed.

Colors and type come from the design tokens at the top of
`src/styles/input.css` (Figma "Primitives" and "Color" collections). Use the
role tokens (`--color-text-*`, `--color-surface-*`, `--color-border-*`) or their
utility names (`text-fg`, `bg-page`, `border-line`…), never raw hex values.

## Project structure

```text
.
├── assets/
│   ├── icons/
│   └── images/
├── dist/                 # Generated CSS (committed: GitHub Pages serves it as-is)
├── src/
│   ├── components/        # Reusable HTML snippets
│   ├── scripts/           # Browser JavaScript
│   └── styles/
│       └── input.css      # Design tokens + components (Tailwind entry point)
├── index.html                  # Home
├── about.html                  # About Me
├── texas-cultural-trust.html   # Case study
├── sure-walk.html              # Case study
├── scripts/
│   └── responsive-images.sh    # Makes 800w/1600w image copies for srcset
└── package.json
```
