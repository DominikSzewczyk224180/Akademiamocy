# Testy na telefonach (etapy 3 i 4)

Odtwarzacz przeszedł 31 testów automatycznych na emulowanym iPhonie, Androidzie i komputerze (lista na końcu). Emulacja nie zastąpi prawdziwego telefonu, więc ta lista prowadzi przez test na iPhonie i Androidzie. Całość zajmuje około 15 minut na jeden telefon.

## Link do testów

```
https://dominikszewczyk224180.github.io/AkademiaMocy/trening.html?test=1&diag=1
```

- `test=1` skraca czasy: cały trening trwa około 2 minut.
- `diag=1` pokazuje panel „Diagnostyka” z przyciskiem „Kopiuj raport”.
- Bez parametrów jest zwykły trening, około 7 minut.

## Przed testem

- Bateria powyżej 20%, tryb niskiego zużycia energii wyłączony (sprawdzamy go osobno w teście 10).
- iPhone: przełącznik wyciszenia wyłączony, inaczej nie będzie sygnałów.
- Autoblokada ustawiona na 30 sekund albo 1 minutę, żeby test wygaszania miał sens.
- iPhone: Ustawienia, Ekran i jasność, Autoblokada. Android: Ustawienia, Wyświetlacz, Wygaszanie ekranu.

## Testy

| Nr | Co zrobić | Co powinno się stać |
|---|---|---|
| 1 | Otwórz link, dotknij „Zaczynamy” | Film rusza w ciągu sekundy, przy 3, 2, 1 słychać sygnały, w rogu zielony napis „Ekran nie zgaśnie” |
| 2 | Połóż telefon i nie dotykaj go przez 90 sekund | Ekran cały czas świeci, trening idzie dalej |
| 3 | W trakcie ćwiczenia obróć telefon poziomo, potem z powrotem | W poziomie film na cały ekran, licznik i nazwa na wierzchu. Licznik nie staje, film nie startuje od nowa. W pionie wraca zwykły widok |
| 4 | W poziomie dotknij ekranu | Pojawia się sterowanie, po 3 sekundach znika |
| 5 | Włącz blokadę obrotu, w pionie dotknij „Poziom” | iPhone: obraz obraca się w poziom, obróć telefon w lewo. Android: pełny ekran w poziomie. „Pion” wraca do zwykłego widoku |
| 6 | Patrz na kartę „Następne” | Zgadza się z planem ze startu. W poziomie karta pojawia się w ostatnich 10 sekundach ćwiczenia i w przerwach |
| 7 | Przy kocim grzbiecie | Licznik pokazuje „8×” i przycisk „Gotowe, dalej” (w trybie testowym ćwiczenie przejdzie też samo po 8 s) |
| 8 | Przy ptaku-psie, prawa strona | Film jest odbity lustrzanie, przed nim jest „Zmień stronę” |
| 9 | Wyjdź do ekranu głównego na 10 sekund i wróć | Trening wstrzymany z napisem, że aplikacja była w tle. „Wznów” działa, napis „Ekran nie zgaśnie” znowu zielony |
| 10 | Włącz tryb niskiego zużycia energii i zacznij od nowa | Jeśli film nie ruszy sam, widać „Dotknij, aby włączyć film”. Po dotknięciu film gra, licznik leci cały czas |
| 11 | Na starcie wybierz „Sygnały i głos” | Polski głos zapowiada ćwiczenia i przerwy. Jeśli telefon nie ma polskiego głosu, zostają sygnały |
| 12 | W połowie treningu odśwież stronę | Na starcie pojawia się „Kontynuuj”, które wraca do tego ćwiczenia |
| 13 | Dokończ trening | Ekran „Trening zaliczony”, ocena „Jak było?” działa, „Wróć do programu” otwiera stronę programu |
| 14 | Tylko iPhone: Udostępnij, Do ekranu początkowego, otwórz z ikony i powtórz testy 1-3 | Strona otwiera się bez paska Safari. Na iOS 18.4 i nowszym ekran nie gaśnie. Na starszym iOS strona sama ostrzega, że w tym trybie ekran może gasnąć |

## Jak wysłać wynik

1. Gdy coś działa inaczej, niż w tabeli, otwórz „Diagnostyka” (przycisk na dole odtwarzacza).
2. Dotknij „Kopiuj raport” i wklej go w wiadomość.
3. Dopisz model telefonu, wersję systemu i numer testu.

Raport zawiera m.in. stan blokady wygaszania, układ ekranu, stan filmu, liczbę klatek na sekundę i ostatnie zdarzenia. Nie zawiera danych osobowych.

## Wyniki

| Test | iPhone, Safari | iPhone, z ekranu początkowego | Android, Chrome |
|---|---|---|---|
| 1. Start i sygnały | | | |
| 2. Ekran nie gaśnie | | | |
| 3. Obrót w trakcie | | | |
| 4. Sterowanie w poziomie | | | |
| 5. Przycisk Poziom | | | |
| 6. Następne ćwiczenie | | | |
| 7. Powtórzenia | | | |
| 8. Strony | | | |
| 9. Powrót z tła | | | |
| 10. Oszczędzanie energii | | | |
| 11. Głos | | | |
| 12. Kontynuacja | | | |
| 13. Koniec treningu | | | |
| 14. Ekran początkowy | | nie dotyczy Androida | nie dotyczy |

Model i system: iPhone ............ iOS ........ / Android ............ wersja ........

## Znane ograniczenia

- iPhone nie pozwala stronom włączyć pełnego ekranu dla zwykłych elementów. Dlatego poziom na iPhonie to prawdziwy obrót telefonu albo obrót CSS.
- Przełącznik wyciszenia na iPhonie wycisza też sygnały. To ustawienie systemu, strona go nie obejdzie.
- Screen Wake Lock działa w Safari od iOS 16.4, a w aplikacji z ekranu początkowego od iOS 18.4. Na starszych wersjach strona pokazuje ostrzeżenie i instrukcję ustawienia Autoblokady.
- Na części telefonów z Androidem tryb oszczędzania baterii producenta może skrócić wygaszanie mimo blokady.

## Co sprawdziły testy automatyczne

Emulacja iPhone 13 (bez pełnego ekranu), Pixel 5 i komputer 1440 px:

- start, przygotowanie, ćwiczenie, licznik i odtwarzanie filmu
- blokada wygaszania: włączenie, odnowienie po powrocie z tła, ostrzeżenie bez API, ostrzeżenie dla aplikacji z ekranu początkowego na iOS 17
- obrót CSS na iPhonie, prawdziwy obrót bez przerwy w treningu, chowanie sterowania po 3 s, powrót do pionu
- Android: pełny ekran, obrót CSS, gdy blokada orientacji się nie uda, wyjście z pełnego ekranu
- pauza po przejściu w tło i wznowienie
- cały trening do końca: odbity film dla prawej strony, przerwy z klipem następnego ćwiczenia, podsumowanie i ocena
- ćwiczenie na powtórzenia, kontynuacja po przeładowaniu strony
- zablokowane autoodtwarzanie (jak w trybie niskiego zużycia energii) i przycisk „Dotknij, aby włączyć film”
- brak błędów JavaScript i brakujących plików

# Strefa kursantki (etap 4)

Link: `https://dominikszewczyk224180.github.io/AkademiaMocy/logowanie.html`. Całość zajmuje około 10 minut. Odtwarzacz w strefie można przyspieszyć, dopisując `&test=1` do adresu treningu.

| Nr | Co zrobić | Co powinno się stać |
|---|---|---|
| S1 | Otwórz `panel.html` bez logowania | Strona przenosi do logowania. „Wejdź jako kursantka demo” wraca do panelu |
| S2 | Panel | Karta „trening na dziś” z przeszkodą 11, cel tygodnia, seria, Próba Mocy zablokowana na 2 przeszkody |
| S3 | Parkur: dotknij przeszkody albo „Kontynuuj” | Otwiera się trening przeszkody 11. Po zaliczeniu mapa ma ptaszek na 11, a „Tu jesteś” stoi na 12 |
| S4 | Zalicz przeszkodę 12 | Ekran końcowy mówi, że Próba Mocy jest odblokowana, i prowadzi do Próby |
| S5 | Próba: 4 testy ze stoperem albo wpisanym wynikiem | Po zaliczeniu wszystkich testów jest rozeta Stęp, Kłus się otwiera, certyfikat ma imię i datę |
| S6 | Panel demo, „Próba niezaliczona” | Panel i Próba pokazują tydzień celowany i datę drugiego podejścia |
| S7 | Postępy | Liczby, kalendarz, cel tygodnia, wyniki Prób i rozety zgadzają się z historią |
| S8 | Certyfikat, „Zapisz jako PDF” | Otwiera się drukowanie, na podglądzie jest sam certyfikat bez menu |
| S9 | Dolny pasek na telefonie | Panel, Parkur, Próba i Postępy przełączają się bez przewijania w bok, pasek nie zasłania treści |

Co sprawdziły testy automatyczne strefy: przekierowanie do logowania, logowanie demo, zaliczenie przeszkód 11 i 12 w odtwarzaczu z zapisem, odblokowanie i zaliczenie Próby, rozeta, certyfikat, odblokowanie Kłusa, scenariusz niezaliczonej Próby, układ na iPhonie bez przewijania w bok, brak błędów JavaScript i brakujących plików. Wszystkie 7 stron strefy działa na 1440 i 390 px.
