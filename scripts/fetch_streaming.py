#!/usr/bin/env python3
"""Build streaming/catalogue.json: what's on each streaming service in Iceland.

Data comes from TMDB's official API (its watch-provider data is supplied by JustWatch).
Needs a TMDB API Read Access Token (or a v3 API key) in the TMDB_TOKEN environment variable.

    TMDB_TOKEN=... python3 scripts/fetch_streaming.py

Gaps in TMDB's Iceland data are filled from the other Nordic countries (DK, NO, SE, FI):
  - Disney+ and Apple TV+ have no Iceland listings on TMDB at all, and HBO Max and Crunchyroll
    are clearly incomplete there. For these, a title counts if TMDB lists it on that service in
    Iceland, or in at least 3 of the 4 Nordic countries. Titles only seen in the Nordics are
    marked (key "n") so the page can label them.
  - Netflix, Prime Video and Viaplay catalogues differ by country, so they use Iceland data only.
  - Dropout is not a TMDB provider; its catalogue is the same worldwide, so it is built from
    TMDB's Dropout network (shows) and Dropout company (specials released since its 2018 launch).
"""
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone

API = "https://api.themoviedb.org/3"
TOKEN = os.environ.get("TMDB_TOKEN", "").strip()
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "streaming", "catalogue.json")

# key, display name, TMDB provider id, whether to fill gaps from the Nordic catalogues
SERVICES = [
    ("netflix", "Netflix", 8, False),
    ("prime", "Prime Video", 119, False),
    ("hbo", "HBO Max", 1899, True),
    ("disney", "Disney+", 337, True),
    ("viaplay", "Viaplay", 76, False),
    ("apple", "Apple TV+", 350, True),
    ("crunchyroll", "Crunchyroll", 283, True),
]
NORDIC = ("DK", "NO", "SE", "FI")
NORDIC_MIN = 3  # a Nordic-only title needs to be listed in at least this many of NORDIC

DROPOUT_NETWORK = 4551
DROPOUT_COMPANY = 216446

GENRES = {}


def get(path, **params):
    headers = {"Accept": "application/json"}
    if re.fullmatch(r"[0-9a-f]{32}", TOKEN):  # v3 API key
        params["api_key"] = TOKEN
    else:
        headers["Authorization"] = "Bearer " + TOKEN
    url = f"{API}{path}?{urllib.parse.urlencode(params)}"
    for attempt in range(6):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=30) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code in (401, 403):
                sys.exit(f"TMDB refused the token ({e.code}). Check TMDB_TOKEN.")
            if e.code == 429 or e.code >= 500:
                time.sleep(float(e.headers.get("Retry-After") or 1 + attempt * 2))
                continue
            raise
        except (urllib.error.URLError, TimeoutError):
            time.sleep(1 + attempt * 2)
    raise RuntimeError(f"Gave up on {path}")


def discover(kind, provider, region, page):
    return get(f"/discover/{kind}", watch_region=region, with_watch_providers=provider,
               with_watch_monetization_types="flatrate", sort_by="popularity.desc",
               include_adult="false", language="en-US", page=page)


def entry(kind, r):
    date = r.get("release_date" if kind == "movie" else "first_air_date") or ""
    return {
        "id": r["id"],
        "k": "m" if kind == "movie" else "s",
        "t": r.get("title") or r.get("name") or "",
        "o": r.get("original_title") or r.get("original_name") or "",
        "y": int(date[:4]) if date[:4].isdigit() else None,
        "r": round(r.get("vote_average") or 0, 1),
        "v": r.get("vote_count") or 0,
        "p": round(r.get("popularity") or 0, 1),
        "g": r.get("genre_ids") or [],
        "i": r.get("poster_path"),
    }


def main():
    if not TOKEN:
        sys.exit("Set TMDB_TOKEN to a TMDB API Read Access Token.")
    for kind in ("movie", "tv"):
        for g in get(f"/genre/{kind}/list", language="en-US")["genres"]:
            GENRES[g["id"]] = g["name"]

    titles = {}  # (kind letter, id) -> entry with "s": [service keys]

    def add(kind, r, key, nordic=False):
        e = entry(kind, r)
        cur = titles.setdefault((e["k"], e["id"]), e)
        cur.setdefault("s", [])
        if key not in cur["s"]:
            cur["s"].append(key)
            if nordic:
                cur.setdefault("n", []).append(key)

    with ThreadPoolExecutor(max_workers=8) as pool:
        def fetch_all(kind, pid, region):
            first = discover(kind, pid, region, 1)
            pages = min(first.get("total_pages") or 1, 500)  # TMDB stops at page 500
            rest = pool.map(lambda p: discover(kind, pid, region, p), range(2, pages + 1))
            return [r for res in [first, *rest] for r in res.get("results", [])]

        for key, name, pid, fill in SERVICES:
            n_is = n_nordic = 0
            for kind in ("movie", "tv"):
                local = fetch_all(kind, pid, "IS")
                for r in local:
                    add(kind, r, key)
                n_is += len(local)
                if not fill:
                    continue
                seen, rows = {}, {}
                for region in NORDIC:
                    for r in fetch_all(kind, pid, region):
                        seen[r["id"]] = seen.get(r["id"], 0) + 1
                        rows[r["id"]] = r
                local_ids = {r["id"] for r in local}
                for tid, c in seen.items():
                    if c >= NORDIC_MIN and tid not in local_ids:
                        add(kind, rows[tid], key, nordic=True)
                        n_nordic += 1
            print(f"{name:12} Iceland {n_is:6}  + Nordic {n_nordic:6}", file=sys.stderr)

    n = 0
    for kind, flt in (("tv", {"with_networks": DROPOUT_NETWORK}),
                      ("movie", {"with_companies": DROPOUT_COMPANY, "primary_release_date.gte": "2018-09-01"})):
        page, pages = 1, 1
        while page <= pages:
            res = get(f"/discover/{kind}", sort_by="popularity.desc", language="en-US", page=page, **flt)
            pages = min(res.get("total_pages") or 1, 500)
            for r in res.get("results", []):
                add(kind, r, "dropout")
                n += 1
            page += 1
    print(f"{'Dropout':12} --  {n} titles", file=sys.stderr)

    items = sorted(titles.values(), key=lambda e: -e["p"])
    for e in items:
        if e["o"] == e["t"]:
            del e["o"]
    def svc(k, nm, fill):
        count = sum(1 for e in items if k in e["s"])
        nordic = sum(1 for e in items if k in e.get("n", ()))
        region = "IS" if not nordic else "nordic" if nordic == count else "IS+nordic"
        return {"key": k, "name": nm, "region": region, "count": count, "nordic": nordic}

    out = {
        "updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%MZ"),
        "services": [svc(k, nm, fill) for k, nm, _, fill in SERVICES]
        + [{"key": "dropout", "name": "Dropout", "region": "global", "nordic": 0,
            "count": sum(1 for e in items if "dropout" in e["s"])}],
        "genres": {str(k): v for k, v in sorted(GENRES.items())},
        "titles": items,
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    print(f"Wrote {len(items)} unique titles to {os.path.relpath(OUT)}", file=sys.stderr)


if __name__ == "__main__":
    main()
