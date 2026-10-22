/*
  Akademia Mocy Jeździeckich: sklep w demo (etap 5).
  Zapis zgodny z JSON. Ceny są przykładowe, tak jak na stronie cennika.
  W produkcji: produkty i kody z Django, płatność przez Przelewy24 (BLIK, przelew, karta), potwierdzenie przez powiadomienie z P24.

  produkty.programy: "wybor" (kursantka wybiera jeden program) albo "wszystkie".
  kody: kody rabatowe w procentach.
  voucherDemo: voucher, który od razu działa na stronie aktywacji, żeby dało się ją sprawdzić bez zakupu.
  blikDemo: kody, które w demo udają błąd (pozostałe 6-cyfrowe kody przechodzą).
*/
window.AKADEMIA_SKLEP = {
  "produkty": [
    { "id": "program", "nazwa": "Program", "krotko": "Jeden program do wyboru", "cena": 179, "miesiace": 12, "programy": "wybor", "zawiera": ["Level Stęp i Kłus", "Próby Mocy i rozety", "Dostęp na 12 miesięcy"] },
    { "id": "karnet-3", "nazwa": "Karnet 3 miesiące", "krotko": "Wszystkie programy", "cena": 229, "miesiace": 3, "programy": "wszystkie", "zawiera": ["Wszystkie 3 programy", "Próby Mocy i rozety", "Dostęp na 3 miesiące"] },
    { "id": "karnet-12", "nazwa": "Karnet 12 miesięcy", "krotko": "Wszystkie programy i nowe treningi", "cena": 499, "miesiace": 12, "programy": "wszystkie", "polecany": true, "zawiera": ["Wszystkie 3 programy", "Nowe treningi przez cały rok", "Próby Mocy i rozety", "Dostęp na 12 miesięcy"] }
  ],
  "kody": {
    "START10": { "procent": 10, "opis": "10% na start Akademii" }
  },
  "voucherWaznosc": 12,
  "voucherDemo": { "kod": "AMJ-DEMO-2026", "produkt": "karnet-3", "dla": "Ola", "od": "Kasia", "wiadomosc": "Na wiosenną formę w siodle!" },
  "blikDemo": { "bledny": "000000", "odrzucony": "111111" }
};
