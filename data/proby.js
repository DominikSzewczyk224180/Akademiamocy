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
  }
};
