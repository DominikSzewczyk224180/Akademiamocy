/*
  Akademia Mocy Jeździeckich: skrypty strony głównej (etap 1 demo, wersja 2).
  Bez bibliotek. Działa na GitHub Pages i po otwarciu pliku z dysku.
*/
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var DANE = window.AKADEMIA || { programy: [], levele: [] };
  var mniejRuchu = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function esc(tekst) {
    return String(tekst).replace(/[&<>"']/g, function (z) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[z];
    });
  }
  /* Polska typografia: twarda spacja po jednoliterowych słowach i między liczbą a jednostką */
  function typo(tekst) {
    return String(tekst)
      .replace(/(^|[\s(])([aiouwzAIOUWZ])\s+/g, '$1$2\u00a0')
      .replace(/(\d)\s+(min|minut|zł|razy)/g, '$1\u00a0$2');
  }
  function txt(tekst) { return esc(typo(tekst)); }

  /* Krótki komunikat na dole ekranu */
  var toastEl = doc.querySelector('[data-toast]');
  var toastTimer = null;
  function toast(wiadomosc) {
    if (!toastEl) { return; }
    toastEl.textContent = wiadomosc;
    toastEl.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toastEl.classList.remove('is-visible'); }, 3400);
  }

  /* 1. Kapsuła menu: stan po przewinięciu, arkusz na telefonie */
  var header = doc.querySelector('[data-header]');
  var menuBtn = doc.querySelector('[data-menu-btn]');
  var menu = doc.getElementById('menu');

  function ustawMenu(otwarte) {
    if (!header || !menuBtn) { return; }
    header.classList.toggle('is-open', otwarte);
    menuBtn.setAttribute('aria-expanded', otwarte ? 'true' : 'false');
    doc.body.classList.toggle('menu-open', otwarte);
    odswiezDok();
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () { ustawMenu(!header.classList.contains('is-open')); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) { ustawMenu(false); } });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('is-open')) { ustawMenu(false); menuBtn.focus(); }
    });
    var szeroko = window.matchMedia('(min-width: 1080px)');
    if (szeroko.addEventListener) { szeroko.addEventListener('change', function (m) { if (m.matches) { ustawMenu(false); } }); }
  }
  if (header) {
    var naScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 12); };
    window.addEventListener('scroll', naScroll, { passive: true });
    naScroll();
  }

  /* 2. Różowa pigułka pod linkiem: najechany albo aktywna sekcja */
  var linksBox = doc.querySelector('[data-menu-links]');
  var pill = doc.querySelector('[data-menu-pill]');
  var spyLinks = Array.prototype.slice.call(doc.querySelectorAll('[data-spy]'));
  var aktywny = null;

  function pokazPigulke(link) {
    if (!pill || !linksBox) { return; }
    if (!link) { pill.classList.remove('is-on'); return; }
    pill.style.width = link.offsetWidth + 'px';
    pill.style.transform = 'translateX(' + link.offsetLeft + 'px)';
    pill.classList.add('is-on');
  }
  spyLinks.forEach(function (a) {
    a.addEventListener('mouseenter', function () { pokazPigulke(a); });
    a.addEventListener('focus', function () { pokazPigulke(a); });
  });
  if (linksBox) {
    linksBox.addEventListener('mouseleave', function () { pokazPigulke(aktywny); });
  }
  window.addEventListener('resize', function () { pokazPigulke(aktywny); });

  if ('IntersectionObserver' in window && spyLinks.length) {
    var widoczne = {};
    var spy = new IntersectionObserver(function (wpisy) {
      wpisy.forEach(function (w) { widoczne[w.target.id] = w.isIntersecting; });
      var nowy = null;
      spyLinks.forEach(function (a) {
        var id = a.getAttribute('href').slice(1);
        if (!nowy && widoczne[id]) { nowy = a; }
      });
      if (nowy !== aktywny) {
        spyLinks.forEach(function (a) { a.removeAttribute('aria-current'); });
        if (nowy) { nowy.setAttribute('aria-current', 'true'); }
        aktywny = nowy;
        pokazPigulke(aktywny);
      }
    }, { rootMargin: '-40% 0px -55% 0px' });
    spyLinks.forEach(function (a) {
      var cel = doc.getElementById(a.getAttribute('href').slice(1));
      if (cel) { spy.observe(cel); }
    });
  }

  /* 3. Karty programów z data/programs.js */
  (function renderujProgramy() {
    var lista = doc.querySelector('[data-programy]');
    if (!lista || !DANE.programy || !DANE.programy.length) { return; }
    var levele = {};
    (DANE.levele || []).forEach(function (l) { levele[l.id] = l; });

    lista.innerHTML = DANE.programy.map(function (p) {
      var chipy = (p.levele || []).map(function (id) {
        var l = levele[id];
        if (!l) { return ''; }
        var wkrotce = !l.dostepny;
        return '<li class="level-chip level-chip--' + esc(id) + (wkrotce ? ' level-chip--soon' : '') + '">' +
          '<span class="level-chip__dot" aria-hidden="true"></span>' + esc(l.nazwa) + (wkrotce ? ', wkrótce' : '') + '</li>';
      }).join('');
      return '' +
        '<article class="prog prog--' + esc(p.kolor || 'pink') + '">' +
          '<div class="prog__top">' +
            '<svg class="prog__icon" aria-hidden="true"><use href="#' + esc(p.ikona) + '"></use></svg>' +
            '<span class="prog__time">' + txt(p.czas) + '</span>' +
          '</div>' +
          '<div class="prog__body">' +
            '<h3 class="prog__name">' + txt(p.nazwa) + '</h3>' +
            '<p class="prog__text">' + txt(p.krotko) + '</p>' +
            '<ul class="prog__levels" aria-label="Levele programu">' + chipy + '</ul>' +
            '<div class="prog__foot"><span>' + txt(p.czestotliwosc) + '</span>' +
              '<a class="link" href="#" data-demo-soon="Strona programu powstanie w następnym etapie demo.">Zobacz program</a></div>' +
          '</div>' +
        '</article>';
    }).join('');
  })();

  /* 4. Linki do podstron, które dopiero powstaną */
  doc.addEventListener('click', function (e) {
    var el = e.target.closest('[data-demo-soon]');
    if (!el) { return; }
    e.preventDefault();
    toast(el.getAttribute('data-demo-soon') || 'Ta podstrona powstanie w kolejnym etapie.');
  });

  /* 5. Działający podgląd odtwarzacza: licznik, bloki, pion i poziom */
  (function odtwarzacz() {
    var device = doc.querySelector('[data-device]');
    var trening = DANE.przykladowyTrening;
    if (!device || !trening || !trening.cwiczenia || !trening.cwiczenia.length) { return; }

    var cw = trening.cwiczenia;
    var nazwyBlokow = (DANE.bloki || []).map(function (b) { return b.nazwa; });
    var el = {
      name: device.querySelector('[data-p-name]'),
      timer: device.querySelector('[data-p-timer]'),
      cue: device.querySelector('[data-p-cue]'),
      next: device.querySelector('[data-p-next]'),
      block: device.querySelector('[data-p-block]'),
      meta: device.querySelector('[data-p-meta]'),
      bars: device.querySelectorAll('[data-p-progress] b'),
      play: device.querySelector('[data-p-play]'),
      icon: device.querySelector('[data-p-icon]'),
      prev: device.querySelector('[data-p-prev]'),
      nextBtn: device.querySelector('[data-p-next-btn]'),
      video: device.querySelector('[data-p-video]')
    };
    var sumaBloku = [0, 0, 0, 0];
    cw.forEach(function (c) { sumaBloku[c.blok] += c.czas; });

    var stan = { i: 1, zostalo: cw[1].czas, gra: true, widoczny: false };
    var zegar = null;

    function mmss(s) { return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
    function maleLitery(t) { return t.charAt(0).toLowerCase() + t.slice(1); }

    function rysuj() {
      var c = cw[stan.i];
      var nast = cw[(stan.i + 1) % cw.length];
      el.name.textContent = c.nazwa;
      el.timer.textContent = mmss(stan.zostalo);
      el.cue.textContent = c.wskazowka;
      el.next.textContent = 'Następne: ' + maleLitery(nast.nazwa);
      el.block.textContent = (nazwyBlokow[c.blok] || '') + ', blok ' + (c.blok + 1) + ' z 4';
      if (el.meta) { el.meta.textContent = trening.opis; }
      for (var b = 0; b < 4; b++) {
        var zrobione = 0;
        for (var k = 0; k < cw.length; k++) {
          if (cw[k].blok !== b) { continue; }
          if (k < stan.i) { zrobione += cw[k].czas; }
          if (k === stan.i) { zrobione += cw[k].czas - stan.zostalo; }
        }
        var proc = sumaBloku[b] ? Math.min(100, Math.round(zrobione / sumaBloku[b] * 100)) : 0;
        if (el.bars[b]) { el.bars[b].style.setProperty('--fill', proc + '%'); }
      }
    }
    function przejdz(o) {
      stan.i = (stan.i + o + cw.length) % cw.length;
      if (stan.i === 0 && o > 0) { /* nowe okrążenie: zerujemy pasek */ }
      stan.zostalo = cw[stan.i].czas;
      rysuj();
    }
    function tik() {
      if (!stan.gra || !stan.widoczny) { return; }
      stan.zostalo -= 1;
      if (stan.zostalo <= 0) { przejdz(1); } else { rysuj(); }
    }
    function ustawGra(gra) {
      stan.gra = gra;
      el.play.setAttribute('aria-pressed', gra ? 'true' : 'false');
      el.play.setAttribute('aria-label', gra ? 'Wstrzymaj' : 'Wznów');
      var u = el.icon.querySelector('use');
      u.setAttribute('href', gra ? '#i-pause' : '#i-play');
      el.icon.classList.toggle('ico--fill', !gra);
    }

    el.play.addEventListener('click', function () { ustawGra(!stan.gra); });
    el.prev.addEventListener('click', function () { przejdz(-1); });
    el.nextBtn.addEventListener('click', function () { przejdz(1); });

    /* W poziomie sterowanie chowa się i wraca po dotknięciu, jak w docelowej aplikacji */
    var ukryj = null;
    function pokazSterowanie() {
      if (!device.classList.contains('is-landscape')) { return; }
      device.classList.add('show-controls');
      window.clearTimeout(ukryj);
      ukryj = window.setTimeout(function () { device.classList.remove('show-controls'); }, 3000);
    }
    el.video.addEventListener('click', pokazSterowanie);
    device.addEventListener('focusin', pokazSterowanie);

    var seg = doc.querySelector('.seg');
    var przyciski = doc.querySelectorAll('[data-orient]');
    Array.prototype.forEach.call(przyciski, function (b) {
      b.addEventListener('click', function () {
        var poziom = b.getAttribute('data-orient') === 'poziom';
        device.classList.toggle('is-landscape', poziom);
        device.classList.remove('show-controls');
        if (seg) { seg.classList.toggle('is-poziom', poziom); }
        Array.prototype.forEach.call(przyciski, function (x) {
          x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
        });
        if (poziom) { window.setTimeout(pokazSterowanie, 800); }
      });
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (w) { stan.widoczny = w[0].isIntersecting; }, { threshold: 0.3 }).observe(device);
    } else {
      stan.widoczny = true;
    }
    rysuj();
    zegar = window.setInterval(tik, 1000);
  })();

  /* 6. Formularz darmowej rozgrzewki (demo: nic nie wysyła) */
  var form = doc.querySelector('[data-lead-form]');
  if (form) {
    var email = form.querySelector('#lead-email');
    var zgoda = form.querySelector('#lead-zgoda');
    var bladEmail = form.querySelector('#lead-email-blad');
    var bladZgoda = form.querySelector('#lead-zgoda-blad');
    var sukces = doc.querySelector('[data-lead-success]');
    var pokazBlad = function (pole, komunikat, czyBlad) {
      pole.setAttribute('aria-invalid', czyBlad ? 'true' : 'false');
      komunikat.hidden = !czyBlad;
    };
    email.addEventListener('input', function () {
      if (email.getAttribute('aria-invalid') === 'true') { pokazBlad(email, bladEmail, false); }
    });
    zgoda.addEventListener('change', function () { if (zgoda.checked) { pokazBlad(zgoda, bladZgoda, false); } });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());
      var okZgoda = zgoda.checked;
      pokazBlad(email, bladEmail, !okEmail);
      pokazBlad(zgoda, bladZgoda, !okZgoda);
      if (!okEmail) { email.focus(); return; }
      if (!okZgoda) { zgoda.focus(); return; }
      form.hidden = true;
      if (sukces) { sukces.hidden = false; sukces.focus(); }
    });
  }

  /* 7. Dok na telefonie: rozgrzewka pod kciukiem, znika przy formularzu i w menu */
  var dock = doc.querySelector('[data-dock]');
  var poHero = false;
  var przyFormularzu = false;
  function odswiezDok() {
    if (!dock) { return; }
    var menuOtwarte = header && header.classList.contains('is-open');
    dock.classList.toggle('is-visible', poHero && !przyFormularzu && !menuOtwarte);
  }
  if (dock && 'IntersectionObserver' in window) {
    var hero = doc.getElementById('top');
    var rozgrzewka = doc.getElementById('rozgrzewka');
    if (hero) {
      new IntersectionObserver(function (w) { poHero = !w[0].isIntersecting; odswiezDok(); }, { threshold: 0 }).observe(hero);
    }
    if (rozgrzewka) {
      new IntersectionObserver(function (w) { przyFormularzu = w[0].isIntersecting; odswiezDok(); }, { threshold: 0.15 }).observe(rozgrzewka);
    }
  }

  /* 8. Demo: wariant krojów (A: Instrument Sans, B: Familjen Grotesk) */
  var fontBtns = doc.querySelectorAll('[data-fonty-set]');
  function ustawFonty(w, zapisz) {
    if (w === 'b') { root.setAttribute('data-fonty', 'b'); } else { root.removeAttribute('data-fonty'); }
    Array.prototype.forEach.call(fontBtns, function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-fonty-set') === w ? 'true' : 'false');
    });
    if (zapisz) { try { localStorage.setItem('akademia-fonty', w); } catch (err) { /* tryb prywatny */ } }
    pokazPigulke(aktywny);
  }
  ustawFonty(root.getAttribute('data-fonty') === 'b' ? 'b' : 'a', false);
  Array.prototype.forEach.call(fontBtns, function (b) {
    b.addEventListener('click', function () {
      var w = b.getAttribute('data-fonty-set');
      ustawFonty(w, true);
      toast(w === 'b' ? 'Kroje: wariant B, Familjen Grotesk' : 'Kroje: wariant A, Instrument Sans');
    });
  });

  /* 9. Rok w stopce */
  doc.querySelectorAll('[data-rok]').forEach(function (n) { n.textContent = String(new Date().getFullYear()); });

  if (mniejRuchu) { root.classList.add('mniej-ruchu'); }
})();
