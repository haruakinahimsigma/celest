import "./style.css";
import { resolveAddress, isLikelyUrl, isAllowedWebUrl } from "./engine/url.js";

const STORAGE_KEY = "celest-state-v1";
const app = document.querySelector("#app");
const defaults = { tabs: [{ id: 1, title: "New tab", url: "", history: [], index: -1, active: true }], bookmarks: [], searchEngine: "duckduckgo", nextId: 2 };
let state = loadState();

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.tabs) && saved.tabs.length) {
      return { ...defaults, ...saved, searchEngine: "duckduckgo", tabs: saved.tabs, bookmarks: Array.isArray(saved.bookmarks) ? saved.bookmarks : [] };
    }
  } catch {}
  return structuredClone(defaults);
}
function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}
function activeTab() { return state.tabs.find(tab => tab.active) || state.tabs[0]; }
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[char]);
}

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
    <header class="topbar"><div class="tabs" id="tabs"></div><button class="new-tab" data-action="new-tab" aria-label="New tab">+</button></header>
    <section class="toolbar">
      <button class="tool-btn" data-action="back" title="Back">←</button>
      <button class="tool-btn" data-action="forward" title="Forward">→</button>
      <button class="tool-btn" data-action="reload" title="Reload">↻</button>
      <form id="address-form" class="address-form"><span class="lock">⌕</span><input id="address" autocomplete="off" spellcheck="false" placeholder="Search or enter an address" /><button type="submit">Go</button></form>
      <button class="tool-btn" data-action="bookmark" title="Bookmark this page">☆</button>
    </section>
    <section class="view" id="view"></section>
    <footer><span>CELEST</span><span id="status">Engine lab · v0.2.0</span></footer>
  </main>
</div>
<dialog id="settings-dialog">
  <form method="dialog" class="dialog-head"><h2>Settings</h2><button class="tool-btn">✕</button></form>
  <label>Search engine<select id="search-engine"><option value="duckduckgo">DuckDuckGo</option></select></label>
  <p class="dialog-note">Settings are saved on this device.</p>
</dialog>
<dialog id="bookmarks-dialog">
  <form method="dialog" class="dialog-head"><h2>Bookmarks</h2><button class="tool-btn">✕</button></form>
  <div id="bookmark-list" class="bookmark-list"></div>
</dialog>`;

const tabsEl = document.querySelector("#tabs");
const view = document.querySelector("#view");
const address = document.querySelector("#address");
const status = document.querySelector("#status");
const settingsDialog = document.querySelector("#settings-dialog");
const bookmarksDialog = document.querySelector("#bookmarks-dialog");
document.querySelector("#search-engine").value = state.searchEngine;

function renderTabs() {
  tabsEl.innerHTML = state.tabs.map(tab => `
    <button class="tab ${tab.active ? "selected" : ""}" data-tab="${tab.id}">
      <span class="tab-dot"></span><span class="tab-title">${escapeHtml(tab.title)}</span><span class="tab-close" data-close="${tab.id}">×</span>
    </button>`).join("");
}
function renderHome() {
  view.innerHTML = `
    <div class="welcome"><div class="orb"></div><p class="eyebrow">YOUR WEB WORKSPACE</p>
    <h1>Explore with <span>Celest.</span></h1><p class="sub">A clean, keyboard-friendly browser workspace.</p>
    <form id="hero-form" class="hero-search"><input id="hero-address" autocomplete="off" placeholder="Search the web or enter a URL" /><button type="submit">Explore</button></form>
    <div class="quick-links"><button data-go="https://www.google.com">Google</button><button data-go="https://duckduckgo.com">DuckDuckGo</button><button data-go="https://www.youtube.com">YouTube</button><button data-go="https://www.instagram.com">Instagram</button><button data-go="/__celest_lab__/">Celest Lab</button></div>
    <p class="notice">Celest is an early browser-workspace prototype. Some websites block embedded viewing through their own security policies.</p></div>`;
}

async function renderSearchResults(query, searchStateUrl) {
  view.innerHTML = `<div class="search-page"><p class="eyebrow">CELEST SEARCH</p><h2>Searching the web</h2><p class="search-query">${escapeHtml(query)}</p><p class="search-message">Fetching results…</p></div>`;
  status.textContent = "Searching";
  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { headers: { accept: "application/json" } });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Search request failed");
    if (activeTab().url !== searchStateUrl) return;
    const results = Array.isArray(payload.results) ? payload.results : [];
    view.innerHTML = `
      <div class="search-page">
        <p class="eyebrow">CELEST SEARCH · DUCKDUCKGO</p>
        <h2>Results</h2>
        <p class="search-query">${escapeHtml(query)}</p>
        ${results.length ? `<div class="search-results">${results.map((item, index) => `
          <article class="search-result">
            <p class="result-domain">${escapeHtml(new URL(item.url).hostname)}</p>
            <button class="result-title" data-result-url="${escapeHtml(item.url)}">${escapeHtml(item.title || item.url)}</button>
            <p class="result-snippet">${escapeHtml(item.snippet || "")}</p>
          </article>`).join("")}</div>` : '<p class="search-message">No results were returned. Try a different query.</p>'}
      </div>`;
    status.textContent = `${results.length} search results`;
  } catch (error) {
    if (activeTab().url !== searchStateUrl) return;
    view.innerHTML = `<div class="search-page"><p class="eyebrow">CELEST SEARCH</p><h2>Search unavailable</h2><p class="search-query">${escapeHtml(query)}</p><p class="search-message">${escapeHtml(error.message || "The search provider could not be reached.")}</p></div>`;
    status.textContent = "Search failed";
  }
}

function renderCurrent() {
  const tab = activeTab();
  if (!tab.url) { renderHome(); address.value = ""; status.textContent = "New tab"; return; }
  if (tab.url.startsWith("celest-search://")) {
    const query = new URL(tab.url).searchParams.get("q") || "";
    address.value = query;
    renderSearchResults(query, tab.url);
    return;
  }
  address.value = tab.url;
  const destination = new URL(tab.url, location.origin);
  const isCelestOrigin = destination.origin === location.origin;
  const sandbox = isCelestOrigin
    ? "allow-scripts allow-forms allow-same-origin"
    : "allow-scripts allow-forms allow-same-origin allow-popups";
  view.innerHTML = `<div class="page-frame"><iframe class="site-frame" title="${escapeHtml(tab.title)}" src="${escapeHtml(destination.href)}" sandbox="${sandbox}" referrerpolicy="strict-origin-when-cross-origin" allow="fullscreen; autoplay; clipboard-read; clipboard-write"></iframe><div class="frame-hint" id="frame-hint">Loading inside Celest. If this site refuses embedding, its security policy is blocking the frame.</div></div>`;
  status.textContent = "Loading inside Celest";
  const frame = view.querySelector("iframe");
  frame.addEventListener("load", () => {
    status.textContent = "Frame loaded · site policy may still block content";
  }, { once: true });
}
function render() { renderTabs(); renderCurrent(); persist(); }

function navigate(raw, { replace = false } = {}) {
  const value = String(raw ?? "").trim();
  if (!value) { status.textContent = "Enter a search or web address"; return; }
  const tab = activeTab();
  if (!isLikelyUrl(value)) {
    const searchUrl = `celest-search://results?q=${encodeURIComponent(value)}`;
    if (replace && tab.index >= 0) tab.history[tab.index] = searchUrl;
    else {
      tab.history = tab.history.slice(0, tab.index + 1);
      tab.history.push(searchUrl);
      tab.index = tab.history.length - 1;
    }
    tab.url = searchUrl;
    tab.title = `Search: ${value.slice(0, 24)}`;
    render();
    return;
  }
  const url = resolveAddress(value);
  if (!url || !isAllowedWebUrl(url)) { status.textContent = "Enter a valid web address"; return; }
  if (replace && tab.index >= 0) tab.history[tab.index] = url;
  else {
    tab.history = tab.history.slice(0, tab.index + 1);
    tab.history.push(url);
    tab.index = tab.history.length - 1;
  }
  tab.url = url;
  tab.title = new URL(url).hostname.replace(/^www\./, "");
  render();
}
function goHistory(delta) {
  const tab = activeTab();
  const next = tab.index + delta;
  if (next < 0 || next >= tab.history.length) { status.textContent = "No more page history"; return; }
  tab.index = next;
  tab.url = tab.history[next];
  tab.title = tab.url.startsWith("celest-search://")
    ? `Search: ${new URL(tab.url).searchParams.get("q")?.slice(0, 24) || ""}`
    : new URL(tab.url).hostname.replace(/^www\./, "");
  render();
}
function addTab() {
  state.tabs.forEach(tab => tab.active = false);
  state.tabs.push({ id: state.nextId++, title: "New tab", url: "", history: [], index: -1, active: true });
  render();
}
function closeTab(id) {
  const index = state.tabs.findIndex(tab => tab.id === id);
  if (index < 0) return;
  const wasActive = state.tabs[index].active;
  state.tabs.splice(index, 1);
  if (!state.tabs.length) return addTab();
  if (wasActive) state.tabs[Math.max(0, index - 1)].active = true;
  render();
}
function saveBookmark() {
  const tab = activeTab();
  if (!tab.url) { status.textContent = "Open a page before bookmarking"; return; }
  if (!state.bookmarks.some(item => item.url === tab.url)) state.bookmarks.push({ title: tab.title, url: tab.url });
  persist();
  status.textContent = "Bookmark saved";
}
function renderBookmarks() {
  const list = document.querySelector("#bookmark-list");
  list.innerHTML = state.bookmarks.length ? state.bookmarks.map((item, i) => `
    <div class="bookmark-row"><button data-bookmark-open="${i}"><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.url)}</small></button><button class="remove-bookmark" data-bookmark-remove="${i}" title="Remove bookmark">×</button></div>`).join("") : '<p class="empty-bookmarks">No bookmarks yet. Save a page with the ☆ button.</p>';
}
function openHome() { renderHome(); address.value = ""; status.textContent = "New tab"; }

if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  navigator.serviceWorker.register("/celest-sw.js", { scope: "/" })
    .then(() => { status.textContent = "Celest Service Worker ready"; })
    .catch(() => { status.textContent = "Service Worker unavailable"; });
}

document.addEventListener("submit", event => {
  if (event.target.id === "address-form") { event.preventDefault(); navigate(address.value); }
  if (event.target.id === "hero-form") { event.preventDefault(); navigate(document.querySelector("#hero-address").value); }
});
document.addEventListener("click", event => {
  const go = event.target.closest("[data-go]");
  if (go) return navigate(go.dataset.go.startsWith("/") ? new URL(go.dataset.go, location.origin).href : go.dataset.go);
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "new-tab") return addTab();
  if (action === "home") return openHome();
  if (action === "settings") return settingsDialog.showModal();
  if (action === "bookmarks") { renderBookmarks(); return bookmarksDialog.showModal(); }
  if (action === "bookmark") return saveBookmark();
  if (action === "back") return goHistory(-1);
  if (action === "forward") return goHistory(1);
  if (action === "reload") { const tab = activeTab(); if (tab.url) renderCurrent(); return; }
  const resultLink = event.target.closest("[data-result-url]");
  if (resultLink) return navigate(resultLink.dataset.resultUrl);

  const close = event.target.closest("[data-close]");
  if (close) { event.stopPropagation(); return closeTab(Number(close.dataset.close)); }
  const tabButton = event.target.closest("[data-tab]");
  if (tabButton) {
    state.tabs.forEach(tab => tab.active = tab.id === Number(tabButton.dataset.tab));
    return render();
  }
  const openBookmark = event.target.closest("[data-bookmark-open]");
  if (openBookmark) {
    const item = state.bookmarks[Number(openBookmark.dataset.bookmarkOpen)];
    bookmarksDialog.close();
    return navigate(item.url);
  }
  const removeBookmark = event.target.closest("[data-bookmark-remove]");
  if (removeBookmark) {
    state.bookmarks.splice(Number(removeBookmark.dataset.bookmarkRemove), 1);
    persist(); renderBookmarks();
  }
});
document.querySelector("#search-engine").addEventListener("change", event => {
  state.searchEngine = event.target.value;
  persist();
});
document.addEventListener("keydown", event => {
  const mod = event.metaKey || event.ctrlKey;
  if (!mod) return;
  if (event.key.toLowerCase() === "l") { event.preventDefault(); address.focus(); address.select(); }
  if (event.key.toLowerCase() === "t") { event.preventDefault(); addTab(); }
  if (event.key.toLowerCase() === "w") { event.preventDefault(); closeTab(activeTab().id); }
});
render();