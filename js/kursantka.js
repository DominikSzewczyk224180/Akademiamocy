/*
  Akademia Mocy Jeździeckich: stan kursantki w demo (etap 4).
  W demo wszystko jest w localStorage: logowanie to przycisk, a postęp, wyniki Prób i rozety zapisują się w przeglądarce.
  W produkcji te same dane przyjdą z Django (konto, historia treningów, próby), więc strony strefy zostaną bez zmian.
*/
(function () {
  'use strict';

  var KLUCZ = 'akademia-kursantka';
  var DANE = window.AKADEMIA || { programy: [], levele: [] };
  var TR = window.AKADEMIA_TRENINGI || { treningi: [], kursy: [], cwiczenia: {}, klipy: {} };
  var PROBY = window.AKADEMIA_PROBY || {};

  /* Biblioteka ćwiczeń: trening odwołuje się do ćwiczenia przez "cw" */
  (TR.treningi || []).forEach(function (t) {
    t.bloki.forEach(function (b) {
      b.cwiczenia = b.cwiczenia.map(function (c) {
        return c.cw && TR.cwiczenia && TR.cwiczenia[c.cw] && !c.nazwa ? Object.assign({}, TR.cwiczenia[c.cw], c) : c;
      });
    });
  });

  /* Daty jako lokalne YYYY-MM-DD */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function zIso(s) { var p = String(s).split('-'); return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2])); }
  function startDnia(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function dodajDni(d, n) { var x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; }
  function poniedzialek(d) { var x = startDnia(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }
  function dzis() { return startDnia(new Date()); }
  function roznicaDni(a, b) { return Math.round((startDnia(b) - startDnia(a)) / 86400000); }

  var MIESIACE = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
  var MIESIACE_KROTKO = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];
  var DNI = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];
  var DNI_KROTKO = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];
  function data(s, opcje) {
    var d = typeof s === 'string' ? zIso(s) : s;
    opcje = opcje || {};
    var t = d.getDate() + ' ' + MIESIACE[d.getMonth()];
    if (opcje.rok) { t += ' ' + d.getFullYear(); }
    if (opcje.dzien) { t = DNI[d.getDay()] + ', ' + t; }
    return t;
  }
  function kiedy(s) {
    var r = roznicaDni(zIso(s), dzis());
    if (r === 0) { return 'dziś'; }
    if (r === 1) { return 'wczoraj'; }
    if (r > 1 && r < 7) { return r + ' dni temu'; }
    return data(s);
  }

  /* Dane statyczne */
  function trening(id) { return TR.treningi.filter(function (t) { return t.id === id; })[0] || null; }
  function kurs(id) { return (TR.kursy || []).filter(function (k) { return k.id === id; })[0] || null; }
  function program(id) { return (DANE.programy || []).filter(function (p) { return p.id === id; })[0] || null; }
  function level(id) { return (DANE.levele || []).filter(function (l) { return l.id === id; })[0] || null; }
  function proba(id) { return PROBY[id] || null; }

  /* Szacowany czas treningu w sekundach (jak w odtwarzaczu: przygotowanie, zmiana strony, przerwy) */
  function czasTreningu(t) {
    var s = 0, poprzedni = '';
    t.bloki.forEach(function (b) {
      var rundy = b.rundy || 1;
      for (var r = 1; r <= rundy; r++) {
        b.cwiczenia.forEach(function (c, ci) {
          var strony = c.strony ? 2 : 1;
          for (var si = 0; si < strony; si++) {
            if (si === 1) { s += t.zmianaStrony || 5; }
            else if (poprzedni !== 'przerwa') { s += t.przygotowanie || 5; }
            s += c.powtorzenia ? (c.czasOk || 45) : c.czas;
            poprzedni = 'praca';
          }
          var ost = ci === b.cwiczenia.length - 1;
          if (!ost && b.przerwa) { s += b.przerwa; poprzedni = 'przerwa'; }
          else if (ost && r < rundy && b.przerwaRundy) { s += b.przerwaRundy; poprzedni = 'przerwa'; }
        });
      }
    });
    return s;
  }
  function liczbaCwiczen(t) {
    return t.bloki.reduce(function (a, b) { return a + b.cwiczenia.length * (b.rundy || 1); }, 0);
  }

  /* Zapis */
  var stan = null;
  function wczytaj() {
    try { stan = JSON.parse(localStorage.getItem(KLUCZ)); } catch (e) { stan = null; }
    if (stan && stan.wersja !== 1) { stan = null; }
    return stan;
  }
  function zapisz() {
    try { localStorage.setItem(KLUCZ, JSON.stringify(stan)); } catch (e) { /* tryb prywatny */ }
  }

  var OCENY = ['ok', 'ok', 'lekko', 'ok', 'ciezko', 'ok', 'ok', 'lekko', 'ok', 'ok', 'ok', 'lekko'];
  function wpis(kursId, n, d, i) {
    var k = kurs(kursId);
    var tid = k.przeszkody[n - 1];
    var t = trening(tid);
    return { kurs: kursId, przeszkoda: n, trening: tid, data: iso(d), minuty: Math.max(1, Math.round(czasTreningu(t) / 60)), ocena: OCENY[i % OCENY.length] };
  }
  function nowyStan(imie) {
    return { wersja: 1, imie: imie || 'Kasia', email: 'kasia@przyklad.pl', program: 'gimnastyka', kurs: 'gimnastyka-step', cel: 3, start: iso(dzis()), historia: [], proby: [], rozety: [], celowany: null };
  }
  /* Kasia po 3 tygodniach: 3 pełne tygodnie po 3 treningi i jeden trening w tym tygodniu */
  function przyklad(imie) {
    var s = nowyStan(imie);
    var pon = poniedzialek(dzis());
    var plan = [[-21, [0, 2, 4]], [-14, [1, 3, 6]], [-7, [0, 2, 5]], [0, [0]]];
    var daty = [];
    plan.forEach(function (w) { w[1].forEach(function (dd) { daty.push(dodajDni(pon, w[0] + dd)); }); });
    daty = daty.filter(function (d) { return d <= dzis(); });
    s.historia = daty.map(function (d, i) { return wpis('gimnastyka-step', i + 1, d, i); });
    s.start = s.historia.length ? s.historia[0].data : iso(dzis());
    return s;
  }
  function dopiszDoKonca(s, kursId, odDnia) {
    var k = kurs(kursId);
    var zrobione = s.historia.filter(function (h) { return h.kurs === kursId; }).map(function (h) { return h.przeszkoda; });
    var d = odDnia;
    for (var n = 1; n <= k.przeszkody.length; n++) {
      if (zrobione.indexOf(n) === -1) { s.historia.push(wpis(kursId, n, d, n)); d = dodajDni(d, 1); }
    }
  }
  function wynikiPrzyklad(zaliczona) {
    return {
      'siad-9090': { lewa: 26, prawa: 23, technika: true, zalicza: true },
      'deska-boczna': zaliczona ? { lewa: 34, prawa: 31, technika: true, zalicza: true } : { lewa: 31, prawa: 18, technika: true, zalicza: false },
      'sklon': { wybor: 'Do kostek', technika: true, zalicza: true },
      'jedna-noga': zaliczona ? { lewa: 38, prawa: 33, technika: true, zalicza: true } : { lewa: 30, prawa: 22, technika: false, zalicza: false }
    };
  }

  function wymagaj() { if (!stan) { wczytaj(); } return stan; }

  /* Postęp na parkurze */
  function postep(kursId) {
    wymagaj();
    var k = kurs(kursId);
    if (!k || !stan) { return null; }
    var wpisy = {};
    stan.historia.forEach(function (h) { if (h.kurs === kursId) { wpisy[h.przeszkoda] = h; } });
    var zrobione = Object.keys(wpisy).map(Number).sort(function (a, b) { return a - b; });
    var biezaca = 0;
    for (var n = 1; n <= k.przeszkody.length; n++) { if (!wpisy[n]) { biezaca = n; break; } }
    return { kurs: k, liczba: k.przeszkody.length, zrobione: zrobione, wpisy: wpisy, biezaca: biezaca, wszystkie: biezaca === 0, procent: Math.round(zrobione.length / k.przeszkody.length * 100) };
  }

  function statusProby(kursId) {
    wymagaj();
    var k = kurs(kursId);
    var def = k && k.proba ? proba(k.proba) : null;
    if (!k || !def || !stan) { return { stan: 'brak' }; }
    var proby = stan.proby.filter(function (x) { return x.kurs === kursId; });
    var zal = proby.filter(function (x) { return x.zaliczona; })[0];
    if (zal) { return { stan: 'zaliczona', data: zal.data, wynik: zal, def: def, proby: proby }; }
    var p = postep(kursId);
    var prog = Math.ceil(p.liczba * (k.progProby || 1));
    if (p.zrobione.length < prog) { return { stan: 'zablokowana', zostalo: prog - p.zrobione.length, def: def, proby: proby }; }
    var ostatnia = proby[proby.length - 1];
    if (ostatnia && !ostatnia.zaliczona) {
      var od = dodajDni(zIso(ostatnia.data), def.dniDoPowtorki || 7);
      if (dzis() < od) { return { stan: 'czeka', od: iso(od), dni: roznicaDni(dzis(), od), ostatnia: ostatnia, def: def, proby: proby }; }
    }
    return { stan: 'gotowa', ostatnia: ostatnia || null, def: def, proby: proby };
  }

  function wTygodniu(pon) {
    var od = iso(pon), doD = iso(dodajDni(pon, 6));
    return stan.historia.filter(function (h) { return h.data >= od && h.data <= doD; }).length;
  }
  function tydzien() {
    wymagaj();
    var pon = poniedzialek(dzis());
    var dni = [];
    for (var i = 0; i < 7; i++) {
      var d = dodajDni(pon, i), s = iso(d);
      dni.push({ data: s, krotko: DNI_KROTKO[i], trening: stan.historia.some(function (h) { return h.data === s; }), dzis: s === iso(dzis()), przyszly: d > dzis() });
    }
    return { cel: stan.cel || 3, zrobione: wTygodniu(pon), dni: dni };
  }
  function seria() {
    wymagaj();
    var cel = stan.cel || 3;
    var pon = poniedzialek(dzis());
    var n = wTygodniu(pon) >= cel ? 1 : 0;
    var w = dodajDni(pon, -7);
    while (wTygodniu(w) >= cel && n < 520) { n += 1; w = dodajDni(w, -7); }
    return n;
  }

  var API = {
    iso: iso, zIso: zIso, dzis: function () { return iso(dzis()); }, dodajDni: function (s, n) { return iso(dodajDni(zIso(s), n)); },
    poniedzialek: function (s) { return iso(poniedzialek(zIso(s))); }, roznicaDni: function (a, b) { return roznicaDni(zIso(a), zIso(b)); },
    data: data, kiedy: kiedy, MIESIACE_KROTKO: MIESIACE_KROTKO, DNI_KROTKO: DNI_KROTKO,
    trening: trening, kurs: kurs, program: program, level: level, proba: proba,
    czasTreningu: czasTreningu, liczbaCwiczen: liczbaCwiczen,
    wczytaj: wczytaj,
    zalogowana: function () { return !!wymagaj(); },
    stan: function () { return wymagaj(); },
    zaloguj: function (imie) { stan = przyklad(imie); zapisz(); return stan; },
    wyloguj: function () { stan = null; try { localStorage.removeItem(KLUCZ); } catch (e) { /* brak */ } },
    postep: postep,
    statusProby: statusProby,
    tydzien: tydzien,
    seria: seria,

    zapiszTrening: function (o) {
      if (!wymagaj()) { return null; }
      var p = postep(o.kurs);
      if (!p) { return null; }
      var nowa = !p.wpisy[o.przeszkoda];
      var przed = statusProby(o.kurs).stan;
      stan.historia.push({ kurs: o.kurs, przeszkoda: o.przeszkoda, trening: o.trening, data: iso(dzis()), minuty: o.minuty || 1, ocena: '' });
      zapisz();
      var po = postep(o.kurs);
      var status = statusProby(o.kurs);
      return { nowa: nowa, zostalo: po.liczba - po.zrobione.length, probaOdblokowana: przed === 'zablokowana' && status.stan === 'gotowa' };
    },
    ocenOstatni: function (ocena) {
      if (!wymagaj() || !stan.historia.length) { return; }
      stan.historia[stan.historia.length - 1].ocena = ocena;
      zapisz();
    },
    zapiszProbe: function (kursId, wyniki) {
      wymagaj();
      var k = kurs(kursId);
      var def = proba(k.proba);
      var brakuje = def.testy.filter(function (t) { return !(wyniki[t.id] && wyniki[t.id].zalicza); }).map(function (t) { return t.id; });
      var zaliczona = brakuje.length === 0;
      stan.proby.push({ kurs: kursId, data: iso(dzis()), wyniki: wyniki, zaliczona: zaliczona });
      if (zaliczona) {
        stan.rozety.push({ kurs: kursId, program: k.program, level: k.level, data: iso(dzis()) });
        if (k.nastepny) { stan.kurs = k.nastepny; }
        stan.celowany = null;
      } else {
        stan.celowany = { kurs: kursId, od: iso(dzis()), testy: brakuje, sesje: [false, false, false] };
      }
      zapisz();
      return { zaliczona: zaliczona, brakuje: brakuje };
    },
    odhaczCelowany: function (i, wartosc) {
      if (!wymagaj() || !stan.celowany) { return; }
      stan.celowany.sesje[i] = wartosc;
      zapisz();
    },
    ustaw: function (pole, wartosc) { if (wymagaj()) { stan[pole] = wartosc; zapisz(); } },

    /* Scenariusze do pokazania demo */
    demo: function (nazwa) {
      var imie = stan ? stan.imie : 'Kasia';
      var wczoraj = dodajDni(dzis(), -1);
      if (nazwa === 'przyklad') { stan = przyklad(imie); }
      else if (nazwa === 'nowa') { stan = nowyStan(imie); }
      else if (nazwa === 'nastepna') {
        wymagaj();
        var p = postep(stan.kurs);
        if (p && p.biezaca) { stan.historia.push(wpis(stan.kurs, p.biezaca, dzis(), p.biezaca)); }
      } else if (nazwa === 'gotowa') {
        stan = przyklad(imie);
        dopiszDoKonca(stan, 'gimnastyka-step', dodajDni(dzis(), -1));
        stan.historia.forEach(function (h) { if (h.data > iso(dzis())) { h.data = iso(dzis()); } });
      } else if (nazwa === 'niezaliczona') {
        stan = przyklad(imie);
        dopiszDoKonca(stan, 'gimnastyka-step', dodajDni(dzis(), -3));
        stan.historia.forEach(function (h) { if (h.data > iso(dzis())) { h.data = iso(dzis()); } });
        stan.proby.push({ kurs: 'gimnastyka-step', data: iso(dodajDni(dzis(), -2)), wyniki: wynikiPrzyklad(false), zaliczona: false });
        stan.celowany = { kurs: 'gimnastyka-step', od: iso(dodajDni(dzis(), -2)), testy: ['deska-boczna', 'jedna-noga'], sesje: [true, false, false] };
      } else if (nazwa === 'po-probie') {
        stan = przyklad(imie);
        dopiszDoKonca(stan, 'gimnastyka-step', dodajDni(dzis(), -4));
        stan.historia.forEach(function (h) { if (h.data > iso(dzis())) { h.data = iso(dzis()); } });
        stan.proby.push({ kurs: 'gimnastyka-step', data: iso(wczoraj), wyniki: wynikiPrzyklad(true), zaliczona: true });
        stan.rozety.push({ kurs: 'gimnastyka-step', program: 'gimnastyka', level: 'step', data: iso(wczoraj) });
        stan.kurs = 'gimnastyka-klus';
        stan.historia.push(wpis('gimnastyka-klus', 1, dzis(), 1));
      }
      zapisz();
      return stan;
    }
  };

  wczytaj();
  window.AkademiaKursantka = API;
})();
