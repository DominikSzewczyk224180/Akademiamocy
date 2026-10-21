# Akademia Mocy Jeździeckich: demo, etap 3

Część publiczna (etap 2) i pełny odtwarzacz treningu (etap 3): jeden trening na 5 klipach, pion i poziom, licznik, następne ćwiczenie, ekran, który nie gaśnie.
Wygląd, kroje i kolory są te same co w etapie 1. Testy na telefonach: `TESTY.md`.

## Strony

| Plik | Co jest na stronie |
|---|---|
| `index.html` | Strona główna |
| `program-ogolny.html` | Ogólny program dla jeźdźców |
| `program-gimnastyka.html` | Gimnastyka dla jeźdźców |
| `program-ranne-moce.html` | Ranne Moce Jeździeckie |
| `cennik.html` | Oferta, porównanie, dodatki, vouchery, płatności |
| `o-akademii.html` | Historia, zasady, ludzie, jak powstają programy, GOT’S for Horses |
| `faq.html` | Wszystkie pytania z wyszukiwarką i kategoriami |
| `lista.html` | Lista chętnych: 3 krótkie kroki i dobór programu na koniec |
| `trening.html` | Odtwarzacz pełnego treningu (etap 3) |

## Co nowego w etapie 2

- Menu: „Programy” rozwija listę trzech programów w ich kolorach. Na telefonie lista otwiera się w arkuszu menu. Pigułka pokazuje stronę, na której jesteś.
- Strona programu: hero w kolorze programu, „bilet” z przykładowym treningiem, dla kogo, efekty w siodle, sprzęt, levele z bramkami Próby Mocy, rozpiska 4 bloków z działającym odtwarzaczem, testy Próby, pytania i inne programy.
- Odtwarzacz na stronie programu odtwarza trening tego programu.
- Cennik: tabela porównania (z ceną w przeliczeniu na miesiąc), dodatki z Justyną, voucher, metody płatności.
- Pytania: wyszukiwarka działa bez polskich znaków („lydka” znajdzie „łydka”), filtr kategorii, licznik pytań, stan „nic nie znaleźliśmy”.
- Lista chętnych: 3 kroki (Twoja jazda, Twój cel, Kontakt), walidacja każdego kroku, na końcu rekomendacja programu z uzasadnieniem. Link `lista.html?program=gimnastyka` z przycisku na stronie programu zapisuje od razu na ten program.

## Etap 3: odtwarzacz treningu

`trening.html` otwiera trening z `data/treningi.js` (domyślnie pierwszy, inny przez `?t=<id>`). Wejście jest na stronie głównej i na stronach programów.

- Ekran startowy: plan bloków, czas, sprzęt, wybór dźwięku (sygnały, sygnały i głos, cisza) i „Kontynuuj”, jeśli trening został przerwany.
- Pion: film 16:9 na górze, pod nim licznik, nazwa, wskazówka, częsty błąd, następne ćwiczenie z miniaturą, sterowanie i paski postępu jak w relacjach.
- Poziom: po obróceniu telefonu film na cały ekran, licznik i nazwa na wierzchu, sterowanie po dotknięciu (znika po 3 s). Obrót nie zatrzymuje treningu.
- Przycisk „Poziom”: Android i komputer włączają pełny ekran (Android dodatkowo blokuje orientację poziomą). iPhone nie ma pełnego ekranu dla stron, więc obraz obraca się w CSS. Działa też przy blokadzie obrotu.
- Ekran nie gaśnie: Screen Wake Lock API, odnawiane po powrocie do karty, zwalniane po 5 minutach pauzy. Gdy telefon tego nie wspiera, strona pokazuje ostrzeżenie i instrukcję Autoblokady.
- Fazy: przygotowanie, ćwiczenie, zmiana strony, przerwa. W przerwie widać już klip następnego ćwiczenia. Druga strona to odbicie lustrzane klipu.
- Ćwiczenia na czas i na powtórzenia (wtedy przycisk „Gotowe, dalej”).
- Sygnały 3, 2, 1 (Web Audio), opcjonalny polski głos (synteza mowy telefonu), wibracja na Androidzie.
- Przejście w tło pauzuje trening. Postęp zapisuje się w przeglądarce, więc po przeładowaniu jest „Kontynuuj”.
- Jeśli tryb oszczędzania energii zablokuje film, pojawia się „Dotknij, aby włączyć film”, a licznik leci dalej.
- Klawiatura na komputerze: spacja pauza, strzałki poprzednie i następne, F pełny ekran.

Parametry do testów: `?test=1` (krótkie czasy, cały trening około 2 minut), `?diag=1` (panel diagnostyki z kopiowaniem raportu). `?tempo=10` przyspiesza czas i służy tylko do testów automatycznych.

### Klipy

W `assets/wideo/` jest 5 klipów zastępczych (animowana sylwetka, 1280×720, H.264, płynna pętla, razem około 580 KB) i ich kadry `.jpg`. Prawdziwe nagrania Justyny podmienia się w `data/treningi.js`, w sekcji `klipy`.

Jak nagrać klip, żeby działał najlepiej:

- poziomo 16:9, najlepiej 1080p i 25-30 kl./s, telefon na statywie, stały kadr
- całe ciało w kadrze z zapasem u góry i u dołu, jasne, spokojne tło
- jeden klip to jedno ćwiczenie: 2-3 powtórzenia, które da się zapętlić (4-8 sekund)
- bez muzyki i bez napisów w kadrze, bo film gra wyciszony, a druga strona może być odbiciem lustrzanym
- przy ćwiczeniach niesymetrycznych nagraj obie strony i dodaj drugi klip zamiast `"lustro": true`

W demo klipy są plikami MP4 w repo. W produkcji trafią do Bunny Stream: wystarczy dopisać przy klipie `"hls": "https://vz-....b-cdn.net/<id>/playlist.m3u8"`. iPhone odtwarza HLS sam, a na Androidzie i komputerze odtwarzacz dociąga hls.js 1.7.3 (tylko wtedy, gdy klip ma adres HLS).

### Format treningu

Opis pól jest na początku `data/treningi.js`. W skrócie: trening ma bloki, blok ma ćwiczenia, a opcjonalnie `rundy`, `przerwa` (po każdym ćwiczeniu) i `przerwaRundy`. Ćwiczenie ma `czas` w sekundach albo `powtorzenia` z orientacyjnym `czasOk`, a `strony: true` robi lewą i prawą stronę. Przygotowanie przed ćwiczeniem i zmiana strony dodają się same.

### Ikona na ekranie głównym

`manifest.webmanifest` i ikony `assets/ikona-*.png` pozwalają dodać Akademię do ekranu głównego telefonu. Otwiera się wtedy bez paska przeglądarki.

## Jak zmieniać strony

Menu, stopka i head są wspólne dla wszystkich stron, więc trzymamy je w jednym miejscu, a gotowe pliki `.html` składa skrypt.

```
_zrodla/
  buduj.py            skrypt składający strony
  czesci/             wspólne kawałki: head, menu, stopka, odtwarzacz, karty cennika, ikony, grafiki SVG
  strony/             treść każdej strony; _program.html to szablon trzech stron programów
data/programs.js      dane programów: opisy, levele, ćwiczenia, testy Próby, pytania
data/treningi.js      pełne treningi do odtwarzacza i lista klipów
```

Po zmianie w `_zrodla` albo w `data/programs.js` uruchom z katalogu repo:

```
python3 _zrodla/buduj.py
```

Wystarczy Python 3, bez dodatkowych bibliotek. Skrypt dodaje też twarde spacje (po w, z, i, a, o, u i między liczbą a jednostką) i pilnuje, żeby zakresy typu 2-3 nie łamały się na końcu linii.

Gotowe pliki `.html` są już w paczce, więc do samego wdrożenia nic nie trzeba uruchamiać.

- Nowy program: dopisz go w `data/programs.js` (ten sam układ pól co pozostałe) i zbuduj strony. Powstanie `program-<id>.html`, a program pojawi się w menu, w stopce i na stronie głównej.
- `data/programs.js` jest zapisany zgodnie z JSON (podwójne cudzysłowy, bez komentarzy w środku), bo czyta go też Python.
- Folder `_zrodla` zaczyna się od podkreślenia, więc GitHub Pages go nie publikuje.

## Dobór programu na liście chętnych

Logika jest w `js/main.js` (funkcja `dobierz`). Każda odpowiedź dodaje punkty programom:

- łydka i półsiad, kondycja: Ogólny program
- symetria, biodra: Gimnastyka
- równowaga i tułów: Ogólny i trochę Gimnastyka
- komfort pleców: Gimnastyka i trochę Ranne Moce
- 10-15 minut na trening: mocno Ranne Moce

Przy remisie wygrywa Gimnastyka, potem Ogólny. Osoby, które startują regularnie, dostają podpowiedź o teście wejściowym do Kłusa. Wagi łatwo zmienić, jeśli Justyna zechce inaczej.

## Jak wrzucić na GitHub Pages

1. Podmień zawartość repo `AkademiaMocy` na zawartość tego folderu (`index.html` w głównym katalogu).
2. Settings → Pages → Source: Deploy from a branch → `main` / `(root)` → Save.
3. Po 1-2 minutach demo działa pod `https://dominikszewczyk224180.github.io/AkademiaMocy/`.
4. Jeśli repo ma inną nazwę, popraw adres `og:image` w `_zrodla/czesci/head.html` i zbuduj strony.

Demo działa też po dwukliku w `index.html` na dysku, bez serwera.

## Linki dla Justyny

- Strona główna: `https://dominikszewczyk224180.github.io/AkademiaMocy/`
- Program: `.../program-gimnastyka.html`, cennik: `.../cennik.html`, lista chętnych: `.../lista.html`
- Wariant krojów B: dopisz `?fonty=b` do dowolnego adresu. W stopce są też przyciski „Kroje: A / B”.

## Do podmiany przed startem

- Kadry: `assets/img/kadr-mata.svg` i `kadr-siodlo.svg` na zdjęcia albo krótkie filmy 9:16.
- Klipy ćwiczeń w `assets/wideo/` na nagrania Justyny (wskazówki w sekcji „Klipy”).
- Zdjęcia Justyny i osoby od fizjoterapii (miejsca z literami J i F), w pionie 4:5.
- Imię, nazwisko, opis i doświadczenie osoby od fizjoterapii, kilka zdań o drodze Justyny (`o-akademii.html`).
- Treści programów w `data/programs.js`: ćwiczenia, czasy, testy Próby Mocy i pytania są przykładowe. Justyna i fizjoterapia powinny je sprawdzić.
- Ceny (179, 229, 499 zł), cena Weryfikacji Próby (59 zł) i zasady voucherów.
- Instagram, Facebook, regulamin, polityka prywatności, zastrzeżenie zdrowotne, kontakt, logowanie: na razie pokazują komunikat.
- Formularze w demo nic nie wysyłają. W wersji produkcyjnej podłączymy Brevo (z polami: program, cele, czas, poziom), po ustawieniu SPF i DKIM domeny.

## Ważne

- `noindex, nofollow`: demo nie trafi do Google.
- Fonty są w paczce, bez Google Fonts (szybciej i zgodnie z RODO).
- Formularze mają etykiety, komunikaty błędów przy polach i obsługę z klawiatury. Pigułki w formularzu to prawdziwe pola radio i checkbox.
- Pastele tylko w tłach i ozdobach. Tekst zawsze w kolorze kakao.
- Przy ustawieniu „ogranicz ruch” animacje się wyłączają.

## Kolejne etapy demo

1. Etap 1: strona główna
2. Etap 2: strony programów, cennik, O Akademii, pytania, lista chętnych
3. Etap 3: pełny odtwarzacz treningu (ta paczka). Do zrobienia na żywo: testy z `TESTY.md` na iPhonie i Androidzie
4. Etap 4: strefa kursantki (panel, mapa parkuru, Próba Mocy, postępy)
5. Etap 5: zakup i konto (koszyk, udawana płatność BLIK, voucher)
