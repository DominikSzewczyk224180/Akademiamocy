# Akademia Mocy Jeździeckich: demo, etap 5

Część publiczna (etap 2), pełny odtwarzacz treningu (etap 3), strefa kursantki (etap 4) oraz zakup i konto (etap 5): cennik, koszyk, udawana płatność BLIK, odblokowany program, logowanie i vouchery.
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
| `logowanie.html` | Wejście do strefy kursantki (w demo przycisk „Wejdź jako kursantka demo”) |
| `panel.html` | Panel: trening na dziś, cel tygodnia, seria, stan Próby, parkur w skrócie, rozety, ostatnie treningi |
| `mapa.html` | Mapa parkuru: przeszkody po kolei, „Tu jesteś”, Próba Mocy na mecie, zakładki Stęp, Kłus, Galop |
| `przeglad.html` | Przegląd treningu przed startem: bloki, ćwiczenia z kadrami, w czym pomagają w siodle, częste błędy |
| `proba.html` | Próba Mocy: testy ze stoperem, technika do odhaczenia, rozeta albo tydzień celowany |
| `postepy.html` | Postępy: liczby, kalendarz treningów, cel tygodnia, wyniki Prób, rozety, „Jak było?” |
| `certyfikat.html` | Certyfikat po zaliczonej Próbie, do zapisania jako PDF |
| `koszyk.html` | Koszyk: oferta, program, dla siebie albo na prezent, dane, faktura, zgody, kod rabatowy |
| `platnosc.html` | Udawana bramka płatności z BLIK-iem (tak jak przekierowanie do Przelewy24) |
| `zamowienie.html` | Wynik płatności: odblokowany program albo gotowy voucher, szczegóły, podgląd maila |
| `aktywuj.html` | Aktywacja vouchera kodem, z założeniem konta albo na zalogowane konto |
| `voucher.html` | Voucher prezentowy do zapisania jako PDF |
| `konto.html` | Konto i zakupy: dane, dostępy, zamówienia, vouchery, ustawienia |

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

## Etap 4: strefa kursantki

Wejście: „Zaloguj” w menu albo `logowanie.html`. Strony strefy bez logowania przenoszą do logowania i po nim wracają tam, gdzie była kursantka. W demo logowanie to przycisk, a stan konta (historia treningów, wyniki Prób, rozety) zapisuje się w przeglądarce. W produkcji te same dane przyjdą z Django, a strony zostaną bez zmian.

- Panel: powitanie zależne od pory dnia, karta „trening na dziś” z kadrami ćwiczeń, cel tygodnia (3 treningi), seria tygodni z celem, stan Próby, pasek parkuru, półka z rozetami, ostatnie treningi z oceną i wskazówka tygodnia.
- Mapa parkuru: każdy trening to przeszkoda (12 w levelu), na mecie Próba Mocy. Zaliczone mają ptaszek, następna świeci „Tu jesteś”. Pod mapą ta sama lista przeszkód po kolei (wygodna na telefonie i dla czytników ekranu). Kłus otwiera się po zaliczonej Próbie Stępu, Galop jest „wkrótce”.
- Przegląd treningu: co jest w treningu, blok po bloku, w czym każde ćwiczenie pomaga w siodle i na co uważać. Strzałki prowadzą do poprzedniej i następnej przeszkody.
- Odtwarzacz zapisuje zaliczenie przeszkody i ocenę „Jak było?”. Po ostatniej przeszkodzie od razu proponuje Próbę Mocy.
- Próba Mocy: 4 testy (stoper z odliczaniem albo wpisany wynik z własnego stopera, na czas albo z wyborem odpowiedzi) i technika do odhaczenia. Zaliczone wszystkie testy dają rozetę, otwierają Kłus i certyfikat. Jeśli czegoś zabraknie, strefa układa tydzień celowany (3 krótkie treningi z ćwiczeniami na brakujące testy), a drugie podejście jest możliwe po 7 dniach. Mocne osoby mogą „podejść do Próby od razu”.
- Postępy: liczba treningów i minut, seria, rozety, kalendarz ostatnich 12 tygodni, treningi w tygodniu na tle celu, wyniki kolejnych Prób, rozkład ocen po treningach.
- Certyfikat: imię, program, level i data. „Zapisz jako PDF” otwiera drukowanie przeglądarki.

### Panel demo

Na dole każdej strony strefy jest „Panel demo”. Przełącza stan konta, żeby Justyna mogła zobaczyć każdy etap drogi kursantki bez trenowania 4 tygodni:

| Stan | Co pokazuje |
|---|---|
| Dane przykładowe | 10 z 12 przeszkód, seria 3 tygodnie (stan na start) |
| Zalicz następny trening | jakby kolejny trening był zrobiony dziś |
| Gotowa do Próby | cały parkur Stęp przejechany |
| Próba niezaliczona | tydzień treningu celowanego przed drugim podejściem |
| Po Próbie | rozeta Stęp, certyfikat i parkur Kłus |
| Nowe konto | start od pierwszej przeszkody |

### Dane strefy

- `js/kursantka.js`: stan kursantki i wszystkie wyliczenia (parkur, cel tygodnia, seria, stan Próby, rozety). Klucz w przeglądarce: `akademia-kursantka`.
- `data/treningi.js`: oprócz treningów i klipów zawiera słownik ćwiczeń (`cwiczenia`) i parkury (`kursy`: kolejność treningów na przeszkodach).
- `data/proby.js`: testy Prób Mocy, cele, kroki, technika i ćwiczenia na tydzień celowany. Progi są przykładowe: ustala je Justyna z fizjoterapią.
- `js/strefa.js`: wszystkie ekrany strefy, mapa parkuru rysowana w SVG.

## Etap 5: zakup i konto

Ścieżka: cennik, koszyk, płatność BLIK, odblokowany program. Działa tak jak w produkcji: koszyk zakłada zamówienie ze statusem „oczekuje”, bramka przyjmuje płatność i dopiero „powiadomienie o płatności” włącza dostęp albo tworzy voucher. W produkcji to powiadomienie wysyła Przelewy24 do Django, a strona zamówienia tylko pokazuje wynik.

- Cennik, „Kup ten program” na stronach programów i „Kup voucher” prowadzą do koszyka z wybraną ofertą.
- Koszyk: oferta (przy „Programie” także wybór programu), dla siebie albo na prezent (imię, podpis, życzenia), dane, faktura z NIP-em, regulamin i zgoda na dostęp od razu, kod rabatowy. W demo działa kod START10 (10%).
- Bramka płatności: BLIK z kodem z aplikacji banku. W demo każdy 6-cyfrowy kod przechodzi, 000 000 udaje błędny kod, a 111 111 płatność odrzuconą w banku. Przelew i karta pokazują, co będzie w produkcji.
- Po płatności: strona zamówienia z datami dostępu, szczegółami i podglądem maila z potwierdzeniem. Nowa kursantka ma od razu konto i jest zalogowana. Jeśli konto z tym adresem już istniało, dostęp dopisuje się do niego, a strona prosi o zalogowanie.
- Przedłużenie: kupno tego samego dostępu, który jeszcze trwa, zaczyna nowy okres zaraz po obecnym. Panel przypomina o końcu dostępu 14 dni wcześniej.
- Vouchery: zakup na prezent daje kod (AMJ-XXXX-XXXX) i voucher w PDF. Osoba obdarowana aktywuje go w `aktywuj.html`, a dostęp liczy się od aktywacji. Kod działa raz. Do testów jest gotowy kod AMJ-DEMO-2026 (karnet 3 miesiące).
- Logowanie: bez hasła, linkiem na e-mail (w demo przycisk „Otwórz link z maila”). Konta przetrwają wylogowanie, więc ten sam adres wraca do tego samego konta. Dla nieznanego adresu strona podpowiada zakup albo voucher, ale nie zdradza, czy konto istnieje.
- Strefa: „Twoje programy” w panelu (odblokowane i do kupienia), zakładki programów na mapie, menu „Konto i zakupy” i „Aktywuj voucher”. Ogólny program i Ranne Moce mają teraz własne parkury (12 i 14 przeszkód) i Próby Mocy, więc każdy kupiony program ma treść.
- Panel demo ma nowy stan „Dostęp się kończy”, żeby pokazać przypomnienie o przedłużeniu.

Dane: `data/sklep.js` (produkty, ceny, kody, voucher demo). Konta i dostępy prowadzi `js/kursantka.js`, a ekrany sklepu i konta `js/sklep.js`. Zamówienia i vouchery w demo leżą w przeglądarce (`akademia-zamowienia`, `akademia-vouchery`), konta pod `akademia-konta`.

Do sprawdzenia z prawnikiem przed startem: treść zgody na natychmiastowy dostęp i utratę prawa odstąpienia, zasady zwrotu voucherów, dokument zakupu (paragon albo faktura).

## Powtórka Próby Mocy

Zaliczoną Próbę można powtarzać jako sprawdzian formy: na stronie Próby jest przycisk „Zrób Próbę jeszcze raz”. Powtórka nie zmienia rozety, odblokowanego levelu ani certyfikatu i nie uruchamia tygodnia celowanego, nawet przy słabszym wyniku. Na końcu każdy test stoi obok poprzedniego podejścia z różnicą w sekundach (w testach na dwie strony liczy się słabsza strona). Powtórki są oznaczone w tabeli w Postępach.

## Konie na stronie

Pliki są w `assets/img/konie/`: koń w kresce (`kon.svg`), koń z jeźdźczynią (`kon-jezdziec.svg`), blada sylwetka do tła (`kon-sylwetka.svg`), znak z głową konia (`glowa-konia.svg`) i kafelek wzoru (`wzor-konie.svg`).

W hero kadr „Na macie” pokazuje tę samą kobietę, która w kadrze „W siodle” siedzi na koniu, tym razem w mostku biodrowym: `assets/img/kadr-mata-ruch.svg` to wersja w ruchu (unoszenie, przytrzymanie, opuszczanie w 4,2 s), a `assets/img/kadr-mata.svg` to nieruchoma pozycja szczytowa dla osób z wyłączonymi animacjami i do obrazka udostępniania.

Gdzie są użyte: kadr „W siodle” w hero i obrazek udostępniania (`assets/img/kadr-siodlo.svg`, `assets/og.png`), koń przy „Co poczujesz w siodle”, koń na starcie planu parkuru, wzór w pasie cennika (strona główna i cennik), sylwetka w zachęcie na końcu stron, znak przy GOT'S for Horses (O Akademii), koń z jeźdźczynią na mapie parkuru w strefie (wjeżdża do bieżącej przeszkody) i nad bieżącą przeszkodą w panelu. Ruch koni wyłącza się, gdy ktoś ma w systemie ograniczenie animacji.

Podstawa sylwetki konia: rysunek „Horse” autorstwa Andreasa Preussa (marauder) z openclipart, udostępniony jako CC0 (bez ograniczeń praw autorskich), dostępny w zestawie danych scikit-image. Kreska, anatomia, grzywa, ogon, cieniowanie, jeźdźczyni, siodło i ogłowie to rysunek własny.

## Jak zmieniać strony

Menu, stopka i head są wspólne dla wszystkich stron, więc trzymamy je w jednym miejscu, a gotowe pliki `.html` składa skrypt.

```
_zrodla/
  buduj.py            skrypt składający strony
  czesci/             wspólne kawałki: head, menu, stopka, odtwarzacz, karty cennika, ikony, grafiki SVG
  strony/             treść każdej strony; _program.html to szablon trzech stron programów
data/programs.js      dane programów: opisy, levele, ćwiczenia, testy Próby, pytania
data/treningi.js      pełne treningi, klipy, słownik ćwiczeń i parkury
data/proby.js         testy Prób Mocy
data/sklep.js         produkty, ceny, kody rabatowe i voucher demo
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
3. Etap 3: pełny odtwarzacz treningu
4. Etap 4: strefa kursantki: panel, mapa parkuru, przegląd treningu, Próba Mocy z rozetą, postępy, certyfikat
5. Etap 5: zakup i konto: cennik, koszyk, udawana płatność BLIK, odblokowany program, logowanie, vouchery (ta paczka)
