import test from "node:test";
import assert from "node:assert/strict";
import { resolveAddress, isAllowedWebUrl } from "../src/engine/url.js";
import { SearchManager } from "../src/search/search-manager.js";

test("keeps valid HTTP and HTTPS URLs", () => {
  assert.equal(resolveAddress("https://example.com/path"), "https://example.com/path");
  assert.equal(resolveAddress("http://localhost:3000"), "http://localhost:3000/");
});

test("turns hostnames into canonical HTTPS URLs", () => {
  assert.equal(resolveAddress("example.com"), "https://example.com/");
});

test("uses the selected search provider for plain text", () => {
  const google = new SearchManager("google").createSearch("hello world");
  assert.deepEqual(google, {
    mode: "external",
    url: "https://www.google.com/search?q=hello%20world",
    query: "hello world"
  });

  const duckduckgo = new SearchManager("duckduckgo").createSearch("hello world");
  assert.deepEqual(duckduckgo, {
    mode: "results",
    url: "celest-search://results?q=hello%20world",
    query: "hello world"
  });
});

test("rejects blank and non-web protocols", () => {
  assert.equal(resolveAddress(""), null);
  assert.equal(isAllowedWebUrl("javascript:alert(1)"), false);
  assert.equal(isAllowedWebUrl("file:///etc/passwd"), false);
  assert.equal(isAllowedWebUrl("https://example.com"), true);
});
