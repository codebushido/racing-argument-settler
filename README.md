# Multiplayer Code Race (first playable)

Monorepo for a 2-player programming race game.

## Stack

- Client: React + TypeScript + Vite + Phaser
- Server: Node.js + TypeScript + Colyseus
- Shared: common types/constants/AST
- Package manager: pnpm

## Structure

- `apps/client` — UI, room join, code editor, Phaser maze rendering
- `apps/server` — Colyseus room, parser, maze generation, interpreter, rules
- `packages/shared` — shared types, instructions, constants

## Run

```bash
pnpm install
pnpm --filter @race/server dev
pnpm --filter @race/client dev
```

Then open two browser tabs at the client URL and join the same room ID (default: `default`).

## Program DSL

Supported instructions (one per line):

- `MOVE`
- `LEFT`
- `RIGHT`
- `WAIT`
- `HOP`
- `IF AHEAD_IS_WALL THEN RIGHT`

## Tests

```bash
pnpm --filter @race/server test
```
