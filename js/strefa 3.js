/*
  Akademia Mocy Jeździeckich: strefa kursantki (etap 4).
  Ekrany: panel, mapa parkuru, przegląd treningu, Próba Mocy, postępy, certyfikat, logowanie.
  Dane: js/kursantka.js (stan w localStorage), data/treningi.js, data/proby.js, data/programs.js.
*/
(function () {
  'use strict';

  var doc = document;
  var AK = window.AkademiaKursantka;
  var TR = window.AKADEMIA_TRENINGI || { kursy: [], klipy: {} };
  var DANE = window.AKADEMIA || { programy: [], levele: [] };
  var main = doc.querySelector('[data-strona]');
  var STRONA = main ? main.getAttribute('data-strona') : '';
  var params = new URLSearchParams(location.search);
  if (!AK || !main) { return; }

  /* Pomocnicze ------------------------------------------------------------- */
  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function el(tag, klasa, tekst) {
    var e = doc.createElement(tag);
    if (klasa) { e.className = klasa; }
    if (tekst !== undefined && tekst !== null) { e.textContent = tekst; }
    return e;
  }
  function ikona(id, klasa) {
    var s = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('class', 'ico' + (klasa ? ' ' + klasa : ''));
    s.setAttribute('aria-hidden', 'true');
    var u = doc.createElementNS('http://www.w3.org/2000/svg', 'use');
    u.setAttribute('href', '#' + id);
    s.appendChild(u);
    return s;
  }
  function przycisk(tekst, href, klasa, ikonaId) {
    var a = el(href ? 'a' : 'button', klasa || 'btn btn--dark');
    if (href) { a.href = href; } else { a.type = 'button'; }
    if (ikonaId) { a.appendChild(ikona(ikonaId, ikonaId === 'i-play' ? 'ico--fill' : '')); }
    a.appendChild(doc.createTextNode(tekst));
    return a;
  }
  function odmiana(n, jeden, dwaCztery, piec) {
    if (n === 1) { return jeden; }
    var r10 = n % 10, r100 = n % 100;
    return (r10 >= 2 && r10 <= 4 && (r100 < 12 || r100 > 14)) ? dwaCztery : piec;
  }
  function mmss(s) { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  function rozeta(levelId, mala) {
    var t = doc.getElementById('tpl-rozeta-' + levelId + (mala ? '-mala' : ''));
    return t && t.content.firstElementChild ? t.content.firstElementChild.cloneNode(true) : el('span');
  }
  var toastEl = $('[data-toast]');
  var toastTimer = null;
  function toast(tekst) {
    if (!toastEl) { return; }
    toastEl.textContent = tekst;
    toastEl.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toastEl.classList.remove('is-visible'); }, 3600);
  }
  var OCENA = { ok: 'W sam raz', lekko: 'Za lekko', ciezko: 'Za ciężko' };
  function poster(klipId) { var k = TR.klipy[klipId]; return k ? k.poster : ''; }
  function infoCw(c) {
    if (c.powtorzenia) { return c.powtorzenia + ' ' + odmiana(c.powtorzenia, 'powtórzenie', 'powtórzenia', 'powtórzeń'); }
    return c.czas + ' s' + (c.strony ? ' na stronę' : '');
  }
  function minuty(t) { return Math.max(1, Math.round(AK.czasTreningu(t) / 60)); }
  function linkTreningu(k, n) { return 'trening.html?t=' + encodeURIComponent(k.przeszkody[n - 1]) + '&kurs=' + encodeURIComponent(k.id) + '&przeszkoda=' + n; }
  function linkPrzegladu(k, n) { return 'przeglad.html?kurs=' + encodeURIComponent(k.id) + '&przeszkoda=' + n; }
  function kursyProgramu(pid) { return (TR.kursy || []).filter(function (k) { return k.program === pid; }); }
  function poprzedniKurs(k) { return (TR.kursy || []).filter(function (x) { return x.nastepny === k.id; })[0] || null; }
  function kursOdblokowany(k) {
    var prev = poprzedniKurs(k);
    return !prev || AK.statusProby(prev.id).stan === 'zaliczona';
  }

  /* Dostęp: strefa tylko po zalogowaniu (w demo to przycisk) */
  if (STRONA !== 'logowanie' && !AK.zalogowana()) {
    location.replace('logowanie.html?wroc=' + encodeURIComponent((location.pathname.split('/').pop() || 'panel.html') + location.search));
    return;
  }

  /* 1. Rama strefy: użytkowniczka, menu, wylogowanie, panel demo ------------------- */
  function rama() {
    var s = AK.stan();
    if (!s) { return; }
    var k = AK.kurs(s.kurs), p = AK.program(k.program), lv = AK.level(k.level);
    $$('[data-sz-imie]').forEach(function (e) { e.textContent = s.imie; });
    $$('[data-sz-inicjal]').forEach(function (e) { e.textContent = s.imie.charAt(0).toUpperCase(); });
    $$('[data-sz-program]').forEach(function (e) { e.textContent = p.nazwa + ', ' + lv.nazwa; });
    var avatar = $('[data-sz-avatar]'), menu = $('[data-sz-menu]');
    if (avatar && menu) {
      var ustaw = function (otwarte) { menu.hidden = !otwarte; avatar.setAttribute('aria-expanded', otwarte ? 'true' : 'false'); };
      avatar.addEventListener('click', function (e) { e.stopPropagation(); ustaw(menu.hidden); });
      doc.addEventListener('click', function (e) { if (!menu.hidden && !e.target.closest('.sz-user')) { ustaw(false); } });
      doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { ustaw(false); avatar.focus(); } });
    }
    $$('[data-sz-wyloguj]').forEach(function (b) {
      b.addEventListener('click', function () { AK.wyloguj(); location.href = 'index.html'; });
    });
    var demo = $('[data-sz-demo]');
    $$('[data-sz-demo-btn]').forEach(function (b) {
      b.addEventListener('click', function () { demo.hidden = !demo.hidden; if (!demo.hidden) { $('button', demo).focus(); } });
    });
    var zamknij = $('[data-sz-demo-zamknij]');
    if (zamknij) { zamknij.addEventListener('click', function () { demo.hidden = true; }); }
    $$('[data-sz-scenariusz]').forEach(function (b) {
      b.addEventListener('click', function () {
        var nazwa = b.getAttribute('data-sz-scenariusz');
        AK.demo(nazwa);
        try { sessionStorage.setItem('akademia-toast', 'Demo: ' + b.querySelector('strong').textContent); } catch (e) { /* brak */ }
        var cel = { gotowa: 'proba.html', niezaliczona: 'proba.html', 'po-probie': 'mapa.html' }[nazwa];
        if (cel && STRONA !== 'proba' && STRONA !== 'mapa') { location.href = cel; } else { location.replace(location.pathname.split('/').pop()); }
      });
    });
    try {
      var t = sessionStorage.getItem('akademia-toast');
      if (t) { sessionStorage.removeItem('akademia-toast'); window.setTimeout(function () { toast(t); }, 300); }
    } catch (e) { /* brak */ }
  }

  /* 2. Panel ---------------------------------------------------------------- */
  function panel() {
    var s = AK.stan(), k = AK.kurs(s.kurs), pr = AK.program(k.program), lv = AK.level(k.level);
    var p = AK.postep(k.id), st = AK.statusProby(k.id);
    $('[data-p-pas]').classList.add('band--' + pr.kolor);
    var h = new Date().getHours();
    $('[data-p-data]').textContent = AK.data(AK.dzis(), { dzien: true });
    $('[data-p-powitanie]').textContent = (h >= 5 && h < 12 ? 'Dzień dobry' : (h >= 12 && h < 18 ? 'Cześć' : 'Dobry wieczór')) + ', ' + s.imie;
    $('[data-p-gdzie]').textContent = pr.nazwa + ', Level ' + lv.nazwa + '. ' + (p.wszystkie ? 'Cały parkur przejechany.' : 'Przeszkoda ' + p.biezaca + ' z ' + p.liczba + '.');

    /* Kontynuuj trening */
    var box = $('[data-p-nastepny]');
    box.textContent = '';
    if (p.biezaca) {
      var t = AK.trening(k.przeszkody[p.biezaca - 1]);
      var tag = el('p', 'sz-next__tag');
      tag.appendChild(el('span', 'sz-num sz-num--now', String(p.biezaca)));
      tag.appendChild(doc.createTextNode('Przeszkoda ' + p.biezaca + ' z ' + p.liczba));
      box.appendChild(tag);
      var h2 = el('h2', 'sz-next__title', t.nazwa);
      h2.id = 'p-nastepny-tytul';
      box.appendChild(h2);
      var meta = el('p', 'sz-next__meta', 'ok. ' + minuty(t) + ' min, ' + AK.liczbaCwiczen(t) + ' ' + odmiana(AK.liczbaCwiczen(t), 'ćwiczenie', 'ćwiczenia', 'ćwiczeń') + ', ' + (t.sprzet || []).join(', '));
      box.appendChild(meta);
      var thumbs = el('ul', 'sz-thumbs');
      var widziane = {};
      t.bloki.forEach(function (b) { b.cwiczenia.forEach(function (c) {
        if (widziane[c.klip] || Object.keys(widziane).length >= 4) { return; }
        widziane[c.klip] = true;
        var li = el('li');
        var img = el('img'); img.src = poster(c.klip); img.alt = ''; img.width = 160; img.height = 90; img.loading = 'lazy';
        li.appendChild(img); li.appendChild(el('span', '', c.nazwa));
        thumbs.appendChild(li);
      }); });
      box.appendChild(thumbs);
      var akcje = el('div', 'sz-next__actions');
      akcje.appendChild(przycisk(p.zrobione.length ? 'Kontynuuj trening' : 'Zacznij trening', linkTreningu(k, p.biezaca), 'btn btn--dark', 'i-play'));
      akcje.appendChild(przycisk('Co jest w treningu', linkPrzegladu(k, p.biezaca), 'btn btn--light'));
      box.appendChild(akcje);
    } else {
      box.classList.add('sz-next--proba');
      box.appendChild(rozeta(k.level));
      var h2b = el('h2', 'sz-next__title', st.stan === 'czeka' ? 'Tydzień w ' + (k.level === 'step' ? 'stępie' : 'kłusie') : 'Próba Mocy czeka');
      h2b.id = 'p-nastepny-tytul';
      box.appendChild(h2b);
      box.appendChild(el('p', 'sz-next__meta', st.stan === 'czeka' ? 'Treningi celowane, a potem drugie podejście od ' + AK.data(st.od) + '.' : 'Cały parkur przejechany. Czas sprawdzić, czy ciało jest gotowe na ' + (st.def ? st.def.otwiera : 'więcej') + '.'));
      var akcje2 = el('div', 'sz-next__actions');
      akcje2.appendChild(przycisk(st.stan === 'czeka' ? 'Plan na ten tydzień' : 'Podejdź do Próby', 'proba.html', 'btn btn--dark', 'i-rozeta'));
      box.appendChild(akcje2);
    }

    /* Cel tygodnia */
    var tyg = AK.tydzien();
    var w = $('[data-p-tydzien]');
    w.textContent = '';
    w.appendChild(el('h2', 'sz-h3', 'Cel tygodnia'));
    var ring = el('div', 'sz-ring');
    var proc = Math.min(1, tyg.zrobione / tyg.cel);
    var r = 34, obw = 2 * Math.PI * r;
    ring.innerHTML = '<svg viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="' + r + '" class="sz-ring__bg"/><circle cx="42" cy="42" r="' + r + '" class="sz-ring__fg" stroke-dasharray="' + (obw * proc).toFixed(1) + ' ' + obw.toFixed(1) + '"/></svg>';
    var srodek = el('p', 'sz-ring__txt');
    srodek.appendChild(el('strong', '', String(tyg.zrobione)));
    srodek.appendChild(el('span', '', 'z ' + tyg.cel));
    ring.appendChild(srodek);
    var dni = el('ol', 'sz-days');
    dni.setAttribute('aria-label', 'Dni tygodnia');
    tyg.dni.forEach(function (d) {
      var li = el('li', (d.trening ? 'is-done ' : '') + (d.dzis ? 'is-today ' : '') + (d.przyszly ? 'is-future' : ''));
      li.appendChild(el('span', '', d.krotko));
      var kropka = el('i');
      kropka.setAttribute('aria-label', d.trening ? 'trening' : 'bez treningu');
      li.appendChild(kropka);
      dni.appendChild(li);
    });
    var wiersz = el('div', 'sz-week__row');
    wiersz.appendChild(ring); wiersz.appendChild(dni);
    w.appendChild(wiersz);
    var brak = tyg.cel - tyg.zrobione;
    w.appendChild(el('p', 'sz-muted', brak > 0 ? 'Jeszcze ' + brak + ' ' + odmiana(brak, 'trening', 'treningi', 'treningów') + ' do celu w tym tygodniu.' : 'Cel tygodnia zrobiony. Koń to poczuje.'));

    /* Seria */
    var ser = AK.seria();
    var sb = $('[data-p-seria]');
    sb.textContent = '';
    sb.appendChild(el('h2', 'sz-h3', 'Seria'));
    var big = el('p', 'sz-big');
    big.appendChild(el('strong', '', String(ser)));
    big.appendChild(el('span', '', ser ? odmiana(ser, 'tydzień', 'tygodnie', 'tygodni') + ' z rzędu z celem' : 'tygodni z celem'));
    sb.appendChild(big);
    sb.appendChild(el('p', 'sz-muted', ser ? 'Seria liczy tygodnie, w których jest ' + s.cel + ' ' + odmiana(s.cel, 'trening', 'treningi', 'treningów') + '. Jeden słabszy tydzień nie kasuje postępów na parkurze.' : 'Zrób ' + s.cel + ' ' + odmiana(s.cel, 'trening', 'treningi', 'treningów') + ' w tym tygodniu i zacznij serię.'));

    /* Próba Mocy */
    var pb = $('[data-p-proba]');
    pb.textContent = '';
    pb.appendChild(el('h2', 'sz-h3', 'Próba Mocy'));
    var stProby = st;
    var kursProby = k;
    if (st.stan === 'brak') { var prev = poprzedniKurs(k); if (prev) { kursProby = prev; stProby = AK.statusProby(prev.id); } }
    var rz = el('div', 'sz-probabox__ros' + (stProby.stan === 'zaliczona' ? '' : ' is-dim'));
    rz.appendChild(rozeta(kursProby.level, true));
    pb.appendChild(rz);
    var opisy = {
      zablokowana: 'Odblokuje się po ostatniej przeszkodzie. ' + (stProby.zostalo ? 'Zostało: ' + stProby.zostalo + ' ' + odmiana(stProby.zostalo, 'przeszkoda', 'przeszkody', 'przeszkód') + '.' : ''),
      gotowa: 'Gotowa do podejścia. 4 testy, około 10 minut.',
      czeka: 'Drugie podejście od ' + (stProby.od ? AK.data(stProby.od) : '') + '.',
      zaliczona: 'Zaliczona ' + (stProby.data ? AK.data(stProby.data) : '') + '. Rozeta ' + AK.level(kursProby.level).nazwa + ' jest w kolekcji.',
      brak: 'Próba tego levelu pojawi się razem z kolejnym levelem.'
    };
    pb.appendChild(el('p', '', opisy[stProby.stan] || ''));
    pb.appendChild(przycisk(stProby.stan === 'gotowa' ? 'Podejdź do Próby' : (stProby.stan === 'zaliczona' ? 'Zobacz wynik' : 'Jak działa Próba'), 'proba.html' + (kursProby.id !== s.kurs ? '?kurs=' + kursProby.id : ''), stProby.stan === 'gotowa' ? 'btn btn--dark btn--sm' : 'link'));

    /* Pasek parkuru */
    pasekParkuru($('[data-p-parkur]'), k, p, st);

    /* Rozety */
    polkaRozet($('[data-p-rozety]'), k.program, false);

    /* Ostatnie treningi */
    var lista = $('[data-p-historia]');
    lista.textContent = '';
    var hist = s.historia.slice(-4).reverse();
    if (!hist.length) { lista.appendChild(el('li', 'sz-history__empty', 'Pierwszy trening pojawi się tutaj.')); }
    hist.forEach(function (hh) {
      var kk = AK.kurs(hh.kurs), tt = AK.trening(hh.trening);
      var li = el('li');
      li.appendChild(el('span', 'sz-history__when', AK.kiedy(hh.data)));
      var co = el('span', 'sz-history__what');
      co.appendChild(el('strong', '', tt.nazwa));
      co.appendChild(el('span', '', 'Przeszkoda ' + hh.przeszkoda + ', ' + AK.level(kk.level).nazwa + ', ' + hh.minuty + ' min'));
      li.appendChild(co);
      if (hh.ocena) { li.appendChild(el('span', 'sz-chip sz-chip--' + hh.ocena, OCENA[hh.ocena])); }
      lista.appendChild(li);
    });
  }

  function pasekParkuru(cel, k, p, st) {
    cel.textContent = '';
    var ol = el('ol', 'sz-strip__list');
    ol.setAttribute('aria-label', 'Przeszkody parkuru ' + AK.level(k.level).nazwa);
    for (var n = 1; n <= p.liczba; n++) {
      var stan = p.wpisy[n] ? 'done' : (n === p.biezaca ? 'now' : 'next');
      var li = el('li', 'sz-strip__item is-' + stan);
      if (stan === 'now') { li.appendChild(konik()); ol.classList.add('ma-konia'); }
      var a = el('a', 'sz-strip__link');
      a.href = linkPrzegladu(k, n);
      a.setAttribute('aria-label', 'Przeszkoda ' + n + (stan === 'done' ? ', zaliczona' : (stan === 'now' ? ', tu jesteś' : ', przed Tobą')));
      if (stan === 'done') { a.appendChild(ikona('i-check')); } else { a.appendChild(doc.createTextNode(String(n))); }
      li.appendChild(a);
      ol.appendChild(li);
    }
    var fin = el('li', 'sz-strip__item sz-strip__item--proba is-' + st.stan);
    if (p.wszystkie) { fin.appendChild(konik()); ol.classList.add('ma-konia'); }
    var af = el('a', 'sz-strip__link');
    af.href = 'proba.html';
    af.setAttribute('aria-label', 'Próba Mocy, ' + ({ zablokowana: 'zablokowana', gotowa: 'gotowa', czeka: 'drugie podejście wkrótce', zaliczona: 'zaliczona', brak: 'wkrótce' }[st.stan] || ''));
    af.appendChild(rozeta(k.level, true));
    fin.appendChild(af);
    ol.appendChild(fin);
    cel.appendChild(ol);
    var opis = el('p', 'sz-strip__txt');
    opis.appendChild(el('strong', '', p.zrobione.length + ' z ' + p.liczba));
    opis.appendChild(doc.createTextNode(' ' + odmiana(p.liczba, 'przeszkoda', 'przeszkody', 'przeszkód') + ' zaliczone, na końcu Próba Mocy'));
    cel.appendChild(opis);
  }

  function polkaRozet(cel, programId, zCertyfikatami) {
    cel.textContent = '';
    var s = AK.stan();
    (DANE.levele || []).forEach(function (lv) {
      var kk = kursyProgramu(programId).filter(function (x) { return x.level === lv.id; })[0];
      var zdobyta = s.rozety.filter(function (r) { return r.program === programId && r.level === lv.id; })[0];
      var li = el('li', 'sz-shelf__item' + (zdobyta ? ' is-won' : ''));
      var fig = el('div', 'sz-shelf__ros');
      fig.appendChild(rozeta(lv.id));
      li.appendChild(fig);
      li.appendChild(el('strong', '', lv.nazwa));
      var opis = zdobyta ? 'zdobyta ' + AK.data(zdobyta.data) : (!lv.dostepny ? 'wkrótce' : (kk && kursOdblokowany(kk) ? 'na końcu parkuru' : 'po Próbie poprzedniego levelu'));
      li.appendChild(el('span', '', opis));
      if (zCertyfikatami && zdobyta) {
        var a = przycisk('Certyfikat PDF', 'certyfikat.html?kurs=' + encodeURIComponent(zdobyta.kurs), 'link', 'i-certyfikat');
        li.appendChild(a);
      }
      cel.appendChild(li);
    });
  }

  /* 3. Mapa parkuru (SVG) ----------------------------------------------------- */
  var UKLADY = {
    poziom: {
      W: 1200, H: 720, start: { x: 70, y: 175 }, lewo: 160, prawo: 1040, zawrot: 78, skala: 1,
      punkty: [
        [180, 175, 0, 1], [370, 175, 0, 1], [560, 175, 0, 1], [750, 175, 0, 1], [940, 175, 0, 1],
        [880, 370, 1, -1], [680, 370, 1, -1], [480, 370, 1, -1], [280, 370, 1, -1],
        [320, 565, 2, 1], [520, 565, 2, 1], [720, 565, 2, 1], [960, 565, 2, 1]
      ]
    },
    pion: {
      W: 420, H: 1460, start: { x: 40, y: 165 }, lewo: 70, prawo: 350, zawrot: 58, skala: 0.86,
      punkty: [
        [130, 165, 0, 1], [290, 165, 0, 1],
        [290, 355, 1, -1], [130, 355, 1, -1],
        [130, 545, 2, 1], [290, 545, 2, 1],
        [290, 735, 3, -1], [130, 735, 3, -1],
        [130, 925, 4, 1], [290, 925, 4, 1],
        [290, 1115, 5, -1], [130, 1115, 5, -1],
        [230, 1305, 6, 1]
      ]
    }
  };
  /* Układ mapy dla dowolnej liczby punktów (przeszkody i Próba). Dla 13 punktów zostaje ręczny układ z UKLADY. */
  function uklad(nazwa, punkty) {
    var baza = UKLADY[nazwa];
    if (punkty === baza.punkty.length) { return baza; }
    var poziom = nazwa === 'poziom';
    var naRzad = poziom ? 5 : 2;
    var rzedy = Math.ceil(punkty / naRzad);
    var podst = Math.floor(punkty / rzedy), extra = punkty % rzedy;
    var y0 = poziom ? 175 : 165, dy = poziom ? 195 : 190;
    var L = poziom ? 200 : 130, R = poziom ? 1000 : 290;
    var lista = [];
    for (var r = 0; r < rzedy; r++) {
      var k = podst + (r < extra ? 1 : 0);
      var kier = r % 2 === 0 ? 1 : -1;
      for (var i = 0; i < k; i++) {
        var x = k === 1 ? (L + R) / 2 : L + i * (R - L) / (k - 1);
        if (kier < 0) { x = L + R - x; }
        lista.push([Math.round(x), y0 + r * dy, r, kier]);
      }
    }
    return { W: baza.W, H: y0 + (rzedy - 1) * dy + (poziom ? 155 : 155), start: baza.start, lewo: baza.lewo, prawo: baza.prawo, zawrot: baza.zawrot, skala: baza.skala, punkty: lista };
  }
  function noga(a, b, u) {
    if (a[2] === b[2]) { return 'M' + a[0] + ' ' + a[1] + ' L' + b[0] + ' ' + b[1]; }
    var krawedz = a[3] > 0 ? u.prawo : u.lewo;
    var c = a[3] > 0 ? u.prawo + u.zawrot : u.lewo - u.zawrot;
    return 'M' + a[0] + ' ' + a[1] + ' L' + krawedz + ' ' + a[1] + ' C' + c + ' ' + a[1] + ' ' + c + ' ' + b[1] + ' ' + krawedz + ' ' + b[1] + ' L' + b[0] + ' ' + b[1];
  }
  function kwiat(x, y, kolor) {
    var g = '<g class="ob__flower" transform="translate(' + x + ' ' + y + ')">';
    for (var i = 0; i < 5; i++) {
      var a = i * Math.PI * 2 / 5;
      g += '<circle cx="' + (Math.cos(a) * 4.2).toFixed(1) + '" cy="' + (Math.sin(a) * 4.2).toFixed(1) + '" r="3.2" fill="' + kolor + '"/>';
    }
    return g + '<circle r="2.2" fill="#E9D27F"/></g>';
  }
  function rozetaSvg(level, stan) {
    var kolory = { step: ['#F2B6C6', '#FBE3EA', '#E07D98'], klus: ['#ADC3A4', '#E3ECDE', '#7E9677'], galop: ['#E9D27F', '#F8EFC9', '#C9AE6A'] }[level] || ['#F2B6C6', '#FBE3EA', '#E07D98'];
    var pkt = [];
    for (var i = 0; i < 72; i++) {
      var th = i / 72 * Math.PI * 2;
      var rr = 30 + 3.2 * Math.cos(12 * th);
      pkt.push((Math.cos(th) * rr).toFixed(1) + ',' + (Math.sin(th) * rr).toFixed(1));
    }
    return '<g class="ob-proba__ros">' +
      '<path d="M-14 20 L-4 24 L-10 58 L-16 52 L-24 56 Z" fill="' + kolory[2] + '"/><path d="M14 20 L4 24 L10 58 L16 52 L24 56 Z" fill="' + kolory[0] + '"/>' +
      '<polygon points="' + pkt.join(' ') + '" fill="' + kolory[0] + '"/><circle r="20" fill="' + kolory[1] + '"/><circle r="15" fill="#FFFFFF"/>' +
      (stan === 'zaliczona' ? '<path d="M-6 0 L-1.5 4.5 L7 -4.5" fill="none" stroke="' + kolory[2] + '" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>' : '<circle r="4.5" fill="#2F2323"/>') +
      '</g>';
  }
  /* Koń z jeźdźczynią stoi na prostym odcinku przed bieżącą przeszkodą (albo przed Próbą Mocy),
     przodem w kierunku jazdy, i wjeżdża na miejsce. Punkty układu to [x, y, rząd, kierunek]. */
  function konNaMapie(p, pkt, u) {
    var idx = (!p.wszystkie && p.biezaca >= 1 && p.biezaca <= p.liczba) ? p.biezaca - 1 : pkt.length - 1;
    var q = pkt[idx];
    var prev = idx === 0 ? [u.start.x, u.start.y, 0, 1] : pkt[idx - 1];
    var kier = q[3] || 1;
    var odstep = (idx === pkt.length - 1 ? 44 : 26) * u.skala;        /* przerwa do numeru, „Tu jesteś” albo rozety */
    var miejsce;
    if (prev[2] === q[2]) {
      miejsce = Math.abs(q[0] - prev[0]) - 22 * u.skala;              /* prosta od poprzedniej przeszkody */
    } else {
      var krawedz = prev[3] > 0 ? u.prawo : u.lewo;                    /* tu ścieżka wychodzi z zawrotu */
      var banda = kier > 0 ? q[0] - 34 : (u.W - 34) - q[0];
      miejsce = Math.min(Math.abs(q[0] - krawedz) + u.zawrot * 0.8, banda);
    }
    var w = Math.max(56 * u.skala, Math.min(120 * u.skala, miejsce - odstep));
    var dyst = odstep + w / 2;
    var h = w * 566 / 596;
    var x = Math.round(q[0] - kier * dyst), y = Math.round(q[1] + 10 * u.skala);
    return '<g class="sz-kon-poz" transform="translate(' + x + ' ' + y + ')" aria-hidden="true"><g class="sz-kon" style="--od:' + (-kier * 70) + 'px">' +
      '<g transform="scale(' + kier + ' 1)"><g class="sz-kon__cialo"><image href="assets/img/konie/kon-jezdziec.svg" x="' + (-w / 2).toFixed(1) + '" y="' + (-h).toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + h.toFixed(1) + '"/></g></g></g></g>';
  }

  function konik() {
    var img = el('img', 'sz-strip__kon');
    img.src = 'assets/img/konie/kon-jezdziec.svg'; img.alt = ''; img.width = 48; img.height = 46;
    return img;
  }

  function svgParkur(k, p, st, nazwaUkladu) {
    var u = uklad(nazwaUkladu, p.liczba + 1);
    var pkt = u.punkty;
    var stanP = function (n) { return p.wpisy[n] ? 'done' : (n === p.biezaca ? 'now' : 'next'); };
    var s = '<svg class="sz-map__svg" viewBox="0 0 ' + u.W + ' ' + u.H + '" role="group" aria-labelledby="sz-map-tytul">';
    s += '<title id="sz-map-tytul">Mapa parkuru ' + AK.level(k.level).nazwa + ': ' + p.zrobione.length + ' z ' + p.liczba + ' przeszkód zaliczone</title>';
    s += '<rect class="sz-map__arena" x="14" y="14" width="' + (u.W - 28) + '" height="' + (u.H - 28) + '" rx="' + (nazwaUkladu === 'poziom' ? 64 : 48) + '"/>';
    s += '<rect class="sz-map__rail" x="28" y="28" width="' + (u.W - 56) + '" height="' + (u.H - 56) + '" rx="' + (nazwaUkladu === 'poziom' ? 52 : 38) + '"/>';
    var rogi = nazwaUkladu === 'poziom' ? [[60, 60], [u.W - 60, 60], [60, u.H - 60], [u.W - 60, u.H - 60]] : [[56, 56], [u.W - 56, 56], [56, u.H - 56], [u.W - 56, u.H - 56]];
    rogi.forEach(function (r, i) { s += kwiat(r[0], r[1], i % 2 ? '#ADC3A4' : '#F2B6C6') + kwiat(r[0] + (i % 2 ? -14 : 14), r[1] + 9, i % 2 ? '#F2B6C6' : '#ADC3A4'); });
    /* nogi trasy */
    var start = [u.start.x, u.start.y, 0, 1];
    for (var i = 0; i < pkt.length; i++) {
      var a = i === 0 ? start : pkt[i - 1];
      var b = pkt[i];
      var n = i + 1;
      var klasa = n <= p.liczba ? (p.wpisy[n] ? 'is-done' : (n === p.biezaca ? 'is-now' : 'is-next')) : (st.stan === 'zaliczona' ? 'is-done' : (p.wszystkie ? 'is-now' : 'is-next'));
      s += '<path class="sz-map__leg ' + klasa + '" d="' + noga(a, b, u) + '"/>';
    }
    /* start */
    s += '<g class="sz-map__start" transform="translate(' + u.start.x + ' ' + u.start.y + ')"><path d="M-8 22 V-30" class="sz-map__pole"/><path d="M-8 -30 L18 -22 L-8 -13 Z" class="sz-map__flag"/><text x="-8" y="44" class="sz-map__label" text-anchor="middle">Start</text></g>';
    /* przeszkody */
    for (var j = 0; j < p.liczba; j++) {
      var q = pkt[j], nr = j + 1, st2 = stanP(nr);
      var tr = AK.trening(k.przeszkody[j]);
      var opis = 'Przeszkoda ' + nr + ', ' + tr.nazwa + (st2 === 'done' ? ', zaliczona ' + AK.data(p.wpisy[nr].data) : (st2 === 'now' ? ', tu jesteś' : ', przed Tobą'));
      var oxer = nr % 3 === 0;
      var g = '<a class="ob ob--' + st2 + '" href="' + linkPrzegladu(k, nr) + '" aria-label="' + opis + '"><g transform="translate(' + q[0] + ' ' + q[1] + ') scale(' + u.skala + ')">';
      g += '<rect class="ob__hit" x="-44" y="-96" width="88" height="148" rx="20"/>';
      if (st2 === 'now') { g += '<circle class="ob__halo" r="44"/>'; }
      g += kwiat(-15, -40, '#F2B6C6') + kwiat(15, 40, '#ADC3A4');
      g += '<line class="ob__bar" x1="0" y1="-31" x2="0" y2="31"/>';
      if (oxer) { g += '<line class="ob__bar ob__bar--2" x1="' + (-11 * q[3]) + '" y1="-31" x2="' + (-11 * q[3]) + '" y2="31"/>'; }
      g += '<circle class="ob__stand" cy="-34" r="5.5"/><circle class="ob__stand" cy="34" r="5.5"/>';
      if (oxer) { g += '<circle class="ob__stand" cx="' + (-11 * q[3]) + '" cy="-34" r="4.5"/><circle class="ob__stand" cx="' + (-11 * q[3]) + '" cy="34" r="4.5"/>'; }
      g += '<g class="ob__num" transform="translate(0 -66)"><circle r="17"/>';
      g += st2 === 'done' ? '<path d="M-6.5 0.5 L-2 5 L7 -4.5" class="ob__check"/>' : '<text y="5.5" text-anchor="middle">' + nr + '</text>';
      g += '</g>';
      if (st2 === 'now') { g += '<g class="ob__here" transform="translate(0 -104)"><rect x="-44" y="-15" width="88" height="28" rx="14"/><text y="4.5" text-anchor="middle">Tu jesteś</text></g>'; }
      g += '</g></a>';
      s += g;
    }
    /* Próba Mocy jako ostatnia przeszkoda */
    var f = pkt[pkt.length - 1];
    var stanProby = st.stan === 'brak' ? 'zablokowana' : st.stan;
    s += '<a class="ob-proba ob-proba--' + stanProby + '" href="proba.html' + (k.id !== AK.stan().kurs ? '?kurs=' + k.id : '') + '" aria-label="Próba Mocy, ' + ({ zablokowana: 'odblokuje się po ostatniej przeszkodzie', gotowa: 'gotowa do podejścia', czeka: 'drugie podejście wkrótce', zaliczona: 'zaliczona' }[stanProby]) + '">';
    s += '<g transform="translate(' + f[0] + ' ' + f[1] + ') scale(' + u.skala + ')">';
    s += '<rect class="ob__hit" x="-56" y="-60" width="112" height="150" rx="24"/>';
    if (stanProby === 'gotowa') { s += '<circle class="ob__halo ob__halo--gold" r="52"/>'; }
    s += rozetaSvg(k.level, stanProby);
    s += '<text y="84" class="sz-map__label sz-map__label--proba" text-anchor="middle">Próba Mocy</text>';
    s += '</g></a>';
    s += konNaMapie(p, pkt, u);
    s += '</svg>';
    return s;
  }

  function mapa() {
    var s = AK.stan();
    var aktualny = AK.kurs(s.kurs);
    var kursy = kursyProgramu(aktualny.program);
    var wybrany = aktualny;
    if (params.get('level')) { wybrany = kursy.filter(function (x) { return x.level === params.get('level'); })[0] || aktualny; }
    if (!kursOdblokowany(wybrany)) { wybrany = aktualny; }
    var pr = AK.program(wybrany.program);
    $('[data-m-program]').textContent = pr.nazwa;
    $('#m-tytul').textContent = 'Parkur ' + AK.level(wybrany.level).nazwa;

    /* Zakładki leveli */
    var box = $('[data-m-levele]');
    box.textContent = '';
    (DANE.levele || []).forEach(function (lv) {
      var kk = kursy.filter(function (x) { return x.level === lv.id; })[0];
      var otwarty = kk && kursOdblokowany(kk);
      var a = el(otwarty ? 'a' : 'span', 'sz-lvtab' + (kk === wybrany ? ' is-on' : '') + (otwarty ? '' : ' is-locked'));
      if (otwarty) { a.href = 'mapa.html?level=' + lv.id; if (kk === wybrany) { a.setAttribute('aria-current', 'page'); } }
      if (!otwarty) { a.appendChild(ikona('i-blokada')); }
      a.appendChild(doc.createTextNode(lv.nazwa));
      if (!otwarty) { a.appendChild(el('span', 'visually-hidden', lv.dostepny ? ', otworzy się po Próbie Mocy' : ', wkrótce')); }
      box.appendChild(a);
    });

    var p = AK.postep(wybrany.id), st = AK.statusProby(wybrany.id);
    /* Pasek postępu i przycisk */
    var bar = $('[data-m-pasek]');
    bar.textContent = '';
    var info = el('div', 'sz-mapbar__info');
    var big = el('p', 'sz-mapbar__count');
    big.appendChild(el('strong', '', p.zrobione.length + ' z ' + p.liczba));
    big.appendChild(doc.createTextNode(' przeszkód zaliczone'));
    info.appendChild(big);
    var meter = el('div', 'sz-meter');
    var fill = el('i'); fill.style.width = p.procent + '%';
    meter.appendChild(fill);
    info.appendChild(meter);
    bar.appendChild(info);
    if (p.biezaca) {
      bar.appendChild(przycisk('Kontynuuj: przeszkoda ' + p.biezaca, linkTreningu(wybrany, p.biezaca), 'btn btn--dark', 'i-play'));
    } else if (st.stan === 'gotowa' || st.stan === 'czeka') {
      bar.appendChild(przycisk(st.stan === 'gotowa' ? 'Podejdź do Próby Mocy' : 'Plan przed drugim podejściem', 'proba.html', 'btn btn--dark', 'i-rozeta'));
    } else if (st.stan === 'zaliczona' && wybrany.nastepny) {
      bar.appendChild(przycisk('Parkur ' + AK.level(AK.kurs(wybrany.nastepny).level).nazwa, 'mapa.html?level=' + AK.kurs(wybrany.nastepny).level, 'btn btn--dark'));
    }

    /* Mapa z wyborem układu */
    var cel = $('[data-m-mapa]');
    var biezacyUklad = '';
    function rysuj() {
      var uklad = cel.clientWidth >= 720 ? 'poziom' : 'pion';
      if (uklad === biezacyUklad) { return; }
      biezacyUklad = uklad;
      cel.className = 'sz-map sz-map--' + uklad;
      cel.innerHTML = svgParkur(wybrany, p, st, uklad);
    }
    rysuj();
    var czekaj = 0;
    window.addEventListener('resize', function () { window.clearTimeout(czekaj); czekaj = window.setTimeout(rysuj, 150); });

    /* Lista przeszkód */
    var ol = $('[data-m-lista]');
    ol.textContent = '';
    for (var n = 1; n <= p.liczba; n++) {
      var tr = AK.trening(wybrany.przeszkody[n - 1]);
      var stn = p.wpisy[n] ? 'done' : (n === p.biezaca ? 'now' : 'next');
      var li = el('li', 'sz-list__item is-' + stn);
      li.appendChild(el('span', 'sz-num sz-num--' + stn, stn === 'done' ? '' : String(n)));
      if (stn === 'done') { li.firstChild.appendChild(ikona('i-check')); li.firstChild.setAttribute('aria-label', String(n)); }
      var co = el('div', 'sz-list__what');
      co.appendChild(el('strong', '', tr.nazwa));
      co.appendChild(el('span', '', stn === 'done' ? 'zaliczona ' + AK.data(p.wpisy[n].data) + (p.wpisy[n].ocena ? ', ' + OCENA[p.wpisy[n].ocena].toLowerCase() : '') : (stn === 'now' ? 'tu jesteś, ok. ' + minuty(tr) + ' min' : 'ok. ' + minuty(tr) + ' min')));
      li.appendChild(co);
      var akcja = el('a', 'link', stn === 'now' ? 'Zacznij' : 'Przegląd');
      akcja.href = stn === 'now' ? linkTreningu(wybrany, n) : linkPrzegladu(wybrany, n);
      akcja.setAttribute('aria-label', (stn === 'now' ? 'Zacznij trening, przeszkoda ' : 'Przegląd treningu, przeszkoda ') + n);
      li.appendChild(akcja);
      ol.appendChild(li);
    }
    var liP = el('li', 'sz-list__item sz-list__item--proba is-' + st.stan);
    var rz = el('span', 'sz-list__ros');
    rz.appendChild(rozeta(wybrany.level, true));
    liP.appendChild(rz);
    var coP = el('div', 'sz-list__what');
    coP.appendChild(el('strong', '', 'Próba Mocy'));
    coP.appendChild(el('span', '', { zablokowana: 'po ostatniej przeszkodzie', gotowa: 'gotowa do podejścia', czeka: 'drugie podejście od ' + (st.od ? AK.data(st.od) : ''), zaliczona: 'zaliczona ' + (st.data ? AK.data(st.data) : ''), brak: 'pojawi się z kolejnym levelem' }[st.stan] || ''));
    liP.appendChild(coP);
    var aP = el('a', 'link', st.stan === 'gotowa' ? 'Podejdź' : 'Szczegóły');
    aP.href = 'proba.html' + (wybrany.id !== s.kurs ? '?kurs=' + wybrany.id : '');
    liP.appendChild(aP);
    ol.appendChild(liP);
  }

  /* 4. Przegląd treningu ------------------------------------------------------- */
  function przeglad() {
    var s = AK.stan();
    var k = AK.kurs(params.get('kurs') || s.kurs) || AK.kurs(s.kurs);
    var p = AK.postep(k.id);
    var n = Math.max(1, Math.min(p.liczba, Number(params.get('przeszkoda')) || p.biezaca || 1));
    var t = AK.trening(k.przeszkody[n - 1]);
    var wpis = p.wpisy[n];
    var stan = wpis ? 'done' : (n === p.biezaca ? 'now' : 'locked');
    if (!kursOdblokowany(k)) { stan = 'locked'; }
    doc.title = t.nazwa + ', przeszkoda ' + n + ' | Akademia Mocy Jeździeckich';
    $('[data-t-okruszek]').textContent = 'Przeszkoda ' + n;
    $('[data-t-kicker]').textContent = 'Przeszkoda ' + n + ' z ' + p.liczba + ', ' + k.nazwa;
    $('[data-t-nazwa]').textContent = t.nazwa;
    $('[data-t-opis]').textContent = t.opis || '';
    var meta = $('[data-t-meta]');
    meta.textContent = '';
    [['i-zegar', 'ok. ' + minuty(t) + ' min'], ['i-lista', AK.liczbaCwiczen(t) + ' ' + odmiana(AK.liczbaCwiczen(t), 'ćwiczenie', 'ćwiczenia', 'ćwiczeń')], ['i-kalendarz', t.bloki.length + ' ' + odmiana(t.bloki.length, 'blok', 'bloki', 'bloków')], ['i-dom', (t.sprzet || []).join(', ') || 'Bez sprzętu']].forEach(function (m) {
      var c = el('span', 'sz-chip-meta');
      c.appendChild(ikona(m[0]));
      c.appendChild(doc.createTextNode(m[1]));
      meta.appendChild(c);
    });
    var akcje = $('[data-t-akcje]');
    akcje.textContent = '';
    if (stan === 'now') {
      akcje.appendChild(przycisk('Zacznij trening', linkTreningu(k, n), 'btn btn--dark', 'i-play'));
    } else if (stan === 'done') {
      akcje.appendChild(przycisk('Powtórz trening', linkTreningu(k, n), 'btn btn--light', 'i-powtorz'));
      if (p.biezaca) { akcje.appendChild(przycisk('Następny: przeszkoda ' + p.biezaca, linkPrzegladu(k, p.biezaca), 'link')); }
    } else {
      var info = el('p', 'sz-locked');
      info.appendChild(ikona('i-blokada'));
      info.appendChild(doc.createTextNode(kursOdblokowany(k) ? 'Najpierw zalicz przeszkodę ' + p.biezaca + '. Parkur jedzie się po kolei.' : 'Ten parkur otworzy się po Próbie Mocy poprzedniego levelu.'));
      akcje.appendChild(info);
      if (p.biezaca && kursOdblokowany(k)) { akcje.appendChild(przycisk('Przejdź do przeszkody ' + p.biezaca, linkPrzegladu(k, p.biezaca), 'btn btn--light')); }
    }
    var zrob = $('[data-t-zrobione]');
    if (wpis) {
      zrob.hidden = false;
      zrob.textContent = '';
      zrob.appendChild(ikona('i-check'));
      var tx = el('p');
      tx.appendChild(el('strong', '', 'Trening ukończony ' + AK.data(wpis.data)));
      tx.appendChild(el('span', '', wpis.minuty + ' min' + (wpis.ocena ? ', ' + OCENA[wpis.ocena].toLowerCase() : '')));
      zrob.appendChild(tx);
    }
    var fig = $('[data-t-poster]');
    fig.textContent = '';
    var pierwszy = t.bloki[0].cwiczenia[0];
    var img = el('img'); img.src = poster(pierwszy.klip); img.alt = ''; img.width = 1280; img.height = 720;
    fig.appendChild(img);
    var bloki4 = el('ul', 'sz-poster-blocks');
    t.bloki.forEach(function (b, bi) { var li = el('li'); li.style.setProperty('--b', 'var(--blk-' + (bi + 1) + ')'); li.appendChild(el('span', '', b.nazwa)); bloki4.appendChild(li); });
    fig.appendChild(bloki4);

    $('[data-t-bloki-info]').textContent = 'Zawsze ta sama kolejność: rozgrzewka, mobilność, część główna, rozciąganie.';
    var cel = $('[data-t-bloki]');
    cel.textContent = '';
    t.bloki.forEach(function (b, bi) {
      var sek = el('section', 'sz-block');
      sek.style.setProperty('--b', 'var(--blk-' + (bi + 1) + ')');
      var head = el('header', 'sz-block__head');
      head.appendChild(el('span', 'sz-block__dot'));
      head.appendChild(el('h3', 'sz-h3', b.nazwa));
      var czas = 0;
      var rundy = b.rundy || 1;
      b.cwiczenia.forEach(function (c) { czas += (c.powtorzenia ? (c.czasOk || 45) : c.czas) * (c.strony ? 2 : 1); });
      czas = czas * rundy + (b.przerwa || 0) * Math.max(0, b.cwiczenia.length - 1) * rundy + (b.przerwaRundy || 0) * (rundy - 1);
      head.appendChild(el('span', 'sz-muted', 'ok. ' + Math.max(1, Math.round(czas / 60)) + ' min' + (rundy > 1 ? ', ' + rundy + ' ' + odmiana(rundy, 'runda', 'rundy', 'rund') : '') + (b.przerwa ? ', przerwy ' + b.przerwa + ' s' : '')));
      sek.appendChild(head);
      var ul = el('ul', 'sz-ex');
      b.cwiczenia.forEach(function (c) {
        var li = el('li', 'sz-ex__item');
        var im = el('img'); im.src = poster(c.klip); im.alt = ''; im.width = 160; im.height = 90; im.loading = 'lazy';
        li.appendChild(im);
        var body = el('div', 'sz-ex__body');
        var top = el('p', 'sz-ex__top');
        top.appendChild(el('strong', '', c.nazwa));
        top.appendChild(el('span', 'sz-ex__param', infoCw(c)));
        body.appendChild(top);
        if (c.wSiodle) { var ws = el('p', 'sz-ex__saddle'); ws.appendChild(el('span', '', 'W siodle pomaga na: ')); ws.appendChild(doc.createTextNode(c.wSiodle)); body.appendChild(ws); }
        if (c.wskazowka) { body.appendChild(el('p', 'sz-ex__cue', c.wskazowka)); }
        if (c.blad) { body.appendChild(el('p', 'sz-ex__mistake', 'Uważaj: ' + c.blad)); }
        li.appendChild(body);
        ul.appendChild(li);
      });
      sek.appendChild(ul);
      cel.appendChild(sek);
    });

    var nav = $('[data-t-nawigacja]');
    nav.textContent = '';
    if (n > 1) { nav.appendChild(przycisk('Przeszkoda ' + (n - 1), linkPrzegladu(k, n - 1), 'btn btn--light', 'i-prev')); } else { nav.appendChild(el('span')); }
    nav.appendChild(przycisk('Mapa parkuru', 'mapa.html' + (k.id !== s.kurs ? '?level=' + k.level : ''), 'link'));
    if (n < p.liczba) {
      var dalej = przycisk('Przeszkoda ' + (n + 1), linkPrzegladu(k, n + 1), 'btn btn--light');
      dalej.appendChild(ikona('i-next'));
      nav.appendChild(dalej);
    } else {
      nav.appendChild(przycisk('Próba Mocy', 'proba.html', 'btn btn--light', 'i-rozeta'));
    }
  }

  /* 5. Próba Mocy ------------------------------------------------------------ */
  var dzwiek = (function () {
    var ctx = null;
    function odblokuj() {
      try { var AC = window.AudioContext || window.webkitAudioContext; if (AC && !ctx) { ctx = new AC(); } if (ctx && ctx.state === 'suspended') { ctx.resume(); } } catch (e) { /* brak */ }
    }
    function ton(f, d, v, o) {
      if (!ctx) { return; }
      try {
        var t = ctx.currentTime + (o || 0), osc = ctx.createOscillator(), g = ctx.createGain();
        osc.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
        osc.connect(g); g.connect(ctx.destination); osc.start(t); osc.stop(t + d + 0.05);
      } catch (e) { /* brak */ }
    }
    return {
      odblokuj: odblokuj,
      pik: function () { ton(660, 0.12, 0.25); },
      start: function () { ton(990, 0.26, 0.3); },
      cel: function () { ton(784, 0.16, 0.28); ton(1175, 0.3, 0.3, 0.14); if (navigator.vibrate) { try { navigator.vibrate([80, 60, 80]); } catch (e) { /* brak */ } } },
      fanfara: function () { ton(784, 0.18, 0.28); ton(988, 0.18, 0.28, 0.16); ton(1319, 0.4, 0.3, 0.32); }
    };
  })();

  function proba() {
    var s = AK.stan();
    var k = AK.kurs(params.get('kurs') || s.kurs) || AK.kurs(s.kurs);
    if (!k.proba) { var prev = poprzedniKurs(k); if (prev) { k = prev; } }
    var def = AK.proba(k.proba);
    var ekran = $('[data-pr-ekran]');
    var lvNazwa = AK.level(k.level).nazwa;
    var wyniki = {};
    var obejscie = false;

    function wyczysc() { ekran.textContent = ''; window.scrollTo(0, 0); }
    function naglowek(tytul, kicker) {
      var h = el('header', 'pr-head');
      if (kicker) { h.appendChild(el('p', 'sz-kicker', kicker)); }
      var h1 = el('h1', 'sz-title', tytul);
      h1.tabIndex = -1;
      h.appendChild(h1);
      return h;
    }
    function fokus() { var h = $('h1', ekran); if (h) { h.focus({ preventScroll: true }); } }
    function wynikTekst(t, w) {
      if (!w) { return 'brak wyniku'; }
      if (t.typ === 'wybor') { return w.wybor; }
      return t.strony ? 'lewa ' + w.lewa + ' s, prawa ' + w.prawa + ' s' : w.czas + ' s';
    }
    function tabelaWynikow(w) {
      var ul = el('ul', 'pr-results');
      def.testy.forEach(function (t) {
        var r = w[t.id];
        var li = el('li', r && r.zalicza ? 'is-ok' : 'is-no');
        li.appendChild(ikona(r && r.zalicza ? 'i-check' : 'i-x'));
        var b = el('div');
        b.appendChild(el('strong', '', t.nazwa));
        b.appendChild(el('span', '', wynikTekst(t, r) + (t.typ === 'czas' ? ', cel ' + t.cel + ' s' : '') + (r && !r.technika ? ', technika do poprawy' : '')));
        li.appendChild(b);
        ul.appendChild(li);
      });
      return ul;
    }

    function ekranZablokowana(st) {
      wyczysc();
      var box = el('div', 'pr-center');
      var ros = el('div', 'pr-ros is-dim'); ros.appendChild(rozeta(k.level)); box.appendChild(ros);
      box.appendChild(naglowek('Próba Mocy: ' + lvNazwa, 'Ostatnia przeszkoda parkuru'));
      box.appendChild(el('p', 'sz-lead', 'Próba odblokuje się po ostatniej przeszkodzie. Zostało: ' + st.zostalo + ' ' + odmiana(st.zostalo, 'przeszkoda', 'przeszkody', 'przeszkód') + '.'));
      var p = AK.postep(k.id);
      var meter = el('div', 'sz-meter sz-meter--center'); var f = el('i'); f.style.width = p.procent + '%'; meter.appendChild(f); box.appendChild(meter);
      var akcje = el('div', 'pr-actions');
      if (p.biezaca) { akcje.appendChild(przycisk('Kontynuuj: przeszkoda ' + p.biezaca, linkTreningu(k, p.biezaca), 'btn btn--dark', 'i-play')); }
      akcje.appendChild(przycisk('Mapa parkuru', 'mapa.html', 'btn btn--light'));
      box.appendChild(akcje);
      var adv = el('p', 'sz-muted pr-advanced');
      adv.appendChild(doc.createTextNode('Masz już mocne podstawy? '));
      var b = el('button', 'linkbtn', 'Podejdź do Próby od razu');
      b.type = 'button';
      b.addEventListener('click', function () { obejscie = true; ekranStart(); });
      adv.appendChild(b);
      box.appendChild(adv);
      ekran.appendChild(box);
      fokus();
    }

    function ekranStart() {
      wyczysc();
      var grid = el('div', 'pr-intro');
      var lewa = el('div', 'pr-intro__ros');
      var ros = el('div', 'pr-ros pr-ros--big'); ros.appendChild(rozeta(k.level)); lewa.appendChild(ros);
      grid.appendChild(lewa);
      var prawa = el('div', 'pr-intro__copy');
      prawa.appendChild(naglowek(def.nazwa, obejscie ? 'Podejście dla zaawansowanych' : 'Ostatnia przeszkoda parkuru'));
      prawa.appendChild(el('p', 'sz-lead', def.testy.length + ' ' + odmiana(def.testy.length, 'test', 'testy', 'testów') + ', ' + def.czas + '. Sprawdzasz, czy ciało jest gotowe na ' + def.otwiera + '.'));
      var zasady = el('ul', 'pr-rules');
      [['i-rozeta', 'Zaliczasz wszystkie testy: rozeta ' + lvNazwa + ', certyfikat i parkur ' + def.otwiera + ' (w cenie programu).'],
       ['i-kalendarz', 'Jeszcze nie: tydzień w ' + (k.level === 'step' ? 'stępie' : 'kłusie') + ' z 3 krótkimi treningami celowanymi i drugie podejście.'],
       ['i-zegar', 'Czas mierzy licznik, a technikę odhaczasz na krótkiej liście przy każdym teście.']].forEach(function (z) {
        var li = el('li'); li.appendChild(ikona(z[0])); li.appendChild(el('span', '', z[1])); zasady.appendChild(li);
      });
      prawa.appendChild(zasady);
      var chips = el('div', 'sz-chips');
      def.sprzet.forEach(function (x) { var c = el('span', 'sz-chip-meta'); c.appendChild(ikona('i-dom')); c.appendChild(doc.createTextNode(x)); chips.appendChild(c); });
      prawa.appendChild(chips);
      var lista = el('ol', 'pr-tests');
      def.testy.forEach(function (t) {
        var li = el('li');
        var im = el('img'); im.src = t.obraz; im.alt = ''; im.width = 160; im.height = 90; li.appendChild(im);
        var b = el('div'); b.appendChild(el('strong', '', t.nazwa)); b.appendChild(el('span', '', t.typ === 'czas' ? t.cel + ' s' + (t.strony ? ' na każdą stronę' : '') : 'zasięg skłonu'));
        li.appendChild(b);
        lista.appendChild(li);
      });
      prawa.appendChild(lista);
      var akcje = el('div', 'pr-actions');
      var start = przycisk('Zaczynam Próbę', null, 'btn btn--dark', 'i-play');
      start.addEventListener('click', function () { dzwiek.odblokuj(); wyniki = {}; ekranTest(0); });
      akcje.appendChild(start);
      prawa.appendChild(akcje);
      var wer = el('p', 'sz-muted');
      wer.appendChild(doc.createTextNode('Chcesz opinii z zewnątrz? Nagraj Próbę telefonem i wyślij Justynie. '));
      var a = el('a', 'link', 'Weryfikacja Próby'); a.href = 'cennik.html#dodatki'; wer.appendChild(a);
      prawa.appendChild(wer);
      grid.appendChild(prawa);
      ekran.appendChild(grid);
      fokus();
    }

    function ekranTest(i) {
      wyczysc();
      var t = def.testy[i];
      var w = { technika: false, zalicza: false };
      var wrap = el('div', 'pr-test');
      var prog = el('div', 'pr-progress');
      prog.appendChild(el('span', '', 'Test ' + (i + 1) + ' z ' + def.testy.length));
      var paski = el('div', 'pr-progress__bars');
      def.testy.forEach(function (x, j) { paski.appendChild(el('i', j < i ? 'is-done' : (j === i ? 'is-on' : ''))); });
      prog.appendChild(paski);
      wrap.appendChild(prog);
      var grid = el('div', 'pr-test__grid');
      var fig = el('figure', 'pr-test__img');
      var im = el('img'); im.src = t.obraz; im.alt = 'Ilustracja: ' + t.nazwa; im.width = 1280; im.height = 720; fig.appendChild(im);
      grid.appendChild(fig);
      var body = el('div', 'pr-test__body');
      body.appendChild(naglowek(t.nazwa));
      body.appendChild(el('p', 'pr-goal', t.typ === 'czas' ? 'Cel: ' + t.cel + ' s' + (t.strony ? ' na każdą stronę' : '') : t.pytanie));
      var kroki = el('ol', 'pr-steps');
      t.kroki.forEach(function (x) { kroki.appendChild(el('li', '', x)); });
      body.appendChild(kroki);

      var dalej = przycisk(i < def.testy.length - 1 ? 'Zapisz wynik i dalej' : 'Zapisz wynik i zakończ', null, 'btn btn--dark');
      dalej.disabled = true;
      function gotowe() {
        var ok = t.typ === 'wybor' ? !!w.wybor : (t.strony ? w.lewa !== undefined && w.prawa !== undefined : w.czas !== undefined);
        dalej.disabled = !ok;
      }

      if (t.typ === 'czas') { body.appendChild(stoper(t, w, gotowe)); }
      else {
        var fs = el('fieldset', 'pr-choice');
        fs.appendChild(el('legend', 'visually-hidden', t.pytanie));
        t.opcje.forEach(function (o, oi) {
          var lab = el('label', 'opt');
          var inp = el('input'); inp.type = 'radio'; inp.name = 'wybor-' + t.id; inp.value = String(oi);
          inp.addEventListener('change', function () { w.wybor = o.tekst; w.wyborZalicza = o.zalicza; gotowe(); });
          lab.appendChild(inp); lab.appendChild(el('span', '', o.tekst));
          fs.appendChild(lab);
        });
        body.appendChild(fs);
      }
      var tech = el('fieldset', 'pr-tech');
      tech.appendChild(el('legend', '', 'Technika: odhacz, jeśli tak było'));
      t.technika.forEach(function (x) {
        var lab = el('label', 'check');
        var inp = el('input'); inp.type = 'checkbox';
        lab.appendChild(inp); lab.appendChild(el('span', '', x));
        tech.appendChild(lab);
      });
      body.appendChild(tech);
      var akcje = el('div', 'pr-actions');
      if (i > 0) {
        var wst = przycisk('Wstecz', null, 'btn btn--light', 'i-prev');
        wst.addEventListener('click', function () { ekranTest(i - 1); });
        akcje.appendChild(wst);
      }
      dalej.addEventListener('click', function () {
        w.technika = $$('input', tech).every(function (x) { return x.checked; });
        w.zalicza = w.technika && (t.typ === 'wybor' ? !!w.wyborZalicza : (t.strony ? w.lewa >= t.cel && w.prawa >= t.cel : w.czas >= t.cel));
        var zapis = { technika: w.technika, zalicza: w.zalicza };
        if (t.typ === 'wybor') { zapis.wybor = w.wybor; } else if (t.strony) { zapis.lewa = w.lewa; zapis.prawa = w.prawa; } else { zapis.czas = w.czas; }
        wyniki[t.id] = zapis;
        if (i < def.testy.length - 1) { ekranTest(i + 1); } else { zakoncz(); }
      });
      akcje.appendChild(dalej);
      body.appendChild(akcje);
      grid.appendChild(body);
      wrap.appendChild(grid);
      ekran.appendChild(wrap);
      fokus();
    }

    /* Stoper: odliczanie 3-2-1, licznik w górę, cel z sygnałem, wynik na stronę, wpis ręczny */
    function stoper(t, w, gotowe) {
      var box = el('div', 'pr-timer');
      var strony = t.strony ? ['lewa', 'prawa'] : ['czas'];
      var idx = 0;
      var stronaEl = el('p', 'pr-timer__side');
      var zegar = el('p', 'pr-timer__clock', '0:00');
      zegar.setAttribute('aria-live', 'off');
      var meter = el('div', 'pr-timer__meter');
      var fill = el('i'); meter.appendChild(fill);
      var goal = el('b', 'pr-timer__goal'); meter.appendChild(goal);
      var stan = el('p', 'pr-timer__status');
      stan.setAttribute('aria-live', 'polite');
      var btn = przycisk('Start', null, 'btn btn--pink pr-timer__btn', 'i-play');
      var wyniki2 = el('ul', 'pr-timer__results');
      var reczny = el('details', 'pr-manual');
      reczny.appendChild(el('summary', '', 'Mierzysz własnym stoperem? Wpisz wynik'));
      var inp = el('input', 'input'); inp.type = 'number'; inp.min = '0'; inp.max = '600'; inp.inputMode = 'numeric'; inp.placeholder = 'sekundy';
      var lab = el('label', 'field__label', 'Wynik w sekundach'); var idInp = 'pr-reczny-' + t.id; inp.id = idInp; lab.htmlFor = idInp;
      var zapiszR = przycisk('Zapisz', null, 'btn btn--light btn--sm');
      var rr = el('div', 'pr-manual__row'); rr.appendChild(inp); rr.appendChild(zapiszR);
      reczny.appendChild(lab); reczny.appendChild(rr);
      box.appendChild(stronaEl); box.appendChild(zegar); box.appendChild(meter); box.appendChild(stan); box.appendChild(btn); box.appendChild(wyniki2); box.appendChild(reczny);

      var tryb = 'stoi', t0 = 0, odlicz = 0, celOsiagniety = false, raf = 0, timer = 0;
      var MAX = Math.max(t.cel * 2, t.cel + 30);
      goal.style.left = (t.cel / MAX * 100) + '%';
      function etykieta() {
        var nazwa = strony[idx];
        stronaEl.textContent = nazwa === 'lewa' ? 'Lewa strona' : (nazwa === 'prawa' ? 'Prawa strona' : 'Wynik');
        inp.value = '';
      }
      function rysujWyniki() {
        wyniki2.textContent = '';
        strony.forEach(function (n) {
          if (w[n] === undefined) { return; }
          var li = el('li', w[n] >= t.cel ? 'is-ok' : 'is-no');
          li.appendChild(ikona(w[n] >= t.cel ? 'i-check' : 'i-x'));
          li.appendChild(doc.createTextNode((n === 'czas' ? 'Wynik' : (n === 'lewa' ? 'Lewa' : 'Prawa')) + ': ' + w[n] + ' s'));
          wyniki2.appendChild(li);
        });
      }
      function zapisz(sek) {
        w[strony[idx]] = sek;
        rysujWyniki();
        if (idx < strony.length - 1) {
          idx += 1;
          etykieta();
          zegar.textContent = '0:00'; fill.style.width = '0%';
          stan.textContent = 'Teraz druga strona. Start, kiedy będziesz gotowa albo gotowy.';
          btn.lastChild.textContent = 'Start';
          btn.firstChild.querySelector('use').setAttribute('href', '#i-play');
          tryb = 'stoi';
        } else {
          stan.textContent = 'Wynik zapisany. Możesz odhaczyć technikę i iść dalej.';
          btn.hidden = true;
          tryb = 'koniec';
        }
        gotowe();
      }
      function klatka() {
        if (tryb !== 'leci') { return; }
        var sek = (performance.now() - t0) / 1000;
        zegar.textContent = mmss(sek);
        fill.style.width = Math.min(100, sek / MAX * 100) + '%';
        if (!celOsiagniety && sek >= t.cel) { celOsiagniety = true; dzwiek.cel(); stan.textContent = 'Cel osiągnięty. Trzymaj dalej albo zatrzymaj.'; box.classList.add('is-goal'); }
        raf = window.requestAnimationFrame(klatka);
      }
      btn.addEventListener('click', function () {
        dzwiek.odblokuj();
        if (tryb === 'stoi') {
          tryb = 'odlicza'; odlicz = 3; celOsiagniety = false; box.classList.remove('is-goal');
          btn.disabled = true;
          zegar.textContent = String(odlicz);
          stan.textContent = 'Przyjmij pozycję.';
          dzwiek.pik();
          timer = window.setInterval(function () {
            odlicz -= 1;
            if (odlicz > 0) { zegar.textContent = String(odlicz); dzwiek.pik(); return; }
            window.clearInterval(timer);
            dzwiek.start();
            tryb = 'leci'; t0 = performance.now(); btn.disabled = false;
            btn.lastChild.textContent = 'Stop';
            btn.firstChild.querySelector('use').setAttribute('href', '#i-pause');
            stan.textContent = 'Licznik leci.';
            raf = window.requestAnimationFrame(klatka);
          }, 1000);
        } else if (tryb === 'leci') {
          window.cancelAnimationFrame(raf);
          var wynik = Math.floor((performance.now() - t0) / 1000);
          tryb = 'stoi';
          zapisz(wynik);
        }
      });
      zapiszR.addEventListener('click', function () {
        var v = parseInt(inp.value, 10);
        if (isNaN(v) || v < 0 || v > 600) { inp.setAttribute('aria-invalid', 'true'); inp.focus(); return; }
        inp.setAttribute('aria-invalid', 'false');
        if (tryb === 'leci' || tryb === 'odlicza') { window.cancelAnimationFrame(raf); window.clearInterval(timer); btn.disabled = false; }
        zegar.textContent = mmss(v); fill.style.width = Math.min(100, v / MAX * 100) + '%';
        tryb = 'stoi';
        zapisz(v);
      });
      etykieta();
      stan.textContent = 'Dotknij Start. Najpierw krótkie odliczanie.';
      return box;
    }

    function zakoncz() {
      var wynik = AK.zapiszProbe(k.id, wyniki);
      if (wynik.zaliczona) { ekranZaliczona(true); } else { ekranCzeka(true); }
    }

    function ekranZaliczona(swiezo) {
      wyczysc();
      var st = AK.statusProby(k.id);
      var box = el('div', 'pr-center pr-win');
      var ros = el('div', 'pr-ros pr-ros--big' + (swiezo ? ' is-reveal' : '')); ros.appendChild(rozeta(k.level)); box.appendChild(ros);
      if (swiezo) { dzwiek.fanfara(); }
      box.appendChild(naglowek('Próba zaliczona', 'Rozeta ' + lvNazwa + (st.data ? ', ' + AK.data(st.data, { rok: true }) : '')));
      var nast = k.nastepny ? AK.kurs(k.nastepny) : null;
      box.appendChild(el('p', 'sz-lead', nast ? 'Level ' + AK.level(nast.level).nazwa + ' odblokowany. Nowy parkur czeka, z trudniejszymi wersjami ćwiczeń.' : 'Kolejny level pojawi się wkrótce.'));
      box.appendChild(tabelaWynikow(st.wynik.wyniki));
      var akcje = el('div', 'pr-actions');
      if (nast) { akcje.appendChild(przycisk('Zobacz parkur ' + AK.level(nast.level).nazwa, 'mapa.html?level=' + nast.level, 'btn btn--dark')); }
      akcje.appendChild(przycisk('Certyfikat PDF', 'certyfikat.html?kurs=' + encodeURIComponent(k.id), 'btn btn--light', 'i-certyfikat'));
      box.appendChild(akcje);
      box.appendChild(przycisk('Wróć do panelu', 'panel.html', 'link'));
      ekran.appendChild(box);
      fokus();
    }

    function ekranCzeka(swiezo) {
      wyczysc();
      var st = AK.statusProby(k.id);
      var s2 = AK.stan();
      var ost = st.ostatnia || (st.proby && st.proby[st.proby.length - 1]);
      var box = el('div', 'pr-wait');
      var lewa = el('div', 'pr-wait__main');
      lewa.appendChild(naglowek('Jeszcze tydzień w ' + (k.level === 'step' ? 'stępie' : 'kłusie'), swiezo ? 'Wynik Próby' : 'Próba Mocy: drugie podejście'));
      var zal = ost ? def.testy.filter(function (t) { return ost.wyniki[t.id] && ost.wyniki[t.id].zalicza; }).length : 0;
      lewa.appendChild(el('p', 'sz-lead', 'Zaliczone ' + zal + ' z ' + def.testy.length + ' testów. To normalne: brakujące testy poćwiczysz w 3 krótkich treningach, a potem podejdziesz jeszcze raz.'));
      if (ost) { lewa.appendChild(tabelaWynikow(ost.wyniki)); }
      box.appendChild(lewa);
      var prawa = el('div', 'pr-wait__plan');
      prawa.appendChild(el('h2', 'sz-h3', 'Plan na 7 dni'));
      var cel = s2.celowany;
      var brakujace = def.testy.filter(function (t) { return cel ? cel.testy.indexOf(t.id) !== -1 : true; });
      var cw = el('ul', 'pr-plan__ex');
      brakujace.forEach(function (t) { cw.appendChild(el('li', '', t.celowany)); });
      prawa.appendChild(el('p', 'sz-muted', 'Każdy trening celowany: 5 minut rozgrzewki z parkuru i te ćwiczenia:'));
      prawa.appendChild(cw);
      var sesje = el('ul', 'pr-plan__sessions');
      (cel ? cel.sesje : [false, false, false]).forEach(function (zrobiona, si) {
        var li = el('li');
        var lab = el('label', 'check');
        var inp = el('input'); inp.type = 'checkbox'; inp.checked = !!zrobiona;
        inp.addEventListener('change', function () { AK.odhaczCelowany(si, inp.checked); licznik(); });
        lab.appendChild(inp); lab.appendChild(el('span', '', 'Trening celowany ' + (si + 1)));
        li.appendChild(lab);
        sesje.appendChild(li);
      });
      prawa.appendChild(sesje);
      var licz = el('p', 'pr-plan__count');
      function licznik() { var c = AK.stan().celowany; var n = c ? c.sesje.filter(Boolean).length : 0; licz.textContent = n + ' z 3 treningów celowanych zrobione'; }
      licznik();
      prawa.appendChild(licz);
      var kiedy = el('p', 'pr-plan__date');
      kiedy.appendChild(ikona('i-kalendarz'));
      kiedy.appendChild(doc.createTextNode(st.stan === 'czeka' ? 'Drugie podejście od ' + AK.data(st.od) + (st.dni > 0 ? ' (za ' + st.dni + ' ' + odmiana(st.dni, 'dzień', 'dni', 'dni') + ')' : '') : 'Drugie podejście jest już dostępne'));
      prawa.appendChild(kiedy);
      var akcje = el('div', 'pr-actions');
      if (st.stan === 'gotowa') {
        var go = przycisk('Podejdź ponownie', null, 'btn btn--dark', 'i-play');
        go.addEventListener('click', ekranStart);
        akcje.appendChild(go);
      } else {
        akcje.appendChild(przycisk('Wróć do panelu', 'panel.html', 'btn btn--dark'));
        var demoBtn = przycisk('Podejdź teraz (demo)', null, 'btn btn--light');
        demoBtn.addEventListener('click', ekranStart);
        akcje.appendChild(demoBtn);
      }
      prawa.appendChild(akcje);
      var wer = el('p', 'sz-muted');
      wer.appendChild(doc.createTextNode('Nie wiesz, co poprawić? '));
      var a = el('a', 'link', 'Weryfikacja Próby z Justyną'); a.href = 'cennik.html#dodatki'; wer.appendChild(a);
      prawa.appendChild(wer);
      box.appendChild(prawa);
      ekran.appendChild(box);
      fokus();
    }

    if (!def) {
      wyczysc();
      var box = el('div', 'pr-center');
      box.appendChild(naglowek('Próba Mocy', AK.level(k.level).nazwa));
      box.appendChild(el('p', 'sz-lead', 'Próba tego levelu pojawi się razem z kolejnym levelem programu.'));
      box.appendChild(przycisk('Mapa parkuru', 'mapa.html', 'btn btn--dark'));
      ekran.appendChild(box);
      return;
    }
    var st0 = AK.statusProby(k.id);
    if (st0.stan === 'zablokowana') { ekranZablokowana(st0); }
    else if (st0.stan === 'zaliczona') { ekranZaliczona(false); }
    else if (st0.stan === 'czeka') { ekranCzeka(false); }
    else if (st0.ostatnia && !st0.ostatnia.zaliczona) { ekranCzeka(false); }
    else { ekranStart(); }
  }

  /* 6. Postępy --------------------------------------------------------------- */
  function postepy() {
    var s = AK.stan(), k = AK.kurs(s.kurs), pr = AK.program(k.program);
    $('[data-s-od]').textContent = pr.nazwa + ', od ' + AK.data(s.start, { rok: true });
    var minutySuma = s.historia.reduce(function (a, h) { return a + (h.minuty || 0); }, 0);
    var ser = AK.seria();
    var dl = $('[data-s-liczby]');
    dl.textContent = '';
    [[String(s.historia.length), odmiana(s.historia.length, 'trening', 'treningi', 'treningów')], [String(minutySuma), 'minut na macie'], [String(ser), odmiana(ser, 'tydzień serii', 'tygodnie serii', 'tygodni serii')], [String(s.rozety.length), odmiana(s.rozety.length, 'rozeta', 'rozety', 'rozet')]].forEach(function (x) {
      var d = el('div', 'sz-stats__item');
      d.appendChild(el('dt', '', x[1]));
      d.appendChild(el('dd', '', x[0]));
      dl.appendChild(d);
    });

    /* Kalendarz: 12 tygodni, kolumny to tygodnie */
    var kal = $('[data-s-kalendarz]');
    kal.textContent = '';
    var dzis = AK.dzis();
    var ponTeraz = AK.poniedzialek(dzis);
    var poDniach = {};
    s.historia.forEach(function (h) { poDniach[h.data] = (poDniach[h.data] || 0) + 1; });
    var tab = el('div', 'sz-cal__grid');
    var etykiety = el('div', 'sz-cal__days');
    AK.DNI_KROTKO.forEach(function (d, i) { etykiety.appendChild(el('span', '', i % 2 === 0 ? d : '')); });
    tab.appendChild(etykiety);
    var ostatniMiesiac = -1;
    for (var w = 11; w >= 0; w--) {
      var pon = AK.dodajDni(ponTeraz, -7 * w);
      var kol = el('div', 'sz-cal__col');
      var m = AK.zIso(pon).getMonth();
      kol.appendChild(el('span', 'sz-cal__month', m !== ostatniMiesiac ? AK.MIESIACE_KROTKO[m] : ''));
      ostatniMiesiac = m;
      for (var dd = 0; dd < 7; dd++) {
        var dzien = AK.dodajDni(pon, dd);
        var ile = poDniach[dzien] || 0;
        var c = el('i', 'sz-cal__cell' + (ile ? ' is-' + Math.min(2, ile) : '') + (dzien === dzis ? ' is-today' : '') + (dzien > dzis ? ' is-future' : ''));
        c.title = AK.data(dzien) + (ile ? ': ' + ile + ' ' + odmiana(ile, 'trening', 'treningi', 'treningów') : '');
        kol.appendChild(c);
      }
      tab.appendChild(kol);
    }
    kal.appendChild(tab);
    var leg = el('p', 'sz-cal__legend');
    leg.appendChild(el('i', 'sz-cal__cell')); leg.appendChild(doc.createTextNode('bez treningu'));
    leg.appendChild(el('i', 'sz-cal__cell is-1')); leg.appendChild(doc.createTextNode('trening'));
    leg.appendChild(el('i', 'sz-cal__cell is-2')); leg.appendChild(doc.createTextNode('2 treningi'));
    kal.appendChild(leg);

    /* Cel tygodnia: 8 ostatnich tygodni */
    var cel = s.cel || 3;
    $('[data-s-cel-info]').textContent = cel + ' ' + odmiana(cel, 'trening', 'treningi', 'treningów') + ' w tygodniu';
    var bars = $('[data-s-tygodnie]');
    bars.textContent = '';
    var maks = cel + 1;
    var lista = el('ol', 'sz-bars__list');
    for (var tw = 7; tw >= 0; tw--) {
      var od = AK.dodajDni(ponTeraz, -7 * tw), doD = AK.dodajDni(od, 6);
      var n = s.historia.filter(function (h) { return h.data >= od && h.data <= doD; }).length;
      var li = el('li', n >= cel ? 'is-goal' : '');
      var slup = el('span', 'sz-bars__bar');
      slup.style.height = Math.max(4, Math.min(100, n / maks * 100)) + '%';
      slup.appendChild(el('b', '', String(n)));
      li.appendChild(slup);
      var dOd = AK.zIso(od);
      li.appendChild(el('span', 'sz-bars__label', tw === 0 ? 'ten' : dOd.getDate() + ' ' + AK.MIESIACE_KROTKO[dOd.getMonth()]));
      li.setAttribute('aria-label', (tw === 0 ? 'Ten tydzień' : 'Tydzień od ' + AK.data(od)) + ': ' + n + ' ' + odmiana(n, 'trening', 'treningi', 'treningów'));
      lista.appendChild(li);
    }
    var linia = el('span', 'sz-bars__goal'); linia.style.bottom = (cel / maks * 100) + '%';
    linia.appendChild(el('span', '', 'cel'));
    var wykres = el('div', 'sz-bars__chart');
    wykres.appendChild(lista); wykres.appendChild(linia);
    bars.appendChild(wykres);

    /* Próby */
    var pbox = $('[data-s-proby]');
    pbox.textContent = '';
    if (!s.proby.length) {
      var st = AK.statusProby(k.id);
      var pusty = el('div', 'sz-empty');
      pusty.appendChild(rozeta(k.level, true));
      pusty.appendChild(el('p', '', st.stan === 'zablokowana' ? 'Pierwsza Próba czeka na końcu parkuru. Zostało: ' + st.zostalo + ' ' + odmiana(st.zostalo, 'przeszkoda', 'przeszkody', 'przeszkód') + '.' : 'Nie ma jeszcze wyników Prób.'));
      pbox.appendChild(pusty);
    } else {
      var tabela = el('div', 'sz-table');
      var tbl = el('table');
      var def = null;
      var thead = el('thead'); var trh = el('tr');
      var pierwsza = s.proby[0];
      def = AK.proba(AK.kurs(pierwsza.kurs).proba);
      ['Data', 'Level'].concat(def.testy.map(function (t) { return t.nazwa; })).concat(['Wynik']).forEach(function (x) { var th = el('th', '', x); th.scope = 'col'; trh.appendChild(th); });
      thead.appendChild(trh); tbl.appendChild(thead);
      var tb = el('tbody');
      s.proby.slice().reverse().forEach(function (pr2) {
        var kk = AK.kurs(pr2.kurs), d2 = AK.proba(kk.proba);
        var tr = el('tr');
        var th = el('th', '', AK.data(pr2.data)); th.scope = 'row'; tr.appendChild(th);
        tr.appendChild(el('td', '', AK.level(kk.level).nazwa));
        d2.testy.forEach(function (t) {
          var r = pr2.wyniki[t.id];
          var td = el('td', r && r.zalicza ? 'is-ok' : 'is-no');
          td.appendChild(ikona(r && r.zalicza ? 'i-check' : 'i-x'));
          td.appendChild(doc.createTextNode(r ? (t.typ === 'wybor' ? r.wybor : (t.strony ? r.lewa + ' / ' + r.prawa + ' s' : r.czas + ' s')) : '?'));
          tr.appendChild(td);
        });
        tr.appendChild(el('td', '', pr2.zaliczona ? 'zaliczona' : 'jeszcze nie'));
        tb.appendChild(tr);
      });
      tbl.appendChild(tb);
      tabela.appendChild(tbl);
      tabela.setAttribute('role', 'region');
      tabela.setAttribute('aria-label', 'Wyniki Prób Mocy');
      tabela.tabIndex = 0;
      pbox.appendChild(tabela);
      pbox.appendChild(el('p', 'sz-muted', 'Przy testach na obie strony wynik to lewa / prawa strona.'));
    }

    /* Rozety i certyfikaty */
    polkaRozet($('[data-s-rozety]'), k.program, true);

    /* Jak było */
    var ob = $('[data-s-oceny]');
    ob.textContent = '';
    var licz = { ok: 0, lekko: 0, ciezko: 0 };
    s.historia.forEach(function (h) { if (licz[h.ocena] !== undefined) { licz[h.ocena] += 1; } });
    var suma = licz.ok + licz.lekko + licz.ciezko;
    if (!suma) { ob.appendChild(el('p', 'sz-muted', 'Po każdym treningu odpowiedz na pytanie „Jak było?”, a tutaj zobaczysz, jak dobrany jest poziom.')); return; }
    var pasek = el('div', 'sz-feel__bar');
    ['ok', 'lekko', 'ciezko'].forEach(function (x) {
      if (!licz[x]) { return; }
      var seg = el('span', 'sz-feel__seg sz-feel__seg--' + x);
      seg.style.flex = String(licz[x]);
      seg.title = OCENA[x] + ': ' + licz[x];
      pasek.appendChild(seg);
    });
    ob.appendChild(pasek);
    var lg = el('ul', 'sz-feel__legend');
    ['ok', 'lekko', 'ciezko'].forEach(function (x) {
      var li = el('li'); li.appendChild(el('i', 'sz-feel__dot sz-feel__seg--' + x)); li.appendChild(doc.createTextNode(OCENA[x] + ': ' + licz[x])); lg.appendChild(li);
    });
    ob.appendChild(lg);
    var rada = licz.lekko > licz.ciezko && licz.lekko >= suma * 0.3 ? 'Często jest za lekko. Wybieraj trudniejsze wersje ćwiczeń, a parkur szybciej Cię rozwinie.' : (licz.ciezko >= suma * 0.3 ? 'Często jest za ciężko. Weź dłuższe przerwy albo łatwiejsze wersje ćwiczeń. To też postęp.' : 'Poziom dobrany dobrze: większość treningów jest w sam raz.');
    ob.appendChild(el('p', 'sz-feel__tip', rada));
  }

  /* 7. Certyfikat do druku ----------------------------------------------------------------- */
  function certyfikat() {
    var s = AK.stan();
    var kursId = params.get('kurs') || (s.rozety[0] && s.rozety[0].kurs) || s.kurs;
    var k = AK.kurs(kursId);
    var st = k ? AK.statusProby(k.id) : { stan: 'brak' };
    var druk = $('[data-c-drukuj]');
    if (st.stan !== 'zaliczona') {
      $('[data-c-certyfikat]').classList.add('is-empty');
      $('.cert__title').textContent = 'Certyfikat pojawi się po Próbie';
      $('[data-c-imie]').textContent = s.imie;
      $('[data-c-co]').textContent = 'Zalicz Próbę Mocy na końcu parkuru, a certyfikat będzie gotowy do pobrania.';
      druk.disabled = true;
      return;
    }
    $('[data-c-rozeta]').appendChild(rozeta(k.level));
    $('[data-c-imie]').textContent = s.imie;
    $('[data-c-co]').textContent = AK.program(k.program).nazwa + ', Level ' + AK.level(k.level).nazwa;
    $('[data-c-data]').textContent = AK.data(st.data, { rok: true });
    doc.title = 'Certyfikat, ' + AK.level(k.level).nazwa + ', ' + s.imie + ' | Akademia Mocy Jeździeckich';
    druk.addEventListener('click', function () { window.print(); });
  }

  /* 8. Logowanie (demo: link z maila to przycisk) --------------------------------------------- */
  function logowanie() {
    var wroc = params.get('wroc') || 'panel.html';
    if (!/^[a-z-]+\.html(\?[\w=&%.-]*)?$/.test(wroc)) { wroc = 'panel.html'; }
    var form = $('[data-l-form]'), wyslane = $('[data-l-wyslane]');
    var email = $('#l-email'), blad = $('#l-email-blad');
    function imieZMaila(m) {
      var czesci = (m.split('@')[0] || '').split(/[._\-+0-9]+/).filter(Boolean);
      var x = (czesci[0] || '').replace(/[^a-ząćęłńóśźż]/gi, '');
      return x.length > 1 ? x.charAt(0).toUpperCase() + x.slice(1).toLowerCase() : 'Kasia';
    }
    if (AK.zalogowana()) {
      var info = el('p', 'login__session');
      info.appendChild(doc.createTextNode('Masz otwartą sesję: ' + AK.stan().imie + '. '));
      var a = el('a', 'link', 'Przejdź do panelu'); a.href = 'panel.html'; info.appendChild(a);
      $('[data-l-karta]').insertBefore(info, form);
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());
      email.setAttribute('aria-invalid', ok ? 'false' : 'true');
      blad.hidden = ok;
      if (!ok) { email.focus(); return; }
      $('[data-l-adres]').textContent = email.value.trim();
      form.hidden = true;
      wyslane.hidden = false;
      $('[data-l-wejdz]').focus();
    });
    if (params.get('email')) { email.value = params.get('email'); }
    $('[data-l-wejdz]').addEventListener('click', function (e) {
      e.preventDefault();
      var adres = email.value.trim();
      if (AK.zalogujEmail && AK.zalogujEmail(adres)) { location.href = wroc; return; }
      if (!AK.zalogujEmail) { AK.zaloguj(imieZMaila(adres)); location.href = wroc; return; }
      var brak = $('[data-l-brak]');
      if (brak) { brak.hidden = false; brak.querySelector('[data-l-brak-adres]').textContent = adres; brak.focus(); }
    });
    $('[data-l-demo]').addEventListener('click', function (e) {
      e.preventDefault();
      AK.zaloguj('Kasia');
      location.href = wroc;
    });
  }

  /* Start */
  var EKRANY = { panel: panel, mapa: mapa, przeglad: przeglad, proba: proba, postepy: postepy, certyfikat: certyfikat, logowanie: logowanie };
  if (STRONA !== 'logowanie') { rama(); }
  if (EKRANY[STRONA]) { EKRANY[STRONA](); }
})();
