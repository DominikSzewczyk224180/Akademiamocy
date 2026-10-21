# Akademia Mocy Jeździeckich: demo, etap 1

Strona główna, która ustala wygląd całej Akademii: kolory, kroje, przyciski i sekcje.
Kolejne podstrony korzystają z tego samego `css/style.css` i `data/programs.js`.

## Co jest w paczce

- `index.html`: strona główna
- `css/style.css`: wspólny styl (tokeny kolorów, kroje, przyciski, wszystkie sekcje)
- `js/main.js`: menu na telefonie, karty programów, formularz rozgrzewki (demo), przełącznik krojów, komunikaty
- `data/programs.js`: dane programów, jedno źródło dla całego demo
- `assets/fonts/`: Fraunces, Plus Jakarta Sans, Bodoni Moda (lokalnie, licencja SIL OFL w plikach `OFL-*.txt`)
- `assets/img/`: ilustracje zastępcze do hero
- `assets/og.png`: obrazek do podglądu linku w WhatsAppie i Messengerze
- `assets/favicon.svg`: ikonka karty w przeglądarce (rozeta)

## Jak wrzucić na GitHub Pages

1. Załóż publiczne repo `AkademiaMocy`.
2. Wrzuć zawartość folderu tak, żeby `index.html` był w głównym katalogu repo.
3. Settings → Pages → Source: Deploy from a branch → `main` / `(root)` → Save.
4. Po 1-2 minutach demo działa pod `https://dominikszewczyk224180.github.io/AkademiaMocy/`.
5. Jeśli repo ma inną nazwę, popraw adres w `og:image` w `index.html` (WhatsApp wymaga pełnego adresu obrazka).

Demo działa też po dwukliku w `index.html` na dysku, bez serwera.

## Linki dla Justyny: porównanie krojów nagłówków

- Wariant A, Fraunces: `https://dominikszewczyk224180.github.io/AkademiaMocy/?fonty=a`
- Wariant B, Bodoni Moda: `https://dominikszewczyk224180.github.io/AkademiaMocy/?fonty=b`
- Przycisk „Nagłówki A/B” w lewym dolnym rogu przełącza na żywo i zapamiętuje wybór.
- Logo, rozety i drobne napisy marki zostają we Fraunces w obu wariantach.
- Po decyzji usuwamy przycisk i wariant, który odpadnie (sekcja 11 w `style.css`, punkt 6 w `main.js`).

## Do podmiany przed startem

- Zdjęcia hero: `assets/img/hero-mata.svg` i `hero-siodlo.svg` na zdjęcia JPG, pion 3:4 (np. 1200×1600 px). Najlepiej ten sam ruch na macie i w siodle.
- „Kto stoi za Akademią”: miejsca z literami J i F na zdjęcia, pion 4:5 (np. 1200×1500 px).
- Imię, nazwisko i opis osoby od fizjoterapii.
- Ceny są przykładowe: 179, 229 i 499 zł.
- Instagram, Facebook, regulamin, polityka prywatności, kontakt: na razie pokazują komunikat, że powstaną później.
- Formularz rozgrzewki w demo nic nie wysyła. W wersji produkcyjnej podłączymy Brevo.

## Ważne

- `noindex, nofollow`: demo nie trafi do Google.
- Fonty są w paczce, bez Google Fonts: szybciej i bez wysyłania adresów IP odwiedzających do Google (RODO).
- Polska typografia: twarde spacje po jednoliterowych słowach (w, z, i, a, o, u) i między liczbą a jednostką.
- Pastele tylko w tłach i ozdobach. Tekst zawsze w kolorze mokka, żeby był czytelny i miał dobry kontrast.

## Kolejne etapy demo

1. Etap 1: strona główna (ta paczka)
2. Etap 2: strony 3 programów, cennik, O Akademii, FAQ, lista chętnych
3. Etap 3: odtwarzacz treningu (pion, poziom, licznik, ekran nie gaśnie)
4. Etap 4: strefa kursantki (panel, mapa parkuru, Próba Mocy, postępy)
5. Etap 5: zakup i konto (koszyk, udawana płatność BLIK, voucher)
