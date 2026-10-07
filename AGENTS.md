# Instructions for AI coding agents

Building or editing a calculator tool? Read **[docs/BUILDING-TOOLS.md](docs/BUILDING-TOOLS.md)** first and follow it exactly.

Site names: the only site today is **Home & Yard Calcs** (display name). Its slug, folder, and Worker stay `home-project-calcs` / `sites/home-project-calcs/` / `tools-home-project-calcs`. Use the display name in visible copy; never rename the slug or paths.

Top 5 rules:
1. Change files **only** inside `sites/<site-slug>/tools/<tool-slug>/`. Start it with `npm run new-tool -- --site <site-slug> --tool <tool-slug>`.
2. Never touch `packages/`, the site's `src/` (layouts, pages, config), `tools/_template/`, root or site `package.json`/`package-lock.json`, `.github/`, `scripts/`, `wrangler.jsonc`, `astro.config.mjs`, `robots.txt`, `ads.txt`, or any ad/consent code. Never add secrets.
3. Don't install packages; list any needed dependency in the tool's `HANDOFF.md`. No external scripts, fonts, analytics, network calls, or storage.
4. `logic.js` is pure and tested: at least 3 known-answer cases plus edge cases (zero, negative, very large, empty, non-numeric, boundaries). `npm ci`, `npm test`, and `npm run build` must pass.
5. No deploys, no pushes, no pull requests. Hand back a zip of only the tool folder with a filled-in `HANDOFF.md`.

Calculator data and assumptions (defaults, formulas, code editions, rounding, waste factors): decide them yourself from the industry standard or the most sensible option, and record each choice with its source link under "Decisions made" in `HANDOFF.md`. Only product, UX, and scope questions go to Matthew. See [docs/BUILDING-TOOLS.md](docs/BUILDING-TOOLS.md) section 5.
