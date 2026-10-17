# Portfolio

A plain HTML portfolio styled with Tailwind CSS.

## Getting started

Install dependencies, then start Tailwind's watcher:

```sh
npm install
npm run dev
```

Open `index.html` in a local web server to view the page. The watcher rebuilds
`dist/styles.css` when source files change. Create a production stylesheet with
`npm run build`.

## Project structure

```text
.
├── assets/
│   ├── icons/
│   └── images/
├── dist/                 # Generated Tailwind CSS (not committed)
├── src/
│   ├── components/        # Reusable HTML snippets
│   ├── scripts/           # Browser JavaScript
│   └── styles/
│       └── input.css      # Tailwind entry point
├── index.html                  # Home
├── about.html                  # About Me
├── texas-cultural-trust.html   # Case study
└── package.json
```
