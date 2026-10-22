/*
  Akademia Mocy Jeździeckich: treningi, biblioteka ćwiczeń i parkury (etap 3 i 4).
  Zapis zgodny z JSON, bo czyta go też _zrodla/buduj.py.

  Biblioteka ("cwiczenia"): każde ćwiczenie istnieje raz. Trening odwołuje się do niego przez "cw"
  i dodaje parametry: "czas" w sekundach albo "powtorzenia" (z orientacyjnym "czasOk"), "strony": true.
  Klip: "mp4" w repo (demo). W produkcji dopisujemy "hls" z Bunny Stream.
  "lustro": true pozwala pokazać drugą stronę ćwiczenia przez odbicie klipu.
  Blok: "rundy" powtarza ćwiczenia bloku, "przerwa" jest po każdym ćwiczeniu, "przerwaRundy" między rundami.
  Parkur ("kursy"): level jako 12 przeszkód (w Rannych Mocach 14), treningi A, B, C na zmianę, na końcu Próba Mocy.
  "progProby": jaka część przeszkód musi być zaliczona, żeby odblokować Próbę (1 = wszystkie, 0.8 = 80%).
*/
window.AKADEMIA_TRENINGI = {
  "klipy": {
    "marsz": { "mp4": "assets/wideo/marsz.mp4", "poster": "assets/wideo/marsz.jpg", "lustro": true },
    "koci-grzbiet": { "mp4": "assets/wideo/koci-grzbiet.mp4", "poster": "assets/wideo/koci-grzbiet.jpg", "lustro": true },
    "mostek": { "mp4": "assets/wideo/mostek.mp4", "poster": "assets/wideo/mostek.jpg", "lustro": true },
    "ptak-pies": { "mp4": "assets/wideo/ptak-pies.mp4", "poster": "assets/wideo/ptak-pies.jpg", "lustro": true },
    "pozycja-dziecka": { "mp4": "assets/wideo/pozycja-dziecka.mp4", "poster": "assets/wideo/pozycja-dziecka.jpg", "lustro": true }
  },

  "cwiczenia": {
    "marsz": { "klip": "marsz", "nazwa": "Marsz w miejscu", "wskazowka": "Kolana wysoko, ramiona pracują swobodnie", "blad": "Nie garb się, patrz przed siebie", "wSiodle": "rozgrzane biodra i rytm przed wejściem na konia" },
    "koci-grzbiet": { "klip": "koci-grzbiet", "nazwa": "Koci grzbiet", "wskazowka": "Ruch z miednicy, wydech przy zaokrąglaniu", "blad": "Nie zapadaj się w barkach", "wSiodle": "kręgosłup, który miękko idzie za ruchem konia" },
    "mostek": { "klip": "mostek", "nazwa": "Mostek biodrowy", "wskazowka": "Biodra wysoko, żebra w dół", "blad": "Nie wyginaj lędźwi, pracują pośladki", "wSiodle": "stabilna miednica w siadzie i w półsiadzie" },
    "ptak-pies": { "klip": "ptak-pies", "nazwa": "Ptak-pies", "wskazowka": "Ręka i noga w jednej linii z plecami", "blad": "Miednica nie rotuje, brzuch napięty", "wSiodle": "spokojny tułów i niezależna praca rąk i łydek" },
    "pozycja-dziecka": { "klip": "pozycja-dziecka", "nazwa": "Pozycja dziecka", "wskazowka": "Długi wydech, plecy rosną szeroko", "blad": "Nie spinaj ramion", "wSiodle": "rozluźnione plecy po jeździe" }
  },

  "treningi": [
    {
      "id": "gimnastyka-step-a",
      "program": "gimnastyka",
      "level": "step",
      "nazwa": "Trening A",
      "naglowek": "Gimnastyka dla jeźdźców, Stęp",
      "opis": "Pełny trening w wersji demo: 7 ćwiczeń w 4 blokach (5 różnych), z przerwami i dwiema rundami części głównej.",
      "sprzet": ["Mata"],
      "przygotowanie": 5,
      "zmianaStrony": 5,
      "bloki": [
        { "nazwa": "Rozgrzewka", "cwiczenia": [ { "cw": "marsz", "czas": 60 } ] },
        { "nazwa": "Mobilność", "cwiczenia": [ { "cw": "koci-grzbiet", "powtorzenia": 8, "czasOk": 48 } ] },
        { "nazwa": "Część główna", "rundy": 2, "przerwa": 15, "przerwaRundy": 25, "cwiczenia": [ { "cw": "mostek", "czas": 40 }, { "cw": "ptak-pies", "czas": 30, "strony": true } ] },
        { "nazwa": "Rozciąganie", "cwiczenia": [ { "cw": "pozycja-dziecka", "czas": 45 } ] }
      ]
    },
    {
      "id": "gimnastyka-step-b",
      "program": "gimnastyka",
      "level": "step",
      "nazwa": "Trening B",
      "naglowek": "Gimnastyka dla jeźdźców, Stęp",
      "opis": "Wariant B: więcej pracy tułowia, ptak-pies na początku części głównej.",
      "sprzet": ["Mata"],
      "przygotowanie": 5,
      "zmianaStrony": 5,
      "bloki": [
        { "nazwa": "Rozgrzewka", "cwiczenia": [ { "cw": "marsz", "czas": 45 } ] },
        { "nazwa": "Mobilność", "cwiczenia": [ { "cw": "koci-grzbiet", "powtorzenia": 10, "czasOk": 55 } ] },
        { "nazwa": "Część główna", "rundy": 2, "przerwa": 15, "przerwaRundy": 25, "cwiczenia": [ { "cw": "ptak-pies", "czas": 30, "strony": true }, { "cw": "mostek", "czas": 45 } ] },
        { "nazwa": "Rozciąganie", "cwiczenia": [ { "cw": "pozycja-dziecka", "czas": 60 } ] }
      ]
    },
    {
      "id": "gimnastyka-step-c",
      "program": "gimnastyka",
      "level": "step",
      "nazwa": "Trening C",
      "naglowek": "Gimnastyka dla jeźdźców, Stęp",
      "opis": "Wariant C: krótszy, trzy rundy mostka i dłuższe rozciąganie.",
      "sprzet": ["Mata"],
      "przygotowanie": 5,
      "zmianaStrony": 5,
      "bloki": [
        { "nazwa": "Rozgrzewka", "cwiczenia": [ { "cw": "marsz", "czas": 60 } ] },
        { "nazwa": "Mobilność", "cwiczenia": [ { "cw": "koci-grzbiet", "powtorzenia": 6, "czasOk": 36 }, { "cw": "pozycja-dziecka", "czas": 30 } ] },
        { "nazwa": "Część główna", "rundy": 3, "przerwaRundy": 20, "cwiczenia": [ { "cw": "mostek", "czas": 35 } ] },
        { "nazwa": "Rozciąganie", "cwiczenia": [ { "cw": "pozycja-dziecka", "czas": 60 } ] }
      ]
    },
    {
      "id": "gimnastyka-klus-a",
      "program": "gimnastyka",
      "level": "klus",
      "nazwa": "Trening A",
      "naglowek": "Gimnastyka dla jeźdźców, Kłus",
      "opis": "Kłus: trzy rundy części głównej, dłuższe ćwiczenia i krótsze przerwy.",
      "sprzet": ["Mata"],
      "przygotowanie": 5,
      "zmianaStrony": 4,
      "bloki": [
        { "nazwa": "Rozgrzewka", "cwiczenia": [ { "cw": "marsz", "czas": 75 } ] },
        { "nazwa": "Mobilność", "cwiczenia": [ { "cw": "koci-grzbiet", "powtorzenia": 12, "czasOk": 60 } ] },
        { "nazwa": "Część główna", "rundy": 3, "przerwa": 10, "przerwaRundy": 20, "cwiczenia": [ { "cw": "mostek", "czas": 50 }, { "cw": "ptak-pies", "czas": 40, "strony": true } ] },
        { "nazwa": "Rozciąganie", "cwiczenia": [ { "cw": "pozycja-dziecka", "czas": 60 } ] }
      ]
    },
    {
      "id": "gimnastyka-klus-b",
      "program": "gimnastyka",
      "level": "klus",
      "nazwa": "Trening B",
      "naglowek": "Gimnastyka dla jeźdźców, Kłus",
      "opis": "Kłus, wariant B: ptak-pies dłużej na stronę, mostek na koniec rundy.",
      "sprzet": ["Mata"],
      "przygotowanie": 5,
      "zmianaStrony": 4,
      "bloki": [
        { "nazwa": "Rozgrzewka", "cwiczenia": [ { "cw": "marsz", "czas": 60 } ] },
        { "nazwa": "Mobilność", "cwiczenia": [ { "cw": "koci-grzbiet", "powtorzenia": 12, "czasOk": 60 } ] },
        { "nazwa": "Część główna", "rundy": 3, "przerwa": 10, "przerwaRundy": 20, "cwiczenia": [ { "cw": "ptak-pies", "czas": 45, "strony": true }, { "cw": "mostek", "czas": 50 } ] },
        { "nazwa": "Rozciąganie", "cwiczenia": [ { "cw": "pozycja-dziecka", "czas": 60 } ] }
      ]
    },
    {
      "id": "gimnastyka-klus-c",
      "program": "gimnastyka",
      "level": "klus",
      "nazwa": "Trening C",
      "naglowek": "Gimnastyka dla jeźdźców, Kłus",
      "opis": "Kłus, wariant C: cztery rundy mostka bez przerw między ćwiczeniami.",
      "sprzet": ["Mata"],
      "przygotowanie": 5,
      "zmianaStrony": 4,
      "bloki": [
        { "nazwa": "Rozgrzewka", "cwiczenia": [ { "cw": "marsz", "czas": 75 } ] },
        { "nazwa": "Mobilność", "cwiczenia": [ { "cw": "koci-grzbiet", "powtorzenia": 10, "czasOk": 50 }, { "cw": "pozycja-dziecka", "czas": 30 } ] },
        { "nazwa": "Część główna", "rundy": 4, "przerwaRundy": 15, "cwiczenia": [ { "cw": "mostek", "czas": 45 } ] },
        { "nazwa": "Rozciąganie", "cwiczenia": [ { "cw": "pozycja-dziecka", "czas": 75 } ] }
      ]
    },
    {
      "id": "ogolny-step-a", "program": "ogolny", "level": "step", "nazwa": "Trening A",
      "naglowek": "Ogólny program dla jeźdźców, Stęp",
      "opis": "Siła i stabilizacja: dłuższe przytrzymania w trzech rundach.",
      "sprzet": ["Mata"], "przygotowanie": 5, "zmianaStrony": 5,
      "bloki": [
        { "nazwa": "Rozgrzewka", "cwiczenia": [{"cw": "marsz", "czas": 90}] },
        { "nazwa": "Mobilność", "cwiczenia": [{"cw": "koci-grzbiet", "powtorzenia": 8, "czasOk": 48}] },
        { "nazwa": "Część główna", "rundy": 3, "przerwa": 15, "przerwaRundy": 30, "cwiczenia": [{"cw": "mostek", "czas": 45}, {"cw": "ptak-pies", "czas": 35, "strony": true}] },
        { "nazwa": "Rozciąganie", "cwiczenia": [{"cw": "pozycja-dziecka", "czas": 45}] }
      ]
    },
    {
      "id": "ogolny-step-b", "program": "ogolny", "level": "step", "nazwa": "Trening B",
      "naglowek": "Ogólny program dla jeźdźców, Stęp",
      "opis": "Kondycja: dłuższy marsz i krótkie przerwy w części głównej.",
      "sprzet": ["Mata"], "przygotowanie": 5, "zmianaStrony": 5,
      "bloki": [
        { "nazwa": "Rozgrzewka", "cwiczenia": [{"cw": "marsz", "czas": 120}] },
        { "nazwa": "Mobilność", "cwiczenia": [{"cw": "koci-grzbiet", "powtorzenia": 8, "czasOk": 48}] },
        { "nazwa": "Część główna", "rundy": 3, "przerwa": 10, "przerwaRundy": 20, "cwiczenia": [{"cw": "ptak-pies", "czas": 30, "strony": true}, {"cw": "mostek", "czas": 45}] },
        { "nazwa": "Rozciąganie", "cwiczenia": [{"cw": "pozycja-dziecka", "czas": 45}] }
      ]
    },
    {
      "id": "ogolny-step-c", "program": "ogolny", "level": "step", "nazwa": "Trening C",
      "naglowek": "Ogólny program dla jeźdźców, Stęp",
      "opis": "Równowaga i tułów: wolniejsze tempo i dłuższe przytrzymania ptaka-psa.",
      "sprzet": ["Mata"], "przygotowanie": 5, "zmianaStrony": 5,
      "bloki": [
        { "nazwa": "Rozgrzewka", "cwiczenia": [{"cw": "marsz", "czas": 90}] },
        { "nazwa": "Mobilność", "cwiczenia": [{"cw": "koci-grzbiet", "powtorzenia": 10, "czasOk": 60}] },
        { "nazwa": "Część główna", "rundy": 3, "przerwa": 15, "przerwaRundy": 25, "cwiczenia": [{"cw": "mostek", "czas": 40}, {"cw": "ptak-pies", "czas": 40, "strony": true}] },
        { "nazwa": "Rozciąganie", "cwiczenia": [{"cw": "pozycja-dziecka", "czas": 45}] }
      ]
    },
    {
      "id": "ranne-moce-step-a", "program": "ranne-moce", "level": "step", "nazwa": "Poranek A",
      "naglowek": "Ranne Moce Jeździeckie, Stęp",
      "opis": "Krótki poranek: aktywacja, mobilność i rozciąganie.",
      "sprzet": ["Bez sprzętu"], "przygotowanie": 4, "zmianaStrony": 4,
      "bloki": [
        { "nazwa": "Rozgrzewka", "cwiczenia": [{"cw": "marsz", "czas": 45}] },
        { "nazwa": "Mobilność", "cwiczenia": [{"cw": "koci-grzbiet", "powtorzenia": 8, "czasOk": 45}] },
        { "nazwa": "Część główna", "cwiczenia": [{"cw": "ptak-pies", "czas": 20, "strony": true}] },
        { "nazwa": "Rozciąganie", "cwiczenia": [{"cw": "pozycja-dziecka", "czas": 45}] }
      ]
    },
    {
      "id": "ranne-moce-step-b", "program": "ranne-moce", "level": "step", "nazwa": "Poranek B",
      "naglowek": "Ranne Moce Jeździeckie, Stęp",
      "opis": "Poranek z mostkiem: pobudka dla pośladków przed dniem w stajni.",
      "sprzet": ["Bez sprzętu"], "przygotowanie": 4, "zmianaStrony": 4,
      "bloki": [
        { "nazwa": "Rozgrzewka", "cwiczenia": [{"cw": "marsz", "czas": 45}] },
        { "nazwa": "Mobilność", "cwiczenia": [{"cw": "koci-grzbiet", "powtorzenia": 6, "czasOk": 36}] },
        { "nazwa": "Część główna", "cwiczenia": [{"cw": "mostek", "czas": 30}] },
        { "nazwa": "Rozciąganie", "cwiczenia": [{"cw": "pozycja-dziecka", "czas": 45}] }
      ]
    },
    {
      "id": "ranne-moce-step-c", "program": "ranne-moce", "level": "step", "nazwa": "Poranek C",
      "naglowek": "Ranne Moce Jeździeckie, Stęp",
      "opis": "Najkrótszy poranek, gdy czasu jest naprawdę mało.",
      "sprzet": ["Bez sprzętu"], "przygotowanie": 4, "zmianaStrony": 4,
      "bloki": [
        { "nazwa": "Rozgrzewka", "cwiczenia": [{"cw": "marsz", "czas": 30}] },
        { "nazwa": "Mobilność", "cwiczenia": [{"cw": "koci-grzbiet", "powtorzenia": 6, "czasOk": 36}] },
        { "nazwa": "Rozciąganie", "cwiczenia": [{"cw": "pozycja-dziecka", "czas": 60}] }
      ]
    }
  ],

  "kursy": [
    {
      "id": "gimnastyka-step",
      "program": "gimnastyka",
      "level": "step",
      "nazwa": "Parkur Stęp",
      "progProby": 1,
      "proba": "gimnastyka-step",
      "nastepny": "gimnastyka-klus",
      "przeszkody": ["gimnastyka-step-a", "gimnastyka-step-b", "gimnastyka-step-c", "gimnastyka-step-a", "gimnastyka-step-b", "gimnastyka-step-c", "gimnastyka-step-a", "gimnastyka-step-b", "gimnastyka-step-c", "gimnastyka-step-a", "gimnastyka-step-b", "gimnastyka-step-c"]
    },
    {
      "id": "gimnastyka-klus",
      "program": "gimnastyka",
      "level": "klus",
      "nazwa": "Parkur Kłus",
      "progProby": 1,
      "proba": "",
      "nastepny": "",
      "przeszkody": ["gimnastyka-klus-a", "gimnastyka-klus-b", "gimnastyka-klus-c", "gimnastyka-klus-a", "gimnastyka-klus-b", "gimnastyka-klus-c", "gimnastyka-klus-a", "gimnastyka-klus-b", "gimnastyka-klus-c", "gimnastyka-klus-a", "gimnastyka-klus-b", "gimnastyka-klus-c"]
    },
    {
      "id": "ogolny-step",
      "program": "ogolny",
      "level": "step",
      "nazwa": "Parkur Stęp",
      "progProby": 1,
      "proba": "ogolny-step",
      "nastepny": "",
      "przeszkody": ["ogolny-step-a", "ogolny-step-b", "ogolny-step-c", "ogolny-step-a", "ogolny-step-b", "ogolny-step-c", "ogolny-step-a", "ogolny-step-b", "ogolny-step-c", "ogolny-step-a", "ogolny-step-b", "ogolny-step-c"]
    },
    {
      "id": "ranne-moce-step",
      "program": "ranne-moce",
      "level": "step",
      "nazwa": "Parkur Stęp",
      "progProby": 1,
      "proba": "ranne-moce-step",
      "nastepny": "",
      "przeszkody": ["ranne-moce-step-a", "ranne-moce-step-b", "ranne-moce-step-c", "ranne-moce-step-a", "ranne-moce-step-b", "ranne-moce-step-c", "ranne-moce-step-a", "ranne-moce-step-b", "ranne-moce-step-c", "ranne-moce-step-a", "ranne-moce-step-b", "ranne-moce-step-c", "ranne-moce-step-a", "ranne-moce-step-b"]
    }
  ]
};
