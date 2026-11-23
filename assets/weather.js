/* Akureyri weather from the Icelandic Met Office (vedur.is) open XML service.
   Observations: station 3471, Akureyri - Krossanesbraut. Forecast: same station point.
   Times from vedur.is are UTC, which is also Iceland's local time. */
(function () {
  var STATION = "3471";
  var BASE = "https://xmlweather.vedur.is/?op_w=xml&lang=en&view=xml&ids=" + STATION;
  var OBS_URL = BASE + "&type=obs&params=T;F;FG;D;RH";
  var FOREC_URL = BASE + "&type=forec";
  var CACHE_KEY = "egilsson-weather-v1";
  var REFRESH_MS = 10 * 60 * 1000;
  var root = document.getElementById("weather");
  if (!root) return;

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

    var html = '<div class="wx-head"><div><span class="wx-place">Akureyri</span><span class="wx-sub">' +
      (obsTime ? "Measured " + hhmm(obsTime) : "Forecast") + ' · <a href="https://en.vedur.is/weather/forecasts/areas/northeast/#group=15&station=' + STATION + '" target="_blank" rel="noopener">vedur.is</a></span></div></div>' +
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
    root.removeAttribute("aria-busy");
  }

  function load() {
    var parser = new DOMParser();
    function get(u) { return fetch(u, { cache: "no-store" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); }).then(function (t) { return parser.parseFromString(t, "text/xml"); }); }
    return Promise.all([get(OBS_URL).catch(function () { return null; }), get(FOREC_URL)]).then(function (res) {
      var data = { obs: res[0] ? parseObs(res[0]) : null, forec: parseForec(res[1]), at: Date.now() };
      if (!data.forec.length) throw new Error("empty");
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch (e) {}
      render(data);
    }).catch(function () {
      if (!root.querySelector(".wx-now")) root.innerHTML = '<p class="wx-err">Couldn\'t reach vedur.is right now. <a href="https://en.vedur.is/weather/forecasts/areas/northeast/#group=15&station=' + STATION + '" target="_blank" rel="noopener">Open the forecast</a></p>';
    });
  }

  try {
    var cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    if (cached && cached.forec && Date.now() - cached.at < 6 * 3600e3) render(cached);
  } catch (e) {}
  load();
  setInterval(load, REFRESH_MS);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) load(); });
})();
