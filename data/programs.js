/*
  Akademia Mocy Jeździeckich: dane dla demo.
  Jedno źródło prawdy dla wszystkich stron: karty programów, strony programów, odtwarzacz i formularz listy chętnych.
  Zapis zgodny z JSON (podwójne cudzysłowy, bez komentarzy w środku), bo z tego pliku buduje się też HTML (_zrodla/buduj.py).
  W wersji produkcyjnej te dane przyjdą z bazy (Django).
*/
window.AKADEMIA = {
  "levele": [
    { "id": "step", "numer": 1, "nazwa": "Stęp", "dostepny": true },
    { "id": "klus", "numer": 2, "nazwa": "Kłus", "dostepny": true },
    { "id": "galop", "numer": 3, "nazwa": "Galop", "dostepny": false }
  ],

  "bloki": [
    { "id": "rozgrzewka", "nazwa": "Rozgrzewka", "czas": "3-5 min" },
    { "id": "mobilnosc", "nazwa": "Mobilność", "czas": "5-8 min" },
    { "id": "glowna", "nazwa": "Część główna", "czas": "10-20 min" },
    { "id": "rozciaganie", "nazwa": "Rozciąganie", "czas": "3-5 min" }
  ],

  "programy": [
    {
      "id": "ogolny",
      "kolor": "pink",
      "ikona": "i-podkowa",
      "nazwa": "Ogólny program dla jeźdźców",
      "krotka": "Ogólny program",
      "krotkaBiernik": "Ogólny program",
      "haslo": "Siła i równowaga na cały sezon",
      "krotko": "Siła, core, równowaga i wytrzymałość. Dla osób, które chcą jeździć dłużej i pewniej.",
      "opis": "Program dla osób, które chcą jeździć dłużej i pewniej. Wzmacnia nogi, tułów i stopy, uczy równowagi i buduje kondycję, której brakuje w kłusie i na parkurze.",
      "czas": "25-35 min",
      "czestotliwosc": "2-3 razy w tygodniu",
      "sprzet": ["Mata", "Guma oporowa", "Ściana albo krzesło", "Butelki z wodą zamiast hantli"],
      "dlaKogo": [
        "Jeździsz 2-5 razy w tygodniu i chcesz więcej siły w siodle",
        "Przygotowujesz się do pierwszych startów albo nowego sezonu",
        "Męczysz się w kłusie anglezowanym albo na parkurze",
        "Chcesz jednego planu na siłę, tułów i równowagę"
      ],
      "efekty": [
        { "bylo": "Ucieka mi łydka", "jest": "Stabilna łydka, także w półsiadzie" },
        { "bylo": "Brakuje mi tchu w kłusie", "jest": "Kondycja na cały trening i parkur" },
        { "bylo": "Trzymam się wodzy", "jest": "Lekkie ręce, bo tułów sam się stabilizuje" }
      ],
      "leveleOpis": {
        "step": { "czas": "4-6 tygodni", "opis": "Technika i praca ciężarem ciała. Trzy treningi A, B i C na zmianę." },
        "klus": { "czas": "4-6 tygodni", "opis": "Dłuższa część główna, guma oporowa i praca na jednej nodze." },
        "galop": { "czas": "wkrótce", "opis": "Przygotowanie do sezonu startów: więcej dynamiki i wytrzymałości." }
      },
      "proba": ["Półsiad przy ścianie na czas", "Deska", "Stanie na jednej nodze z zamkniętymi oczami", "Mostek jednonóż"],
      "faq": [
        { "q": "Czy potrzebuję hantli?", "a": "Nie. Wystarczy guma oporowa, a zamiast hantli możesz użyć butelek z wodą." },
        { "q": "Czy to program na siłownię?", "a": "Nie, wszystko zrobisz w domu albo w stajni. Potrzebujesz kawałka podłogi i ściany." },
        { "q": "Ile treningów w tygodniu?", "a": "2-3. Między treningami zostaw dzień przerwy albo dzień z jazdą." }
      ],
      "trening": {
        "opis": "Ogólny, Stęp, trening A",
        "cwiczenia": [
          { "blok": 0, "nazwa": "Marsz w miejscu", "czas": 40, "wskazowka": "Kolana wysoko, luźne ramiona" },
          { "blok": 0, "nazwa": "Krążenia ramion", "czas": 30, "wskazowka": "Duże koła, spokojny oddech" },
          { "blok": 1, "nazwa": "Wykrok z rotacją", "czas": 40, "wskazowka": "Kolano nad stopą, obrót z klatki" },
          { "blok": 1, "nazwa": "Otwieranie bioder", "czas": 30, "wskazowka": "Kolano prowadzi, stopa zostaje" },
          { "blok": 2, "nazwa": "Półsiad przy ścianie", "czas": 45, "wskazowka": "Pięty w dół, kolana nad stopami" },
          { "blok": 2, "nazwa": "Deska", "czas": 40, "wskazowka": "Brzuch napięty, biodra w linii" },
          { "blok": 2, "nazwa": "Mostek jednonóż", "czas": 30, "wskazowka": "Miednica równo, bez skrętu" },
          { "blok": 2, "nazwa": "Wspięcia na palce", "czas": 40, "wskazowka": "Powoli w górę, jeszcze wolniej w dół" },
          { "blok": 3, "nazwa": "Rozciąganie zginaczy bioder", "czas": 40, "wskazowka": "Miednica podwinięta, oddech w brzuch" },
          { "blok": 3, "nazwa": "Skłon do łydki", "czas": 30, "wskazowka": "Oddech wydłuża ruch" }
        ]
      }
    },
    {
      "id": "gimnastyka",
      "kolor": "sage",
      "ikona": "i-wstazka",
      "nazwa": "Gimnastyka dla jeźdźców",
      "krotka": "Gimnastyka",
      "krotkaBiernik": "Gimnastykę",
      "haslo": "Ruch bez blokad i symetryczny dosiad",
      "krotko": "Mobilność, gibkość, postawa i symetria. Dla sztywnych bioder i krzywego dosiadu.",
      "opis": "Program dla sztywnych bioder, krzywego dosiadu i zmęczonych pleców. Krok po kroku zwiększa zakres ruchu i wyrównuje pracę obu stron ciała.",
      "czas": "20-30 min",
      "czestotliwosc": "2-3 razy w tygodniu",
      "sprzet": ["Mata", "Guma oporowa", "Piłka albo zwinięty ręcznik"],
      "dlaKogo": [
        "Czujesz sztywność w biodrach albo w plecach",
        "Instruktor mówi, że siedzisz krzywo",
        "Dużo siedzisz w pracy albo w samochodzie",
        "Wracasz do jazdy po przerwie"
      ],
      "efekty": [
        { "bylo": "Mam sztywne biodra", "jest": "Biodra, które miękko idą za ruchem konia" },
        { "bylo": "Zapadam się na jedną stronę", "jest": "Prosty, symetryczny dosiad" },
        { "bylo": "Bolą mnie plecy po jeździe", "jest": "Silny tułów i spokojniejsze plecy" }
      ],
      "leveleOpis": {
        "step": { "czas": "4-6 tygodni", "opis": "Zakres ruchu w biodrach i kręgosłupie, spokojne tempo i oddech." },
        "klus": { "czas": "4-6 tygodni", "opis": "Mobilność pod obciążeniem, praca jednostronna i symetria." },
        "galop": { "czas": "wkrótce", "opis": "Pełen zakres ruchu z kontrolą, jak w trudniejszych ćwiczeniach w siodle." }
      },
      "proba": ["Siad 90/90 bez podpierania", "Deska boczna na obie strony", "Skłon w siadzie", "Stanie na jednej nodze na obie strony"],
      "faq": [
        { "q": "Czy muszę mieć dobrą gibkość?", "a": "Nie. Program zaczyna od Twojego zakresu ruchu i powoli go zwiększa." },
        { "q": "Czy mogę łączyć go z Ogólnym programem?", "a": "Tak, w karnecie masz oba. Najlepiej na zmianę, w różne dni." },
        { "q": "Bolą mnie plecy. Czy mogę ćwiczyć?", "a": "Przy bólu najpierw porozmawiaj z lekarzem lub fizjoterapeutą. Program nie zastępuje leczenia." }
      ],
      "trening": {
        "opis": "Gimnastyka, Stęp, trening A",
        "cwiczenia": [
          { "blok": 0, "nazwa": "Marsz w miejscu", "czas": 40, "wskazowka": "Luźne ramiona, spokojny oddech" },
          { "blok": 1, "nazwa": "Koci grzbiet", "czas": 35, "wskazowka": "Ruch z miednicy, spokojny oddech" },
          { "blok": 1, "nazwa": "Otwieranie bioder", "czas": 30, "wskazowka": "Kolano prowadzi, stopa zostaje" },
          { "blok": 1, "nazwa": "Rotacje w klęku podpartym", "czas": 30, "wskazowka": "Obrót z klatki, biodra stoją" },
          { "blok": 2, "nazwa": "Mostek biodrowy", "czas": 40, "wskazowka": "Biodra wysoko, żebra w dół" },
          { "blok": 2, "nazwa": "Ptak-pies w klęku podpartym", "czas": 40, "wskazowka": "Ręka i noga w linii, plecy stabilne" },
          { "blok": 2, "nazwa": "Deska boczna", "czas": 30, "wskazowka": "Bark nad łokciem, biodra wysoko" },
          { "blok": 3, "nazwa": "Skłon do łydki", "czas": 30, "wskazowka": "Oddech wydłuża ruch" },
          { "blok": 3, "nazwa": "Motylek", "czas": 40, "wskazowka": "Kolana opadają same, bez dociskania" }
        ]
      }
    },
    {
      "id": "ranne-moce",
      "kolor": "butter",
      "ikona": "i-slonce",
      "nazwa": "Ranne Moce Jeździeckie",
      "krotka": "Ranne Moce",
      "krotkaBiernik": "Ranne Moce",
      "haslo": "10 minut każdego ranka",
      "krotko": "Krótka poranna rutyna: aktywacja, oddech i mobilność na dobry start dnia.",
      "opis": "Krótka poranna rutyna, która mieści się przed obrządkiem i pracą. Oddech, aktywacja i mobilność, żeby ciało było gotowe na cały dzień i na jazdę.",
      "czas": "10-15 min",
      "czestotliwosc": "codziennie",
      "sprzet": ["Bez sprzętu", "Kawałek podłogi", "Mata, jeśli lubisz"],
      "dlaKogo": [
        "Masz mało czasu, ale chcesz ćwiczyć codziennie",
        "Rano obrządek, potem praca, wieczorem stajnia",
        "Chcesz zacząć od nawyku, a nie od wielkiego planu",
        "Lubisz krótkie, spokojne treningi"
      ],
      "efekty": [
        { "bylo": "Rano czuję się jak kłoda", "jest": "Ruch od pierwszych minut dnia" },
        { "bylo": "Nie mam czasu na trening", "jest": "10 minut, które mieszczą się w każdym poranku" },
        { "bylo": "Ciągle odkładam ćwiczenia", "jest": "Nawyk, który zostaje na dłużej" }
      ],
      "leveleOpis": {
        "step": { "czas": "3 tygodnie", "opis": "10 minut każdego ranka: oddech, aktywacja i mobilność." },
        "klus": { "czas": "3 tygodnie", "opis": "15 minut: więcej równowagi, siły stóp i pracy tułowia." },
        "galop": { "czas": "wkrótce", "opis": "Poranna rutyna przed treningiem w siodle i przed startami." }
      },
      "proba": ["Seria 14 poranków w 3 tygodnie", "Stanie na jednej nodze", "Wspięcia na palce", "Koci grzbiet w pełnym zakresie"],
      "faq": [
        { "q": "Czy mogę ćwiczyć wieczorem?", "a": "Tak, nazwa to tylko podpowiedź. Liczy się regularność." },
        { "q": "Co, jeśli opuszczę poranek?", "a": "Nic się nie dzieje. Seria liczy się w ciągu 3 tygodni, a nie dzień po dniu." },
        { "q": "Czy to wystarczy?", "a": "Na start tak. Kiedy złapiesz nawyk, możesz dołożyć Gimnastykę albo Ogólny program." }
      ],
      "trening": {
        "opis": "Ranne Moce, Stęp, poranek 1",
        "cwiczenia": [
          { "blok": 0, "nazwa": "Oddech przeponowy", "czas": 40, "wskazowka": "Dłoń na brzuchu, powolny wydech" },
          { "blok": 0, "nazwa": "Krążenia ramion", "czas": 30, "wskazowka": "Duże koła, ramiona luźno" },
          { "blok": 1, "nazwa": "Koci grzbiet", "czas": 40, "wskazowka": "Ruch z miednicy, spokojny oddech" },
          { "blok": 1, "nazwa": "Krążenia bioder", "czas": 30, "wskazowka": "Kolana miękko, małe koła" },
          { "blok": 2, "nazwa": "Wspięcia na palce", "czas": 40, "wskazowka": "Powoli w górę, jeszcze wolniej w dół" },
          { "blok": 2, "nazwa": "Stanie na jednej nodze", "czas": 30, "wskazowka": "Wzrok przed siebie, kolano miękko" },
          { "blok": 3, "nazwa": "Skłon do łydki", "czas": 30, "wskazowka": "Oddech wydłuża ruch" },
          { "blok": 3, "nazwa": "Pozycja dziecka", "czas": 40, "wskazowka": "Czoło na macie, plecy szeroko" }
        ]
      }
    }
  ]
};
