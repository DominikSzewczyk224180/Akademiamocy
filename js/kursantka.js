/*
  Akademia Mocy Jeździeckich: stan kursantki w demo (etap 4).
  W demo wszystko jest w localStorage: logowanie to przycisk, a postęp, wyniki Prób i rozety zapisują się w przeglądarce.
  W produkcji te same dane przyjdą z Django (konto, historia treningów, próby), więc strony strefy zostaną bez zmian.
*/
(function () {
  'use strict';

  var KLUCZ = 'akademia-kursantka';          /* zapis jednego konta z etapu 4, przenoszony do kont */
  var KLUCZ_KONTA = 'akademia-konta';        /* etap 5: wszystkie konta w tej przeglądarce, po adresie e-mail */
  var KLUCZ_SESJA = 'akademia-sesja';        /* e-mail zalogowanej osoby */
  var DEMO_EMAIL = 'kasia@przyklad.pl';
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
    if (!s) { return ''; }
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

  /* Zapis: konta po adresie e-mail i sesja. Wylogowanie nie kasuje konta, tylko sesję. */
  var stan = null;
  var pamiecKont = null;
  function konta() {
    try { var k = JSON.parse(localStorage.getItem(KLUCZ_KONTA)); if (k && typeof k === 'object') { return k; } } catch (e) { /* brak */ }
    return pamiecKont || {};
  }
  function zapiszKonta(k) { pamiecKont = k; try { localStorage.setItem(KLUCZ_KONTA, JSON.stringify(k)); } catch (e) { /* tryb prywatny: zostaje w pamięci */ } }
  /* Jednorazowa migracja: program „Ranne Moce” ma teraz nazwę i identyfikator „Poranne Moce”.
     Przepisuje dane zapisane wcześniej w tej przeglądarce (konta, zamówienia, vouchery, postępy). */
  (function () {
    try {
      if (localStorage.getItem('akademia-migracja-poranne')) { return; }
      var klucze = [];
      for (var i = 0; i < localStorage.length; i++) { var kl = localStorage.key(i); if (kl && kl.indexOf('akademia') === 0) { klucze.push(kl); } }
      klucze.forEach(function (kl) {
        var v = localStorage.getItem(kl);
        if (!v) { return; }
        var n = v.replace(/(^|[^a-z])ranne-moce/g, '$1poranne-moce').replace(/Ranne Moce/g, 'Poranne Moce').replace(/Rannych Moc/g, 'Porannych Moc').replace(/Rannymi Mocami/g, 'Porannymi Mocami');
        if (n !== v) { localStorage.setItem(kl, n); }
      });
      localStorage.setItem('akademia-migracja-poranne', '1');
    } catch (e) { /* tryb prywatny albo brak pamięci */ }
  })();

  function sesja() { try { return localStorage.getItem(KLUCZ_SESJA) || ''; } catch (e) { return ''; } }
  function ustawSesje(email) { try { if (email) { localStorage.setItem(KLUCZ_SESJA, email); } else { localStorage.removeItem(KLUCZ_SESJA); } } catch (e) { /* brak */ } }
  function klucz(email) { return String(email || '').trim().toLowerCase(); }
  function wczytaj() {
    try {
      var stary = JSON.parse(localStorage.getItem(KLUCZ));
      if (stary && stary.wersja === 1) {
        var kk = konta(), em = klucz(stary.email || DEMO_EMAIL);
        if (!kk[em]) { kk[em] = stary; zapiszKonta(kk); }
        if (!sesja()) { ustawSesje(em); }
        localStorage.removeItem(KLUCZ);
      }
    } catch (e) { /* brak starego zapisu */ }
    var k = konta(), e = sesja();
    stan = e && k[e] && k[e].wersja === 1 ? k[e] : null;
    if (stan) { uzupelnij(stan); }
    return stan;
  }
  function zapisz() {
    if (!stan) { return; }
    var k = konta();
    k[klucz(stan.email)] = stan;
    zapiszKonta(k);
  }

  /* Dostępy: co kursantka kupiła albo aktywowała voucherem */
  var WSZYSTKIE = ['gimnastyka', 'ogolny', 'poranne-moce'];
  function plusMiesiace(d, m) { var x = new Date(d.getTime()); x.setMonth(x.getMonth() + m); return x; }
  function uzupelnij(s) {
    if (!s.dostepy) { s.dostepy = []; }
    if (!s.zamowienia) { s.zamowienia = []; }
    if (!s.dostepy.length && (klucz(s.email) === DEMO_EMAIL || !s.zrodlo)) {
      var od = zIso(s.start || iso(dzis()));
      s.dostepy.push({ id: 'demo', produkt: 'karnet-12', nazwa: 'Karnet 12 miesięcy', programy: WSZYSTKIE.slice(), od: iso(od), do: iso(plusMiesiace(od, 12)), zrodlo: 'demo' });
    }
    return s;
  }
  function aktywne(s) { var d = iso(dzis()); return (s.dostepy || []).filter(function (x) { return x.od <= d && x.do >= d; }); }
  function programyKonta(s) {
    var zb = {};
    aktywne(s).forEach(function (x) { x.programy.forEach(function (p) { zb[p] = true; }); });
    return WSZYSTKIE.filter(function (p) { return zb[p]; });
  }
  function kursStartowy(pid, s) {
    s = s || stan;
    var kk = (TR.kursy || []).filter(function (k) { return k.program === pid; });
    var k = kk.filter(function (x) { return x.level === 'step'; })[0] || kk[0];
    while (k && k.nastepny && s && s.rozety.some(function (r) { return r.kurs === k.id; }) && kurs(k.nastepny)) { k = kurs(k.nastepny); }
    return k ? k.id : null;
  }
  /* Dopisanie dostępu do dowolnego konta (np. zakup na adres istniejącego konta bez logowania na tym urządzeniu) */
  function nowyDostep(d) {
    return { id: d.id || ('d' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5)), produkt: d.produkt, nazwa: d.nazwa, programy: d.programy.slice(), od: d.od, do: d.do, zrodlo: d.zrodlo || 'zakup', zamowienie: d.zamowienie || null, voucher: d.voucher || null };
  }
  function dodajDostepDla(email, d) {
    var k = konta(), em = klucz(email);
    if (!k[em]) { return null; }
    var s = uzupelnij(k[em]);
    var wpis = nowyDostep(d);
    s.dostepy.push(wpis);
    if (!s.program || !s.kurs || programyKonta(s).indexOf(s.program) === -1) {
      var kid = kursStartowy(d.programy[0], s);
      if (kid) { s.program = d.programy[0]; s.kurs = kid; }
    }
    if (d.zamowienie && s.zamowienia.indexOf(d.zamowienie) === -1) { s.zamowienia.push(d.zamowienie); }
    k[em] = s;
    zapiszKonta(k);
    if (stan && klucz(stan.email) === em) { stan = s; }
    return wpis;
  }
  function ustawProgram(pid) {
    if (!stan) { return false; }
    var kid = kursStartowy(pid);
    if (!kid) { return false; }
    stan.program = pid;
    stan.kurs = kid;
    zapisz();
    return true;
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
    if (zal) { return { stan: 'zaliczona', data: zal.data, wynik: zal, ostatnia: proby[proby.length - 1], def: def, proby: proby }; }
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
    /* Konto demo: Kasia z karnetem. Przy kolejnym logowaniu wraca jej zapisany postęp. */
    zaloguj: function (imie) {
      var k = konta();
      if (k[DEMO_EMAIL] && k[DEMO_EMAIL].wersja === 1) { stan = k[DEMO_EMAIL]; }
      else { stan = przyklad(imie || 'Kasia'); stan.email = DEMO_EMAIL; }
      uzupelnij(stan);
      ustawSesje(DEMO_EMAIL);
      zapisz();
      return stan;
    },
    istnieje: function (email) { return !!konta()[klucz(email)]; },
    zalogujEmail: function (email) {
      var k = konta(), em = klucz(email);
      if (!k[em]) { return false; }
      stan = uzupelnij(k[em]);
      ustawSesje(em);
      zapisz();
      return true;
    },
    zalozKonto: function (dane) {
      var em = klucz(dane.email);
      var k = konta();
      if (k[em]) { stan = uzupelnij(k[em]); ustawSesje(em); return stan; }
      stan = nowyStan(dane.imie || 'Kursantka');
      stan.email = em;
      stan.zrodlo = 'zakup';
      stan.program = null;
      stan.kurs = null;
      stan.dostepy = [];
      stan.zamowienia = [];
      ustawSesje(em);
      zapisz();
      return stan;
    },
    wyloguj: function () { stan = null; ustawSesje(''); },
    demoEmail: DEMO_EMAIL,

    /* Dostępy i zamówienia (etap 5) */
    dostepy: function () { return wymagaj() ? stan.dostepy.slice() : []; },
    aktywneDostepy: function () { return wymagaj() ? aktywne(stan) : []; },
    programyKonta: function () { return wymagaj() ? programyKonta(stan) : []; },
    maDostep: function (pid) { return !!wymagaj() && programyKonta(stan).indexOf(pid) !== -1; },
    kursStartowy: kursStartowy,
    ustawProgram: ustawProgram,
    plusMiesiace: function (s, m) { return iso(plusMiesiace(zIso(s), m)); },
    /* Dostęp do programu kończący się najwcześniej (do pokazania przypomnienia) */
    koniecDostepu: function (pid) {
      if (!wymagaj()) { return null; }
      var d = aktywne(stan).filter(function (x) { return x.programy.indexOf(pid) !== -1; });
      if (!d.length) { return null; }
      var najdalej = d.map(function (x) { return x.do; }).sort().pop();
      return { do: najdalej, dni: roznicaDni(dzis(), zIso(najdalej)) };
    },
    dodajDostep: function (d) {
      if (!wymagaj()) { return null; }
      return dodajDostepDla(stan.email, d);
    },
    dodajDostepDla: dodajDostepDla,
    /* Konto, które ma już dostęp do tych programów: nowy okres zaczyna się po końcu obecnego */
    poczatekNowegoOkresu: function (email, programy) {
      var k = konta(), s = k[klucz(email)];
      var d = iso(dzis());
      if (!s) { return d; }
      var najdalej = aktywne(uzupelnij(s)).filter(function (x) { return programy.every(function (p) { return x.programy.indexOf(p) !== -1; }); }).map(function (x) { return x.do; }).sort().pop();
      return najdalej ? iso(dodajDni(zIso(najdalej), 1)) : d;
    },
    dodajZamowienie: function (nr) { if (wymagaj() && stan.zamowienia.indexOf(nr) === -1) { stan.zamowienia.push(nr); zapisz(); } },
    dodajZamowienieDla: function (email, nr) {
      var k = konta(), em = klucz(email);
      if (!k[em]) { return false; }
      var s = uzupelnij(k[em]);
      if (s.zamowienia.indexOf(nr) === -1) { s.zamowienia.push(nr); }
      k[em] = s;
      zapiszKonta(k);
      if (stan && klucz(stan.email) === em) { stan = s; }
      return true;
    },
    ustawImie: function (imie) { if (wymagaj() && imie) { stan.imie = imie; zapisz(); } },
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
      /* Powtórka po zaliczeniu: sprawdzian formy bez ryzyka. Rozeta, level i plan zostają bez zmian. */
      var powtorka = stan.proby.some(function (x) { return x.kurs === kursId && x.zaliczona; });
      var wpis = { kurs: kursId, data: iso(dzis()), wyniki: wyniki, zaliczona: zaliczona };
      if (powtorka) { wpis.powtorka = true; }
      stan.proby.push(wpis);
      if (powtorka) { zapisz(); return { zaliczona: zaliczona, brakuje: brakuje, powtorka: true }; }
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
      var konto = stan ? { email: stan.email, dostepy: stan.dostepy || [], zamowienia: stan.zamowienia || [], zrodlo: stan.zrodlo } : null;
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
      /* Scenariusz zmienia postęp, ale konto zostaje to samo: e-mail, dostępy i zamówienia */
      if (konto) {
        stan.email = konto.email; stan.dostepy = konto.dostepy; stan.zamowienia = konto.zamowienia;
        if (konto.zrodlo) { stan.zrodlo = konto.zrodlo; }
      }
      uzupelnij(stan);
      if (nazwa !== 'nastepna' && programyKonta(stan).indexOf('gimnastyka') === -1) {
        stan.dostepy.push({ id: 'demo-' + Date.now().toString(36), produkt: 'karnet-12', nazwa: 'Dostęp demo', programy: ['gimnastyka'], od: iso(dzis()), do: iso(plusMiesiace(dzis(), 12)), zrodlo: 'demo' });
      }
      if (nazwa === 'wygasa') {
        var d = aktywne(stan).filter(function (x) { return x.programy.indexOf(stan.program || 'gimnastyka') !== -1; });
        d.forEach(function (x) { x.do = iso(dodajDni(dzis(), 5)); });
      }
      zapisz();
      return stan;
    }
  };

  wczytaj();
  window.AkademiaKursantka = API;
})();
