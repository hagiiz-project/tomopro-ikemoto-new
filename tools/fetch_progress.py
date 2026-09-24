"""
東北大学基金の寄付ページから「現在の寄附総額」と「支援者数」を読み取り、
data/progress.json に書き込みます。GitHub Actions から毎朝実行されます。

読み取りに失敗したときは、前回の数字をそのまま残します（サイトは壊れません）。
手元で試すとき： python tools/fetch_progress.py
"""
import json
import re
import sys
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

URL = "https://www.kikin.tohoku.ac.jp/project/tomopro/2026/pj_009_2026"
OUT = Path(__file__).resolve().parent.parent / "data" / "progress.json"
JST = timezone(timedelta(hours=9))


def text_of(html: str) -> str:
    html = re.sub(r"(?is)<(script|style)[^>]*>.*?</\1>", " ", html)
    txt = re.sub(r"(?s)<[^>]+>", " ", html)
    txt = txt.replace("&nbsp;", " ").replace("&yen;", "円")
    return re.sub(r"\s+", " ", txt)


def num(pattern: str, txt: str):
    m = re.search(pattern, txt)
    return int(m.group(1).replace(",", "")) if m else None


def main() -> int:
    old = {}
    if OUT.exists():
        try:
            old = json.loads(OUT.read_text(encoding="utf-8"))
        except ValueError:
            old = {}

    req = urllib.request.Request(URL, headers={"User-Agent": "Mozilla/5.0 (HagiiZ progress bot)"})
    try:
        html = urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "replace")
    except Exception as e:  # noqa: BLE001
        print(f"取得に失敗したので、前回の数字を残します: {e}")
        return 0

    txt = text_of(html)
    current = num(r"現在の寄附総額\s*([\d,]+)\s*円", txt)
    people = num(r"（個人）\s*([\d,]+)\s*名", txt)
    orgs = num(r"（法人・団体）\s*([\d,]+)\s*社", txt)

    if current is None:
        print("寄附総額が見つからないので、前回の数字を残します（ページの形が変わった可能性があります）")
        return 0

    supporters = (people or 0) + (orgs or 0)
    data = {
        "current": current,
        "supporters": supporters,
        "updated": datetime.now(JST).isoformat(timespec="minutes"),
    }
    if old.get("current") == current and old.get("supporters") == supporters and old.get("updated"):
        print(f"変化なし: {current}円 / {supporters}人")
        return 0

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"更新: {current}円 / {supporters}人")
    return 0


if __name__ == "__main__":
    sys.exit(main())
