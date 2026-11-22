/* egilsson.me theme switch: Auto follows the device, Light and Dark are remembered per browser. */
(function () {
  var KEY = "egilsson-theme";
  var COLORS = { light: "#eef1f6", dark: "#0f1521" };
  var root = document.documentElement;

  function read() {
    try { var v = localStorage.getItem(KEY); return v === "light" || v === "dark" ? v : "auto"; }
    catch (e) { return "auto"; }
  }
  function save(v) {
    try { v === "auto" ? localStorage.removeItem(KEY) : localStorage.setItem(KEY, v); } catch (e) {}
  }
  function apply(v) {
    if (v === "auto") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", v);
    var metas = document.querySelectorAll('meta[name="theme-color"]');
    for (var i = 0; i < metas.length; i++) {
      var m = metas[i];
      if (!m.dataset.media) m.dataset.media = m.getAttribute("media") || "";
      if (v === "auto") { m.setAttribute("media", m.dataset.media); m.content = /dark/.test(m.dataset.media) ? COLORS.dark : COLORS.light; }
      else { m.removeAttribute("media"); m.content = COLORS[v]; }
    }
  }

  apply(read());

  var ICONS = {
    auto: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor"/></svg>',
    light: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    dark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>'
  };
  var LABELS = { auto: "Auto (match device)", light: "Light", dark: "Dark" };

  function build() {
    var wrap = document.createElement("div");
    wrap.className = "theme-switch";
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", "Colour theme");
    ["auto", "light", "dark"].forEach(function (v) {
      var b = document.createElement("button");
      b.type = "button";
      b.dataset.theme = v;
      b.title = LABELS[v];
      b.setAttribute("aria-label", LABELS[v]);
      b.innerHTML = ICONS[v];
      b.addEventListener("click", function (e) {
        var hover = window.matchMedia("(hover: hover)").matches;
        // On touch screens the first tap on the current choice opens the switch.
        if (!hover && !wrap.classList.contains("open")) { wrap.classList.add("open"); return; }
        save(v); apply(v); sync();
        wrap.classList.remove("open");
        if (e.detail > 0) b.blur();
      });
      wrap.appendChild(b);
    });
    document.body.appendChild(wrap);
    function sync() {
      var cur = read();
      wrap.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.theme === cur)); });
    }
    sync();
    document.addEventListener("click", function (e) { if (!wrap.contains(e.target)) wrap.classList.remove("open"); });
    // Keep every page in step: other open tabs, and pages restored with the Back button.
    window.addEventListener("storage", function (e) { if (e.key === KEY) { apply(read()); sync(); } });
    window.addEventListener("pageshow", function () { apply(read()); sync(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
