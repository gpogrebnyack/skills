#!/usr/bin/env python3
"""Проверяет, не появились ли новые версии моделей. Источник — открытый каталог
fal.ai (без ключа). В сеть ходит не чаще раза в сутки, таймаут 3 секунды,
при ошибке сети печатает ERROR и не задерживает работу навыка.

Вывод:  пусто                          — ничего нового
        NEW <семейство> <id> <дата>    — префикса нет в versions.json или дата свежее известной
        ERROR <семейство>: <причина>   — сеть недоступна, работаем по текущим гайдам
Флаг --force игнорирует суточный кэш.
"""
import json, sys, urllib.request, urllib.parse
from datetime import date
from pathlib import Path

HERE = Path(__file__).resolve().parent
VERS = HERE / "versions.json"
API = "https://fal.ai/api/models?keywords="
TIMEOUT = 3

def prefix(model_id: str) -> str:
    return "/".join(model_id.split("/")[:3])

def main() -> int:
    data = json.loads(VERS.read_text(encoding="utf-8"))
    today = date.today().isoformat()
    if data.get("checked") == today and "--force" not in sys.argv:
        return 0
    found = []
    for fam, cfg in data["families"].items():
        url = API + urllib.parse.quote(cfg["keywords"])
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "prompt-helper/1.0"})
            items = json.load(urllib.request.urlopen(req, timeout=TIMEOUT)).get("items", [])
        except Exception as e:
            print(f"ERROR {fam}: {e.__class__.__name__}")
            continue
        known = set(cfg["known_prefixes"])
        newest = cfg.get("newest_date", "")
        seen = set()
        for it in items:
            if it.get("deprecated"):
                continue
            mid, d = it.get("id", ""), (it.get("date") or "")[:10]
            p = prefix(mid)
            if p in seen:
                continue
            if p not in known or (d and d > newest):
                seen.add(p)
                found.append((fam, mid, d))
    data["checked"] = today
    VERS.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    for fam, mid, d in sorted(found, key=lambda x: x[2], reverse=True):
        print(f"NEW {fam} {mid} {d}")
    return 0

if __name__ == "__main__":
    sys.exit(main())
