import test from "node:test";
import assert from "node:assert/strict";
import { resolveAddress, isAllowedWebUrl } from "../src/engine/url.js";

test("keeps valid HTTP and HTTPS URLs", () => {
  assert.equal(resolveAddress("https://example.com/path"), "https://example.com/path");
  assert.equal(resolveAddress("http://localhost:3000"), "http://localhost:3000/");
});

test("turns hostnames into HTTPS URLs", () => {
  assert.equal(resolveAddress("example.com"), "https://example.com");
});

test("uses the selected search engine for plain text", () => {
  assert.equal(resolveAddress("hello world", "google"), "https://www.google.com/search?q=hello%20world");
  assert.equal(resolveAddress("hello world", "duckduckgo"), "https://duckduckgo.com/?q=hello%20world");
});

test("rejects blank and non-web protocols", () => {
  assert.equal(resolveAddress(""), null);
  assert.equal(isAllowedWebUrl("javascript:alert(1)"), false);
  assert.equal(isAllowedWebUrl("file:///etc/passwd"), false);
  assert.equal(isAllowedWebUrl("https://example.com"), true);
});