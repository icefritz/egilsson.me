/* Weather from the Icelandic Met Office (vedur.is) open XML service: live observations and the
   station-point forecast for the chosen location (Akureyri by default, picked from the title's dot).
   Times from vedur.is are UTC, which is also Iceland's local time. */
(function () {
  var LOCATIONS = [
    { id: "3471", name: "Akureyri", station: "Krossanesbraut" },
    { id: "4652", name: "Langanes", station: "Miðfjarðarnes" },
    { id: "1", name: "Reykjavík", station: "Reykjavík" },
    { id: "6015", name: "Vestmannaeyjar", station: "Vestmannaeyjabær" }
  ];
  var LOC_KEY = "egilsson-weather-loc";
  var CACHE_KEY = "egilsson-weather-v2-";
  var REFRESH_MS = 10 * 60 * 1000;
  var root = document.getElementById("weather");
  if (!root) return;
  var loc = LOCATIONS[0];
  try { var saved = localStorage.getItem(LOC_KEY); LOCATIONS.forEach(function (l) { if (l.id === saved) loc = l; }); } catch (e) {}
  function urls(l) {
    var b = "https://xmlweather.vedur.is/?op_w=xml&lang=en&view=xml&ids=" + l.id;
    return { obs: b + "&type=obs&params=T;F;FG;D;RH", forec: b + "&type=forec" };
  }
  function pageLink(data) {
    var u = (data && data.link) || "https://en.vedur.is/weather/forecasts/areas/";
    return u.replace(/^http:/, "https:");
  }

  var DIRS = { N: 0, NNE: 22.5, NE: 45, ENE: 67.5, E: 90, ESE: 112.5, SE: 135, SSE: 157.5, S: 180, SSW: 202.5, SW: 225, WSW: 247.5, W: 270, WNW: 292.5, NW: 315, NNW: 337.5 };
  var DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  /* Stroke icons in the same style as the nav icons. */
  var P = {
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    part: '<path d="M8 3v1.5M3.6 4.9l1 1M2 9.5h1.5M12.4 4.9l-1 1"/><path d="M5.3 12.3A4 4 0 1 1 12.6 9"/><path d="M17 20H9a4 4 0 1 1 .9-7.9A5 5 0 0 1 19.5 13 3.5 3.5 0 0 1 17 20Z"/>',
    cloud: '<path d="M17.5 19H8a5 5 0 1 1 1.2-9.9A6 6 0 0 1 20.5 11 4 4 0 0 1 17.5 19Z"/>',
    rain: '<path d="M16.5 15H8a4.5 4.5 0 1 1 1.1-8.9A5.5 5.5 0 0 1 19.3 8 3.6 3.6 0 0 1 16.5 15Z"/><path d="M8 18.5 7 21M12.5 18.5l-1 2.5M17 18.5l-1 2.5"/>',
    snow: '<path d="M16.5 15H8a4.5 4.5 0 1 1 1.1-8.9A5.5 5.5 0 0 1 19.3 8 3.6 3.6 0 0 1 16.5 15Z"/><path d="M8 19h.01M12 21h.01M16 19h.01M10 22.5h.01M14 22.5h.01" stroke-width="2.6"/>',
    sleet: '<path d="M16.5 15H8a4.5 4.5 0 1 1 1.1-8.9A5.5 5.5 0 0 1 19.3 8 3.6 3.6 0 0 1 16.5 15Z"/><path d="M8 18.5 7 21M16 18.5l-1 2.5"/><path d="M12 20h.01" stroke-width="2.6"/>',
    fog: '<path d="M4 9h16M3 13h18M5 17h14"/>',
    storm: '<path d="M16.5 14H8a4.5 4.5 0 1 1 1.1-8.9A5.5 5.5 0 0 1 19.3 7 3.6 3.6 0 0 1 16.5 14Z"/><path d="m12.5 15-2 3.5h3l-2 3.5"/>'
  };
  function kind(w) {
    w = (w || "").toLowerCase();
    if (/thunder/.test(w)) return "storm";
    if (/sleet/.test(w)) return "sleet";
    if (/snow|hail|blizzard/.test(w)) return "snow";
    if (/rain|drizzle|shower/.test(w)) return "rain";
    if (/fog|mist|haze|dust/.test(w)) return "fog";
    if (/partly|fair/.test(w)) return "part";
    if (/clear/.test(w)) return "sun";
    return "cloud";
  }
  function icon(w, cls) {
    return '<svg class="' + (cls || "wi") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + P[kind(w)] + "</svg>";
  }
  function arrow(d) {
    var deg = DIRS[d];
    if (deg == null) return "";
    /* The arrow is drawn pointing down (a north wind); rotating by the bearing gives the way the wind blows to. */
    return '<svg class="wdir" viewBox="0 0 24 24" style="transform:rotate(' + deg + 'deg)" aria-hidden="true"><path d="M12 3v17M6 14l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function num(s) { var n = parseFloat(String(s).replace(",", ".")); return isNaN(n) ? null : n; }
  function deg(n) { return n == null ? "–" : Math.round(n) + "°"; }
  function parseTime(s) { return s ? new Date(s.replace(" ", "T") + "Z") : null; }
  function hhmm(d) { return String(d.getUTCHours()).padStart(2, "0") + ":" + String(d.getUTCMinutes()).padStart(2, "0"); }
  function dayKey(d) { return d.toISOString().slice(0, 10); }
  function txt(el, tag) { var n = el.getElementsByTagName(tag)[0]; return n ? n.textContent.trim() : ""; }

  function parseObs(xml) {
    var st = xml.getElementsByTagName("station")[0];
    if (!st || txt(st, "err")) return null;
    return { time: txt(st, "time"), T: num(txt(st, "T")), F: num(txt(st, "F")), FG: num(txt(st, "FG")), D: txt(st, "D"), RH: num(txt(st, "RH")) };
  }
  function parseLink(xml) {
    var st = xml.getElementsByTagName("station")[0];
    return st ? txt(st, "link") : "";
  }
  function parseForec(xml) {
    var list = xml.getElementsByTagName("forecast"), out = [];
    for (var i = 0; i < list.length; i++) {
      var f = list[i];
      out.push({ time: txt(f, "ftime"), T: num(txt(f, "T")), F: num(txt(f, "F")), D: txt(f, "D"), W: txt(f, "W") });
    }
    return out;
  }

  function render(data) {
    var now = new Date();
    var fc = data.forec.map(function (f) { f.d = parseTime(f.time); return f; });
    /* Current condition: the forecast step closest to now (observations rarely carry a weather text). */
    var cur = fc.reduce(function (best, f) { return !best || Math.abs(f.d - now) < Math.abs(best.d - now) ? f : best; }, null) || {};
    var obs = data.obs || {};
    var temp = obs.T != null ? obs.T : cur.T;
    var wind = obs.F != null ? obs.F : cur.F;
    var dir = obs.D || cur.D;
    var obsTime = parseTime(obs.time);

    /* Next hours: every third hour from now, eight steps. */
    var upcoming = fc.filter(function (f) { return f.d > now; });
    var hours = [], lastT = 0;
    upcoming.forEach(function (f) { if (hours.length < 8 && f.d - lastT >= 3 * 3600e3 - 1) { hours.push(f); lastT = f.d; } });

    /* Days: min and max over the day, weather and wind taken nearest midday. */
    var byDay = {};
    fc.forEach(function (f) { if (dayKey(f.d) >= dayKey(now)) (byDay[dayKey(f.d)] = byDay[dayKey(f.d)] || []).push(f); });
    var days = Object.keys(byDay).sort().slice(0, 6).map(function (k) {
      var list = byDay[k], ts = list.map(function (f) { return f.T; }).filter(function (t) { return t != null; });
      var mid = list.reduce(function (b, f) { return !b || Math.abs(f.d.getUTCHours() - 13) < Math.abs(b.d.getUTCHours() - 13) ? f : b; }, null);
      var maxF = Math.max.apply(null, list.map(function (f) { return f.F || 0; }));
      return { key: k, d: list[0].d, lo: Math.min.apply(null, ts), hi: Math.max.apply(null, ts), W: mid.W, F: maxF };
    });
    var range = days.reduce(function (r, d) { return [Math.min(r[0], d.lo), Math.max(r[1], d.hi)]; }, [Infinity, -Infinity]);
    var span = Math.max(1, range[1] - range[0]);

    var l = data.loc;
    var html = '<div class="wx-head"><div><span class="wx-place">' + esc(l.name) + '</span><span class="wx-sub">' +
      (l.station !== l.name ? esc(l.station) + " · " : "") +
      (obsTime ? "Measured " + hhmm(obsTime) : "Forecast") + ' · <a href="' + esc(pageLink(data)) + '" target="_blank" rel="noopener">vedur.is</a></span></div></div>' +
      '<div class="wx-now">' + icon(cur.W, "wi wi-big") +
      '<div class="wx-temp">' + (temp == null ? "–" : (Math.round(temp * 10) / 10).toString().replace(/\.0$/, "")) + '<span>°C</span></div>' +
      '<div class="wx-facts"><b>' + esc(cur.W || "–") + '</b>' +
      '<span>' + arrow(dir) + (wind == null ? "–" : wind) + " m/s " + esc(dir || "") + (obs.FG != null ? " · gusts " + obs.FG : "") + "</span>" +
      (obs.RH != null ? "<span>Humidity " + obs.RH + "%</span>" : "") + "</div></div>";

    if (hours.length) {
      html += '<div class="wx-hours">' + hours.map(function (f) {
        return '<div class="wx-h"><small>' + hhmm(f.d) + "</small>" + icon(f.W) + "<b>" + deg(f.T) + '</b><span>' + arrow(f.D) + (f.F == null ? "" : f.F) + "</span></div>";
      }).join("") + "</div>";
    }
    if (days.length) {
      html += '<div class="wx-days">' + days.map(function (d, i) {
        var l = ((d.lo - range[0]) / span) * 100, w = Math.max(4, ((d.hi - d.lo) / span) * 100);
        var dt = d.d;
        return '<div class="wx-d"><span class="wx-dn">' + (i === 0 && d.key === dayKey(now) ? "Today" : DAYS[dt.getUTCDay()] + ' <small>' + dt.getUTCDate() + "/" + (dt.getUTCMonth() + 1) + "</small>") + "</span>" +
          icon(d.W) + '<span class="wx-lo">' + deg(d.lo) + '</span><span class="wx-bar"><i style="left:' + l + "%;width:" + w + '%"></i></span><span class="wx-hi">' + deg(d.hi) + '</span><span class="wx-wind">' + d.F + " m/s</span></div>";
      }).join("") + "</div>";
    }
    root.innerHTML = html;
    root.setAttribute("aria-label", "Weather in " + l.name);
    root.removeAttribute("aria-busy");
    root.classList.remove("wx-switching");
  }

  function readCache(l) {
    try {
      var c = JSON.parse(localStorage.getItem(CACHE_KEY + l.id) || "null");
      if (c && c.forec && Date.now() - c.at < 6 * 3600e3) { c.loc = l; return c; }
    } catch (e) {}
    return null;
  }

  var seq = 0;
  function load() {
    var l = loc, my = ++seq, u = urls(l);
    var parser = new DOMParser();
    function get(x) { return fetch(x, { cache: "no-store" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); }).then(function (t) { return parser.parseFromString(t, "text/xml"); }); }
    return Promise.all([get(u.obs).catch(function () { return null; }), get(u.forec)]).then(function (res) {
      if (my !== seq) return;
      var data = { obs: res[0] ? parseObs(res[0]) : null, forec: parseForec(res[1]), link: parseLink(res[1]), at: Date.now() };
      if (!data.forec.length) throw new Error("empty");
      try { localStorage.setItem(CACHE_KEY + l.id, JSON.stringify(data)); } catch (e) {}
      data.loc = l;
      render(data);
    }).catch(function () {
      if (my !== seq) return;
      root.classList.remove("wx-switching");
      if (!root.querySelector(".wx-now")) root.innerHTML = '<p class="wx-err">Couldn\'t reach vedur.is right now. <a href="https://en.vedur.is/weather/forecasts/areas/" target="_blank" rel="noopener">Open the forecast</a></p>';
    });
  }

  function choose(l) {
    if (l === loc) return;
    loc = l;
    try { localStorage.setItem(LOC_KEY, l.id); } catch (e) {}
    var c = readCache(l);
    if (c) render(c);
    else { root.classList.add("wx-switching"); root.setAttribute("aria-busy", "true"); }
    load();
    syncMenu();
  }

  /* The full stop after "Egilsson" opens the location menu. */
  var dot = document.getElementById("wx-dot"), menu = null;
  function syncMenu() {
    if (!menu) return;
    menu.querySelectorAll("[role=menuitemradio]").forEach(function (b) { b.setAttribute("aria-checked", String(b.dataset.id === loc.id)); });
  }
  var closeTimer = 0;
  function isOpen() { return menu.classList.contains("open"); }
  function setOpen(open, focusFirst) {
    if (open === isOpen()) return;
    clearTimeout(closeTimer);
    if (open) {
      /* Line the stream (and the option dots on it) up under the centre of the full stop's glyph. */
      var h = dot.parentNode, hr = h.getBoundingClientRect(), dr = dot.getBoundingClientRect();
      var cx = dr.left - hr.left + dr.width * 0.5, x = Math.max(0, Math.min(cx - 19, h.clientWidth - menu.offsetWidth));
      var glyphBottom = dr.top + dr.height * 0.79, menuTop = hr.bottom + 14;
      var s = Math.max(8, menuTop - glyphBottom), btns = menu.querySelectorAll("button"), last = btns[btns.length - 1];
      menu.style.setProperty("--menu-x", x + "px");
      menu.style.setProperty("--s", s + "px");
      menu.style.setProperty("--n", btns.length);
      menu.style.setProperty("--len", last.offsetTop + last.offsetHeight / 2 + "px");
      btns.forEach(function (b) { b.style.setProperty("--d", s + b.offsetTop + b.offsetHeight / 2 + "px"); });
      menu.classList.remove("closing");
      menu.classList.add("open");
    } else {
      menu.classList.remove("open");
      menu.classList.add("closing");
      closeTimer = setTimeout(function () { menu.classList.remove("closing"); }, 600);
    }
    dot.setAttribute("aria-expanded", String(open));
    if (open && focusFirst) (menu.querySelector("[aria-checked=true]") || menu.querySelector("button")).focus();
  }
  if (dot) {
    menu = document.createElement("div");
    menu.className = "wx-menu";
    menu.id = "wx-menu";
    menu.setAttribute("role", "menu");
    menu.setAttribute("aria-label", "Weather location");
    menu.innerHTML = '<span class="wx-stream" aria-hidden="true"></span>' + LOCATIONS.map(function (l, i) {
      return '<button type="button" role="menuitemradio" data-id="' + l.id + '" style="--i:' + i + '"><span class="wx-pin"></span><span class="wx-mn">' + esc(l.name) +
        (i === 0 ? ' <em>Default</em>' : "") + "</span>" + (l.station !== l.name ? "<small>" + esc(l.station) + "</small>" : "") + "</button>";
    }).join("");
    dot.parentNode.appendChild(menu);
    dot.setAttribute("aria-controls", "wx-menu");
    syncMenu();
    dot.addEventListener("click", function (e) { setOpen(!isOpen(), e.detail === 0); });
    menu.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-id]");
      if (!b) return;
      LOCATIONS.forEach(function (l) { if (l.id === b.dataset.id) choose(l); });
      setOpen(false);
      dot.focus();
    });
    menu.addEventListener("keydown", function (e) {
      var items = Array.prototype.slice.call(menu.querySelectorAll("button")), i = items.indexOf(document.activeElement);
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); items[(i + (e.key === "ArrowDown" ? 1 : items.length - 1)) % items.length].focus(); }
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && isOpen()) { setOpen(false); dot.focus(); } });
    document.addEventListener("click", function (e) { if (isOpen() && !menu.contains(e.target) && e.target !== dot) setOpen(false); });
  }

  var first = readCache(loc);
  if (first) render(first);
  load();
  setInterval(load, REFRESH_MS);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) load(); });
})();
