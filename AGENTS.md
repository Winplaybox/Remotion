# Notes for AI agents

- Making a new video format/channel? Read `docs/NEW_ENGINE.md` first and scaffold with `node scripts/new-engine.mjs <slug> <PascalName>`.
- How videos get published (voice → render → upload): `docs/CHANNELS.md`.
- Never change a post that is already published; never push to `main`; open a PR.
- Checks: `npx tsc --noEmit && npm run lint && npm test`.
