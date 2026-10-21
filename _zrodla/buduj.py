"""
Akademia Mocy Jeździeckich: budowanie stron demo.

Wspólne części (head, menu, stopka) są w _zrodla/czesci, treść stron w _zrodla/strony,
a dane programów w data/programs.js. Skrypt składa z nich gotowe pliki .html w katalogu repo.

Użycie (z katalogu repo):  python3 _zrodla/buduj.py
Wymaga tylko Pythona 3, bez dodatkowych bibliotek.
"""
import html
import json
import re
from pathlib import Path

ZRODLA = Path(__file__).resolve().parent
REPO = ZRODLA.parent
CZESCI = ZRODLA / "czesci"
STRONY = ZRODLA / "strony"


def wczytaj_dane():
    tekst = (REPO / "data" / "programs.js").read_text(encoding="utf-8")
    return json.loads(tekst[tekst.index("{"): tekst.rindex("}") + 1])


DANE = wczytaj_dane()
LEVELE = {l["id"]: l for l in DANE["levele"]}


def t(tekst):
    """Tekst z danych bezpiecznie wstawiony do HTML."""
    return html.escape(str(tekst), quote=False)


def odmiana(n, jeden, dwa_cztery, piec):
    if n == 1:
        return jeden
    if n % 10 in (2, 3, 4) and n % 100 not in (12, 13, 14):
        return dwa_cztery
    return piec


# Kawałki HTML generowane z danych ------------------------------------------

def chipy_leveli(p):
    out = []
    for l in DANE["levele"]:
        lid = l["id"]
        wkrotce = not l["dostepny"]
        out.append('<li class="level-chip level-chip--%s%s"><span class="level-chip__dot" aria-hidden="true"></span>%s%s</li>'
                   % (lid, " level-chip--soon" if wkrotce else "", t(l["nazwa"]), ", wkrótce" if wkrotce else ""))
    return "".join(out)


def karta_programu(p):
    return (
        '          <article class="prog prog--%(kolor)s">\n'
        '            <div class="prog__top"><svg class="prog__icon" aria-hidden="true"><use href="#%(ikona)s"></use></svg><span class="prog__time">%(czas)s</span></div>\n'
        '            <div class="prog__body">\n'
        '              <h3 class="prog__name"><a class="prog__link" href="program-%(id)s.html">%(nazwa)s</a></h3>\n'
        '              <p class="prog__text">%(krotko)s</p>\n'
        '              <ul class="prog__levels" aria-label="Levele programu">%(chipy)s</ul>\n'
        '              <div class="prog__foot"><span>%(czestotliwosc)s</span><span class="prog__more" aria-hidden="true">Zobacz program</span></div>\n'
        '            </div>\n'
        '          </article>'
    ) % dict(kolor=p["kolor"], ikona=p["ikona"], czas=t(p["czas"]), id=p["id"], nazwa=t(p["nazwa"]),
             krotko=t(p["krotko"]), chipy=chipy_leveli(p), czestotliwosc=t(p["czestotliwosc"]))


def flyout():
    linki = []
    for p in DANE["programy"]:
        linki.append(
            '              <a class="fly fly--%s" href="program-%s.html"><span class="fly__icon"><svg class="ico" aria-hidden="true"><use href="#%s"/></svg></span>'
            '<span class="fly__text"><strong>%s</strong><span>%s, %s</span></span></a>'
            % (p["kolor"], p["id"], p["ikona"], t(p["nazwa"]), t(p["haslo"]), t(p["czas"])))
    linki.append('              <a class="fly fly--plain" href="lista.html"><span class="fly__text"><strong>Nie wiesz, który wybrać?</strong><span>Odpowiedz na kilka pytań, dobierzemy program</span></span></a>')
    return "\n".join(linki)


def stopka_programy():
    return "\n".join('            <li><a href="program-%s.html">%s</a></li>' % (p["id"], t(p["krotka"])) for p in DANE["programy"])


def program_placeholdery(p):
    cw = p["trening"]["cwiczenia"]
    n = len(cw)
    reszta = max(0, n - 5)
    bilet = "\n".join('              <li><span>%s</span><span>%d s</span></li>' % (t(c["nazwa"]), c["czas"]) for c in cw[:5])
    if reszta == 1:
        wiecej = "i jedno kolejne"
    else:
        wiecej = "i %d %s" % (reszta, odmiana(reszta, "kolejne", "kolejne", "kolejnych")) if reszta else ""

    bloki = []
    for b, blok in enumerate(DANE["bloki"]):
        lista = [c for c in cw if c["blok"] == b]
        if not lista:
            continue
        pozycje = "".join('<li><span>%s</span><span>%d s</span></li>' % (t(c["nazwa"]), c["czas"]) for c in lista)
        bloki.append(
            '            <div class="session__block" style="--b: var(--blk-%d)">\n'
            '              <p class="session__head"><span class="session__dot" aria-hidden="true"></span><strong>%s</strong><span>%d %s</span></p>\n'
            '              <ol class="session__list">%s</ol>\n'
            '            </div>' % (b + 1, t(blok["nazwa"]), len(lista), odmiana(len(lista), "ćwiczenie", "ćwiczenia", "ćwiczeń"), pozycje))
    bloki.append('            <p class="session__note">Czasy jednej serii. W pełnym treningu część główna ma 2-3 rundy.</p>')

    levele = []
    for l in DANE["levele"]:
        opis = p["leveleOpis"][l["id"]]
        levele.append(
            '          <li class="level level--%s%s">\n'
            '            <div class="level__ros">{{> grafiki/rozeta-%s-mala.svg}}</div>\n'
            '            <div class="level__body"><p class="level__tag">Level %d, %s</p><h3 class="h3">%s</h3><p>%s</p></div>\n'
            '          </li>' % (l["id"], "" if l["dostepny"] else " level--soon", l["id"], l["numer"], t(opis["czas"]), t(l["nazwa"]), t(opis["opis"])))

    inne = [karta_programu(x) for x in DANE["programy"] if x["id"] != p["id"]]
    band_trening = {"pink": "sage", "sage": "pink", "butter": "sage"}[p["kolor"]]

    return {
        "p.id": p["id"],
        "p.kolor_band": p["kolor"],
        "p.band_trening": band_trening,
        "p.ikona": p["ikona"],
        "p.nazwa": t(p["nazwa"]),
        "p.krotka": t(p["krotka"]),
        "p.krotka_dopelniacz": t(p["krotkaBiernik"]),
        "p.haslo": t(p["haslo"]),
        "p.opis": t(p["opis"]),
        "p.czas": t(p["czas"]),
        "p.czestotliwosc": t(p["czestotliwosc"]),
        "p.trening_opis": t(p["trening"]["opis"]),
        "p.trening_info": "%d %s, 4 bloki" % (n, odmiana(n, "ćwiczenie", "ćwiczenia", "ćwiczeń")),
        "p.bilet_lista": bilet,
        "p.bilet_wiecej": wiecej,
        "p.dla_kogo": "\n".join('            <li><svg class="ico"><use href="#i-check"/></svg>%s</li>' % t(x) for x in p["dlaKogo"]),
        "p.sprzet": "\n".join('            <li>%s</li>' % t(x) for x in p["sprzet"]),
        "p.efekty": "\n".join('            <li class="fix"><span class="fix__was">„%s”</span><span class="fix__now"><svg class="ico"><use href="#i-check"/></svg>%s</span></li>'
                              % (t(e["bylo"]), t(e["jest"])) for e in p["efekty"]),
        "p.levele": "\n".join(levele),
        "p.bloki": "\n".join(bloki),
        "p.proba": "\n".join('            <li>%s</li>' % t(x) for x in p["proba"]),
        "p.faq": "\n".join('          <details class="faq__item"><summary>%s</summary><div class="faq__answer"><p>%s</p></div></details>'
                           % (t(f["q"]), t(f["a"])) for f in p["faq"]),
        "p.inne": "\n".join(inne),
    }


# Składanie stron ---------------------------------------------------------

def czesc(nazwa):
    return (CZESCI / nazwa).read_text(encoding="utf-8").rstrip("\n")


def wstaw_czesci(tekst, glebokosc=0):
    if glebokosc > 5:
        raise RuntimeError("Za głęboko zagnieżdżone części")
    def zamien(m):
        return wstaw_czesci(czesc(m.group(1).strip()), glebokosc + 1)
    return re.sub(r"\{\{>\s*([^}]+?)\s*\}\}", zamien, tekst)


def naglowek_strony(tekst):
    m = re.match(r"\s*<!--(.*?)-->\s*", tekst, re.S)
    meta = {}
    if m:
        for linia in m.group(1).splitlines():
            if ":" in linia:
                k, v = linia.split(":", 1)
                meta[k.strip()] = v.strip()
        tekst = tekst[m.end():]
    return meta, tekst


SIEROTKI = re.compile(r"(?:(?<=^)|(?<=[\s(>]))([aiouwzAIOUWZ]) (?=\S)")
JEDNOSTKI = re.compile(r"(\d) (minut|min|zł|dni|razy|osób|miesięcy|miesiące|programy|tygodnie|tygodni|s)\b")
ZAKRES = re.compile(r"(?<![\w&#])(\d+)-(\d+)(?![\w])")


def typografia(dokument):
    """Twarde spacje po jednoliterowych słowach, między liczbą a jednostką i zakresy typu 2-3 bez łamania linii (niewidoczny łącznik słów U+2060) (tylko w tekście, nie w kodzie)."""
    czesci, wynik, pomin = re.split(r"(<[^>]+>)", dokument), [], False
    for kawalek in czesci:
        if kawalek.startswith("<"):
            male = kawalek.lower()
            if male.startswith(("<script", "<style", "<title")):
                pomin = True
            elif male.startswith(("</script", "</style", "</title")):
                pomin = False
            wynik.append(kawalek)
        else:
            if not pomin:
                kawalek = SIEROTKI.sub(r"\1&nbsp;", kawalek)
                kawalek = JEDNOSTKI.sub(r"\1&nbsp;\2", kawalek)
                kawalek = ZAKRES.sub(r"\1&#8288;-&#8288;\2", kawalek)
            wynik.append(kawalek)
    return "".join(wynik)


def zloz(meta, tresc, dodatkowe=None):
    zmienne = {
        "tytul": meta.get("tytul", "Akademia Mocy Jeździeckich"),
        "og_tytul": meta.get("og_tytul", meta.get("tytul", "Akademia Mocy Jeździeckich")),
        "opis": meta.get("opis", ""),
        "body_klasa": meta.get("body_klasa", ""),
        "odtwarzacz_program": meta.get("odtwarzacz_program", "gimnastyka"),
        "flyout": flyout(),
        "stopka_programy": stopka_programy(),
        "programy_karty": "\n".join(karta_programu(p) for p in DANE["programy"]),
    }
    zmienne.update(dodatkowe or {})
    dokument = "\n".join([czesc("head.html"), czesc("ikony.html"), czesc("naglowek.html"), tresc.rstrip("\n"), czesc("stopka.html"), czesc("koniec.html")]) + "\n"
    dokument = wstaw_czesci(dokument)
    for k, v in zmienne.items():
        dokument = dokument.replace("{{%s}}" % k, v)
    aktywny = meta.get("aktywny", "").strip()
    if aktywny:
        dokument = dokument.replace('data-nav="%s"' % aktywny, 'data-nav="%s" aria-current="page"' % aktywny, 1)
    reszta = re.findall(r"\{\{[^}]+\}\}", dokument)
    if reszta:
        raise RuntimeError("Niewypełnione znaczniki: %s" % sorted(set(reszta)))
    return typografia(dokument)


def main():
    zapisane = []
    for plik in sorted(STRONY.glob("*.html")):
        if plik.name.startswith("_"):
            continue
        meta, tresc = naglowek_strony(plik.read_text(encoding="utf-8"))
        (REPO / plik.name).write_text(zloz(meta, tresc), encoding="utf-8")
        zapisane.append(plik.name)

    _, szablon = naglowek_strony((STRONY / "_program.html").read_text(encoding="utf-8"))
    for p in DANE["programy"]:
        meta = {
            "tytul": "%s | Akademia Mocy Jeździeckich" % p["nazwa"],
            "og_tytul": p["nazwa"],
            "opis": p["opis"],
            "aktywny": "programy",
            "odtwarzacz_program": p["id"],
            "body_klasa": "strona-programu",
        }
        tresc = szablon
        for k, v in program_placeholdery(p).items():
            tresc = tresc.replace("{{%s}}" % k, v)
        nazwa = "program-%s.html" % p["id"]
        (REPO / nazwa).write_text(zloz(meta, tresc), encoding="utf-8")
        zapisane.append(nazwa)
    print("Zbudowane strony:", ", ".join(zapisane))


if __name__ == "__main__":
    main()
