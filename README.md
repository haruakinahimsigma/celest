# Celest

Celest is an independently written browser-style web workspace. It is not a fork or copy of Interstellar, Scramjet, or Titanium Network source code.

## Current status

**v0.1.0 — interface and navigation prototype**

- Browser-style tab strip
- Address/search bar
- Google and DuckDuckGo search selection
- Quick links for Google, DuckDuckGo, YouTube, and Instagram
- Settings dialog
- URL normalization module

The current version opens destinations in a separate browser tab. It does not intercept, tunnel, or proxy traffic.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Architecture roadmap

1. **Celest UI** — tabs, navigation, bookmarks, settings, history.
2. **Celest Core** — isolated URL parsing, navigation state, resource policy, and compatibility diagnostics.
3. **Service Worker lab** — controlled experiments on pages and origins you own or are authorized to test.
4. **Transport lab** — WebSocket protocol exercises against a local test server, not an unrestricted relay.
5. **Compatibility testing** — document which public sites work normally and which features are blocked by site policies.

## Safety and scope

Celest is intended for learning web technologies and testing systems you own or have permission to test. It will not be designed to evade school/work network rules, access controls, authentication, paywalls, or website security measures.
