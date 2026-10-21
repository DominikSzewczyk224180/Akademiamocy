# Akademia Mocy Jeździeckich: demo, etap 1 (wersja 2)

Strona główna, która ustala wygląd całej Akademii: kroje, kolory, przyciski i sekcje.
Kolejne podstrony korzystają z tego samego `css/style.css` i `data/programs.js`.

## Co nowego w wersji 2

- Kroje: Instrument Sans (wąski, nowoczesny) zamiast szeryfów. Wariant B: Familjen Grotesk.
- Menu: pływająca kapsuła, różowa pigułka pokazuje aktywną sekcję. Na telefonie menu wysuwa się jako arkusz.
- Hero: duży nagłówek z pigułkami (dom, podkowa) i dwa kadry jak relacje: „Na macie” i „W siodle”.
- Jak to działa: plan parkuru z góry, trzy przeszkody z numerami.
- Każdy trening w 4 blokach: działający podgląd odtwarzacza. Licznik leci, pauza i przełączanie ćwiczeń działają, a przycisk „Poziom” obraca telefon.
- Na telefonie: dok z przyciskiem rozgrzewki pod kciukiem (znika przy formularzu i w menu).

## Co jest w paczce

- `index.html`: strona główna
- `css/style.css`: wspólny styl (tokeny, kroje, przyciski, wszystkie sekcje)
- `js/main.js`: menu, karty programów, odtwarzacz, formularz (demo), dok, przełącznik krojów
- `data/programs.js`: programy, levele, bloki i przykładowy trening do odtwarzacza
- `assets/fonts/`: Instrument Sans i Familjen Grotesk (lokalnie, licencja SIL OFL w `OFL-*.txt`)
- `assets/img/`: kadry zastępcze `kadr-mata.svg` i `kadr-siodlo.svg`
- `assets/og.png`: obrazek do podglądu linku w WhatsAppie i Messengerze
- `assets/favicon.svg`: ikonka karty w przeglądarce (rozeta)

## Jak wrzucić na GitHub Pages

1. Załóż publiczne repo `AkademiaMocy` (albo podmień pliki w istniejącym).
2. Wrzuć zawartość folderu tak, żeby `index.html` był w głównym katalogu repo.
3. Settings → Pages → Source: Deploy from a branch → `main` / `(root)` → Save.
4. Po 1-2 minutach demo działa pod `https://dominikszewczyk224180.github.io/AkademiaMocy/`.
5. Jeśli repo ma inną nazwę, popraw adres w `og:image` w `index.html`.

Przy podmianie wersji usuń stare pliki z repo (stare fonty i `hero-*.svg` nie są już potrzebne).
Demo działa też po dwukliku w `index.html` na dysku, bez serwera.

## Linki dla Justyny

- Wariant A, Instrument Sans: `https://dominikszewczyk224180.github.io/AkademiaMocy/?fonty=a`
- Wariant B, Familjen Grotesk: `https://dominikszewczyk224180.github.io/AkademiaMocy/?fonty=b`
- W stopce są też przyciski „Kroje: A / B”. Po decyzji usuwamy je razem z wariantem, który odpadnie.

## Do podmiany przed startem

- Kadry w hero: `assets/img/kadr-mata.svg` i `kadr-siodlo.svg` na zdjęcia albo krótkie filmy w pionie 9:16 (np. 1080×1920). Najlepiej ten sam ruch na macie i w siodle.
- Podgląd odtwarzacza używa `kadr-mata.svg`. Docelowo tu będzie klip z ćwiczenia.
- „Kto stoi za Akademią”: miejsca z literami J i F na zdjęcia w pionie 4:5 (np. 1200×1500 px).
- Imię, nazwisko i opis osoby od fizjoterapii.
- Ceny są przykładowe: 179, 229 i 499 zł.
- Instagram, Facebook, regulamin, polityka prywatności, kontakt, logowanie: na razie pokazują komunikat.
- Formularz rozgrzewki w demo nic nie wysyła. W wersji produkcyjnej podłączymy Brevo.

## Ważne

- `noindex, nofollow`: demo nie trafi do Google.
- Fonty są w paczce, bez Google Fonts: szybciej i bez wysyłania adresów IP odwiedzających do Google (RODO).
- Polska typografia: twarde spacje po jednoliterowych słowach (w, z, i, a, o, u) i między liczbą a jednostką.
- Pastele tylko w tłach i ozdobach. Tekst zawsze w kolorze kakao, żeby był czytelny i miał dobry kontrast.
- Ruch: jedno wejście w hero, reszta reaguje na kliknięcia. Przy ustawieniu „ogranicz ruch” animacje się wyłączają.

## Kolejne etapy demo

1. Etap 1: strona główna (ta paczka)
2. Etap 2: strony 3 programów, cennik, O Akademii, FAQ, lista chętnych
3. Etap 3: pełny odtwarzacz treningu (pion, poziom, licznik, ekran nie gaśnie)
4. Etap 4: strefa kursantki (panel, mapa parkuru, Próba Mocy, postępy)
5. Etap 5: zakup i konto (koszyk, udawana płatność BLIK, voucher)
