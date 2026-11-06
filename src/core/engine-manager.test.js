import test from "node:test";
import assert from "node:assert/strict";
import { EngineManager } from "./engine-manager.js";
import { SearchManager } from "../search/search-manager.js";

test("engine manager registers, resolves, and selects supported engines", () => {
  const manager = new EngineManager();
  assert.equal(manager.supports("native-frame"), true);
  assert.equal(manager.get("missing").id, "native-frame");
  manager.register({ id: "test-engine", name: "Test", kind: "test" });
  assert.equal(manager.get("test-engine").name, "Test");
  assert.equal(manager.select("test-engine").id, "test-engine");
  assert.equal(manager.active().id, "test-engine");
  assert.throws(() => manager.select("missing"), /Unsupported browsing mode/);
});

test("search manager builds provider-specific destinations", () => {
  const manager = new SearchManager("google");
  assert.equal(manager.createSearch("hello world").url, "https://www.google.com/search?q=hello%20world");
  assert.equal(manager.createSearch("hello").mode, "external");
  manager.setProvider("duckduckgo");
  assert.equal(manager.createSearch("hello").mode, "results");
  assert.throws(() => manager.createSearch(""), /between 1 and 200/);
  assert.throws(() => manager.createSearch("x".repeat(201)), /between 1 and 200/);
});
