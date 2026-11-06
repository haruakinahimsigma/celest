import test from "node:test";
import assert from "node:assert/strict";
import { checkBackend, normalizeBackendUrl } from "./backend-diagnostics.js";

test("normalizes valid backend endpoints", () => {
  assert.equal(normalizeBackendUrl(" https://example.com/ "), "https://example.com");
  assert.equal(normalizeBackendUrl(""), "");
  assert.throws(() => normalizeBackendUrl("example.com"), /complete URL/);
  assert.throws(() => normalizeBackendUrl("ftp://example.com"), /HTTP or HTTPS/);
  assert.throws(() => normalizeBackendUrl("https://user:pass@example.com"), /embedded credentials/);
  assert.throws(() => normalizeBackendUrl("https://example.com/?token=x"), /query string/);
});

test("checks a JSON health endpoint", async () => {
  const result = await checkBackend("https://example.com", {
    fetchImpl: async url => {
      assert.equal(String(url), "https://example.com/health");
      return { ok: true, status: 200, json: async () => ({ ok: true, version: "test" }) };
    }
  });
  assert.equal(result.payload.ok, true);
});

test("reports failed health responses", async () => {
  await assert.rejects(
    checkBackend("https://example.com", { fetchImpl: async () => ({ ok: false, status: 503 }) }),
    /HTTP 503/
  );
});
