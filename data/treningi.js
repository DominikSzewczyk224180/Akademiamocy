/*
  Akademia Mocy Jeździeckich: pełne treningi do odtwarzacza (etap 3).
  Zapis zgodny z JSON, bo czyta go też _zrodla/buduj.py.

  Klip: "mp4" to plik w repo (demo). W produkcji dopisujemy "hls" z Bunny Stream,
  np. "https://vz-xxxx.b-cdn.net/<id>/playlist.m3u8". Odtwarzacz sam wybierze HLS, gdy jest podany.
  "lustro": true pozwala pokazać drugą stronę ćwiczenia przez odbicie klipu.

  Ćwiczenie: "czas" w sekundach albo "powtorzenia" (wtedy "czasOk" to orientacyjny czas).
  "strony": true robi dwie części: lewa i prawa strona, z krótką zmianą pomiędzy.
  Blok: "rundy" powtarza ćwiczenia bloku, "przerwa" jest po każdym ćwiczeniu, "przerwaRundy" między rundami.
*/
window.AKADEMIA_TRENINGI = {
  "klipy": {
    "marsz": { "mp4": "assets/wideo/marsz.mp4", "poster": "assets/wideo/marsz.jpg", "lustro": true },
    "koci-grzbiet": { "mp4": "assets/wideo/koci-grzbiet.mp4", "poster": "assets/wideo/koci-grzbiet.jpg", "lustro": true },
    "mostek": { "mp4": "assets/wideo/mostek.mp4", "poster": "assets/wideo/mostek.jpg", "lustro": true },
    "ptak-pies": { "mp4": "assets/wideo/ptak-pies.mp4", "poster": "assets/wideo/ptak-pies.jpg", "lustro": true },
    "pozycja-dziecka": { "mp4": "assets/wideo/pozycja-dziecka.mp4", "poster": "assets/wideo/pozycja-dziecka.jpg", "lustro": true }
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
        {
          "nazwa": "Rozgrzewka",
          "cwiczenia": [
            { "klip": "marsz", "nazwa": "Marsz w miejscu", "czas": 60, "wskazowka": "Kolana wysoko, ramiona pracują swobodnie", "blad": "Nie garb się, patrz przed siebie" }
          ]
        },
        {
          "nazwa": "Mobilność",
          "cwiczenia": [
            { "klip": "koci-grzbiet", "nazwa": "Koci grzbiet", "powtorzenia": 8, "czasOk": 48, "wskazowka": "Ruch z miednicy, wydech przy zaokrąglaniu", "blad": "Nie zapadaj się w barkach" }
          ]
        },
        {
          "nazwa": "Część główna",
          "rundy": 2,
          "przerwa": 15,
          "przerwaRundy": 25,
          "cwiczenia": [
            { "klip": "mostek", "nazwa": "Mostek biodrowy", "czas": 40, "wskazowka": "Biodra wysoko, żebra w dół", "blad": "Nie wyginaj lędźwi, pracują pośladki" },
            { "klip": "ptak-pies", "nazwa": "Ptak-pies", "czas": 30, "strony": true, "wskazowka": "Ręka i noga w jednej linii z plecami", "blad": "Miednica nie rotuje, brzuch napięty" }
          ]
        },
        {
          "nazwa": "Rozciąganie",
          "cwiczenia": [
            { "klip": "pozycja-dziecka", "nazwa": "Pozycja dziecka", "czas": 45, "wskazowka": "Długi wydech, plecy rosną szeroko", "blad": "Nie spinaj ramion" }
          ]
        }
      ]
    }
  ]
};
