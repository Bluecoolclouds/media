# AGENTS.md — Guide for AI agents and human contributors

This file is the source of truth for how to work in this repo. It is read by AI coding
agents (Claude Code, Cursor, Codex, etc.) and applies to humans too. `CLAUDE.md` points here.

## What this project is

**Open Generative AI** — a self-hosted studio for AI image/video/audio generation.
Web app (Next.js) + desktop app (Electron), talking to the MuAPI engine.

- **Stack:** Next.js 15 (App Router), React 19, Tailwind CSS, Electron 33. A separate
  Vite entry (`vite.config.mjs`, `src/`) builds the Electron renderer.
- **Monorepo:** npm workspaces. See `workspaces` in `package.json`.
- Deeper architecture notes live in `project_knowledge.md`.

## Layout

```
app/            Next.js App Router (routes, API route handlers under app/api/)
components/     Shared React components for the Next.js app
src/            Vite/Electron renderer (vanilla-JS studio, separate from app/)
electron/       Electron main process + local-inference libs
packages/       Vendored workspace packages (studio, workflow-builder, agents, design-agent)
tests/          node:test unit tests
scripts/        Build/packaging helper scripts
```

Note: `packages/*` are **vendored copies committed directly** (not git submodules).
Edit them in place. Do not re-add `.gitmodules`.

## Commands

Run from the repo root:

| Task | Command |
|------|---------|
| Install | `npm install` |
| First-time setup | `npm run setup` (install + build workspace packages) |
| Dev (web) | `npm run dev` |
| Dev (desktop) | `npm run electron:dev` |
| Build (web) | `npm run build` |
| Tests | `npm test` (runs `node --test`) |
| Lint | `npm run lint` — see caveat below |

## Golden rules for agents

1. **Verify before you claim.** After any change, run `npm test`. For UI/route changes,
   run `npm run build` and confirm it compiles. Report the actual result — if a test
   fails, say so with the output. Don't say "done" without checking.
2. **Match the surrounding code.** This repo mixes React (in `app/`, `components/`) with
   vanilla JS (in `src/`). Follow whichever style the file you're editing already uses.
   Don't introduce new libraries when an existing one does the job.
3. **Never commit secrets.** API keys live in `.env` (gitignored). Use `.env.example`
   for placeholders. The MuAPI client uses the `x-api-key` header — never log key values.
4. **Never push to `main`.** Work on a branch, open a PR. See workflow below.
5. **Keep changes scoped.** Solve the task asked. Don't refactor unrelated code or add
   speculative features in the same change.
6. **Ask before destructive or wide-blast actions** (deleting files/dirs, changing auth,
   rewriting many files, force-push). Local reversible edits: just do them.

## Git workflow (humans + agents)

`main` is protected in spirit — treat it as never-direct-push.

```bash
git checkout main && git pull
git checkout -b feat/<short-name>     # or fix/<short-name>
# ... make changes, run: npm test
git add -A
git commit -m "feat: clear message in imperative mood"
git push -u origin feat/<short-name>
# then open a Pull Request on GitHub; merge only after review
```

- One logical change per PR. Keep PR titles under ~70 chars.
- Rebase or merge `main` into your branch before opening the PR if it's behind.
- Don't amend/force-push shared branches unless you're the only one on them.

## Known caveats

- **`npm run lint` is interactive.** `next lint` prompts to scaffold an ESLint config
  because none exists yet. It will hang for an agent/CI. Either answer the prompt once to
  generate `.eslintrc`, or migrate to the flat ESLint CLI. Until then, don't rely on lint
  in automation.
- **Two frontends coexist.** `app/` (Next.js) and `src/` (Vite/Electron) are different
  apps sharing this repo. Make sure you're editing the right one for the target.
