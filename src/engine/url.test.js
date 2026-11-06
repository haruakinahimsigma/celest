import test from "node:test";
import assert from "node:assert/strict";
import { isLikelyUrl, resolveAddress, isAllowedWebUrl } from "./url.js";

test("recognizes ordinary domains and local development addresses", () => {
  assert.equal(isLikelyUrl("example.com"), true);
  assert.equal(isLikelyUrl("example.com:8080/path"), true);
  assert.equal(isLikelyUrl("localhost:5173"), true);
  assert.equal(isLikelyUrl("127.0.0.1:3000"), true);
});

test("keeps search phrases out of URL navigation", () => {
  assert.equal(isLikelyUrl("hello world"), false);
  assert.equal(resolveAddress("hello world"), null);
});

test("normalizes bare hostnames to HTTPS", () => {
  assert.equal(resolveAddress("example.com"), "https://example.com/");
  assert.equal(resolveAddress("http://example.com/path"), "http://example.com/path");
});

test("rejects unsupported protocols and credential-bearing URLs", () => {
  assert.equal(resolveAddress("javascript:alert(1)"), null);
  assert.equal(isAllowedWebUrl("javascript:alert(1)"), false);
  assert.equal(isAllowedWebUrl("https://user:pass@example.com"), false);
});
