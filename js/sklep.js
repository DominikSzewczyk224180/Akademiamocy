/*
  Akademia Mocy Jeździeckich: zakup i konto (etap 5).
  Ekrany: koszyk, bramka płatności (symulacja BLIK), zamówienie, aktywacja vouchera, voucher do druku, konto.
  W strefie kursantki dokłada przełącznik programów i przypomnienie o końcu dostępu.

  Przepływ jak w produkcji: koszyk zakłada zamówienie ze statusem "oczekuje", bramka przyjmuje płatność
  i "powiadamia sklep" (w produkcji robi to Przelewy24 przez webhook do Django). Dopiero wtedy włącza się dostęp
  albo powstaje voucher. Strona zamówienia tylko pokazuje wynik.

  Dane: data/sklep.js (produkty, kody), js/kursantka.js (konta i dostępy).
  Zamówienia i vouchery w demo leżą w localStorage tej przeglądarki.
  Do testów: ?szybko=1 skraca oczekiwanie na potwierdzenie BLIK.
*/
(function () {
  'use strict';

  var doc = document;
  var SKLEP = window.AKADEMIA_SKLEP;
  var AK = window.AkademiaKursantka;
  var DANE = window.AKADEMIA || { programy: [] };
  if (!SKLEP || !AK) { return; }

  var params = new URLSearchParams(location.search);
  var korzen = doc.querySelector('[data-sklep]');
  var STRONA = korzen ? korzen.getAttribute('data-sklep') : '';
  var strefaEl = doc.querySelector('[data-strona]');
  var STREFA = strefaEl ? strefaEl.getAttribute('data-strona') : '';
  var SZYBKO = params.has('szybko');

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
  function link(tekst, href, klasa, ikonaId) {
    var a = el('a', klasa || 'btn btn--dark');
    a.href = href;
    if (ikonaId) { a.appendChild(ikona(ikonaId, ikonaId === 'i-play' ? 'ico--fill' : '')); }
    a.appendChild(doc.createTextNode(tekst));
    return a;
  }
  function przycisk(tekst, klasa, ikonaId) {
    var b = el('button', klasa || 'btn btn--dark');
    b.type = 'button';
    if (ikonaId) { b.appendChild(ikona(ikonaId, ikonaId === 'i-play' ? 'ico--fill' : '')); }
    b.appendChild(doc.createTextNode(tekst));
    return b;
  }
  function odmiana(n, a, b, c) {
    if (n === 1) { return a; }
    var r10 = n % 10, r100 = n % 100;
    return r10 >= 2 && r10 <= 4 && (r100 < 12 || r100 > 14) ? b : c;
  }
  function zl(n) {
    var s = (Math.round(n * 100) / 100).toFixed(2).replace('.', ',');
    if (s.slice(-3) === ',00') { s = s.slice(0, -3); }
    return s + '\u00a0zł';
  }
  function data(s, rok) { return AK.data(s, { rok: rok !== false }); }
  function wiersz(dl, nazwa, wartosc) {
    dl.appendChild(el('dt', '', nazwa));
    var dd = el('dd');
    if (typeof wartosc === 'string') { dd.textContent = wartosc; } else { dd.appendChild(wartosc); }
    dl.appendChild(dd);
  }
  var toastEl = doc.querySelector('[data-toast]');
  var toastT = null;
  function toast(t) {
    if (!toastEl) { return; }
    toastEl.textContent = t;
    toastEl.classList.add('is-visible');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('is-visible'); }, 3600);
  }
  var EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function pokazBlad(pole, komunikat, czyBlad) {
    if (pole) { pole.setAttribute('aria-invalid', czyBlad ? 'true' : 'false'); }
    if (komunikat) { komunikat.hidden = !czyBlad; }
  }
  function kopiuj(tekst, okTekst) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(tekst).then(function () { toast(okTekst); }).catch(function () { toast('Kod: ' + tekst); });
    } else { toast('Kod: ' + tekst); }
  }

  /* Dane sklepu ------------------------------------------------------------ */
  function produkt(id) { return SKLEP.produkty.filter(function (p) { return p.id === id; })[0] || null; }
  function program(id) { return (DANE.programy || []).filter(function (p) { return p.id === id; })[0] || null; }
  function programyProduktu(p, wybrany) { return p.programy === 'wszystkie' ? DANE.programy.map(function (x) { return x.id; }) : (wybrany ? [wybrany] : []); }
  function nazwaZakupu(p, programy) { return p.nazwa + (p.programy === 'wybor' && programy[0] ? ': ' + program(programy[0]).nazwa : ''); }
  function cena(p, kod) {
    var k = kod ? SKLEP.kody[kod] : null;
    var rabat = k ? Math.round(p.cena * k.procent) / 100 : 0;
    return { cena: p.cena, rabat: rabat, razem: Math.round((p.cena - rabat) * 100) / 100, kod: k ? kod : '' };
  }
  function koniecOkresu(od, miesiace) { return AK.dodajDni(AK.plusMiesiace(od, miesiace), -1); }

  var KZ = 'akademia-zamowienia';
  var KV = 'akademia-vouchery';
  function mapa(k) { try { var m = JSON.parse(localStorage.getItem(k)); return m && typeof m === 'object' ? m : {}; } catch (e) { return {}; } }
  function zapiszMape(k, m) { try { localStorage.setItem(k, JSON.stringify(m)); } catch (e) { /* tryb prywatny */ } }
  function zamowienie(nr) { return mapa(KZ)[nr] || null; }
  function zapiszZamowienie(z) { var m = mapa(KZ); m[z.nr] = z; zapiszMape(KZ, m); }
  function wszystkieZamowienia() { var m = mapa(KZ); return Object.keys(m).map(function (k) { return m[k]; }); }
  function vouchery() {
    var m = mapa(KV);
    var d = SKLEP.voucherDemo;
    if (d && !m[d.kod]) {
      var p = produkt(d.produkt);
      m[d.kod] = { kod: d.kod, produkt: p.id, nazwa: p.nazwa, programy: programyProduktu(p), miesiace: p.miesiace, dla: d.dla, od: d.od, wiadomosc: d.wiadomosc, kupiony: AK.dzis(), waznyDo: AK.plusMiesiace(AK.dzis(), SKLEP.voucherWaznosc || 12), status: 'aktywny', demo: true };
      zapiszMape(KV, m);
    }
    return m;
  }
  function zapiszVoucher(v) { var m = vouchery(); m[v.kod] = v; zapiszMape(KV, m); }
  function nowyNr() { return 'AMJ-' + AK.dzis().replace(/-/g, '') + '-' + String(Math.floor(1000 + Math.random() * 9000)); }
  var ALFABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  function nowyKod() {
    function czesc() { var s = ''; for (var i = 0; i < 4; i++) { s += ALFABET.charAt(Math.floor(Math.random() * ALFABET.length)); } return s; }
    var m = vouchery(), k;
    do { k = 'AMJ-' + czesc() + '-' + czesc(); } while (m[k]);
    return k;
  }
  function normalizujKod(s) { return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^AMJ(.{4})(.{4})$/, 'AMJ-$1-$2').replace(/^AMJDEMO2026$/, 'AMJ-DEMO-2026'); }

  /* Realizacja zamówienia: to, co w produkcji robi Django po powiadomieniu z Przelewy24 */
  function realizuj(z) {
    var p = produkt(z.produkt);
    if (z.prezent) {
      var v = { kod: nowyKod(), produkt: p.id, nazwa: nazwaZakupu(p, z.programy), programy: z.programy.slice(), miesiace: p.miesiace, dla: z.prezent.dla, od: z.prezent.od, wiadomosc: z.prezent.wiadomosc, kupiony: AK.dzis(), waznyDo: AK.plusMiesiace(AK.dzis(), SKLEP.voucherWaznosc || 12), status: 'aktywny', zamowienie: z.nr, kupujacy: z.klient.email };
      zapiszVoucher(v);
      z.voucher = v.kod;
      AK.dodajZamowienieDla(z.klient.email, z.nr);
    } else {
      var email = z.klient.email;
      var bylo = AK.istnieje(email);
      if (!bylo) { AK.zalozKonto({ imie: z.klient.imie, email: email }); z.noweKonto = true; }
      var od = AK.poczatekNowegoOkresu(email, z.programy);
      var doD = koniecOkresu(od, p.miesiace);
      AK.dodajDostepDla(email, { produkt: p.id, nazwa: nazwaZakupu(p, z.programy), programy: z.programy, od: od, do: doD, zrodlo: 'zakup', zamowienie: z.nr });
      z.dostep = { od: od, do: doD };
    }
    z.status = 'oplacone';
    z.metoda = 'BLIK';
    z.oplacono = new Date().toISOString();
    zapiszZamowienie(z);
    return z;
  }

  function aktywujVoucher(kod, dane) {
    var v = vouchery()[kod];
    if (!v || v.status !== 'aktywny') { return null; }
    var email = dane.email;
    var bylo = AK.istnieje(email);
    if (!bylo) { AK.zalozKonto({ imie: dane.imie, email: email }); }
    var od = AK.poczatekNowegoOkresu(email, v.programy);
    var doD = koniecOkresu(od, v.miesiace);
    AK.dodajDostepDla(email, { produkt: v.produkt, nazwa: v.nazwa + ' (voucher)', programy: v.programy, od: od, do: doD, zrodlo: 'voucher', voucher: kod });
    v.status = 'wykorzystany';
    v.aktywowany = AK.dzis();
    v.konto = email.toLowerCase();
    zapiszVoucher(v);
    return { voucher: v, od: od, do: doD, noweKonto: !bylo };
  }
  function sprawdzVoucher(kod) {
    var v = vouchery()[kod];
    if (!v) { return { blad: 'Nie znamy tego kodu. Sprawdź, czy nie ma w nim literówki.' }; }
    if (v.status === 'wykorzystany') { return { blad: 'Ten voucher jest już aktywowany (' + data(v.aktywowany) + ').' }; }
    if (v.waznyDo < AK.dzis()) { return { blad: 'Ten voucher był ważny do ' + data(v.waznyDo) + '.' }; }
    return { voucher: v };
  }

  function chipyProgramow(ids) {
    var ul = el('ul', 'sk-chips');
    ids.forEach(function (id) {
      var p = program(id);
      if (!p) { return; }
      var li = el('li', 'sk-chip sk-chip--' + p.kolor);
      li.appendChild(ikona(p.ikona));
      li.appendChild(doc.createTextNode(p.krotka || p.nazwa));
      ul.appendChild(li);
    });
    return ul;
  }
  function kartaVouchera(v, duza) {
    var k = el('div', 'vkarta' + (duza ? ' vkarta--duza' : ''));
    var top = el('div', 'vkarta__top');
    top.appendChild(el('span', 'vkarta__marka', 'Akademia Mocy Jeździeckich'));
    top.appendChild(el('span', 'vkarta__typ', 'Voucher'));
    k.appendChild(top);
    k.appendChild(el('p', 'vkarta__nazwa', v.nazwa));
    if (v.dla) { k.appendChild(el('p', 'vkarta__dla', 'Dla: ' + v.dla + (v.od ? ', od: ' + v.od : ''))); }
    if (v.wiadomosc) { k.appendChild(el('p', 'vkarta__msg', '„' + v.wiadomosc + '”')); }
    var kod = el('p', 'vkarta__kod');
    kod.appendChild(el('span', '', 'Kod'));
    kod.appendChild(el('strong', '', v.kod));
    k.appendChild(kod);
    k.appendChild(el('p', 'vkarta__wazny', 'Ważny do ' + data(v.waznyDo) + '. Dostęp na ' + v.miesiace + ' ' + odmiana(v.miesiace, 'miesiąc', 'miesiące', 'miesięcy') + ' od aktywacji.'));
    return k;
  }

  /* 1. Koszyk ---------------------------------------------------------------- */
  function koszyk() {
    var form = $('[data-k-form]');
    var poprzednie = params.get('nr') ? zamowienie(params.get('nr')) : null;
    if (poprzednie && poprzednie.status !== 'oczekuje') { poprzednie = null; }
    var wybor = {
      produkt: (poprzednie && poprzednie.produkt) || params.get('produkt') || 'karnet-12',
      program: (poprzednie && poprzednie.wybranyProgram) || params.get('program') || '',
      prezent: poprzednie ? !!poprzednie.prezent : params.get('prezent') === '1',
      kod: (poprzednie && poprzednie.kod) || ''
    };
    if (!produkt(wybor.produkt)) { wybor.produkt = 'karnet-12'; }
    if (wybor.program && !program(wybor.program)) { wybor.program = ''; }

    var alert = $('[data-k-alert]');
    if (params.get('anulowano') === '1') { alert.textContent = 'Płatność została przerwana. Nic nie zostało pobrane, możesz spróbować jeszcze raz.'; alert.hidden = false; }

    /* Produkty jako karty wyboru */
    var box = $('[data-k-produkty]');
    SKLEP.produkty.forEach(function (p) {
      var lab = el('label', 'kprod' + (p.polecany ? ' kprod--polecany' : ''));
      var inp = el('input'); inp.type = 'radio'; inp.name = 'produkt'; inp.value = p.id; inp.checked = p.id === wybor.produkt;
      lab.appendChild(inp);
      var tresc = el('span', 'kprod__tresc');
      var gora = el('span', 'kprod__gora');
      gora.appendChild(el('strong', 'kprod__nazwa', p.nazwa));
      gora.appendChild(el('span', 'kprod__cena', zl(p.cena)));
      tresc.appendChild(gora);
      if (p.polecany) { tresc.appendChild(el('span', 'kprod__badge', 'Najlepsza wartość')); }
      tresc.appendChild(el('span', 'kprod__opis', p.krotko + ', dostęp na ' + p.miesiace + ' ' + odmiana(p.miesiace, 'miesiąc', 'miesiące', 'miesięcy')));
      lab.appendChild(tresc);
      box.appendChild(lab);
    });
    var progBox = $('[data-k-programy]');
    DANE.programy.forEach(function (p) {
      var lab = el('label', 'opt opt--prog');
      var inp = el('input'); inp.type = 'radio'; inp.name = 'program'; inp.value = p.id; inp.checked = p.id === wybor.program;
      lab.appendChild(inp);
      lab.appendChild(el('span', '', p.nazwa));
      progBox.appendChild(lab);
    });
    if (wybor.prezent) { $('input[name="dla"][value="prezent"]', form).checked = true; }

    /* Dane: zalogowana kursantka kupuje na swoje konto */
    var imie = $('#k-imie'), email = $('#k-email');
    if (AK.zalogowana()) {
      var s = AK.stan();
      imie.value = s.imie;
      email.value = s.email;
      email.readOnly = true;
      var info = $('[data-k-konto]');
      info.textContent = 'Kupujesz na konto ' + s.imie + ' (' + s.email + '). ';
      var wyl = el('button', 'linkbtn', 'To nie Ty? Wyloguj się');
      wyl.type = 'button';
      wyl.addEventListener('click', function () { AK.wyloguj(); location.reload(); });
      info.appendChild(wyl);
      info.hidden = false;
    }
    if (poprzednie) {
      imie.value = poprzednie.klient.imie;
      email.value = poprzednie.klient.email;
      if (poprzednie.prezent) { $('#k-dla').value = poprzednie.prezent.dla || ''; $('#k-od').value = poprzednie.prezent.od || ''; $('#k-zyczenia').value = poprzednie.prezent.wiadomosc || ''; }
      if (poprzednie.faktura) { $('#k-faktura').checked = true; $('#k-firma').value = poprzednie.faktura.firma; $('#k-nip').value = poprzednie.faktura.nip; }
    }
    if (params.get('przedluz') === '1' && AK.zalogowana()) {
      var p0 = produkt(wybor.produkt);
      var od0 = AK.poczatekNowegoOkresu(AK.stan().email, programyProduktu(p0, wybor.program || AK.stan().program));
      if (od0 > AK.dzis()) {
        alert.textContent = 'Przedłużasz dostęp. Nowy okres zacznie się ' + data(od0) + ', zaraz po obecnym, więc nic nie przepada.';
        alert.hidden = false;
        alert.classList.add('koszyk__alert--info');
      }
    }

    var kodInp = $('#k-kod'), kodInfo = $('[data-k-kod-info]');
    if (wybor.kod) { kodInp.value = wybor.kod; $('[data-k-kod-box]').open = true; }
    $('[data-k-kod]').addEventListener('click', function () {
      var k = kodInp.value.trim().toUpperCase();
      if (!k) { wybor.kod = ''; kodInfo.textContent = 'W demo działa kod START10.'; rysuj(); return; }
      if (SKLEP.kody[k]) { wybor.kod = k; kodInfo.textContent = 'Kod ' + k + ': ' + SKLEP.kody[k].opis + '.'; kodInfo.classList.remove('is-bad'); }
      else { wybor.kod = ''; kodInfo.textContent = 'Nie znamy kodu ' + k + '.'; kodInfo.classList.add('is-bad'); }
      rysuj();
    });

    function stanFormularza() {
      var pid = ($('input[name="produkt"]:checked', form) || {}).value || 'karnet-12';
      wybor.produkt = pid;
      var pr = $('input[name="program"]:checked', form);
      wybor.program = pr ? pr.value : '';
      wybor.prezent = ($('input[name="dla"]:checked', form) || {}).value === 'prezent';
    }
    function rysuj() {
      stanFormularza();
      var p = produkt(wybor.produkt);
      $('[data-k-program]').hidden = p.programy !== 'wybor';
      $('[data-k-prezent]').hidden = !wybor.prezent;
      $('[data-k-zgoda-dostep]').hidden = wybor.prezent;
      $('[data-k-faktura]').hidden = !$('#k-faktura').checked;
      var programy = programyProduktu(p, wybor.program);
      var c = cena(p, wybor.kod);
      var sp = $('[data-k-sum-produkt]');
      sp.textContent = '';
      sp.appendChild(el('strong', 'ksum__nazwa', p.nazwa));
      if (programy.length) { sp.appendChild(chipyProgramow(programy)); }
      else { sp.appendChild(el('span', 'ksum__brak', 'Wybierz program')); }
      var dl = $('[data-k-sum-lista]');
      dl.textContent = '';
      if (wybor.prezent) {
        wiersz(dl, 'Forma', 'Voucher prezentowy w PDF');
        wiersz(dl, 'Dostęp', p.miesiace + ' ' + odmiana(p.miesiace, 'miesiąc', 'miesiące', 'miesięcy') + ' od aktywacji');
      } else {
        var od = EMAIL_OK.test(email.value.trim()) && programy.length ? AK.poczatekNowegoOkresu(email.value.trim(), programy) : AK.dzis();
        wiersz(dl, 'Dostęp', (od === AK.dzis() ? 'od dziś' : 'od ' + data(od, false)) + ' do ' + data(koniecOkresu(od, p.miesiace)));
      }
      wiersz(dl, 'Cena', zl(c.cena));
      if (c.rabat) { wiersz(dl, 'Rabat ' + c.kod, '\u2212' + zl(c.rabat)); }
      $('[data-k-razem]').textContent = zl(c.razem);
    }
    form.addEventListener('change', rysuj);
    email.addEventListener('input', rysuj);
    rysuj();

    /* Błąd znika, gdy pole jest już poprawne */
    var reguly = [
      [imie, '#k-imie-blad', function () { return imie.value.trim().length > 0; }],
      [email, '#k-email-blad', function () { return EMAIL_OK.test(email.value.trim()); }],
      [$('#k-nip'), '#k-nip-blad', function () { return /^\d{10}$/.test($('#k-nip').value.replace(/\D/g, '')); }],
      [$('#k-regulamin'), '#k-regulamin-blad', function () { return $('#k-regulamin').checked; }],
      [$('#k-dostep'), '#k-dostep-blad', function () { return $('#k-dostep').checked; }]
    ];
    reguly.forEach(function (r) {
      ['input', 'change'].forEach(function (typ) {
        r[0].addEventListener(typ, function () { if (r[0].getAttribute('aria-invalid') === 'true' && r[2]()) { pokazBlad(r[0], $(r[1]), false); } });
      });
    });
    $$('input[name="program"]', form).forEach(function (x) { x.addEventListener('change', function () { $('[data-k-program-blad]').hidden = true; }); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      stanFormularza();
      var p = produkt(wybor.produkt);
      var ok = true, pierwszy = null;
      function sprawdz(warunek, pole, kom) { pokazBlad(pole, kom, !warunek); if (!warunek) { ok = false; pierwszy = pierwszy || pole; } }
      if (p.programy === 'wybor') {
        var jest = !!wybor.program;
        $('[data-k-program-blad]').hidden = jest;
        if (!jest) { ok = false; pierwszy = pierwszy || $('input[name="program"]', form); }
      }
      sprawdz(imie.value.trim().length > 0, imie, $('#k-imie-blad'));
      sprawdz(EMAIL_OK.test(email.value.trim()), email, $('#k-email-blad'));
      if ($('#k-faktura').checked) { sprawdz(/^\d{10}$/.test($('#k-nip').value.replace(/\D/g, '')), $('#k-nip'), $('#k-nip-blad')); }
      sprawdz($('#k-regulamin').checked, $('#k-regulamin'), $('#k-regulamin-blad'));
      if (!wybor.prezent) { sprawdz($('#k-dostep').checked, $('#k-dostep'), $('#k-dostep-blad')); }
      if (!ok) { if (pierwszy) { pierwszy.focus(); } return; }
      var programy = programyProduktu(p, wybor.program);
      var c = cena(p, wybor.kod);
      var z = {
        nr: poprzednie ? poprzednie.nr : nowyNr(),
        utworzono: new Date().toISOString(),
        data: AK.dzis(),
        produkt: p.id, nazwa: nazwaZakupu(p, programy), programy: programy, wybranyProgram: wybor.program || null,
        cena: c.cena, rabat: c.rabat, kod: c.kod, kwota: c.razem,
        klient: { imie: imie.value.trim(), email: email.value.trim().toLowerCase() },
        prezent: wybor.prezent ? { dla: $('#k-dla').value.trim(), od: $('#k-od').value.trim() || imie.value.trim(), wiadomosc: $('#k-zyczenia').value.trim() } : null,
        faktura: $('#k-faktura').checked ? { firma: $('#k-firma').value.trim(), nip: $('#k-nip').value.replace(/\D/g, '') } : null,
        zgody: { regulamin: true, dostepOdRazu: !wybor.prezent, newsletter: $('#k-zgoda-mail').checked },
        status: 'oczekuje'
      };
      zapiszZamowienie(z);
      location.href = 'platnosc.html?nr=' + encodeURIComponent(z.nr) + (SZYBKO ? '&szybko=1' : '');
    });
  }

  /* 2. Bramka płatności: symulacja BLIK ------------------------------------- */
  function platnosc() {
    var nr = params.get('nr');
    var z = nr ? zamowienie(nr) : null;
    function ekran(nazwa) {
      $$('[data-b-ekran]').forEach(function (s) { s.hidden = s.getAttribute('data-b-ekran') !== nazwa; });
      var h = $('[data-b-ekran="' + nazwa + '"] .bramka__h, [data-b-ekran="' + nazwa + '"] .bramka__label');
      if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    }
    var anuluj = $('[data-b-anuluj]');
    if (!z) {
      $('[data-b-blad-tytul]').textContent = 'Nie ma takiego zamówienia';
      $('[data-b-blad-opis]').textContent = 'Wróć do cennika i wybierz program albo karnet jeszcze raz.';
      var pon = $('[data-b-ponow]'); pon.textContent = 'Przejdź do cennika';
      pon.addEventListener('click', function () { location.href = 'cennik.html'; });
      $('.bramka__metody').hidden = true;
      ekran('blad');
      return;
    }
    if (z.status === 'oplacone') { location.replace('zamowienie.html?nr=' + encodeURIComponent(nr)); return; }
    $('[data-b-nr]').textContent = 'Zamówienie ' + z.nr;
    $('[data-b-kwota]').textContent = zl(z.kwota);
    $('[data-b-zaplac]').textContent = 'Zapłać ' + zl(z.kwota);
    anuluj.href = 'koszyk.html?nr=' + encodeURIComponent(nr) + '&anulowano=1';
    $('[data-b-wroc-ok]').href = 'zamowienie.html?nr=' + encodeURIComponent(nr);

    $$('[data-b-metoda]').forEach(function (b) {
      b.addEventListener('click', function () {
        var m = b.getAttribute('data-b-metoda');
        var inna = $('[data-b-inna]');
        if (m === 'blik') { inna.hidden = true; return; }
        inna.textContent = m === 'przelew' ? 'W demo działa tylko BLIK. W prawdziwym sklepie tu będzie lista banków do szybkiego przelewu.' : 'W demo działa tylko BLIK. W prawdziwym sklepie tu będzie bezpieczny formularz karty z Przelewy24.';
        inna.hidden = false;
      });
    });

    var kod = $('#b-kod'), blad = $('[data-b-blad]');
    kod.addEventListener('input', function () {
      var cyfry = kod.value.replace(/\D/g, '').slice(0, 6);
      kod.value = cyfry.length > 3 ? cyfry.slice(0, 3) + ' ' + cyfry.slice(3) : cyfry;
      if (kod.getAttribute('aria-invalid') === 'true') { pokazBlad(kod, blad, false); }
    });
    var licznik = null;
    function czekaj(odrzucony) {
      ekran('czekaj');
      var start = Date.now(), CZAS = 60;
      var potwierdzenie = SZYBKO ? 400 : 3200;
      var pasek = $('[data-b-pasek]'), czas = $('[data-b-czas]');
      clearInterval(licznik);
      licznik = setInterval(function () {
        var minelo = (Date.now() - start) / 1000;
        var zostalo = Math.max(0, CZAS - Math.floor(minelo));
        czas.textContent = Math.floor(zostalo / 60) + ':' + ('0' + (zostalo % 60)).slice(-2);
        pasek.style.width = Math.min(100, minelo / (potwierdzenie / 1000) * 100) + '%';
        if (Date.now() - start >= potwierdzenie) {
          clearInterval(licznik);
          if (odrzucony) {
            $('[data-b-blad-tytul]').textContent = 'Płatność odrzucona w aplikacji banku';
            $('[data-b-blad-opis]').textContent = 'Bank nie potwierdził płatności i nic nie zostało pobrane. Wygeneruj nowy kod BLIK i spróbuj jeszcze raz.';
            ekran('blad');
          } else {
            realizuj(z);
            ekran('ok');
            setTimeout(function () { location.href = 'zamowienie.html?nr=' + encodeURIComponent(nr); }, SZYBKO ? 300 : 1600);
          }
        }
      }, 100);
    }
    $('[data-b-form]').addEventListener('submit', function (e) {
      e.preventDefault();
      var cyfry = kod.value.replace(/\D/g, '');
      if (cyfry.length !== 6) { blad.textContent = 'Kod BLIK ma 6 cyfr.'; pokazBlad(kod, blad, true); kod.focus(); return; }
      if (cyfry === SKLEP.blikDemo.bledny) { blad.textContent = 'Nieprawidłowy kod BLIK. Wygeneruj nowy kod w aplikacji banku.'; pokazBlad(kod, blad, true); kod.select(); return; }
      czekaj(cyfry === SKLEP.blikDemo.odrzucony);
    });
    $('[data-b-ponow]').addEventListener('click', function () { kod.value = ''; ekran('kod'); kod.focus(); });
    kod.focus();
  }

  /* 3. Zamówienie: wynik po płatności ---------------------------------------- */
  function zamowienieStrona() {
    var box = $('[data-z-tresc]');
    var z = zamowienie(params.get('nr') || '');
    box.textContent = '';
    if (!z) {
      $('[data-z-kroki]').hidden = true;
      var b = el('div', 'zam__pusto');
      b.appendChild(el('h1', 'page-title page-title--sklep', 'Nie znamy tego zamówienia'));
      b.appendChild(el('p', 'page-lead', 'Link mógł się skrócić albo zamówienie było w innej przeglądarce.'));
      var ak = el('div', 'zam__akcje');
      ak.appendChild(link('Przejdź do cennika', 'cennik.html'));
      ak.appendChild(link('Konto i zakupy', 'konto.html', 'btn btn--light'));
      b.appendChild(ak);
      box.appendChild(b);
      return;
    }
    if (z.status !== 'oplacone') {
      var w = el('div', 'zam__pusto');
      w.appendChild(el('h1', 'page-title page-title--sklep', 'Zamówienie czeka na płatność'));
      w.appendChild(el('p', 'page-lead', 'Płatność nie została dokończona. Możesz wrócić do niej teraz.'));
      var a2 = el('div', 'zam__akcje');
      a2.appendChild(link('Przejdź do płatności', 'platnosc.html?nr=' + encodeURIComponent(z.nr)));
      a2.appendChild(link('Wróć do koszyka', 'koszyk.html?nr=' + encodeURIComponent(z.nr), 'btn btn--light'));
      w.appendChild(a2);
      box.appendChild(w);
      $$('[data-z-kroki] li').forEach(function (li, i) { li.className = i === 0 ? 'is-done' : (i === 1 ? 'is-on' : ''); });
      return;
    }
    var zalogowanaTu = AK.zalogowana() && AK.stan().email === z.klient.email;
    var glowny = el('div', 'zam__glowny');
    var hero = el('div', 'zam__hero' + (z.prezent ? ' zam__hero--prezent' : ''));
    hero.appendChild(el('span', 'badge badge--rose zam__badge', z.prezent ? 'prezent' : 'gotowe'));
    if (z.prezent) {
      var v = vouchery()[z.voucher];
      hero.appendChild(el('h1', 'page-title page-title--sklep', 'Voucher jest gotowy'));
      hero.appendChild(el('p', 'page-lead', 'Pobierz go w PDF i wręcz albo wyślij. Osoba obdarowana aktywuje kod, kiedy zechce zacząć.'));
      if (v) {
        hero.appendChild(kartaVouchera(v, false));
        var ak3 = el('div', 'zam__akcje');
        ak3.appendChild(link('Pobierz voucher w PDF', 'voucher.html?kod=' + encodeURIComponent(v.kod), 'btn btn--dark', 'i-pobierz'));
        var kop = przycisk('Kopiuj kod', 'btn btn--light');
        kop.addEventListener('click', function () { kopiuj(v.kod, 'Kod vouchera skopiowany.'); });
        ak3.appendChild(kop);
        if (navigator.share) {
          var udo = przycisk('Wyślij', 'btn btn--light', 'i-udostepnij');
          udo.addEventListener('click', function () {
            navigator.share({ title: 'Voucher do Akademii Mocy Jeździeckich', text: 'Mam dla Ciebie voucher do Akademii Mocy Jeździeckich. Kod: ' + v.kod, url: new URL('aktywuj.html?kod=' + v.kod, location.href).href }).catch(function () { /* anulowane */ });
          });
          ak3.appendChild(udo);
        }
        hero.appendChild(ak3);
      }
    } else {
      hero.appendChild(el('h1', 'page-title page-title--sklep', z.programy.length > 1 ? 'Gotowe, programy są odblokowane' : 'Gotowe, program jest odblokowany'));
      hero.appendChild(el('p', 'page-lead', 'Dostęp ' + (z.dostep.od === z.data ? 'od dziś' : 'od ' + data(z.dostep.od, false)) + ' do ' + data(z.dostep.do) + '. Potwierdzenie wysłaliśmy na ' + z.klient.email + '.'));
      hero.appendChild(chipyProgramow(z.programy));
      var ak4 = el('div', 'zam__akcje');
      if (zalogowanaTu) {
        ak4.appendChild(link('Wejdź do strefy kursantki', 'panel.html', 'btn btn--dark', 'i-play'));
        ak4.appendChild(link('Zobacz parkur', 'mapa.html', 'btn btn--light'));
      } else {
        ak4.appendChild(link('Zaloguj się i zacznij', 'logowanie.html?email=' + encodeURIComponent(z.klient.email) + '&wroc=panel.html', 'btn btn--dark'));
        hero.appendChild(el('p', 'zam__info', 'Dostęp dopisaliśmy do konta ' + z.klient.email + '. Zaloguj się linkiem wysyłanym na ten adres.'));
      }
      hero.appendChild(ak4);
    }
    glowny.appendChild(hero);

    /* Podgląd maila: jak będzie wyglądać wiadomość z Brevo */
    var mail = el('details', 'zam__mail');
    mail.appendChild(el('summary', '', 'Podgląd maila z potwierdzeniem'));
    var m = el('div', 'mail');
    var mh = el('div', 'mail__head');
    mh.appendChild(el('span', '', 'Od: Akademia Mocy Jeździeckich'));
    mh.appendChild(el('span', '', 'Do: ' + z.klient.email));
    mh.appendChild(el('strong', '', z.prezent ? 'Twój voucher do Akademii jest gotowy' : 'Twój dostęp do Akademii jest gotowy'));
    m.appendChild(mh);
    var mb = el('div', 'mail__body');
    mb.appendChild(el('p', '', 'Cześć ' + z.klient.imie + ','));
    mb.appendChild(el('p', '', z.prezent ? 'dziękujemy za zakup vouchera „' + z.nazwa + '”. W załączniku jest PDF z kodem ' + z.voucher + ', ważnym do ' + data(vouchery()[z.voucher].waznyDo) + '.' : 'dziękujemy za zakup. „' + z.nazwa + '” jest aktywny do ' + data(z.dostep.do) + '. Pierwszy trening czeka na Twoim parkurze.'));
    var mbtn = el('span', 'mail__btn', z.prezent ? 'Pobierz voucher' : 'Zacznij pierwszy trening');
    mb.appendChild(mbtn);
    mb.appendChild(el('p', 'mail__fine', 'Logujesz się bez hasła: na stronie logowania wpisz ten adres e-mail, a wyślemy Ci link. Zamówienie ' + z.nr + ', zapłacono ' + zl(z.kwota) + ' BLIK-iem.'));
    m.appendChild(mb);
    mail.appendChild(m);
    glowny.appendChild(mail);
    box.appendChild(glowny);

    var bok = el('aside', 'zam__bok');
    bok.appendChild(el('p', 'ksum__title', 'Szczegóły zamówienia'));
    var dl = el('dl', 'ksum__lista');
    wiersz(dl, 'Numer', z.nr);
    wiersz(dl, 'Data', data(z.data));
    wiersz(dl, 'Zakup', z.nazwa + (z.prezent ? ' (voucher)' : ''));
    if (!z.prezent) { wiersz(dl, 'Dostęp', data(z.dostep.od, false) + ' do ' + data(z.dostep.do)); }
    wiersz(dl, 'Cena', zl(z.cena));
    if (z.rabat) { wiersz(dl, 'Rabat ' + z.kod, '\u2212' + zl(z.rabat)); }
    wiersz(dl, 'Zapłacono', zl(z.kwota) + ', BLIK');
    if (z.faktura) { wiersz(dl, 'Faktura', z.faktura.firma + ', NIP ' + z.faktura.nip); }
    bok.appendChild(dl);
    bok.appendChild(el('p', 'ksum__fine', 'W demo płatność jest udawana. Dokument zakupu przyjdzie mailem w wersji produkcyjnej.'));
    box.appendChild(bok);
  }

  /* 4. Aktywacja vouchera ------------------------------------------------------ */
  function aktywuj() {
    var form = $('[data-a-form]'), kodInp = $('#a-kod'), blad = $('[data-a-blad]'), krok2 = $('[data-a-krok2]');
    if (params.get('kod')) { kodInp.value = normalizujKod(params.get('kod')); }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var kod = normalizujKod(kodInp.value);
      kodInp.value = kod;
      var w = sprawdzVoucher(kod);
      if (w.blad) { blad.textContent = w.blad; pokazBlad(kodInp, blad, true); kodInp.focus(); krok2.hidden = true; return; }
      pokazBlad(kodInp, blad, false);
      form.hidden = true;
      pokazKrok2(w.voucher);
    });
    function pokazKrok2(v) {
      krok2.textContent = '';
      krok2.appendChild(kartaVouchera(v, false));
      krok2.appendChild(chipyProgramow(v.programy));
      if (AK.zalogowana()) {
        var s = AK.stan();
        krok2.appendChild(el('p', 'aktywuj__konto', 'Aktywujesz na koncie ' + s.imie + ' (' + s.email + ').'));
        var go = przycisk('Aktywuj voucher', 'btn btn--dark btn--block', 'i-play');
        go.addEventListener('click', function () { gotowe(aktywujVoucher(v.kod, { imie: s.imie, email: s.email })); });
        krok2.appendChild(go);
        var wyl = el('button', 'linkbtn', 'To nie Ty? Wyloguj się');
        wyl.type = 'button';
        wyl.addEventListener('click', function () { AK.wyloguj(); pokazKrok2(v); });
        krok2.appendChild(wyl);
      } else {
        var f = el('form', 'aktywuj__dane');
        f.noValidate = true;
        f.innerHTML = '<div class="field"><label class="field__label" for="a-imie">Imię</label><input class="input" id="a-imie" type="text" autocomplete="given-name" required><p class="field__error" id="a-imie-blad" hidden>Wpisz imię.</p></div>' +
          '<div class="field"><label class="field__label" for="a-email">E-mail</label><input class="input" id="a-email" type="email" inputmode="email" autocomplete="email" placeholder="imie@przyklad.pl" required><p class="field__hint">Na ten adres wyślemy link do logowania.</p><p class="field__error" id="a-email-blad" hidden>Wpisz poprawny adres e-mail.</p></div>' +
          '<div class="field"><label class="check" for="a-reg"><input id="a-reg" type="checkbox" required><span>Akceptuję regulamin i politykę prywatności.</span></label><p class="field__error" id="a-reg-blad" hidden>Ta zgoda jest potrzebna.</p></div>' +
          '<button class="btn btn--dark btn--block" type="submit">Aktywuj i załóż konto</button>';
        if (v.dla) { $('#a-imie', f).value = v.dla; }
        f.addEventListener('submit', function (ev) {
          ev.preventDefault();
          var im = $('#a-imie', f), em = $('#a-email', f), rg = $('#a-reg', f);
          var ok1 = im.value.trim().length > 0, ok2 = EMAIL_OK.test(em.value.trim()), ok3 = rg.checked;
          pokazBlad(im, $('#a-imie-blad', f), !ok1); pokazBlad(em, $('#a-email-blad', f), !ok2); pokazBlad(rg, $('#a-reg-blad', f), !ok3);
          if (!ok1) { im.focus(); return; }
          if (!ok2) { em.focus(); return; }
          if (!ok3) { rg.focus(); return; }
          gotowe(aktywujVoucher(v.kod, { imie: im.value.trim(), email: em.value.trim().toLowerCase() }));
        });
        krok2.appendChild(f);
        var mam = el('p', 'aktywuj__login');
        mam.appendChild(doc.createTextNode('Masz już konto? '));
        var a = el('a', 'link', 'Zaloguj się'); a.href = 'logowanie.html?wroc=' + encodeURIComponent('aktywuj.html?kod=' + v.kod);
        mam.appendChild(a);
        mam.appendChild(doc.createTextNode(' i wróć tutaj.'));
        krok2.appendChild(mam);
      }
      krok2.hidden = false;
    }
    function gotowe(w) {
      if (!w) { toast('Ten voucher nie jest już aktywny.'); return; }
      krok2.textContent = '';
      var h = el('div', 'aktywuj__ok');
      h.appendChild(el('span', 'badge badge--rose', 'gotowe'));
      h.appendChild(el('p', 'h3', 'Voucher aktywny'));
      h.appendChild(el('p', '', w.voucher.nazwa + ': dostęp od ' + data(w.od, false) + ' do ' + data(w.do) + '.'));
      h.appendChild(chipyProgramow(w.voucher.programy));
      var tu = AK.zalogowana() && AK.stan().email === w.voucher.konto;
      if (tu) { h.appendChild(link('Wejdź do strefy kursantki', 'panel.html', 'btn btn--dark btn--block', 'i-play')); }
      else {
        h.appendChild(el('p', 'zam__info', 'To konto już istniało, więc dostęp dopisaliśmy do niego. Zaloguj się linkiem wysyłanym na ' + w.voucher.konto + '.'));
        h.appendChild(link('Zaloguj się', 'logowanie.html?email=' + encodeURIComponent(w.voucher.konto) + '&wroc=panel.html', 'btn btn--dark btn--block'));
      }
      krok2.appendChild(h);
      var t = $('.p-h3, .h3', h);
      if (t) { t.setAttribute('tabindex', '-1'); t.focus(); }
    }
  }

  /* 5. Voucher do druku ------------------------------------------------------------ */
  function voucherDruk() {
    var kod = normalizujKod(params.get('kod') || '');
    var v = vouchery()[kod];
    var box = $('[data-v-karta]');
    var wroc = $('[data-v-wroc]');
    if (AK.zalogowana()) { wroc.href = 'konto.html'; } else if (v && v.zamowienie) { wroc.href = 'zamowienie.html?nr=' + encodeURIComponent(v.zamowienie); } else { wroc.href = 'index.html'; }
    if (!v) {
      box.appendChild(el('p', 'vdruk__brak', 'Nie znamy tego vouchera. Sprawdź link albo kod.'));
      $('[data-v-drukuj]').hidden = true;
      $('[data-v-kopiuj]').hidden = true;
      return;
    }
    var tpl = doc.getElementById('tpl-rozeta-mala') || doc.getElementById('tpl-rozeta-step');
    var r = el('div', 'vdruk__rozeta');
    if (tpl) { r.appendChild(tpl.content.cloneNode(true)); }
    box.appendChild(r);
    var t = el('div', 'vdruk__tresc');
    t.appendChild(el('p', 'vdruk__marka', 'Akademia Mocy Jeździeckich'));
    t.appendChild(el('p', 'vdruk__typ', 'Voucher prezentowy'));
    t.appendChild(el('h1', 'vdruk__nazwa', v.nazwa));
    if (v.dla) { t.appendChild(el('p', 'vdruk__dla', 'Dla: ' + v.dla + (v.od ? ', od: ' + v.od : ''))); }
    if (v.wiadomosc) { t.appendChild(el('p', 'vdruk__msg', '„' + v.wiadomosc + '”')); }
    var k = el('p', 'vdruk__kod');
    k.appendChild(el('span', '', 'Kod vouchera'));
    k.appendChild(el('strong', '', v.kod));
    t.appendChild(k);
    var gdzie = location.protocol === 'file:' ? 'stronę Akademii Mocy Jeździeckich, w stopce wybierz „Aktywuj voucher”,' : new URL('aktywuj.html', location.href).href.replace(/^https?:\/\//, '');
    t.appendChild(el('p', 'vdruk__jak', 'Jak aktywować: wejdź na ' + gdzie + ' i wpisz kod. Dostęp na ' + v.miesiace + ' ' + odmiana(v.miesiace, 'miesiąc', 'miesiące', 'miesięcy') + ' liczy się od aktywacji.'));
    t.appendChild(el('p', 'vdruk__wazny', 'Ważny do ' + data(v.waznyDo) + (v.demo ? '. Voucher demonstracyjny.' : '.')));
    box.appendChild(t);
    if (v.status === 'wykorzystany') { box.appendChild(el('span', 'vdruk__stempel', 'aktywowany')); }
    $('[data-v-drukuj]').addEventListener('click', function () { window.print(); });
    $('[data-v-kopiuj]').addEventListener('click', function () { kopiuj(v.kod, 'Kod vouchera skopiowany.'); });
  }

  /* 6. Konto ---------------------------------------------------------------------- */
  function konto() {
    if (!AK.zalogowana()) { return; }
    var s = AK.stan();
    var box = $('[data-ko-tresc]');
    box.textContent = '';
    function karta(tytul, klasa) {
      var c = el('section', 'kkarta' + (klasa ? ' ' + klasa : ''));
      c.appendChild(el('h2', 'kkarta__tytul', tytul));
      box.appendChild(c);
      return c;
    }

    /* Dane */
    var dane = karta('Twoje dane', 'kkarta--dane');
    var who = el('div', 'kdane');
    who.appendChild(el('span', 'sz-avatar__circle kdane__avatar', (s.imie || '?').charAt(0).toUpperCase()));
    var wt = el('div', 'kdane__txt');
    var imieEl = el('strong', '', s.imie);
    wt.appendChild(imieEl);
    wt.appendChild(el('span', '', s.email));
    who.appendChild(wt);
    var zmien = przycisk('Zmień imię', 'btn btn--light btn--sm');
    who.appendChild(zmien);
    dane.appendChild(who);
    var edycja = el('form', 'kdane__edycja');
    edycja.hidden = true;
    edycja.innerHTML = '<label class="field__label" for="ko-imie">Imię</label><div class="kdane__row"><input class="input" id="ko-imie" type="text" autocomplete="given-name"><button class="btn btn--dark btn--sm" type="submit">Zapisz</button></div>';
    dane.appendChild(edycja);
    zmien.addEventListener('click', function () { edycja.hidden = false; $('#ko-imie').value = s.imie; $('#ko-imie').focus(); });
    edycja.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = $('#ko-imie').value.trim();
      if (!v) { return; }
      AK.ustawImie(v);
      toast('Zapisane.');
      location.reload();
    });
    dane.appendChild(el('p', 'kkarta__fine', 'Logujesz się bez hasła: linkiem wysyłanym na ten adres.'));

    /* Dostęp */
    var dost = karta('Dostęp', 'kkarta--dostep');
    var dzis = AK.dzis();
    var lista = AK.dostepy().slice().sort(function (a, b) { return a.do < b.do ? 1 : -1; });
    if (!lista.length) { dost.appendChild(el('p', '', 'Nie masz jeszcze dostępu do programów.')); dost.appendChild(link('Zobacz cennik', 'cennik.html')); }
    lista.forEach(function (d) {
      var akt = d.od <= dzis && d.do >= dzis, przyszly = d.od > dzis;
      var it = el('div', 'kdost' + (akt ? '' : (przyszly ? ' kdost--przyszly' : ' kdost--wygasl')));
      var g = el('div', 'kdost__gora');
      g.appendChild(el('strong', '', d.nazwa));
      g.appendChild(el('span', 'kdost__stan', akt ? 'aktywny' : (przyszly ? 'od ' + data(d.od, false) : 'wygasł')));
      it.appendChild(g);
      it.appendChild(chipyProgramow(d.programy));
      var dni = AK.roznicaDni(dzis, d.do);
      it.appendChild(el('p', 'kdost__daty', data(d.od, false) + ' do ' + data(d.do) + (akt ? ', ' + (dni === 0 ? 'ostatni dzień' : 'zostało ' + dni + ' ' + odmiana(dni, 'dzień', 'dni', 'dni')) : '') + (d.zrodlo === 'voucher' ? ', z vouchera' : (d.zrodlo === 'demo' ? ', konto demo' : ''))));
      if (akt) {
        var calosc = Math.max(1, AK.roznicaDni(d.od, d.do));
        var pas = el('div', 'kdost__pasek');
        var fill = el('i'); fill.style.width = Math.min(100, Math.round(AK.roznicaDni(d.od, dzis) / calosc * 100)) + '%';
        pas.appendChild(fill);
        it.appendChild(pas);
      }
      if (akt || !przyszly) {
        var prod = produkt(d.produkt) ? d.produkt : 'karnet-12';
        it.appendChild(link(akt ? 'Przedłuż' : 'Kup ponownie', 'koszyk.html?produkt=' + prod + (d.programy.length === 1 ? '&program=' + d.programy[0] : '') + '&przedluz=1', 'btn btn--light btn--sm'));
      }
      dost.appendChild(it);
    });

    /* Zamówienia */
    var zam = karta('Zamówienia', 'kkarta--zam');
    var moje = wszystkieZamowienia().filter(function (z) { return z.status === 'oplacone' && (z.klient.email === s.email || (s.zamowienia || []).indexOf(z.nr) !== -1); })
      .sort(function (a, b) { return a.utworzono < b.utworzono ? 1 : -1; });
    if (!moje.length) { zam.appendChild(el('p', 'kkarta__fine', s.email === AK.demoEmail ? 'Konto demo ma karnet bez zamówienia. Kup coś w cenniku, a zamówienie pojawi się tutaj.' : 'Brak zamówień.')); }
    var ol = el('ol', 'kzam');
    moje.forEach(function (z) {
      var li = el('li', 'kzam__it');
      var a = el('a', 'kzam__link');
      a.href = 'zamowienie.html?nr=' + encodeURIComponent(z.nr);
      a.appendChild(el('strong', '', z.nazwa + (z.prezent ? ' (voucher)' : '')));
      a.appendChild(el('span', '', z.nr + ', ' + data(z.data, false)));
      li.appendChild(a);
      li.appendChild(el('span', 'kzam__kwota', zl(z.kwota)));
      ol.appendChild(li);
    });
    if (moje.length) { zam.appendChild(ol); }

    /* Vouchery */
    var vou = karta('Vouchery', 'kkarta--voucher');
    var m = vouchery();
    var mojeV = Object.keys(m).map(function (k) { return m[k]; }).filter(function (v) { return v.kupujacy === s.email || v.konto === s.email; });
    if (!mojeV.length) { vou.appendChild(el('p', 'kkarta__fine', 'Kupione i aktywowane vouchery pojawią się tutaj.')); }
    mojeV.forEach(function (v) {
      var it = el('div', 'kvou');
      var t = el('div', 'kvou__txt');
      t.appendChild(el('strong', '', v.kod));
      t.appendChild(el('span', '', v.nazwa + (v.kupujacy === s.email ? (v.dla ? ', dla: ' + v.dla : ', prezent') : ', aktywowany na tym koncie')));
      it.appendChild(t);
      it.appendChild(el('span', 'kvou__stan kvou__stan--' + v.status, v.status === 'aktywny' ? 'czeka na aktywację' : 'aktywowany'));
      it.appendChild(link('Pokaż', 'voucher.html?kod=' + encodeURIComponent(v.kod), 'btn btn--light btn--sm'));
      vou.appendChild(it);
    });
    var akt2 = el('div', 'kkarta__akcje');
    akt2.appendChild(link('Aktywuj voucher', 'aktywuj.html', 'btn btn--light btn--sm'));
    akt2.appendChild(link('Kup voucher na prezent', 'koszyk.html?produkt=karnet-12&prezent=1', 'btn btn--light btn--sm', 'i-prezent'));
    vou.appendChild(akt2);

    /* Ustawienia */
    var ust = karta('Ustawienia', 'kkarta--ust');
    ust.appendChild(el('p', 'kbox__sub', 'Cel tygodnia'));
    var cele = el('div', 'opts');
    [2, 3, 4].forEach(function (n) {
      var lab = el('label', 'opt');
      var inp = el('input'); inp.type = 'radio'; inp.name = 'cel'; inp.value = String(n); inp.checked = (s.cel || 3) === n;
      inp.addEventListener('change', function () { AK.ustaw('cel', n); toast('Cel tygodnia: ' + n + ' ' + odmiana(n, 'trening', 'treningi', 'treningów') + '.'); });
      lab.appendChild(inp);
      lab.appendChild(el('span', '', n + ' ' + odmiana(n, 'trening', 'treningi', 'treningów')));
      cele.appendChild(lab);
    });
    ust.appendChild(cele);
    var przyp = el('label', 'check');
    var pi = el('input'); pi.type = 'checkbox'; pi.checked = s.przypomnienia !== false;
    pi.addEventListener('change', function () { AK.ustaw('przypomnienia', pi.checked); toast(pi.checked ? 'Przypomnienia włączone.' : 'Przypomnienia wyłączone.'); });
    przyp.appendChild(pi);
    przyp.appendChild(el('span', '', 'Przypomnij mi mailem, gdy w tygodniu brakuje treningu do celu'));
    ust.appendChild(przyp);
    var wyl = przycisk('Wyloguj się', 'btn btn--light');
    wyl.addEventListener('click', function () { AK.wyloguj(); location.href = 'index.html'; });
    ust.appendChild(wyl);
  }

  /* 7. Dodatki w strefie: programy i przypomnienie o dostępie ---------------------- */
  function strefa() {
    if (!AK.zalogowana()) { return; }
    var s = AK.stan();
    var mam = AK.programyKonta();

    var pb = $('[data-p-programy]');
    if (pb) {
      pb.textContent = '';
      DANE.programy.forEach(function (p) {
        var ma = mam.indexOf(p.id) !== -1;
        var c = el('article', 'szp szp--' + p.kolor + (ma ? '' : ' szp--zamkniety') + (s.program === p.id ? ' is-on' : ''));
        var g = el('div', 'szp__gora');
        g.appendChild(ikona(p.ikona, 'szp__ikona'));
        g.appendChild(el('span', 'szp__stan', s.program === p.id ? 'teraz trenujesz' : (ma ? 'w Twoim dostępie' : 'bez dostępu')));
        c.appendChild(g);
        c.appendChild(el('h3', 'szp__nazwa', p.nazwa));
        var kid = AK.kursStartowy(p.id);
        if (ma && kid) {
          var po = AK.postep(kid);
          c.appendChild(el('p', 'szp__opis', AK.kurs(kid).nazwa + ': ' + po.zrobione.length + ' z ' + po.liczba + ' przeszkód'));
          var pas = el('div', 'szp__pasek'); var f = el('i'); f.style.width = po.procent + '%'; pas.appendChild(f); c.appendChild(pas);
          if (s.program !== p.id) {
            var b = przycisk('Przełącz na ten program', 'btn btn--light btn--sm');
            b.addEventListener('click', function () { AK.ustawProgram(p.id); try { sessionStorage.setItem('akademia-toast', 'Teraz trenujesz: ' + p.nazwa); } catch (e) { /* brak */ } location.reload(); });
            c.appendChild(b);
          } else {
            c.appendChild(link('Otwórz parkur', 'mapa.html', 'btn btn--dark btn--sm'));
          }
        } else {
          c.appendChild(el('p', 'szp__opis', p.krotko));
          var kup = el('div', 'szp__kup');
          kup.appendChild(link('Kup dostęp, ' + zl(produkt('program').cena), 'koszyk.html?produkt=program&program=' + p.id, 'btn btn--dark btn--sm'));
          kup.appendChild(link('albo karnet', 'koszyk.html?produkt=karnet-12', 'link'));
          c.appendChild(kup);
        }
        pb.appendChild(c);
      });
    }

    var baner = $('[data-p-dostep]');
    if (baner) {
      var k = AK.koniecDostepu(s.program);
      var pr = program(s.program);
      var tresc = null, klasa = '';
      if (!k) { tresc = 'Nie masz aktywnego dostępu do programu ' + (pr ? pr.nazwa : '') + '. Historia i rozety zostają na koncie.'; klasa = 'sz-dostep--brak'; }
      else if (k.dni <= 14) { tresc = 'Dostęp do programu ' + pr.nazwa + ' kończy się ' + (k.dni === 0 ? 'dziś' : 'za ' + k.dni + ' ' + odmiana(k.dni, 'dzień', 'dni', 'dni') + ' (' + data(k.do, false) + ')') + '. Przedłuż teraz, a nowy okres zacznie się zaraz po obecnym.'; }
      if (tresc) {
        baner.textContent = '';
        baner.className = 'sz-dostep ' + klasa;
        baner.appendChild(ikona('i-kalendarz', 'sz-dostep__ikona'));
        baner.appendChild(el('p', '', tresc));
        var dost = AK.aktywneDostepy().filter(function (x) { return x.programy.indexOf(s.program) !== -1; }).sort(function (a, b) { return a.do < b.do ? 1 : -1; })[0];
        var prod = dost && produkt(dost.produkt) ? dost.produkt : 'program';
        baner.appendChild(link(k ? 'Przedłuż dostęp' : 'Kup dostęp', 'koszyk.html?produkt=' + prod + (prod === 'program' ? '&program=' + s.program : '') + '&przedluz=1', 'btn btn--dark btn--sm'));
        baner.hidden = false;
      }
    }

    var mp = $('[data-m-programy]');
    if (mp && mam.length > 1) {
      mp.textContent = '';
      mam.forEach(function (pid) {
        var p = program(pid);
        var b = el('button', 'sz-progtab sz-progtab--' + p.kolor, p.krotka || p.nazwa);
        b.type = 'button';
        b.setAttribute('aria-pressed', s.program === pid ? 'true' : 'false');
        b.addEventListener('click', function () {
          if (s.program === pid) { return; }
          AK.ustawProgram(pid);
          location.href = 'mapa.html';
        });
        mp.appendChild(b);
      });
      mp.hidden = false;
    }
  }

  var EKRANY = { koszyk: koszyk, platnosc: platnosc, zamowienie: zamowienieStrona, aktywuj: aktywuj, voucher: voucherDruk, konto: konto };
  if (EKRANY[STRONA]) { EKRANY[STRONA](); }
  if (STREFA && STREFA !== 'logowanie') { strefa(); }

  window.AkademiaSklep = { zamowienie: zamowienie, vouchery: vouchery, realizuj: realizuj, aktywujVoucher: aktywujVoucher };
})();
