/*
  Akademia Mocy Jeździeckich: dane programów dla demo.
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
      nazwa: 'Ranne Moce Jeździeckie',
      krotko: 'Krótka poranna rutyna: aktywacja, oddech i mobilność na dobry start dnia.',
      czas: '10-15 min',
      czestotliwosc: 'codziennie',
      ikona: 'i-slonce',
      levele: ['step', 'klus', 'galop'],
      treningi: []
    }
  ]
};
