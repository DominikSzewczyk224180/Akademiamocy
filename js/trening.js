/*
  Akademia Mocy Jeździeckich: odtwarzacz pełnego treningu (etap 3).

  Najważniejsze decyzje:
  - Czas liczony z performance.now(), a nie z liczby ticków, więc licznik nie ucieka przy przyciętej animacji.
  - Dwa elementy <video> na zmianę: aktywny gra, drugi wczytuje następny klip. Zmiana bez czarnej klatki.
  - Wideo zawsze wyciszone i inline (iPhone), pierwsze play() w kliknięciu "Zaczynamy".
  - Ekran nie gaśnie dzięki Screen Wake Lock API, odnawianemu po powrocie do karty.
  - Poziom: na Androidzie i komputerze pełny ekran i blokada orientacji, na iPhonie obrót CSS albo prawdziwy obrót telefonu.
  - Parametry do testów: ?test=1 (krótkie czasy), ?diag=1 (diagnostyka), ?tempo=10 (przyspieszenie, tylko do testów automatycznych).
*/
(function () {
  'use strict';

  var doc = document;
  var root = doc.querySelector('[data-trn]');
  if (!root) { return; }

  var DANE = window.AKADEMIA || { programy: [] };
  var TR = window.AKADEMIA_TRENINGI || { klipy: {}, treningi: [] };
  var params = new URLSearchParams(location.search);
  var TEST = params.has('test');
  var DIAG = params.has('diag');
  var TEMPO = Math.max(1, Math.min(20, Number(params.get('tempo')) || 1));
  /* Biblioteka ćwiczeń: trening odwołuje się do ćwiczenia przez "cw" */
  (TR.treningi || []).forEach(function (t) {
    t.bloki.forEach(function (b) {
      b.cwiczenia = b.cwiczenia.map(function (c) {
        return c.cw && TR.cwiczenia && TR.cwiczenia[c.cw] && !c.nazwa ? Object.assign({}, TR.cwiczenia[c.cw], c) : c;
      });
    });
  });
  var trening = TR.treningi.filter(function (t) { return t.id === params.get('t'); })[0] || TR.treningi[0];
  /* Strefa kursantki: trening uruchomiony z parkuru zalicza przeszkodę */
  var STREFA = { kurs: params.get('kurs') || '', przeszkoda: Number(params.get('przeszkoda')) || 0 };
  var AK = window.AkademiaKursantka || null;
  var Z_PARKURU = !!(AK && STREFA.kurs && STREFA.przeszkoda);
  if (!trening) { return; }
  var program = (DANE.programy || []).filter(function (p) { return p.id === trening.program; })[0] || null;

  function $(sel, ctx) { return (ctx || root).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || root).querySelectorAll(sel)); }
  function odmiana(n, jeden, dwaCztery, piec) {
    if (n === 1) { return jeden; }
    var r10 = n % 10, r100 = n % 100;
    return (r10 >= 2 && r10 <= 4 && (r100 < 12 || r100 > 14)) ? dwaCztery : piec;
  }
  function mmss(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  function ustawTekst(el, tekst) { if (el && el.textContent !== tekst) { el.textContent = tekst; } }

  /* Urządzenie */
  var ua = navigator.userAgent;
  var IOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var ANDROID = /Android/i.test(ua);
  var iosM = /OS (\d+)[_.](\d+)/.exec(ua);
  var IOS_WER = IOS && iosM ? [Number(iosM[1]), Number(iosM[2])] : null;
  var STANDALONE = navigator.standalone === true || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
  var FS_API = !!(doc.fullscreenEnabled || doc.webkitFullscreenEnabled) && !!(root.requestFullscreen || root.webkitRequestFullscreen);
  var DOTYK = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  var IOS_PWA_BLAD = IOS && STANDALONE && IOS_WER && (IOS_WER[0] < 18 || (IOS_WER[0] === 18 && IOS_WER[1] < 4));

  /* Toast (wspólny styl ze strony) */
  var toastEl = doc.querySelector('[data-toast]');
  var toastTimer = null;
  function toast(tekst) {
    if (!toastEl || root.classList.contains('is-obrocony')) { return; }
    toastEl.textContent = tekst;
    toastEl.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toastEl.classList.remove('is-visible'); }, 4200);
  }

  /* Dziennik zdarzeń do diagnostyki */
  var diag = { zdarzenia: [], t0: Date.now(), klatki: 0, fps: 0, ostatniPomiar: 0 };
  function log(tekst) {
    diag.zdarzenia.push(((Date.now() - diag.t0) / 1000).toFixed(1) + ' s  ' + tekst);
    if (diag.zdarzenia.length > 80) { diag.zdarzenia.shift(); }
  }

  /* 1. Oś czasu z danych ---------------------------------------------------- */
  function rozwin(tr) {
    var lista = [];
    var nr = 0;
    var prep = TEST ? 3 : (tr.przygotowanie || 5);
    var zmiana = TEST ? 3 : (tr.zmianaStrony || 5);
    function krotko(s) { return TEST ? Math.min(s, 8) : s; }
    tr.bloki.forEach(function (blok, bi) {
      var rundy = blok.rundy || 1;
      for (var r = 1; r <= rundy; r++) {
        blok.cwiczenia.forEach(function (c, ci) {
          nr += 1;
          var klip = TR.klipy[c.klip] || {};
          var strony = c.strony ? ['Lewa strona', 'Prawa strona'] : [''];
          strony.forEach(function (strona, si) {
            var wspolne = { cw: c, klip: c.klip, lustro: si === 1 && !!klip.lustro, strona: strona, blok: bi, blokNazwa: blok.nazwa, runda: r, rundy: rundy, nrCw: nr };
            var poprzedni = lista[lista.length - 1];
            if (si === 1) {
              lista.push(Object.assign({ typ: 'zmiana', czas: zmiana }, wspolne));
            } else if (!poprzedni || poprzedni.typ !== 'przerwa') {
              lista.push(Object.assign({ typ: 'przygotowanie', czas: prep }, wspolne));
            }
            var praca = Object.assign({ typ: 'cwiczenie' }, wspolne);
            if (c.powtorzenia) {
              praca.naPowtorzenia = true;
              praca.powtorzenia = c.powtorzenia;
              praca.czas = krotko(c.czasOk || 45);
            } else {
              praca.czas = krotko(c.czas);
            }
            lista.push(praca);
          });
          var ostatniWBloku = ci === blok.cwiczenia.length - 1;
          var przerwa = 0, opis = '';
          if (!ostatniWBloku && blok.przerwa) { przerwa = blok.przerwa; }
          else if (ostatniWBloku && r < rundy && blok.przerwaRundy) { przerwa = blok.przerwaRundy; opis = 'Przerwa przed rundą ' + (r + 1); }
          if (przerwa) { lista.push({ typ: 'przerwa', czas: TEST ? 4 : przerwa, opis: opis, blok: bi, blokNazwa: blok.nazwa, runda: r, rundy: rundy }); }
        });
      }
    });
    /* Przerwa pokazuje już klip następnego ćwiczenia */
    lista.forEach(function (s, i) {
      if (s.typ !== 'przerwa') { return; }
      var n = lista[i + 1];
      if (n) { s.klip = n.klip; s.cw = n.cw; s.lustro = n.lustro; s.strona = n.strona; s.nrCw = n.nrCw; s.nastepnaRunda = n.runda; }
    });
    return lista;
  }

  var SEG = rozwin(trening);
  var LICZBA_CW = SEG.reduce(function (m, s) { return Math.max(m, s.nrCw || 0); }, 0);
  var PRACA = SEG.map(function (s, i) { return s.typ === 'cwiczenie' ? i : -1; }).filter(function (i) { return i >= 0; });
  var CALOSC = SEG.reduce(function (a, s) { return a + s.czas; }, 0);

  function infoCwiczenia(c, s) {
    if (c.powtorzenia) { return c.powtorzenia + ' ' + odmiana(c.powtorzenia, 'powtórzenie', 'powtórzenia', 'powtórzeń'); }
    var czas = s ? s.czas : c.czas;
    return czas + ' s' + (c.strony ? ' na stronę' : '');
  }

  /* 2. Elementy ------------------------------------------------------------- */
  var E = {
    start: $('[data-ekran="start"]'), play: $('[data-ekran="trening"]'), end: $('[data-ekran="koniec"]'),
    media: $('[data-media]'), paski: $('[data-t-paski]'),
    faza: $('[data-t-faza]'), fazaNazwa: $('[data-t-faza-nazwa]'), fazaCzas: $('[data-t-faza-czas]'),
    tap: $('[data-t-tap]'), veil: $('[data-t-veil]'),
    licznik: $('[data-t-licznik]'), wake: $('[data-t-wake]'), wakeTxt: $('[data-t-wake-txt]'),
    blok: $('[data-t-blok]'), cw: $('[data-t-cw]'), strona: $('[data-t-strona]'), wskazowka: $('[data-t-wskazowka]'),
    czas: $('[data-t-czas]'), pasek: $('[data-t-pasek]'), gotowe: $('[data-t-gotowe]'), blad: $('[data-t-blad]'),
    nast: $('[data-t-nastepne]'), nastImg: $('[data-t-nastepne-img]'), nastNazwa: $('[data-t-nastepne-nazwa]'), nastInfo: $('[data-t-nastepne-info]'),
    play_btn: $('[data-t-play]'), playIco: $('[data-t-play-ico]'), wstecz: $('[data-t-wstecz]'), dalej: $('[data-t-dalej]'),
    poziom: $('[data-t-poziom]'), poziomTxt: $('[data-t-poziom-txt]'),
    dzwiekBtn: $('[data-t-dzwiek-btn]'), dzwiekIco: $('[data-t-dzwiek-ico]'), dzwiekTxt: $('[data-t-dzwiek-txt]'),
    zostalo: $('[data-t-zostalo]'), pauza: $('[data-t-pauza]'), pauzaWhy: $('[data-t-pauza-why]'),
    ogloszenie: $('[data-t-ogloszenie]'), zakoncz: $('[data-t-zakoncz]')
  };

  /* 3. Dźwięk: sygnały (Web Audio) i opcjonalny głos (synteza mowy) -------------- */
  var dzwiek = (function () {
    var ctx = null;
    var tryb = 'sygnaly';
    try { tryb = localStorage.getItem('akademia-dzwiek') || 'sygnaly'; } catch (e) { /* tryb prywatny */ }
    function glosPL() {
      if (!('speechSynthesis' in window)) { return null; }
      var g = window.speechSynthesis.getVoices().filter(function (v) { return /^pl/i.test(v.lang); });
      return g[0] || null;
    }
    function odblokuj() {
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (AC && !ctx) { ctx = new AC(); }
        if (ctx && ctx.state === 'suspended') { ctx.resume(); }
        if (ctx) {
          var b = ctx.createBuffer(1, 1, 22050), src = ctx.createBufferSource();
          src.buffer = b; src.connect(ctx.destination); src.start(0);
        }
      } catch (e) { log('audio: ' + e.name); }
      if (tryb === 'glos' && 'speechSynthesis' in window) {
        var u = new SpeechSynthesisUtterance(' ');
        u.volume = 0;
        window.speechSynthesis.speak(u);
      }
    }
    function ton(freq, dlugosc, glosnosc, opoznienie) {
      if (tryb === 'cisza' || !ctx) { return; }
      try {
        var t = ctx.currentTime + (opoznienie || 0);
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(glosnosc, t + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dlugosc);
        o.connect(g); g.connect(ctx.destination);
        o.start(t); o.stop(t + dlugosc + 0.05);
      } catch (e) { /* bez dźwięku */ }
    }
    return {
      tryb: function () { return tryb; },
      ustaw: function (t) { tryb = t; try { localStorage.setItem('akademia-dzwiek', t); } catch (e) { /* tryb prywatny */ } },
      odblokuj: odblokuj,
      odliczanie: function () { ton(660, 0.12, 0.25); },
      start: function () { ton(990, 0.28, 0.32); },
      koniec: function () { ton(784, 0.18, 0.28); ton(988, 0.18, 0.28, 0.16); ton(1319, 0.36, 0.3, 0.32); },
      mow: function (tekst) {
        if (tryb !== 'glos' || !('speechSynthesis' in window)) { return; }
        var g = glosPL();
        if (!g) { return; }
        var u = new SpeechSynthesisUtterance(tekst);
        u.lang = 'pl-PL';
        u.voice = g;
        u.rate = 1.02;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      },
      wibracja: function (wzor) { if (navigator.vibrate) { try { navigator.vibrate(wzor); } catch (e) { /* brak */ } } },
      stan: function () { var g = glosPL(); return { tryb: tryb, audio: ctx ? ctx.state : 'brak', glosPL: g ? g.name : 'brak' }; }
    };
  })();

  /* 4. Ekran nie gaśnie: Screen Wake Lock API ------------------------------- */
  var ekran = (function () {
    var sentinel = null;
    var stan = 'wylaczony';
    var blad = '';
    var proby = 0;
    function wspierane() { return 'wakeLock' in navigator; }
    function rysuj() {
      if (!E.wake) { return; }
      var ok = stan === 'aktywny' && !IOS_PWA_BLAD;
      E.wake.classList.toggle('is-warn', !ok && stan !== 'wylaczony');
      E.wake.classList.toggle('is-off', stan === 'wylaczony');
      ustawTekst(E.wakeTxt, ok ? 'Ekran nie zgaśnie' : (stan === 'wylaczony' ? 'Ekran: zwykły' : 'Ekran może zgasnąć'));
    }
    function zablokuj() {
      if (!wspierane()) { stan = 'niewspierane'; rysuj(); log('wake lock: brak API'); return; }
      if (sentinel && !sentinel.released) { return; }
      proby += 1;
      navigator.wakeLock.request('screen').then(function (s) {
        sentinel = s;
        stan = 'aktywny';
        blad = '';
        log('wake lock: aktywny');
        s.addEventListener('release', function () {
          log('wake lock: zwolniony');
          if (sentinel === s) { sentinel = null; stan = 'zwolniony'; rysuj(); }
        });
        rysuj();
      }).catch(function (e) {
        stan = 'blad';
        blad = e.name + ': ' + e.message;
        log('wake lock błąd: ' + e.name);
        rysuj();
      });
    }
    function zwolnij(powod) {
      if (sentinel) { var s = sentinel; sentinel = null; s.release().catch(function () { /* już zwolniony */ }); }
      stan = 'wylaczony';
      log('wake lock: zwolnienie (' + (powod || 'bez powodu') + ')');
      rysuj();
    }
    function wskazowka() {
      if (IOS) { return 'Na czas treningu ustaw Autoblokadę na Nigdy: Ustawienia, Ekran i jasność, Autoblokada.'; }
      if (ANDROID) { return 'Wydłuż czas wygaszania: Ustawienia, Wyświetlacz, Wygaszanie ekranu.'; }
      return 'Ta przeglądarka nie pozwala stronie wyłączyć wygaszania ekranu.';
    }
    return {
      zablokuj: zablokuj, zwolnij: zwolnij, rysuj: rysuj, wskazowka: wskazowka,
      ostrzezenie: function () { return !wspierane() || IOS_PWA_BLAD; },
      stan: function () { return { api: wspierane(), stan: stan, blad: blad, proby: proby, iosAplikacjaZBledem: !!IOS_PWA_BLAD }; }
    };
  })();

  /* 5. Wideo: dwa elementy, płynna zmiana, wczytywanie następnego klipu --------- */
  var wideo = (function () {
    var v = $$('.trn-video');
    var akt = 0;
    var biezacy = '';
    var hls = [null, null];
    var bledy = 0;
    var ostatniBlad = '';
    var HLS_URL = 'https://cdn.jsdelivr.net/npm/hls.js@1.7.3/dist/hls.light.min.js';
    var hlsLadowanie = null;

    v.forEach(function (el, i) {
      el.muted = true;
      el.defaultMuted = true;
      el.playsInline = true;
      el.addEventListener('error', function () {
        bledy += 1;
        ostatniBlad = 'MediaError ' + (el.error ? el.error.code : '?');
        log('wideo ' + i + ': ' + ostatniBlad);
      });
      el.addEventListener('playing', function () { if (i === akt) { E.veil.hidden = true; } });
    });

    function wczytajHls() {
      if (window.Hls) { return Promise.resolve(window.Hls); }
      if (!hlsLadowanie) {
        hlsLadowanie = new Promise(function (ok, nie) {
          var s = doc.createElement('script');
          s.src = HLS_URL;
          s.onload = function () { ok(window.Hls); };
          s.onerror = nie;
          doc.head.appendChild(s);
        });
      }
      return hlsLadowanie;
    }
    function podlacz(el, id) {
      var k = TR.klipy[id];
      if (!k || el.getAttribute('data-klip') === id) { return; }
      var i = v.indexOf(el);
      el.setAttribute('data-klip', id);
      if (hls[i]) { hls[i].destroy(); hls[i] = null; }
      if (k.poster) { el.poster = k.poster; }
      if (k.hls && el.canPlayType('application/vnd.apple.mpegurl')) {
        el.src = k.hls;
      } else if (k.hls) {
        wczytajHls().then(function (Hls) {
          if (!Hls.isSupported()) { el.src = k.mp4; return; }
          var h = new Hls({ capLevelToPlayerSize: true, maxBufferLength: 20 });
          h.loadSource(k.hls);
          h.attachMedia(el);
          hls[i] = h;
          if (i === akt && stanTreningu.aktywny && !stanTreningu.pauza) { graj(el); }
        }).catch(function () { log('hls.js: nie wczytano, wracam do mp4'); el.src = k.mp4; });
      } else {
        el.src = k.mp4;
      }
    }
    function graj(el) {
      var p;
      try { p = el.play(); } catch (e) { p = null; }
      if (p && p.catch) {
        p.catch(function (e) {
          if (e.name === 'AbortError') { return; }
          bledy += 1;
          ostatniBlad = e.name;
          log('play() odrzucone: ' + e.name);
          if (e.name === 'NotAllowedError' && el === v[akt]) { E.veil.hidden = false; }
        });
      }
    }
    function nastepnyKlip() {
      for (var j = stanTreningu.i + 1; j < SEG.length; j++) {
        if (SEG[j].klip && SEG[j].klip !== v[akt].getAttribute('data-klip')) { return SEG[j].klip; }
      }
      return null;
    }
    function przygotujNastepny() {
      var n = nastepnyKlip();
      var el = v[1 - akt];
      if (n && el.getAttribute('data-klip') !== n) { el.preload = 'auto'; podlacz(el, n); }
    }
    function ustawTlo(id) {
      var k = TR.klipy[id];
      if (k && k.poster) { E.media.style.setProperty('--klip-poster', 'url("' + new URL(k.poster, location.href).href + '")'); }
    }
    function ustaw(id, lustro, grajTeraz) {
      if (!id) { return; }
      var klucz = id + (lustro ? '|lustro' : '');
      if (klucz === biezacy) { if (grajTeraz) { graj(v[akt]); } return; }
      var cel = v[akt].getAttribute('data-klip') === id ? v[akt] : v[1 - akt];
      podlacz(cel, id);
      cel.classList.toggle('is-lustro', !!lustro);
      if (cel !== v[akt]) {
        try { cel.currentTime = 0; } catch (e) { /* jeszcze bez metadanych */ }
        var stary = v[akt];
        cel.classList.add('is-on');
        stary.classList.remove('is-on');
        akt = v.indexOf(cel);
        window.setTimeout(function () { stary.pause(); przygotujNastepny(); }, 450);
      } else {
        window.setTimeout(przygotujNastepny, 50);
      }
      biezacy = klucz;
      ustawTlo(id);
      if (grajTeraz) { graj(cel); }
    }
    return {
      ustaw: ustaw,
      graj: function () { graj(v[akt]); },
      pauza: function () { v.forEach(function (el) { el.pause(); }); },
      /* W kliknięciu: oba elementy dostają play(), żeby iPhone pozwolił im potem grać bez dotyku */
      odblokuj: function (pierwszy) {
        podlacz(v[0], pierwszy);
        var drugi = SEG.filter(function (s) { return s.klip && s.klip !== pierwszy; })[0];
        if (drugi) {
          podlacz(v[1], drugi.klip);
          var p;
          try { p = v[1].play(); } catch (e) { p = null; }
          if (p && p.then) { p.then(function () { if (v[1] !== v[akt]) { v[1].pause(); } }).catch(function () { /* wystarczy próba */ }); }
        }
      },
      stan: function () {
        var el = v[akt];
        return { klip: el.getAttribute('data-klip'), readyState: el.readyState, czas: Number(el.currentTime.toFixed(2)), pauza: el.paused, lustro: el.classList.contains('is-lustro'), hls: !!hls[akt], bledy: bledy, ostatniBlad: ostatniBlad };
      }
    };
  })();

  /* 6. Układ: pion, kino, obrót CSS, pełny ekran ----------------------------- */
  var widok = { wymuszony: false, tryb: 'pion' };
  var mqKino = window.matchMedia('(orientation: landscape) and (max-height: 560px)');
  var ukryjUiTimer = null;

  function pelnyEkran() { return doc.fullscreenElement || doc.webkitFullscreenElement || null; }
  function aktualizujUklad() {
    var poziomo = window.innerWidth > window.innerHeight;
    if (widok.wymuszony && poziomo) { widok.wymuszony = false; log('obrót telefonu zastąpił obrót CSS'); }
    if (widok.wymuszony && widok.zPelnego && !pelnyEkran()) { widok.wymuszony = false; widok.zPelnego = false; log('koniec pełnego ekranu, koniec obrotu CSS'); }
    var fs = !!pelnyEkran();
    var kino = mqKino.matches || fs || widok.wymuszony;
    var poprzedni = widok.tryb;
    root.classList.toggle('is-kino', kino);
    root.classList.toggle('is-obrocony', widok.wymuszony);
    widok.tryb = widok.wymuszony ? 'obrot' : (fs ? 'pelny ekran' : (kino ? 'kino' : 'pion'));
    ustawTekst(E.poziomTxt, kino ? 'Pion' : (DOTYK ? 'Poziom' : 'Pełny ekran'));
    var ikona = E.poziom.querySelector('use');
    if (ikona) { ikona.setAttribute('href', DOTYK ? '#i-obrot' : '#i-pelny'); }
    if (poprzedni !== widok.tryb) {
      log('układ: ' + widok.tryb + ' (' + window.innerWidth + 'x' + window.innerHeight + ')');
      if (kino) { pokazUI(); }
    }
  }
  function wyjdzZPelnego() {
    if (pelnyEkran()) {
      try { (doc.exitFullscreen || doc.webkitExitFullscreen).call(doc); } catch (e) { /* już poza */ }
    }
    try { if (screen.orientation && screen.orientation.unlock) { screen.orientation.unlock(); } } catch (e) { /* brak */ }
  }
  function przelaczPoziom() {
    if (root.classList.contains('is-kino')) {
      if (pelnyEkran()) { wyjdzZPelnego(); }
      else if (widok.wymuszony) { widok.wymuszony = false; }
      else { toast('Obróć telefon do pionu, a ekran sam się dopasuje.'); }
      aktualizujUklad();
      return;
    }
    if (FS_API) {
      var req = root.requestFullscreen || root.webkitRequestFullscreen;
      var wynik;
      try { wynik = req.call(root, { navigationUI: 'hide' }); } catch (e) { wynik = Promise.reject(e); }
      Promise.resolve(wynik).then(function () {
        log('pełny ekran: tak');
        function obrocJesliPion() {
          /* Tylko gdy nadal jest pełny ekran: spóźniona odpowiedź po wyjściu nie może z powrotem obrócić obrazu */
          if (pelnyEkran() && window.innerWidth < window.innerHeight && DOTYK) { widok.wymuszony = true; widok.zPelnego = true; aktualizujUklad(); log('pełny ekran w pionie, włączam obrót CSS'); }
        }
        if (screen.orientation && screen.orientation.lock) {
          return screen.orientation.lock('landscape').then(function () { log('orientation.lock: poziomo'); })
            .catch(function (e) { log('orientation.lock: ' + e.name); obrocJesliPion(); });
        }
        obrocJesliPion();
      }).catch(function (e) {
        log('pełny ekran: ' + e.name + ', używam obrotu CSS');
        widok.wymuszony = window.innerWidth < window.innerHeight;
        aktualizujUklad();
      });
    } else {
      widok.wymuszony = window.innerWidth < window.innerHeight;
      if (!widok.wymuszony) { log('już poziomo'); }
      aktualizujUklad();
    }
  }
  function pokazUI() {
    root.classList.add('show-ui');
    window.clearTimeout(ukryjUiTimer);
    if (!stanTreningu.pauza) { ukryjUiTimer = window.setTimeout(function () { root.classList.remove('show-ui'); }, 3000); }
  }

  window.addEventListener('resize', aktualizujUklad);
  window.addEventListener('orientationchange', function () { window.setTimeout(aktualizujUklad, 250); });
  if (mqKino.addEventListener) { mqKino.addEventListener('change', aktualizujUklad); }
  doc.addEventListener('fullscreenchange', function () { if (!pelnyEkran()) { wyjdzZPelnego(); widok.wymuszony = false; } aktualizujUklad(); });
  doc.addEventListener('webkitfullscreenchange', aktualizujUklad);

  /* 7. Silnik treningu -------------------------------------------------------- */
  var stanTreningu = { i: 0, t0: 0, pauza: false, pauzaOd: 0, aktywny: false, aktywnyMs: 0, ostatniTick: 0, odliczone: -1, zrobione: 0, startPerf: 0, startData: 0 };
  var stan = stanTreningu;
  var cache = {};
  var zegarPauzy = null;

  function teraz() { return performance.now(); }
  function uplynelo() { return ((stan.pauza ? stan.pauzaOd : teraz()) - stan.t0) / 1000 * TEMPO; }

  function etykietaBloku(s) {
    if (s.typ !== 'cwiczenie') { return s.typ === 'zmiana' ? 'Druga strona' : 'Za chwilę'; }
    return s.blokNazwa + (s.rundy > 1 ? ', runda ' + s.runda + ' z ' + s.rundy : '');
  }
  function opisFazy(s) {
    if (s.typ === 'przygotowanie') { return 'Ustaw się do ćwiczenia. Start za chwilę.'; }
    if (s.typ === 'zmiana') { return 'To samo ćwiczenie, teraz druga strona.'; }
    if (s.typ === 'przerwa') { return 'Złap oddech. Następne: ' + (s.cw ? s.cw.nazwa.toLowerCase() : 'koniec') + '.'; }
    return s.cw ? s.cw.wskazowka : '';
  }
  function nastepnaPraca(odIndeksu) {
    for (var j = odIndeksu + 1; j < SEG.length; j++) { if (SEG[j].typ === 'cwiczenie') { return SEG[j]; } }
    return null;
  }

  function rysujPaski() {
    var i = stan.i;
    $$('b', E.paski).forEach(function (b, k) {
      var idx = PRACA[k];
      b.style.setProperty('--fill', idx < i ? '100%' : (idx === i ? (cache.postep || 0) + '%' : '0%'));
    });
  }
  function rysujNastepne() {
    var i = stan.i;
    var fokus = SEG[i].typ === 'cwiczenie' ? i : -1;
    if (fokus < 0) { for (var j = i + 1; j < SEG.length; j++) { if (SEG[j].typ === 'cwiczenie') { fokus = j; break; } } }
    var n = fokus >= 0 ? nastepnaPraca(fokus) : null;
    E.nast.classList.toggle('is-last', !n);
    if (!n) {
      ustawTekst(E.nastNazwa, 'Koniec treningu');
      ustawTekst(E.nastInfo, 'Zaraz rozeta za wytrwałość');
      E.nastImg.hidden = true;
      return;
    }
    E.nastImg.hidden = false;
    var k = TR.klipy[n.klip] || {};
    if (k.poster && E.nastImg.getAttribute('src') !== k.poster) { E.nastImg.setAttribute('src', k.poster); }
    E.nastImg.classList.toggle('is-lustro', !!n.lustro);
    ustawTekst(E.nastNazwa, n.cw.nazwa);
    ustawTekst(E.nastInfo, n.strona ? n.strona + ', ' + n.czas + ' s' : infoCwiczenia(n.cw, n));
  }
  function rysujSegment(s) {
    var c = s.cw || {};
    root.setAttribute('data-faza', s.typ === 'cwiczenie' ? 'praca' : s.typ);
    ustawTekst(E.blok, etykietaBloku(s));
    ustawTekst(E.cw, c.nazwa || 'Koniec');
    E.strona.hidden = !s.strona;
    ustawTekst(E.strona, s.strona || '');
    ustawTekst(E.wskazowka, opisFazy(s));
    ustawTekst(E.blad, s.typ === 'cwiczenie' && c.blad ? 'Uważaj: ' + c.blad : '');
    ustawTekst(E.licznik, 'Ćwiczenie ' + s.nrCw + ' z ' + LICZBA_CW);
    E.gotowe.hidden = !(s.typ === 'cwiczenie' && s.naPowtorzenia);
    E.gotowe.classList.remove('is-ready');
    var faza = s.typ !== 'cwiczenie';
    E.faza.hidden = !faza;
    if (faza) { ustawTekst(E.fazaNazwa, s.typ === 'przygotowanie' ? 'Przygotuj się' : (s.typ === 'zmiana' ? 'Zmień stronę' : (s.opis || 'Przerwa'))); }
    cache = {};
    rysujNastepne();
    rysujPaski();
    var komunikat = faza ? (E.fazaNazwa.textContent + ': ' + (c.nazwa || '')) : (c.nazwa + ', ' + infoCwiczenia(c, s));
    ustawTekst(E.ogloszenie, komunikat + (s.strona ? ', ' + s.strona.toLowerCase() : ''));
  }
  function rysujCzas(s, el, zostalo) {
    var tekst, postep;
    if (s.typ === 'cwiczenie' && s.naPowtorzenia) {
      tekst = s.powtorzenia + '×';
      postep = Math.min(100, Math.round(el / s.czas * 100));
      if (el >= s.czas && !E.gotowe.hidden) { E.gotowe.classList.add('is-ready'); }
    } else {
      var sek = Math.max(0, Math.ceil(zostalo - 0.0001));
      tekst = mmss(sek);
      postep = Math.min(100, Math.max(0, Math.round((1 - zostalo / s.czas) * 100)));
      if (s.typ !== 'cwiczenie') { ustawTekst(E.fazaCzas, String(sek)); }
    }
    ustawTekst(E.czas, tekst);
    if (cache.postep !== postep) {
      cache.postep = postep;
      E.pasek.style.setProperty('--fill', postep + '%');
      if (s.typ === 'cwiczenie') { rysujPaski(); }
    }
    var reszta = Math.max(0, s.czas - el);
    for (var j = stan.i + 1; j < SEG.length; j++) { reszta += SEG[j].czas; }
    ustawTekst(E.zostalo, 'Zostało ' + mmss(reszta));
    var pokaz = s.typ !== 'cwiczenie' || zostalo <= 10;
    if (cache.nast !== pokaz) { cache.nast = pokaz; root.classList.toggle('pokaz-nastepne', pokaz); }
  }

  function zapowiedz(s, poprzedni) {
    var c = s.cw || {};
    if (s.typ === 'przygotowanie') {
      dzwiek.mow('Przygotuj się. ' + c.nazwa + (s.strona ? ', ' + s.strona.toLowerCase() : '') + '.');
    } else if (s.typ === 'zmiana') {
      dzwiek.mow('Zmień stronę.');
      dzwiek.wibracja([60, 60, 60]);
    } else if (s.typ === 'przerwa') {
      dzwiek.mow((s.opis || 'Przerwa') + '. Następne: ' + (c.nazwa || 'koniec') + '.');
    } else {
      dzwiek.start();
      dzwiek.wibracja(120);
      if (poprzedni && poprzedni.typ === 'cwiczenie') { dzwiek.mow(c.nazwa + '.'); }
    }
  }

  function wejdz(i) {
    var poprzedni = SEG[stan.i];
    if (poprzedni && poprzedni.typ === 'cwiczenie' && i > stan.i) { stan.zrobione += 1; }
    stan.i = i;
    stan.t0 = teraz();
    if (stan.pauza) { stan.pauzaOd = stan.t0; }
    stan.odliczone = -1;
    var s = SEG[i];
    wideo.ustaw(s.klip, s.lustro, !stan.pauza);
    rysujSegment(s);
    rysujCzas(s, 0, s.czas);
    zapiszPostep();
    zapowiedz(s, poprzedni);
    log('segment ' + (i + 1) + '/' + SEG.length + ': ' + s.typ + (s.cw ? ', ' + s.cw.nazwa : '') + (s.strona ? ', ' + s.strona : ''));
  }
  function nastepny() { if (stan.i < SEG.length - 1) { wejdz(stan.i + 1); } else { zakoncz(false); } }
  function poprzedni() {
    var s = SEG[stan.i];
    if (s.typ === 'cwiczenie' && uplynelo() > 3) { wejdz(stan.i); return; }
    var j = stan.i - 1;
    while (j > 0 && SEG[j].typ !== 'cwiczenie') { j -= 1; }
    if (j > 0 && (SEG[j - 1].typ === 'przygotowanie' || SEG[j - 1].typ === 'zmiana')) { j -= 1; }
    wejdz(Math.max(0, j));
  }

  function petla(t) {
    window.requestAnimationFrame(petla);
    diag.klatki += 1;
    if (t - diag.ostatniPomiar >= 1000) { diag.fps = Math.round(diag.klatki * 1000 / (t - diag.ostatniPomiar || 1000)); diag.klatki = 0; diag.ostatniPomiar = t; }
    if (!stan.aktywny || stan.pauza) { return; }
    var n = teraz();
    if (stan.ostatniTick) { stan.aktywnyMs += Math.min(1000, n - stan.ostatniTick) * TEMPO; }
    stan.ostatniTick = n;
    var s = SEG[stan.i];
    var el = uplynelo();
    var zostalo = s.czas - el;
    var reczny = s.typ === 'cwiczenie' && s.naPowtorzenia && !TEST;
    if (!reczny && zostalo <= 0) { nastepny(); return; }
    if (!reczny) {
      var sek = Math.ceil(zostalo);
      if (sek <= 3 && sek >= 1 && sek !== stan.odliczone) { stan.odliczone = sek; dzwiek.odliczanie(); }
    }
    rysujCzas(s, el, zostalo);
  }

  function pokazPauze(powod) {
    E.pauza.hidden = false;
    ustawTekst(E.pauzaWhy, powod === 'tlo' ? 'Trening wstrzymany, bo aplikacja była w tle.' : (powod === 'menu' ? 'Chcesz zakończyć trening czy wracasz?' : 'Odpocznij chwilę. Trening czeka.'));
    var b = $('[data-t-wznow]');
    if (b && !root.classList.contains('is-obrocony')) { b.focus({ preventScroll: true }); }
  }
  function pauza(powod) {
    if (stan.pauza || !stan.aktywny) { return; }
    stan.pauza = true;
    stan.pauzaOd = teraz();
    stan.ostatniTick = 0;
    wideo.pauza();
    rysujPlay();
    pokazPauze(powod);
    root.classList.add('is-paused');
    window.clearTimeout(zegarPauzy);
    zegarPauzy = window.setTimeout(function () { ekran.zwolnij('pauza dłuższa niż 5 min'); }, 5 * 60 * 1000);
    zapiszPostep();
    log('pauza (' + (powod || 'przycisk') + ')');
  }
  function wznow() {
    if (!stan.pauza) { return; }
    stan.t0 += teraz() - stan.pauzaOd;
    stan.pauza = false;
    stan.ostatniTick = 0;
    window.clearTimeout(zegarPauzy);
    E.pauza.hidden = true;
    root.classList.remove('is-paused');
    ekran.zablokuj();
    wideo.graj();
    rysujPlay();
    pokazUI();
    log('wznowienie');
  }
  function rysujPlay() {
    E.play_btn.setAttribute('aria-label', stan.pauza ? 'Wznów' : 'Wstrzymaj');
    E.playIco.querySelector('use').setAttribute('href', stan.pauza ? '#i-play' : '#i-pause');
    E.playIco.classList.toggle('ico--fill', stan.pauza);
  }

  /* 8. Zapis postępu (np. gdy Safari przeładuje kartę) ----------------------- */
  var KLUCZ = 'akademia-trening-' + trening.id + (TEST ? '-test' : '');
  function zapiszPostep() {
    try { localStorage.setItem(KLUCZ, JSON.stringify({ i: stan.i, kiedy: Date.now() })); } catch (e) { /* tryb prywatny */ }
  }
  function wczytajPostep() {
    try {
      var d = JSON.parse(localStorage.getItem(KLUCZ));
      if (d && d.i > 0 && d.i < SEG.length && Date.now() - d.kiedy < 12 * 3600 * 1000) { return d; }
    } catch (e) { /* brak */ }
    return null;
  }
  function wyczyscPostep() { try { localStorage.removeItem(KLUCZ); } catch (e) { /* brak */ } }

  /* 9. Ekrany: start, trening, koniec ------------------------------------------ */
  function pokazEkran(nazwa) {
    E.start.hidden = nazwa !== 'start';
    E.play.hidden = nazwa !== 'trening';
    E.end.hidden = nazwa !== 'koniec';
    doc.documentElement.style.overflow = nazwa === 'trening' ? 'hidden' : '';
  }

  function start(od) {
    dzwiek.odblokuj();
    wideo.odblokuj(SEG[od].klip || SEG[0].klip);
    ekran.zablokuj();
    pokazEkran('trening');
    stan.aktywny = true;
    stan.pauza = false;
    stan.aktywnyMs = 0;
    stan.ostatniTick = 0;
    stan.zrobione = 0;
    stan.startPerf = teraz();
    stan.startData = Date.now();
    root.classList.remove('is-paused');
    E.pauza.hidden = true;
    aktualizujUklad();
    stan.i = od;
    wejdz(od);
    rysujPlay();
    if (ekran.ostrzezenie()) { window.setTimeout(function () { toast(ekran.wskazowka()); }, 1200); }
    log('start od segmentu ' + (od + 1) + (TEST ? ' (tryb testowy)' : '') + (TEMPO > 1 ? ', tempo x' + TEMPO : ''));
  }

  function zakoncz(przedwczesnie) {
    stan.aktywny = false;
    stan.pauza = false;
    window.clearTimeout(zegarPauzy);
    wideo.pauza();
    ekran.zwolnij(przedwczesnie ? 'zakończenie wcześniej' : 'koniec treningu');
    wyjdzZPelnego();
    widok.wymuszony = false;
    root.classList.remove('is-kino', 'is-obrocony', 'show-ui', 'is-paused', 'pokaz-nastepne');
    wyczyscPostep();
    if (!przedwczesnie) { stan.zrobione = PRACA.length; }
    var min = Math.max(1, Math.round(stan.aktywnyMs / 60000));
    var rundy = SEG.reduce(function (m, s) { return Math.max(m, s.rundy || 1); }, 1);
    var zrobione = Math.min(stan.zrobione, PRACA.length);
    var wpis = null;
    if (!przedwczesnie && Z_PARKURU) {
      wpis = AK.zapiszTrening({ kurs: STREFA.kurs, przeszkoda: STREFA.przeszkoda, trening: trening.id, minuty: min });
      log('strefa: przeszkoda ' + STREFA.przeszkoda + (wpis && wpis.nowa ? ' zaliczona' : ' powtórzona'));
    }
    ustawTekst($('#trn-koniec-tytul'), przedwczesnie ? 'Trening przerwany' : 'Trening ukończony');
    var odbl = $('[data-t-odblokowane]');
    if (odbl) {
      odbl.hidden = true;
      if (wpis && wpis.nowa) {
        odbl.hidden = false;
        odbl.innerHTML = '';
        var t1 = doc.createElement('strong');
        t1.textContent = wpis.probaOdblokowana ? 'Próba Mocy odblokowana' : 'Przeszkoda ' + STREFA.przeszkoda + ' zaliczona';
        var t2 = doc.createElement('span');
        t2.textContent = wpis.probaOdblokowana ? 'Cały parkur przejechany. Czas na Próbę.' : (wpis.zostalo > 0 ? 'Do Próby Mocy: ' + wpis.zostalo + ' ' + odmiana(wpis.zostalo, 'przeszkoda', 'przeszkody', 'przeszkód') + '.' : '');
        odbl.appendChild(t1); odbl.appendChild(t2);
        if (wpis.probaOdblokowana) {
          var a2 = doc.createElement('a');
          a2.className = 'link';
          a2.href = 'proba.html';
          a2.textContent = 'Przejdź do Próby Mocy';
          odbl.appendChild(a2);
        }
      }
    }
    ustawTekst($('[data-t-podsumowanie]'), (przedwczesnie ? 'Zrobione: ' + zrobione + ' z ' + PRACA.length + ' części. ' : '') +
      'Czas: ' + min + ' min. ' + LICZBA_CW + ' ' + odmiana(LICZBA_CW, 'ćwiczenie', 'ćwiczenia', 'ćwiczeń') + ' w 4 blokach' +
      (rundy > 1 ? ', część główna ' + rundy + ' ' + odmiana(rundy, 'raz', 'razy', 'razy') : '') + '.');
    $('.trn-end__badge').textContent = przedwczesnie ? 'dobry start' : 'brawo!';
    pokazEkran('koniec');
    if (!przedwczesnie) { dzwiek.koniec(); dzwiek.mow('Brawo, trening ukończony.'); }
    var tytul = $('#trn-koniec-tytul');
    if (tytul) { tytul.focus({ preventScroll: true }); }
    log(przedwczesnie ? 'koniec wcześniej' : 'trening ukończony');
  }

  /* Ekran startowy z danych */
  function rysujStart() {
    var naglowek = trening.naglowek || (program ? program.nazwa : '');
    ustawTekst($('[data-t-naglowek]'), naglowek);
    ustawTekst($('[data-t-nazwa]'), trening.nazwa);
    ustawTekst($('[data-t-opis]'), trening.opis || '');
    var wroc = program ? 'program-' + program.id + '.html' : 'index.html';
    if (Z_PARKURU) {
      wroc = 'przeglad.html?kurs=' + encodeURIComponent(STREFA.kurs) + '&przeszkoda=' + STREFA.przeszkoda;
      ustawTekst($('[data-t-naglowek]'), 'Przeszkoda ' + STREFA.przeszkoda + ', ' + naglowek);
    }
    $$('[data-t-wroc]').forEach(function (a) { a.setAttribute('href', wroc); });
    var koniecLink = $('[data-t-wroc-koniec]');
    koniecLink.setAttribute('href', Z_PARKURU ? 'mapa.html' : wroc);
    ustawTekst(koniecLink, Z_PARKURU ? 'Wróć do parkuru' : 'Wróć do programu');
    var pierwszy = TR.klipy[SEG[0].klip] || {};
    if (pierwszy.poster) { $('[data-t-poster]').setAttribute('src', pierwszy.poster); }
    ustawTekst($('[data-t-chip]'), TEST ? 'Tryb testowy' : 'Wersja demo');
    $('[data-t-test]').hidden = !TEST;
    var bloki = trening.bloki.length;
    var minuty = Math.max(1, Math.round(CALOSC / 60));
    var meta = [
      ['i-zegar', 'ok. ' + minuty + ' min'],
      ['i-lista', LICZBA_CW + ' ' + odmiana(LICZBA_CW, 'ćwiczenie', 'ćwiczenia', 'ćwiczeń')],
      ['i-kalendarz', bloki + ' ' + odmiana(bloki, 'blok', 'bloki', 'bloków')],
      ['i-dom', (trening.sprzet || []).join(', ') || 'Bez sprzętu']
    ];
    var m = $('[data-t-meta]');
    m.textContent = '';
    meta.forEach(function (x) {
      var sp = doc.createElement('span');
      sp.innerHTML = '<svg class="ico" aria-hidden="true"><use href="#' + x[0] + '"/></svg>';
      sp.appendChild(doc.createTextNode(x[1]));
      m.appendChild(sp);
    });
    var plan = $('[data-t-plan]');
    plan.textContent = '';
    trening.bloki.forEach(function (b, bi) {
      var li = doc.createElement('li');
      li.className = 'trn-plan__block';
      var rundy = b.rundy || 1;
      var head = doc.createElement('p');
      head.className = 'trn-plan__head';
      head.innerHTML = '<span class="trn-plan__dot" style="--b: var(--blk-' + (bi + 1) + ')" aria-hidden="true"></span>';
      var n1 = doc.createElement('span'); n1.textContent = b.nazwa; head.appendChild(n1);
      var n2 = doc.createElement('span');
      n2.textContent = rundy > 1 ? rundy + ' ' + odmiana(rundy, 'runda', 'rundy', 'rund') + (b.przerwa ? ', przerwy ' + b.przerwa + ' s' : '') : '';
      head.appendChild(n2);
      li.appendChild(head);
      var ul = doc.createElement('ul');
      ul.className = 'trn-plan__list';
      b.cwiczenia.forEach(function (c) {
        var it = doc.createElement('li');
        var a = doc.createElement('span'); a.textContent = c.nazwa;
        var z = doc.createElement('span'); z.textContent = infoCwiczenia(c);
        it.appendChild(a); it.appendChild(z); ul.appendChild(it);
      });
      li.appendChild(ul);
      plan.appendChild(li);
    });
    var info = $('[data-t-wake-info]');
    if (ekran.ostrzezenie() && info) {
      info.classList.add('is-warn');
      info.querySelector('span').textContent = (IOS_PWA_BLAD ? 'W aplikacji z ekranu głównego na tym iOS ekran może gasnąć. Otwórz trening w Safari albo zaktualizuj iOS. ' : 'Ta przeglądarka nie blokuje wygaszania. ') + ekran.wskazowka();
    }
    $$('[data-t-dzwiek]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-t-dzwiek') === dzwiek.tryb() ? 'true' : 'false'); });
    var zapis = wczytajPostep();
    var box = $('[data-t-resume]');
    if (zapis) {
      var s = SEG[zapis.i];
      ustawTekst($('[data-t-resume-nazwa]'), (s.cw ? s.cw.nazwa : 'trening') + (s.rundy > 1 ? ', runda ' + s.runda : ''));
      box.hidden = false;
      $('[data-t-start]').hidden = true;
    }
    /* paski: jeden na każdą część z ćwiczeniem */
    E.paski.innerHTML = PRACA.map(function () { return '<i><b></b></i>'; }).join('');
    rysujDzwiekBtn();
  }
  function rysujDzwiekBtn() {
    var cisza = dzwiek.tryb() === 'cisza';
    E.dzwiekBtn.setAttribute('aria-pressed', cisza ? 'false' : 'true');
    E.dzwiekIco.querySelector('use').setAttribute('href', cisza ? '#i-cisza' : '#i-dzwiek');
    ustawTekst(E.dzwiekTxt, cisza ? 'Cisza' : (dzwiek.tryb() === 'glos' ? 'Głos' : 'Dźwięk'));
  }

  /* 10. Zdarzenia ----------------------------------------------------------- */
  $('[data-t-start]').addEventListener('click', function () { start(0); });
  $('[data-t-kontynuuj]').addEventListener('click', function () {
    var d = wczytajPostep();
    var i = d ? d.i : 0;
    if (SEG[i].typ === 'cwiczenie' && i > 0 && (SEG[i - 1].typ === 'przygotowanie' || SEG[i - 1].typ === 'zmiana')) { i -= 1; }
    start(i);
  });
  $('[data-t-od-nowa]').addEventListener('click', function () {
    wyczyscPostep();
    $('[data-t-resume]').hidden = true;
    $('[data-t-start]').hidden = false;
    $('[data-t-start]').focus();
  });
  $$('[data-t-dzwiek]').forEach(function (b) {
    b.addEventListener('click', function () {
      dzwiek.ustaw(b.getAttribute('data-t-dzwiek'));
      $$('[data-t-dzwiek]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      rysujDzwiekBtn();
      if (dzwiek.tryb() === 'glos' && dzwiek.stan().glosPL === 'brak') { toast('Brak polskiego głosu w tym urządzeniu. Zostają sygnały.'); }
    });
  });
  E.play_btn.addEventListener('click', function () { if (stan.pauza) { wznow(); } else { pauza('przycisk'); } });
  E.dalej.addEventListener('click', function () { nastepny(); pokazUI(); });
  E.wstecz.addEventListener('click', function () { poprzedni(); pokazUI(); });
  E.gotowe.addEventListener('click', function () { nastepny(); });
  E.poziom.addEventListener('click', function () { przelaczPoziom(); pokazUI(); });
  E.dzwiekBtn.addEventListener('click', function () {
    var kolej = { sygnaly: 'glos', glos: 'cisza', cisza: 'sygnaly' };
    dzwiek.ustaw(kolej[dzwiek.tryb()] || 'sygnaly');
    dzwiek.odblokuj();
    rysujDzwiekBtn();
    pokazUI();
  });
  E.wake.addEventListener('click', function () {
    var st = ekran.stan();
    if (st.stan === 'aktywny' && !IOS_PWA_BLAD) { toast('Ekran nie zgaśnie do końca treningu. Po pauzie dłuższej niż 5 minut może już zgasnąć.'); }
    else { toast(ekran.wskazowka()); ekran.zablokuj(); }
  });
  E.zakoncz.addEventListener('click', function () { if (stan.pauza) { pokazPauze('menu'); } else { pauza('menu'); } });
  $('[data-t-wznow]').addEventListener('click', wznow);
  $('[data-t-koniec-teraz]').addEventListener('click', function () { zakoncz(true); });
  E.tap.addEventListener('click', function () {
    if (!root.classList.contains('is-kino')) { return; }
    if (root.classList.contains('show-ui')) { root.classList.remove('show-ui'); } else { pokazUI(); }
  });
  E.veil.addEventListener('click', function () { E.veil.hidden = true; wideo.graj(); });
  $('.trn-stage').addEventListener('focusin', function () { if (root.classList.contains('is-kino')) { pokazUI(); } });
  $('[data-t-powtorz]').addEventListener('click', function () { start(0); });
  $$('[data-t-ocena]').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('[data-t-ocena]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      var w = b.getAttribute('data-t-ocena');
      var msg = { lekko: 'Następnym razem wybierz trudniejsze wersje ćwiczeń albo dodaj rundę.', ok: 'Tak trzymaj: 2-3 treningi w tygodniu dają najlepszy efekt w siodle.', ciezko: 'W porządku. Weź dłuższe przerwy albo łatwiejsze wersje ćwiczeń.' }[w];
      var el = $('[data-t-ocena-msg]');
      el.textContent = msg;
      el.hidden = false;
      if (Z_PARKURU && AK.ocenOstatni) { AK.ocenOstatni(w); }
      try {
        var hist = JSON.parse(localStorage.getItem('akademia-oceny') || '[]');
        hist.push({ trening: trening.id, ocena: w, kiedy: new Date().toISOString() });
        localStorage.setItem('akademia-oceny', JSON.stringify(hist.slice(-50)));
      } catch (e) { /* tryb prywatny */ }
    });
  });

  doc.addEventListener('visibilitychange', function () {
    log('widoczność: ' + doc.visibilityState);
    if (doc.visibilityState === 'hidden') { if (stan.aktywny && !stan.pauza) { pauza('tlo'); } }
    else if (stan.aktywny) { ekran.zablokuj(); }
  });
  window.addEventListener('pagehide', function () { if (stan.aktywny) { zapiszPostep(); } });
  doc.addEventListener('keydown', function (e) {
    if (!stan.aktywny || e.altKey || e.ctrlKey || e.metaKey) { return; }
    var tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') { return; }
    if (e.key === ' ' || e.key === 'k') { e.preventDefault(); if (stan.pauza) { wznow(); } else { pauza('klawiatura'); } }
    else if (e.key === 'ArrowRight') { nastepny(); }
    else if (e.key === 'ArrowLeft') { poprzedni(); }
    else if (e.key === 'f' || e.key === 'F') { przelaczPoziom(); }
    else if (e.key === 'Escape' && stan.pauza) { wznow(); }
  });

  /* 11. Diagnostyka (?diag=1) ------------------------------------------------- */
  var diagBox = doc.querySelector('[data-t-diag]');
  function raport() {
    var v = doc.createElement('video');
    return {
      czas: new Date().toISOString(),
      urzadzenie: IOS ? 'iOS ' + (IOS_WER ? IOS_WER.join('.') : '?') : (ANDROID ? 'Android' : 'inne'),
      aplikacjaZEkranuGlownego: STANDALONE,
      przegladarka: ua,
      ekran: window.innerWidth + 'x' + window.innerHeight + ' @' + (window.devicePixelRatio || 1),
      orientacja: (screen.orientation && screen.orientation.type) || (window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'),
      uklad: widok.tryb,
      blokadaWygaszania: ekran.stan(),
      pelnyEkranApi: FS_API,
      blokadaOrientacjiApi: !!(screen.orientation && screen.orientation.lock),
      h264: v.canPlayType('video/mp4; codecs="avc1.4D401F"') || 'nie',
      hlsNatywny: v.canPlayType('application/vnd.apple.mpegurl') || 'nie',
      wideo: wideo.stan(),
      segment: (stan.i + 1) + '/' + SEG.length + ' ' + (SEG[stan.i] ? SEG[stan.i].typ : ''),
      pauza: stan.pauza,
      klatkiNaSekunde: diag.fps,
      dryfZegaraMs: stan.startData ? Math.round((teraz() - stan.startPerf) - (Date.now() - stan.startData)) : 0,
      dzwiek: dzwiek.stan(),
      tryb: { test: TEST, tempo: TEMPO },
      zdarzenia: diag.zdarzenia.slice(-25)
    };
  }
  function rysujDiag() {
    if (!diagBox || diagBox.hidden) { return; }
    var r = raport();
    var wiersze = [
      ['Urządzenie', r.urzadzenie + (r.aplikacjaZEkranuGlownego ? ', z ekranu głównego' : '')],
      ['Ekran', r.ekran + ', ' + r.orientacja],
      ['Układ', r.uklad],
      ['Wake Lock', (r.blokadaWygaszania.api ? 'jest' : 'brak') + ', ' + r.blokadaWygaszania.stan + (r.blokadaWygaszania.blad ? ' (' + r.blokadaWygaszania.blad + ')' : ''), r.blokadaWygaszania.stan === 'aktywny'],
      ['Pełny ekran', r.pelnyEkranApi ? 'jest' : 'brak (obrót CSS)'],
      ['Orientacja lock', r.blokadaOrientacjiApi ? 'jest' : 'brak'],
      ['H.264 / HLS', r.h264 + ' / ' + r.hlsNatywny, r.h264 !== 'nie'],
      ['Wideo', r.wideo.klip + ', stan ' + r.wideo.readyState + ', ' + r.wideo.czas + ' s' + (r.wideo.pauza ? ', pauza' : '') + (r.wideo.lustro ? ', lustro' : ''), r.wideo.readyState >= 2],
      ['Błędy wideo', r.wideo.bledy + (r.wideo.ostatniBlad ? ' (' + r.wideo.ostatniBlad + ')' : ''), r.wideo.bledy === 0],
      ['Segment', r.segment],
      ['Klatki/s', String(r.klatkiNaSekunde)],
      ['Dryf zegara', r.dryfZegaraMs + ' ms'],
      ['Dźwięk', r.dzwiek.tryb + ', audio ' + r.dzwiek.audio + ', głos PL: ' + r.dzwiek.glosPL]
    ];
    var dl = diagBox.querySelector('[data-t-diag-lista]');
    dl.innerHTML = '';
    wiersze.forEach(function (w) {
      var dt = doc.createElement('dt'); dt.textContent = w[0];
      var dd = doc.createElement('dd'); dd.textContent = w[1];
      if (w.length > 2) { dd.className = w[2] ? 'is-ok' : 'is-bad'; }
      dl.appendChild(dt); dl.appendChild(dd);
    });
    var ol = diagBox.querySelector('[data-t-diag-log]');
    ol.innerHTML = '';
    diag.zdarzenia.slice(-12).reverse().forEach(function (z) { var li = doc.createElement('li'); li.textContent = z; ol.appendChild(li); });
  }
  if (DIAG && diagBox) {
    var diagBtn = $('[data-t-diag-btn]');
    diagBtn.hidden = false;
    diagBtn.addEventListener('click', function () { diagBox.hidden = !diagBox.hidden; rysujDiag(); });
    diagBox.querySelector('[data-t-diag-zamknij]').addEventListener('click', function () { diagBox.hidden = true; });
    diagBox.querySelector('[data-t-diag-kopiuj]').addEventListener('click', function () {
      var tekst = JSON.stringify(raport(), null, 2);
      var out = diagBox.querySelector('[data-t-diag-out]');
      function pokazTekst() { out.hidden = false; out.value = tekst; out.focus(); out.select(); }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(tekst).then(function () { toast('Raport skopiowany. Wklej go w wiadomości.'); }).catch(pokazTekst);
      } else { pokazTekst(); }
    });
    window.setInterval(rysujDiag, 500);
    diagBox.hidden = false;
    window.__akademiaRaport = raport;
  }
  if (params.has('tempo')) { window.__akademiaRaport = raport; }

  /* Start */
  rysujStart();
  ekran.rysuj();
  aktualizujUklad();
  window.requestAnimationFrame(petla);
  log('gotowe: ' + SEG.length + ' części, ' + LICZBA_CW + ' ćwiczeń, ok. ' + Math.round(CALOSC / 60) + ' min');
})();
