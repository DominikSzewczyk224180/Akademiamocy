/*
  Akademia Mocy Jeździeckich: skrypty strony głównej (etap 1 demo).
  Bez bibliotek. Działa na GitHub Pages i po otwarciu pliku z dysku.
*/
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var DANE = window.AKADEMIA || { programy: [], levele: [] };

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

  /* 1. Menu na telefonie */
  var header = doc.querySelector('[data-header]');
  var navToggle = doc.querySelector('[data-nav-toggle]');
  var nav = doc.getElementById('nawigacja');

  function ustawMenu(otwarte) {
    if (!header || !navToggle) { return; }
    header.classList.toggle('is-open', otwarte);
    navToggle.setAttribute('aria-expanded', otwarte ? 'true' : 'false');
    doc.body.classList.toggle('menu-open', otwarte);
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      ustawMenu(!header.classList.contains('is-open'));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { ustawMenu(false); }
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('is-open')) {
        ustawMenu(false);
        navToggle.focus();
      }
    });
    var szeroki = window.matchMedia('(min-width: 1040px)');
    var naZmiane = function (m) { if (m.matches) { ustawMenu(false); } };
    if (szeroki.addEventListener) { szeroki.addEventListener('change', naZmiane); }
  }

  /* 2. Delikatna linia pod nagłówkiem po przewinięciu */
  if (header) {
    var naScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', naScroll, { passive: true });
    naScroll();
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
        '<article class="program program--' + esc(p.id) + '">' +
          '<div class="program__window" aria-hidden="true">' +
            '<svg class="program__icon"><use href="#' + esc(p.ikona) + '"></use></svg>' +
          '</div>' +
          '<div class="program__body">' +
            '<h3 class="h3 program__name">' + txt(p.nazwa) + '</h3>' +
            '<p class="program__text">' + txt(p.krotko) + '</p>' +
            '<ul class="program__meta">' +
              '<li><svg class="ico"><use href="#i-zegar"></use></svg>' + txt(p.czas) + '</li>' +
              '<li><svg class="ico"><use href="#i-kalendarz"></use></svg>' + txt(p.czestotliwosc) + '</li>' +
            '</ul>' +
            '<ul class="program__levels" aria-label="Levele programu">' + chipy + '</ul>' +
            '<a class="link program__link" href="#" data-demo-soon="Strona programu powstanie w następnym etapie demo.">Zobacz program</a>' +
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

  /* 5. Formularz darmowej rozgrzewki (demo: nic nie wysyła) */
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
    zgoda.addEventListener('change', function () {
      if (zgoda.checked) { pokazBlad(zgoda, bladZgoda, false); }
    });

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

  /* 6. Demo: przełącznik krojów nagłówków (A: Fraunces, B: Bodoni Moda) */
  var fontBtn = doc.querySelector('[data-font-switch]');
  function ustawFonty(wariant, zapisz) {
    if (wariant === 'b') { root.setAttribute('data-fonty', 'b'); } else { root.removeAttribute('data-fonty'); }
    if (fontBtn) {
      fontBtn.setAttribute('aria-pressed', wariant === 'b' ? 'true' : 'false');
      var etykieta = fontBtn.querySelector('[data-font-label]');
      if (etykieta) { etykieta.textContent = wariant === 'b' ? 'B' : 'A'; }
    }
    if (zapisz) {
      try { localStorage.setItem('akademia-fonty', wariant); } catch (err) { /* tryb prywatny: bez zapisu */ }
    }
  }
  ustawFonty(root.getAttribute('data-fonty') === 'b' ? 'b' : 'a', false);
  if (fontBtn) {
    fontBtn.addEventListener('click', function () {
      var nowy = root.getAttribute('data-fonty') === 'b' ? 'a' : 'b';
      ustawFonty(nowy, true);
      toast(nowy === 'b' ? 'Nagłówki: wariant B, Bodoni Moda' : 'Nagłówki: wariant A, Fraunces');
    });
  }

  /* 7. Rok w stopce */
  doc.querySelectorAll('[data-rok]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
})();
