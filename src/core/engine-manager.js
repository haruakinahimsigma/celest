export class EngineManager {
  constructor() {
    this.engines = new Map();
    this.register({ id: "native-frame", name: "Native browser frame", description: "Standard HTTP(S) navigation in an embedded frame when the site permits it.", kind: "frame" });
    this.register({ id: "same-origin-lab", name: "Same-origin lab", description: "Controlled Celest-owned Service Worker test environment.", kind: "lab" });
  }

  register(engine) {
    if (!engine || !/^[a-z0-9-]+$/.test(engine.id || "") || !engine.name || !engine.kind) {
      throw new TypeError("An engine needs a valid id, name, and kind.");
    }
    this.engines.set(engine.id, Object.freeze({ ...engine }));
    return this;
  }

  list() { return [...this.engines.values()]; }
  get(id) { return this.engines.get(id) || this.engines.get("native-frame"); }
  supports(id) { return this.engines.has(id); }
}
