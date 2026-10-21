/*
  Akademia Mocy Jeździeckich: skrypty wspólne dla wszystkich stron demo (wersja 3).
  Każda część uruchamia się tylko wtedy, gdy na stronie są jej elementy.
  Bez bibliotek. Działa na GitHub Pages i po otwarciu pliku z dysku.
*/
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var DANE = window.AKADEMIA || { programy: [], levele: [], bloki: [] };
  var PROGRAMY = DANE.programy || [];

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function odmiana(n, jeden, dwaCztery, piec) {
    if (n === 1) { return jeden; }
    var r10 = n % 10, r100 = n % 100;
    return (r10 >= 2 && r10 <= 4 && (r100 < 12 || r100 > 14)) ? dwaCztery : piec;
  }
  function program(id) { return PROGRAMY.filter(function (p) { return p.id === id; })[0] || null; }

  /* Krótki komunikat na dole ekranu */
  var toastEl = $('[data-toast]');
  var toastTimer = null;
  function toast(wiadomosc) {
    if (!toastEl) { return; }
    toastEl.textContent = wiadomosc;
    toastEl.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toastEl.classList.remove('is-visible'); }, 3400);
  }

  /* 1. Kapsuła menu: stan po przewinięciu i arkusz na telefonie */
  var header = $('[data-header]');
  var menuBtn = $('[data-menu-btn]');
  var menu = doc.getElementById('menu');
  var drop = $('[data-drop]');
  var dropBtn = $('[data-drop-btn]');

  function ustawMenu(otwarte) {
    if (!header || !menuBtn) { return; }
    header.classList.toggle('is-open', otwarte);
    menuBtn.setAttribute('aria-expanded', otwarte ? 'true' : 'false');
    doc.body.classList.toggle('menu-open', otwarte);
    if (!otwarte) { ustawDrop(false); }
    odswiezDok();
  }
  function ustawDrop(otwarte) {
    if (!drop || !dropBtn) { return; }
    drop.classList.toggle('is-open', otwarte);
    dropBtn.setAttribute('aria-expanded', otwarte ? 'true' : 'false');
  }

  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () { ustawMenu(!header.classList.contains('is-open')); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) { ustawMenu(false); } });
    var szeroko = window.matchMedia('(min-width: 1080px)');
    if (szeroko.addEventListener) { szeroko.addEventListener('change', function (m) { if (m.matches) { ustawMenu(false); } }); }
  }
  if (dropBtn) {
    dropBtn.addEventListener('click', function () {
      var otworz = !drop.classList.contains('is-open');
      ustawDrop(otworz);
      if (otworz) { pokazPigulke(dropBtn); }
    });
    doc.addEventListener('click', function (e) {
      if (drop.classList.contains('is-open') && !e.target.closest('[data-drop]') && !header.classList.contains('is-open')) { ustawDrop(false); pokazPigulke(aktywny); }
    });
  }
  doc.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') { return; }
    if (drop && drop.classList.contains('is-open')) { ustawDrop(false); dropBtn.focus(); return; }
    if (header && header.classList.contains('is-open')) { ustawMenu(false); menuBtn.focus(); }
  });
  if (header) {
    var naScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 12); };
    window.addEventListener('scroll', naScroll, { passive: true });
    naScroll();
  }

  /* 2. Różowa pigułka: aktualna strona, widoczna sekcja albo najechany link */
  var linksBox = $('[data-menu-links]');
  var pill = $('[data-menu-pill]');
  var pozycje = $$('.menu__item');
  var aktywny = $('.menu__item[aria-current]');

  function pokazPigulke(el) {
    if (!pill || !linksBox) { return; }
    if (!el) { pill.classList.remove('is-on'); return; }
    var x = el.getBoundingClientRect().left - linksBox.getBoundingClientRect().left;
    pill.style.width = el.offsetWidth + 'px';
    pill.style.transform = 'translateX(' + x + 'px)';
    pill.classList.add('is-on');
  }
  pozycje.forEach(function (el) {
    el.addEventListener('mouseenter', function () { pokazPigulke(el); });
    el.addEventListener('focus', function () { pokazPigulke(el); });
  });
  if (linksBox) {
    linksBox.addEventListener('mouseleave', function () {
      if (!(drop && drop.classList.contains('is-open'))) { pokazPigulke(aktywny); }
    });
  }
  window.addEventListener('resize', function () { pokazPigulke(aktywny); });
  if (doc.fonts && doc.fonts.ready) { doc.fonts.ready.then(function () { pokazPigulke(aktywny); }); }
  pokazPigulke(aktywny);

  /* Na stronie głównej pigułka śledzi sekcje Programy i Jak to działa */
  var szpiedzy = pozycje.filter(function (el) { var id = el.getAttribute('data-spy'); return id && doc.getElementById(id); });
  if (szpiedzy.length && 'IntersectionObserver' in window) {
    var widoczne = {};
    var spy = new IntersectionObserver(function (wpisy) {
      wpisy.forEach(function (w) { widoczne[w.target.id] = w.isIntersecting; });
      var nowy = null;
      szpiedzy.forEach(function (el) { if (!nowy && widoczne[el.getAttribute('data-spy')]) { nowy = el; } });
      if (nowy !== aktywny) {
        szpiedzy.forEach(function (el) { el.removeAttribute('aria-current'); });
        if (nowy) { nowy.setAttribute('aria-current', 'true'); }
        aktywny = nowy;
        pokazPigulke(aktywny);
      }
    }, { rootMargin: '-40% 0px -55% 0px' });
    szpiedzy.forEach(function (el) { spy.observe(doc.getElementById(el.getAttribute('data-spy'))); });
  }

  /* 3. Linki do rzeczy, które dopiero powstaną */
  doc.addEventListener('click', function (e) {
    var el = e.target.closest('[data-demo-soon]');
    if (!el) { return; }
    e.preventDefault();
    toast(el.getAttribute('data-demo-soon') || 'Ta podstrona powstanie w kolejnym etapie.');
  });

  /* 4. Działający podgląd odtwarzacza: licznik, bloki, pion i poziom */
  (function odtwarzacz() {
    var device = $('[data-device]');
    if (!device) { return; }
    var prog = program(device.getAttribute('data-trening')) || PROGRAMY[0];
    var trening = prog && prog.trening;
    if (!trening || !trening.cwiczenia || !trening.cwiczenia.length) { return; }

    var cw = trening.cwiczenia;
    var nazwyBlokow = (DANE.bloki || []).map(function (b) { return b.nazwa; });
    var el = {
      name: $('[data-p-name]', device), timer: $('[data-p-timer]', device), cue: $('[data-p-cue]', device),
      next: $('[data-p-next]', device), block: $('[data-p-block]', device), meta: $('[data-p-meta]', device),
      bars: $$('[data-p-progress] b', device), play: $('[data-p-play]', device), icon: $('[data-p-icon]', device),
      prev: $('[data-p-prev]', device), nextBtn: $('[data-p-next-btn]', device), video: $('[data-p-video]', device)
    };
    var suma = [0, 0, 0, 0];
    cw.forEach(function (c) { suma[c.blok] += c.czas; });
    var start = cw.length > 1 ? 1 : 0;
    var stan = { i: start, zostalo: cw[start].czas, gra: true, widoczny: false };

    function mmss(s) { return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
    function male(tekst) { return tekst.charAt(0).toLowerCase() + tekst.slice(1); }
    function rysuj() {
      var c = cw[stan.i], nast = cw[(stan.i + 1) % cw.length];
      el.name.textContent = c.nazwa;
      el.timer.textContent = mmss(stan.zostalo);
      el.cue.textContent = c.wskazowka;
      el.next.textContent = 'Następne: ' + male(nast.nazwa);
      el.block.textContent = (nazwyBlokow[c.blok] || '') + ', blok ' + (c.blok + 1) + ' z 4';
      el.meta.textContent = trening.opis;
      for (var b = 0; b < 4; b++) {
        var zrobione = 0;
        for (var k = 0; k < cw.length; k++) {
          if (cw[k].blok !== b) { continue; }
          if (k < stan.i) { zrobione += cw[k].czas; }
          if (k === stan.i) { zrobione += cw[k].czas - stan.zostalo; }
        }
        var proc = suma[b] ? Math.min(100, Math.round(zrobione / suma[b] * 100)) : 0;
        if (el.bars[b]) { el.bars[b].style.setProperty('--fill', proc + '%'); }
      }
    }
    function przejdz(o) {
      stan.i = (stan.i + o + cw.length) % cw.length;
      stan.zostalo = cw[stan.i].czas;
      rysuj();
    }
    function ustawGra(gra) {
      stan.gra = gra;
      el.play.setAttribute('aria-pressed', gra ? 'true' : 'false');
      el.play.setAttribute('aria-label', gra ? 'Wstrzymaj' : 'Wznów');
      el.icon.querySelector('use').setAttribute('href', gra ? '#i-pause' : '#i-play');
      el.icon.classList.toggle('ico--fill', !gra);
    }
    el.play.addEventListener('click', function () { ustawGra(!stan.gra); });
    el.prev.addEventListener('click', function () { przejdz(-1); });
    el.nextBtn.addEventListener('click', function () { przejdz(1); });

    var ukryj = null;
    function pokazSterowanie() {
      if (!device.classList.contains('is-landscape')) { return; }
      device.classList.add('show-controls');
      window.clearTimeout(ukryj);
      ukryj = window.setTimeout(function () { device.classList.remove('show-controls'); }, 3000);
    }
    el.video.addEventListener('click', pokazSterowanie);
    device.addEventListener('focusin', pokazSterowanie);

    var seg = $('.seg');
    var przyciski = $$('[data-orient]');
    przyciski.forEach(function (b) {
      b.addEventListener('click', function () {
        var poziom = b.getAttribute('data-orient') === 'poziom';
        device.classList.toggle('is-landscape', poziom);
        device.classList.remove('show-controls');
        if (seg) { seg.classList.toggle('is-poziom', poziom); }
        przyciski.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        if (poziom) { window.setTimeout(pokazSterowanie, 800); }
      });
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (w) { stan.widoczny = w[0].isIntersecting; }, { threshold: 0.3 }).observe(device);
    } else { stan.widoczny = true; }
    rysuj();
    window.setInterval(function () {
      if (!stan.gra || !stan.widoczny) { return; }
      stan.zostalo -= 1;
      if (stan.zostalo <= 0) { przejdz(1); } else { rysuj(); }
    }, 1000);
  })();

  /* 5. Szybki formularz rozgrzewki na stronie głównej (demo: nic nie wysyła) */
  function pokazBlad(pole, komunikat, czyBlad) {
    if (pole) { pole.setAttribute('aria-invalid', czyBlad ? 'true' : 'false'); }
    if (komunikat) { komunikat.hidden = !czyBlad; }
  }
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  (function szybkiFormularz() {
    var form = $('[data-lead-form]');
    if (!form) { return; }
    var email = $('#lead-email', form), zgoda = $('#lead-zgoda', form);
    var bladEmail = $('#lead-email-blad', form), bladZgoda = $('#lead-zgoda-blad', form);
    var sukces = $('[data-lead-success]');
    email.addEventListener('input', function () { if (email.getAttribute('aria-invalid') === 'true') { pokazBlad(email, bladEmail, false); } });
    zgoda.addEventListener('change', function () { if (zgoda.checked) { pokazBlad(zgoda, bladZgoda, false); } });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var okEmail = EMAIL.test(email.value.trim()), okZgoda = zgoda.checked;
      pokazBlad(email, bladEmail, !okEmail);
      pokazBlad(zgoda, bladZgoda, !okZgoda);
      if (!okEmail) { email.focus(); return; }
      if (!okZgoda) { zgoda.focus(); return; }
      form.hidden = true;
      if (sukces) { sukces.hidden = false; sukces.focus(); }
    });
  })();

  /* 6. Pytania i odpowiedzi: wyszukiwarka i kategorie */
  (function pytania() {
    var szukaj = $('[data-faq-search]');
    if (!szukaj) { return; }
    var grupy = $$('[data-faq-group]');
    var kategorie = $$('[data-faq-cat]');
    var licznik = $('[data-faq-count]');
    var pusto = $('[data-faq-empty]');
    var kat = 'wszystkie';
    function norm(s) { return s.toLowerCase().replace(/ł/g, 'l').normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
    function filtruj() {
      var q = norm(szukaj.value.trim());
      var razem = 0;
      $$('.faq__item[data-auto]').forEach(function (item) { item.open = false; item.removeAttribute('data-auto'); });
      grupy.forEach(function (g) {
        var wKategorii = kat === 'wszystkie' || g.getAttribute('data-faq-group') === kat;
        var widoczne = 0;
        $$('.faq__item', g).forEach(function (item) {
          var ok = wKategorii && (!q || norm(item.textContent).indexOf(q) !== -1);
          item.hidden = !ok;
          if (ok) {
            widoczne += 1;
            if (q && !item.open && norm($('summary', item).textContent).indexOf(q) === -1) { item.open = true; item.setAttribute('data-auto', ''); }
          }
        });
        g.hidden = widoczne === 0;
        razem += widoczne;
      });
      licznik.textContent = 'Pokazujemy ' + razem + ' ' + odmiana(razem, 'pytanie', 'pytania', 'pytań');
      pusto.hidden = razem !== 0;
    }
    szukaj.addEventListener('input', filtruj);
    kategorie.forEach(function (b) {
      b.addEventListener('click', function () {
        kat = b.getAttribute('data-faq-cat');
        kategorie.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        filtruj();
      });
    });
    filtruj();
  })();

  /* 7. Lista chętnych: trzy kroki i dobór programu */
  (function lista() {
    var form = $('[data-wizard]');
    if (!form) { return; }
    var kroki = $$('[data-step]', form);
    var etykieta = $('[data-wizard-label]', form);
    var paski = $$('.wizard__progress i', form);
    var wstecz = $('[data-wizard-back]', form);
    var dalej = $('[data-wizard-next]', form);
    var wynikBox = $('[data-wizard-result]');
    var nazwyKrokow = ['Twoja jazda', 'Twój cel', 'Kontakt'];
    var krok = 1;

    var wybrany = null;
    try { wybrany = program(new URLSearchParams(location.search).get('program')); } catch (err) { wybrany = null; }
    var chosen = $('[data-wizard-chosen]', form);
    if (wybrany && chosen) { chosen.textContent = 'Zapisujesz się z programem: ' + wybrany.krotka; chosen.hidden = false; }

    function pokazKrok(n, ustawFokus) {
      krok = n;
      kroki.forEach(function (k) { k.hidden = Number(k.getAttribute('data-step')) !== n; });
      paski.forEach(function (p, i) { p.classList.toggle('is-on', i < n); });
      etykieta.textContent = 'Krok ' + n + ' z 3: ' + nazwyKrokow[n - 1];
      wstecz.hidden = n === 1;
      dalej.textContent = n === 3 ? 'Zapisz mnie' : 'Dalej';
      if (ustawFokus) {
        var pierwszy = $('[data-step="' + n + '"] input', form);
        if (pierwszy) { pierwszy.focus({ preventScroll: true }); }
        form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
    function sprawdzKrok(n) {
      var ok = true, pierwszyBlad = null;
      var biezacy = $('[data-step="' + n + '"]', form);
      $$('fieldset[data-required]', biezacy).forEach(function (fs) {
        var zaznaczone = $$('input:checked', fs).length > 0;
        fs.classList.toggle('has-error', !zaznaczone);
        var komunikat = $('.field__error', fs);
        if (komunikat) { komunikat.hidden = zaznaczone; }
        if (!zaznaczone) { ok = false; pierwszyBlad = pierwszyBlad || $('input', fs); }
      });
      if (n === 3) {
        var imie = $('#w-imie', form), email = $('#w-email', form), zgoda = $('#w-zgoda', form);
        var okImie = imie.value.trim().length > 0, okEmail = EMAIL.test(email.value.trim()), okZgoda = zgoda.checked;
        pokazBlad(imie, $('#w-imie-blad', form), !okImie);
        pokazBlad(email, $('#w-email-blad', form), !okEmail);
        pokazBlad(zgoda, $('#w-zgoda-blad', form), !okZgoda);
        if (!okImie) { pierwszyBlad = pierwszyBlad || imie; ok = false; }
        if (!okEmail) { pierwszyBlad = pierwszyBlad || email; ok = false; }
        if (!okZgoda) { pierwszyBlad = pierwszyBlad || zgoda; ok = false; }
      }
      if (pierwszyBlad) { pierwszyBlad.focus(); }
      return ok;
    }
    form.addEventListener('change', function (e) {
      var fs = e.target.closest('fieldset[data-required]');
      if (fs && $$('input:checked', fs).length) { fs.classList.remove('has-error'); var k = $('.field__error', fs); if (k) { k.hidden = true; } }
    });

    function wartosc(nazwa) { var x = $('input[name="' + nazwa + '"]:checked', form); return x ? x.value : ''; }
    function wartosci(nazwa) { return $$('input[name="' + nazwa + '"]:checked', form).map(function (x) { return x.value; }); }
    function lacz(lista) { return lista.length < 2 ? lista.join('') : lista.slice(0, -1).join(', ') + ' i ' + lista[lista.length - 1]; }

    function dobierz() {
      var wynik = { 'ogolny': 0, 'gimnastyka': 0, 'ranne-moce': 0 };
      var powody = { 'ogolny': [], 'gimnastyka': [], 'ranne-moce': [] };
      var mapa = {
        lydka: ['ogolny', 2, 'stabilność łydki i półsiad'],
        kondycja: ['ogolny', 2, 'kondycję'],
        core: ['ogolny', 1, 'równowagę i pracę tułowia'],
        symetria: ['gimnastyka', 2, 'symetrię dosiadu'],
        biodra: ['gimnastyka', 2, 'ruchomość bioder'],
        plecy: ['gimnastyka', 1, 'komfort pleców']
      };
      var cele = wartosci('cel'), czas = wartosc('czas'), styl = wartosc('styl'), czest = wartosc('czestotliwosc');
      cele.forEach(function (c) {
        var m = mapa[c];
        if (!m) { return; }
        wynik[m[0]] += m[1];
        powody[m[0]].push(m[2]);
        if (c === 'core') { wynik.gimnastyka += 1; powody.gimnastyka.push(m[2]); }
        if (c === 'plecy') { wynik['ranne-moce'] += 1; powody['ranne-moce'].push(m[2]); }
      });
      if (czas === 'krotko') { wynik['ranne-moce'] += 3; }
      if (czas === 'dlugo') { wynik.ogolny += 1; }
      if (styl === 'sport') { wynik.ogolny += 1; }
      if (czest === 'rzadko') { wynik['ranne-moce'] += 1; }

      var kolejnosc = ['gimnastyka', 'ogolny', 'ranne-moce'];
      var najlepszy = kolejnosc.reduce(function (a, b) { return wynik[b] > wynik[a] ? b : a; });
      if (wybrany) { najlepszy = wybrany.id; }

      var czesci = [];
      if (najlepszy === 'ranne-moce' && czas === 'krotko') { czesci.push('masz na trening 10-15 minut'); }
      if (powody[najlepszy].length) { czesci.push('chcesz poprawić ' + lacz(powody[najlepszy])); }
      var dlaczego = czesci.length ? 'Pasuje, bo ' + czesci.join(' i ') + '.' : 'Dobry start na Twój poziom i ilość czasu.';
      if (wybrany) { dlaczego = 'Ten program wybrano na jego stronie. ' + (czesci.length ? 'Dobrze pasuje, bo ' + czesci.join(' i ') + '.' : ''); }
      return {
        p: program(najlepszy),
        level: styl === 'sport' ? 'Level Stęp, a po teście wejściowym możesz zacząć od Kłusa' : 'Level Stęp',
        dlaczego: dlaczego
      };
    }

    function pokazWynik() {
      var imie = $('#w-imie', form).value.trim(), email = $('#w-email', form).value.trim();
      var r = dobierz();
      $('[data-r-title]', wynikBox).textContent = 'Jesteś na liście, ' + imie;
      $('[data-r-mail]', wynikBox).textContent = 'Rozgrzewka przed jazdą już leci na ' + email + '. W wersji demo nic nie wysyłamy.';
      var karta = $('[data-r-card]', wynikBox);
      if (r.p) {
        karta.className = 'rec rec--' + (r.p.kolor || 'pink');
        karta.setAttribute('href', 'program-' + r.p.id + '.html');
        $('[data-r-name]', karta).textContent = r.p.nazwa;
      }
      $('[data-r-level]', karta).textContent = r.level;
      $('[data-r-why]', karta).textContent = r.dlaczego;
      form.hidden = true;
      wynikBox.hidden = false;
      wynikBox.focus();
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!sprawdzKrok(krok)) { return; }
      if (krok < 3) { pokazKrok(krok + 1, true); } else { pokazWynik(); }
    });
    wstecz.addEventListener('click', function () { pokazKrok(krok - 1, true); });
    $('[data-wizard-restart]', wynikBox).addEventListener('click', function () {
      form.reset();
      $$('[aria-invalid]', form).forEach(function (x) { x.setAttribute('aria-invalid', 'false'); });
      $$('.field__error', form).forEach(function (x) { x.hidden = true; });
      $$('.has-error', form).forEach(function (x) { x.classList.remove('has-error'); });
      wynikBox.hidden = true;
      form.hidden = false;
      pokazKrok(1, true);
    });
    pokazKrok(1, false);
  })();

  /* 8. Dok na telefonie: rozgrzewka pod kciukiem. Znika przy formularzach i w menu. */
  var dock = $('[data-dock]');
  var poHero = false, przyFormularzu = false;
  function odswiezDok() {
    if (!dock) { return; }
    var menuOtwarte = header && header.classList.contains('is-open');
    dock.classList.toggle('is-visible', poHero && !przyFormularzu && !menuOtwarte);
  }
  if (dock && doc.body.classList.contains('strona-lista')) {
    dock.hidden = true;
  } else if (dock && 'IntersectionObserver' in window) {
    var heroEl = $('.hero, .page-hero, .prog-hero');
    var formEl = doc.getElementById('rozgrzewka');
    if (heroEl) { new IntersectionObserver(function (w) { poHero = !w[0].isIntersecting; odswiezDok(); }, { threshold: 0 }).observe(heroEl); }
    if (formEl) { new IntersectionObserver(function (w) { przyFormularzu = w[0].isIntersecting; odswiezDok(); }, { threshold: 0.15 }).observe(formEl); }
  }

  /* 9. Demo: wariant krojów (A: Instrument Sans, B: Familjen Grotesk) */
  var fontBtns = $$('[data-fonty-set]');
  function ustawFonty(w, zapisz) {
    if (w === 'b') { root.setAttribute('data-fonty', 'b'); } else { root.removeAttribute('data-fonty'); }
    fontBtns.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-fonty-set') === w ? 'true' : 'false'); });
    if (zapisz) { try { localStorage.setItem('akademia-fonty', w); } catch (err) { /* tryb prywatny */ } }
    pokazPigulke(aktywny);
  }
  ustawFonty(root.getAttribute('data-fonty') === 'b' ? 'b' : 'a', false);
  fontBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var w = b.getAttribute('data-fonty-set');
      ustawFonty(w, true);
      toast(w === 'b' ? 'Kroje: wariant B, Familjen Grotesk' : 'Kroje: wariant A, Instrument Sans');
    });
  });

  /* 10. Rok w stopce */
  $$('[data-rok]').forEach(function (n) { n.textContent = String(new Date().getFullYear()); });
})();
