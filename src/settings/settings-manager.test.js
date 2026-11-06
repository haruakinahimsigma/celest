import test from "node:test";
import assert from "node:assert/strict";
import { SettingsManager } from "./settings-manager.js";

function installStorage() {
  const values = new Map();
  globalThis.localStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value))
  };
  return values;
}

test("settings persist valid preferences", () => {
  const values = installStorage();
  const settings = new SettingsManager();
  settings.set("searchEngine", "google");
  settings.set("engine", "same-origin-lab");
  assert.equal(JSON.parse(values.get("celest-settings-v2")).searchEngine, "google");
  assert.equal(new SettingsManager().get("engine"), "same-origin-lab");
});

test("settings reject unknown keys and invalid selections", () => {
  installStorage();
  const settings = new SettingsManager();
  assert.throws(() => settings.set("engine", "unknown"), /Unsupported browsing mode/);
  assert.throws(() => settings.set("searchEngine", "unknown"), /Unsupported search provider/);
  assert.throws(() => settings.set("notASetting", true), /Unknown setting/);
});
