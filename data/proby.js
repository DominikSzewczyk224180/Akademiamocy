/*
  Akademia Mocy Jeździeckich: Próby Mocy (etap 4).
  Zapis zgodny z JSON. Progi są przykładowe: ustala je Justyna z fizjoterapią.

  Test "czas": licznik w górę, zaliczony, gdy wynik >= "cel" sekund (przy "strony": true na obu stronach).
  Test "wybor": kursantka wybiera odpowiedź, zaliczony, gdy odpowiedź ma "zalicza": true.
  "technika": lista do odhaczenia. Test liczy się, gdy wynik jest dobry i cała lista odhaczona.
  Próba zaliczona, gdy zaliczone są wszystkie testy. Jeśli nie: "celowany" daje 3 krótkie treningi
  na 7 dni z ćwiczeniami dla brakujących testów, potem drugie podejście.
*/
window.AKADEMIA_PROBY = {
  "gimnastyka-step": {
    "nazwa": "Próba Mocy: Stęp",
    "program": "gimnastyka",
    "level": "step",
    "otwiera": "Kłus",
    "czas": "ok. 10 minut",
    "sprzet": ["Mata", "Ściana"],
    "dniDoPowtorki": 7,
    "testy": [
      {
        "id": "siad-9090",
        "nazwa": "Siad 90/90 bez podpierania",
        "typ": "czas",
        "cel": 20,
        "strony": true,
        "obraz": "assets/proba/siad-9090.jpg",
        "kroki": ["Usiądź na macie, jedna noga z przodu, druga z boku, obie zgięte pod kątem prostym", "Wyprostuj plecy i unieś ręce przed siebie", "Utrzymaj pozycję bez podpierania się rękami"],
        "technika": ["Plecy proste, bez garbienia", "Oba kolana zgięte pod kątem prostym", "Ręce w górze przez cały czas"],
        "celowany": "Siad 90/90 z podparciem dłoni: 3 serie po 30 s na stronę"
      },
      {
        "id": "deska-boczna",
        "nazwa": "Deska boczna",
        "typ": "czas",
        "cel": 30,
        "strony": true,
        "obraz": "assets/proba/deska-boczna.jpg",
        "kroki": ["Połóż się na boku, łokieć dokładnie pod barkiem", "Unieś biodra, aż ciało ułoży się w jednej linii", "Druga ręka w górę albo na biodrze"],
        "technika": ["Biodra w linii z barkami i stopami", "Bark nad łokciem", "Głowa w przedłużeniu kręgosłupa"],
        "celowany": "Deska boczna z kolan: 3 serie po 20 s na stronę"
      },
      {
        "id": "sklon",
        "nazwa": "Skłon w siadzie",
        "typ": "wybor",
        "obraz": "assets/proba/sklon.jpg",
        "kroki": ["Usiądź z prostymi nogami, stopy razem", "Na wydechu pochyl się z bioder w stronę stóp", "Zatrzymaj się tam, gdzie czujesz mocne, ale przyjemne rozciąganie"],
        "pytanie": "Dokąd sięgasz dłońmi przy prostych kolanach?",
        "opcje": [
          { "tekst": "Do kolan", "zalicza": false },
          { "tekst": "Do połowy łydek", "zalicza": false },
          { "tekst": "Do kostek", "zalicza": true },
          { "tekst": "Do palców stóp i dalej", "zalicza": true }
        ],
        "technika": ["Kolana proste przez cały czas", "Ruch z bioder, nie z karku", "Spokojny oddech, bez odbijania"],
        "celowany": "Skłon w siadzie z gumą na stopach: 3 serie po 40 s"
      },
      {
        "id": "jedna-noga",
        "nazwa": "Stanie na jednej nodze",
        "typ": "czas",
        "cel": 30,
        "strony": true,
        "obraz": "assets/proba/jedna-noga.jpg",
        "kroki": ["Stań prosto, ciężar na jednej nodze", "Unieś drugie kolano do wysokości biodra", "Patrz w jeden punkt przed sobą i utrzymaj równowagę"],
        "technika": ["Miednica równo, bez przechylania", "Kolano nogi podporowej lekko ugięte", "Bez podpierania się"],
        "celowany": "Stanie na jednej nodze przy ścianie: 3 serie po 30 s na nogę"
      }
    ]
  },
  "ogolny-step": {
    "nazwa": "Próba Mocy: Stęp",
    "program": "ogolny",
    "level": "step",
    "otwiera": "Kłus",
    "czas": "ok. 10 minut",
    "sprzet": ["Mata", "Ściana"],
    "dniDoPowtorki": 7,
    "testy": [
      {
        "id": "polsiad",
        "nazwa": "Półsiad przy ścianie",
        "typ": "czas",
        "cel": 45,
        "obraz": "assets/proba/polsiad.jpg",
        "kroki": ["Oprzyj plecy o ścianę i zejdź w dół", "Uda prawie poziomo, kolana nad stopami", "Pięty w dół, jak w strzemionach"],
        "technika": ["Plecy przy ścianie przez cały czas", "Kolana nie uciekają do środka", "Pięty na podłodze"],
        "celowany": "Półsiad przy ścianie: 3 serie po 25 s z przerwą 30 s"
      },
      {
        "id": "deska",
        "nazwa": "Deska",
        "typ": "czas",
        "cel": 40,
        "obraz": "assets/proba/deska.jpg",
        "kroki": ["Łokcie pod barkami, przedramiona na macie", "Unieś biodra, aż ciało ułoży się w jednej linii", "Oddychaj spokojnie, brzuch napięty"],
        "technika": ["Biodra nie opadają", "Barki nad łokciami", "Głowa w przedłużeniu kręgosłupa"],
        "celowany": "Deska z kolan: 3 serie po 25 s"
      },
      {
        "id": "noga-oczy",
        "nazwa": "Stanie na jednej nodze z zamkniętymi oczami",
        "typ": "czas",
        "cel": 15,
        "strony": true,
        "obraz": "assets/proba/jedna-noga.jpg",
        "kroki": ["Stań obok ściany, żeby móc się asekurować", "Unieś jedną nogę i zamknij oczy", "Licz czas do pierwszego podparcia"],
        "technika": ["Biodra na jednej wysokości", "Kolano nogi podporowej miękko", "Bez podpierania się"],
        "celowany": "Stanie na jednej nodze z otwartymi oczami: 3 serie po 30 s na nogę"
      },
      {
        "id": "mostek-jednonoz",
        "nazwa": "Mostek jednonóż",
        "typ": "wybor",
        "pytanie": "Ile powtórzeń robisz na każdą nogę z równą miednicą?",
        "opcje": [
          { "tekst": "Mniej niż 6", "zalicza": false },
          { "tekst": "Od 6 do 9", "zalicza": false },
          { "tekst": "10 albo więcej", "zalicza": true }
        ],
        "obraz": "assets/proba/mostek-jednonoz.jpg",
        "kroki": ["Połóż się na plecach, jedna stopa na macie", "Drugą nogę wyprostuj w linii z udem", "Unoś biodra i opuszczaj je powoli"],
        "technika": ["Miednica nie przechyla się na bok", "Pracują pośladki, nie lędźwie", "Ruch powolny, bez szarpnięć"],
        "celowany": "Mostek biodrowy na dwóch nogach: 3 serie po 12 powtórzeń"
      }
    ]
  },
  "poranne-moce-step": {
    "nazwa": "Próba Mocy: Stęp",
    "program": "poranne-moce",
    "level": "step",
    "otwiera": "Kłus",
    "czas": "ok. 8 minut",
    "sprzet": ["Bez sprzętu"],
    "dniDoPowtorki": 7,
    "testy": [
      {
        "id": "seria-porankow",
        "nazwa": "Seria poranków",
        "typ": "wybor",
        "pytanie": "Ile poranków udało się zrobić w ostatnich 3 tygodniach?",
        "opcje": [
          { "tekst": "Mniej niż 10", "zalicza": false },
          { "tekst": "Od 10 do 13", "zalicza": false },
          { "tekst": "14 albo więcej", "zalicza": true }
        ],
        "obraz": "assets/wideo/marsz.jpg",
        "kroki": ["Zajrzyj do kalendarza w Postępach", "Policz poranki z ostatnich 21 dni", "Wybierz odpowiedź poniżej"],
        "technika": ["Liczę tylko pełne poranki", "Każdy poranek był w innym dniu"],
        "celowany": "Tydzień celowany: poranek codziennie, nawet najkrótszy Poranek C"
      },
      {
        "id": "jedna-noga-rm",
        "nazwa": "Stanie na jednej nodze",
        "typ": "czas",
        "cel": 30,
        "strony": true,
        "obraz": "assets/proba/jedna-noga.jpg",
        "kroki": ["Stań prosto, dłonie na biodrach", "Unieś jedną nogę, wzrok przed siebie", "Licz czas do pierwszego podparcia"],
        "technika": ["Biodra na jednej wysokości", "Bez podpierania się", "Spokojny oddech"],
        "celowany": "Stanie na jednej nodze przy ścianie: 3 serie po 20 s na nogę"
      },
      {
        "id": "wspiecia",
        "nazwa": "Wspięcia na palce",
        "typ": "wybor",
        "pytanie": "Ile spokojnych wspięć na palce robisz bez podparcia?",
        "opcje": [
          { "tekst": "Mniej niż 12", "zalicza": false },
          { "tekst": "Od 12 do 19", "zalicza": false },
          { "tekst": "20 albo więcej", "zalicza": true }
        ],
        "obraz": "assets/proba/wspiecia.jpg",
        "kroki": ["Stań prosto, stopy na szerokość bioder", "Powoli wznieś się na palce", "Jeszcze wolniej opuść pięty"],
        "technika": ["Kolana proste, ale nie zablokowane", "Ciężar na dużym palcu, nie na zewnętrznej krawędzi", "Tempo spokojne w górę i w dół"],
        "celowany": "Wspięcia na palce przy ścianie: 3 serie po 12 powtórzeń"
      },
      {
        "id": "koci-zakres",
        "nazwa": "Koci grzbiet w pełnym zakresie",
        "typ": "wybor",
        "pytanie": "Jak wygląda ruch w 5 powolnych kocich grzbietach?",
        "opcje": [
          { "tekst": "Coś boli albo mocno ciągnie", "zalicza": false },
          { "tekst": "Zakres mniejszy w jedną stronę", "zalicza": false },
          { "tekst": "Pełny zakres w obie strony, bez bólu", "zalicza": true }
        ],
        "obraz": "assets/wideo/koci-grzbiet.jpg",
        "kroki": ["Klęk podparty, dłonie pod barkami", "Z wydechem zaokrąglij plecy, z wdechem je wygnij", "Zrób 5 spokojnych powtórzeń"],
        "technika": ["Ruch zaczyna się w miednicy", "Barki daleko od uszu", "Oddech prowadzi ruch"],
        "celowany": "Koci grzbiet w mniejszym zakresie: 3 serie po 8 powtórzeń"
      }
    ]
  }
};
