# Celest

Celest is an independently written browser-style web workspace. It is not a fork or copy of Interstellar, Scramjet, or Titanium Network source code.

## Current status

**v0.1.2 — browser-workspace foundation**

- Dark browser-style interface
- Multiple tabs with persistent session state
- Address bar and Google / DuckDuckGo search selection
- Back, forward, and reload controls for Celest's navigation history
- Local bookmarks with remove/open actions
- Keyboard shortcuts: Cmd/Ctrl+L, Cmd/Ctrl+T, Cmd/Ctrl+W
- Persistent search-engine setting
- URL normalization and HTTP(S)-only destination validation
- Node static server with a Railway health endpoint
- URL resolver tests

External destinations currently open separately because many sites disallow embedding. This release does not proxy traffic.

## Local development

```bash
npm install
npm run dev
```

## Test and build

```bash
npm test
npm run build
npm start
```

## Railway

The repository includes `railway.json`. Railway should use:

- Build: `npm install && npm run build`
- Start: `npm start`
- Health check: `/health`

The Node server serves the generated `dist/` directory and listens on Railway's `PORT` environment variable.

## Architecture roadmap

1. **Celest UI** — browser controls, tabs, history, bookmarks, settings.
2. **Celest Core** — navigation lifecycle, resource policy, and compatibility diagnostics.
3. **Service Worker lab** — controlled experiments on pages and origins you own or are authorized to test.
4. **Transport lab** — WebSocket protocol exercises against a local test server, not an unrestricted relay.
5. **Compatibility testing** — document which public sites work normally and which features are blocked by site policies.

## Safety and scope

Celest is intended for learning web technologies and testing systems you own or have permission to test. It will not be designed to evade school/work network rules, access controls, authentication, paywalls, or website security measures. Site compatibility depends on each site's own browser and embedding policies.
