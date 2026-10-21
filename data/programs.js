/*
  Akademia Mocy Jeździeckich: dane dla demo.
  Jedno źródło prawdy: strona główna, strony programów i strefa kursantki czytają te same dane.
  Plik .js zamiast .json, żeby demo działało też po otwarciu index.html z dysku (bez serwera).
  W wersji produkcyjnej te dane przyjdą z bazy (Django).
*/
window.AKADEMIA = {
  levele: [
    { id: 'step', numer: 1, nazwa: 'Stęp', dostepny: true },
    { id: 'klus', numer: 2, nazwa: 'Kłus', dostepny: true },
    { id: 'galop', numer: 3, nazwa: 'Galop', dostepny: false }
  ],

  /* Kolejność bloków jest taka sama w każdym treningu */
  bloki: [
    { id: 'rozgrzewka', nazwa: 'Rozgrzewka', czas: '3-5 min' },
    { id: 'mobilnosc', nazwa: 'Mobilność', czas: '5-8 min' },
    { id: 'glowna', nazwa: 'Część główna', czas: '10-20 min' },
    { id: 'rozciaganie', nazwa: 'Rozciąganie', czas: '3-5 min' }
  ],

  programy: [
    {
      id: 'ogolny',
      kolor: 'pink',
      nazwa: 'Ogólny program dla jeźdźców',
      krotko: 'Siła, core, równowaga i wytrzymałość. Dla osób, które chcą jeździć dłużej i pewniej.',
      czas: '25-35 min',
      czestotliwosc: '2-3 razy w tygodniu',
      ikona: 'i-podkowa',
      levele: ['step', 'klus', 'galop'],
      treningi: [] /* uzupełnimy w etapie strefy kursantki */
    },
    {
      id: 'gimnastyka',
      kolor: 'sage',
      nazwa: 'Gimnastyka dla jeźdźców',
      krotko: 'Mobilność, gibkość, postawa i symetria. Dla sztywnych bioder i krzywego dosiadu.',
      czas: '20-30 min',
      czestotliwosc: '2-3 razy w tygodniu',
      ikona: 'i-wstazka',
      levele: ['step', 'klus', 'galop'],
      treningi: []
    },
    {
      id: 'ranne-moce',
      kolor: 'butter',
      nazwa: 'Ranne Moce Jeździeckie',
      krotko: 'Krótka poranna rutyna: aktywacja, oddech i mobilność na dobry start dnia.',
      czas: '10-15 min',
      czestotliwosc: 'codziennie',
      ikona: 'i-slonce',
      levele: ['step', 'klus', 'galop'],
      treningi: []
    }
  ],

  /* Przykładowy trening do podglądu odtwarzacza (czasy skrócone na potrzeby demo) */
  przykladowyTrening: {
    opis: 'Gimnastyka, Stęp, trening A',
    cwiczenia: [
      { blok: 0, nazwa: 'Marsz w miejscu', czas: 20, wskazowka: 'Luźne ramiona, spokojny oddech' },
      { blok: 1, nazwa: 'Koci grzbiet', czas: 35, wskazowka: 'Ruch z miednicy, spokojny oddech' },
      { blok: 1, nazwa: 'Otwieranie bioder', czas: 30, wskazowka: 'Kolano prowadzi, stopa zostaje' },
      { blok: 2, nazwa: 'Mostek biodrowy', czas: 40, wskazowka: 'Biodra wysoko, żebra w dół' },
      { blok: 2, nazwa: 'Półsiad przy ścianie', czas: 45, wskazowka: 'Pięty w dół, kolana nad stopami' },
      { blok: 3, nazwa: 'Skłon do łydki', czas: 30, wskazowka: 'Oddech wydłuża ruch' }
    ]
  }
};
