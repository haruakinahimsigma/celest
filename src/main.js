import "./style.css";
import { resolveAddress, isAllowedWebUrl } from "./engine/url.js";

const app = document.querySelector("#app");
let tabs = [{ id: 1, title: "New tab", url: "", active: true }];
let nextId = 2;
let searchEngine = "google";

app.innerHTML = `
  <div class="shell">
    <aside class="rail">
      <div class="brand-mark">C</div>
      <button class="rail-btn active" title="Home" data-action="home">⌂</button>
      <button class="rail-btn" title="Bookmarks" data-action="bookmarks">☆</button>
      <div class="rail-spacer"></div>
      <button class="rail-btn" title="Settings" data-action="settings">⚙</button>
    </aside>
    <main class="workspace">
      <header class="topbar">
        <div class="tabs" id="tabs"></div>
        <button class="new-tab" data-action="new-tab" aria-label="New tab">+</button>
      </header>
      <section class="toolbar">
        <button class="tool-btn" data-action="back" title="Back">←</button>
        <button class="tool-btn" data-action="forward" title="Forward">→</button>
        <button class="tool-btn" data-action="reload" title="Reload">↻</button>
        <form id="address-form" class="address-form">
          <span class="lock">⌕</span>
          <input id="address" autocomplete="off" spellcheck="false" placeholder="Search or enter an address" />
          <button type="submit">Go</button>
        </form>
      </section>
      <section class="view" id="view">
        <div class="welcome">
          <div class="orb"></div>
          <p class="eyebrow">YOUR WEB WORKSPACE</p>
          <h1>Explore with <span>Celest.</span></h1>
          <p class="sub">A clean, keyboard-friendly browser workspace.</p>
          <form id="hero-form" class="hero-search">
            <input id="hero-address" autocomplete="off" placeholder="Search the web or enter a URL" />
            <button type="submit">Explore</button>
          </form>
          <div class="quick-links">
            <button data-go="https://www.google.com">Google</button>
            <button data-go="https://duckduckgo.com">DuckDuckGo</button>
            <button data-go="https://www.youtube.com">YouTube</button>
            <button data-go="https://www.instagram.com">Instagram</button>
          </div>
          <p class="notice">Celest is currently a UI and navigation prototype. It does not proxy traffic or bypass website/network access controls.</p>
        </div>
      </section>
      <footer><span>CELEST</span><span id="status">Engine shell · v0.1.0</span></footer>
    </main>
  </div>
  <dialog id="settings-dialog">
    <form method="dialog" class="dialog-head"><h2>Settings</h2><button class="tool-btn">✕</button></form>
    <label>Search engine
      <select id="search-engine">
        <option value="google">Google</option>
        <option value="duckduckgo">DuckDuckGo</option>
      </select>
    </label>
    <p class="dialog-note">More engine and appearance settings will be added as Celest develops.</p>
  </dialog>
`;

const tabsEl = document.querySelector("#tabs");
const view = document.querySelector("#view");
const address = document.querySelector("#address");

function activeTab() { return tabs.find(tab => tab.active); }

function renderTabs() {
  tabsEl.innerHTML = tabs.map(tab => `
    <button class="tab ${tab.active ? "selected" : ""}" data-tab="${tab.id}">
      <span class="tab-dot"></span><span class="tab-title">${escapeHtml(tab.title)}</span>
      <span class="tab-close" data-close="${tab.id}">×</span>
    </button>`).join("");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  })[char]);
}

function navigate(raw) {
  const url = resolveAddress(raw, searchEngine);
  if (!url || !isAllowedWebUrl(url)) {
    document.querySelector("#status").textContent = "That address could not be opened";
    return;
  }
  const tab = activeTab();
  tab.url = url;
  tab.title = new URL(url).hostname.replace(/^www\./, "");
  address.value = url;
  renderTabs();
  view.innerHTML = `
    <div class="external-state">
      <div class="external-icon">↗</div>
      <p class="eyebrow">NAVIGATION PREVIEW</p>
      <h2>${escapeHtml(tab.title)}</h2>
      <p>Celest's navigation shell is ready. Full embedded rendering requires a site-permitted integration.</p>
      <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">Open this site in a new tab ↗</a>
      <code>${escapeHtml(url)}</code>
    </div>`;
  document.querySelector("#status").textContent = "Ready";
}

function addTab() {
  tabs.forEach(tab => tab.active = false);
  tabs.push({ id: nextId++, title: "New tab", url: "", active: true });
  address.value = "";
  showHome();
  renderTabs();
}

function showHome() {
  view.innerHTML = `
    <div class="welcome">
      <div class="orb"></div><p class="eyebrow">YOUR WEB WORKSPACE</p>
      <h1>Explore with <span>Celest.</span></h1>
      <p class="sub">A clean, keyboard-friendly browser workspace.</p>
      <form id="hero-form" class="hero-search">
        <input id="hero-address" autocomplete="off" placeholder="Search the web or enter a URL" />
        <button type="submit">Explore</button>
      </form>
      <div class="quick-links">
        <button data-go="https://www.google.com">Google</button>
        <button data-go="https://duckduckgo.com">DuckDuckGo</button>
        <button data-go="https://www.youtube.com">YouTube</button>
        <button data-go="https://www.instagram.com">Instagram</button>
      </div>
      <p class="notice">Celest is currently a UI and navigation prototype. It does not proxy traffic or bypass website/network access controls.</p>
    </div>`;
  address.value = "";
  document.querySelector("#status").textContent = "New tab";
}

document.addEventListener("submit", event => {
  if (event.target.id === "address-form") {
    event.preventDefault();
    navigate(address.value);
  }
  if (event.target.id === "hero-form") {
    event.preventDefault();
    navigate(document.querySelector("#hero-address").value);
  }
});

document.addEventListener("click", event => {
  const go = event.target.closest("[data-go]");
  if (go) return navigate(go.dataset.go);

  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "new-tab") return addTab();
  if (action === "home") return showHome();
  if (action === "settings") return document.querySelector("#settings-dialog").showModal();
  if (action === "reload") {
    const tab = activeTab();
    if (tab?.url) navigate(tab.url);
    return;
  }
  if (action === "back" || action === "forward") {
    document.querySelector("#status").textContent = "History controls are not connected yet";
    return;
  }

  const closeId = event.target.closest("[data-close]")?.dataset.close;
  if (closeId) {
    event.stopPropagation();
    tabs = tabs.filter(tab => tab.id !== Number(closeId));
    if (!tabs.length) return addTab();
    if (!tabs.some(tab => tab.active)) tabs[tabs.length - 1].active = true;
    renderTabs();
    return;
  }

  const tabId = event.target.closest("[data-tab]")?.dataset.tab;
  if (tabId) {
    tabs.forEach(tab => tab.active = tab.id === Number(tabId));
    const tab = activeTab();
    renderTabs();
    if (tab.url) navigate(tab.url); else showHome();
  }
});

document.querySelector("#search-engine").addEventListener("change", event => {
  searchEngine = event.target.value;
});
renderTabs();