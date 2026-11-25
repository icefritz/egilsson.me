/* Moon phase for the main page, computed in the browser (no network).
   Sun and Moon longitudes use the low-precision series from Meeus,
   "Astronomical Algorithms" ch. 25 and 47 (good to well under an hour
   for phase times, and about 1% for illumination). */
(function () {
  var el = document.getElementById("moon");
  if (!el) return;

  var RAD = Math.PI / 180;
  var TZ = "Atlantic/Reykjavik";

  function norm(a) { a %= 360; return a < 0 ? a + 360 : a; }

  /* Elongation of the Moon from the Sun, 0..360 degrees (0 = new, 180 = full). */
  function elongation(date) {
    var T = (date.getTime() / 86400000 + 2440587.5 - 2451545.0) / 36525;
    var M = norm(357.52911 + 35999.05029 * T);
    var sun = 280.46646 + 36000.76983 * T +
      1.914602 * Math.sin(M * RAD) + 0.019993 * Math.sin(2 * M * RAD);
    var L = 218.3164477 + 481267.88123421 * T;
    var D = norm(297.8501921 + 445267.1114034 * T) * RAD;
    var Mp = norm(134.9633964 + 477198.8675055 * T) * RAD;
    var F = norm(93.2720950 + 483202.0175233 * T) * RAD;
    var Ms = M * RAD;
    var moon = L +
      6.288774 * Math.sin(Mp) +
      1.274027 * Math.sin(2 * D - Mp) +
      0.658314 * Math.sin(2 * D) +
      0.213618 * Math.sin(2 * Mp) -
      0.185116 * Math.sin(Ms) -
      0.114332 * Math.sin(2 * F) +
      0.058793 * Math.sin(2 * D - 2 * Mp) +
      0.057066 * Math.sin(2 * D - Ms - Mp) +
      0.053322 * Math.sin(2 * D + Mp) +
      0.045758 * Math.sin(2 * D - Ms) -
      0.040923 * Math.sin(Ms - Mp) -
      0.034720 * Math.sin(D) -
      0.030383 * Math.sin(Ms + Mp);
    return norm(moon - sun);
  }

  /* Next moment the elongation reaches `target` (0 or 180) after `from`. */
  function nextPhase(from, target) {
    var step = 6 * 3600000, t = from.getTime();
    var off = function (ms) { return norm(elongation(new Date(ms)) - target + 180) - 180; };
    var prev = off(t);
    for (var i = 0; i < 160; i++) {
      var n = t + step, cur = off(n);
      if (prev < 0 && cur >= 0) {
        var a = t, b = n;
        for (var j = 0; j < 30; j++) {
          var m = (a + b) / 2;
          if (off(m) < 0) a = m; else b = m;
        }
        return new Date(b);
      }
      t = n; prev = cur;
    }
    return null;
  }

  function phaseName(E) {
    if (E < 7 || E > 353) return "New Moon";
    if (E < 83) return "Waxing Crescent";
    if (E < 97) return "First Quarter";
    if (E < 173) return "Waxing Gibbous";
    if (E < 187) return "Full Moon";
    if (E < 263) return "Waning Gibbous";
    if (E < 277) return "Last Quarter";
    return "Waning Crescent";
  }

  function fmtDay(d) {
    var parts = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, weekday: "short", day: "numeric", month: "short" }).formatToParts(d);
    var get = function (k) { var p = parts.find(function (x) { return x.type === k; }); return p ? p.value : ""; };
    return get("weekday") + " " + get("day") + " " + get("month");
  }
  function fmtTime(d) {
    return new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false }).format(d);
  }

  /* Disc as seen from the northern hemisphere: waxing lit on the right. */
  function disc(E) {
    var k = (1 - Math.cos(E * RAD)) / 2;
    var r = 20, cx = 22, cy = 22;
    var waxing = E < 180;
    var rx = Math.abs(1 - 2 * k) * r;
    var limb = waxing ? 1 : 0;
    var term = waxing ? (k > 0.5 ? 1 : 0) : (k > 0.5 ? 0 : 1);
    var lit = k < 0.005 ? "" :
      '<path d="M' + cx + ' ' + (cy - r) + ' A' + r + ' ' + r + ' 0 0 ' + limb + ' ' + cx + ' ' + (cy + r) +
      ' A' + rx.toFixed(2) + ' ' + r + ' 0 0 ' + term + ' ' + cx + ' ' + (cy - r) + 'Z" fill="currentColor"/>';
    return '<svg class="moon-disc" viewBox="0 0 44 44" aria-hidden="true">' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" class="moon-dark"/>' + lit +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" class="moon-rim"/></svg>';
  }

  function render() {
    var now = new Date();
    var E = elongation(now);
    var k = (1 - Math.cos(E * RAD)) / 2;
    var age = E / 360 * 29.530589;
    var full = nextPhase(now, 180), nw = nextPhase(now, 0);
    var events = [
      { name: "Full", d: full },
      { name: "New", d: nw }
    ].filter(function (e) { return e.d; }).sort(function (a, b) { return a.d - b.d; });
    var name = phaseName(E);

    el.setAttribute("aria-label", "Moon: " + name + ", " + Math.round(k * 100) + "% lit");
    el.innerHTML = disc(E) +
      '<div class="moon-main"><b>' + name + '</b>' +
      '<small>' + Math.round(k * 100) + '% lit · day ' + Math.floor(age + 0.5) + '</small></div>' +
      '<div class="moon-next">' + events.map(function (e) {
        return '<span><em>' + e.name + '</em> ' + fmtDay(e.d) + ' <i>' + fmtTime(e.d) + '</i></span>';
      }).join("") + '</div>';
  }

  render();
  setInterval(render, 10 * 60000);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) render(); });


})();
