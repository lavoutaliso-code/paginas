/*  medir.js — o medidor da landing da Lalá.  13/10/2026
 *
 *  O que ele responde, e que até hoje ninguém sabia:
 *    quantas pessoas abriram · de onde vieram · em que aparelho ·
 *    até onde rolaram · quanto tempo ficaram em cada seção ·
 *    quantas chegaram ao preço · quantas clicaram em comprar.
 *
 *  ⚠️ NÃO identifica ninguém: sem cookie, sem IP, sem nome. O `id` é
 *     sorteado e vive só enquanto a aba estiver aberta (sessionStorage).
 *
 *  ⚠️ O clique no botão é enviado NA HORA, não no beacon de saída: o botão
 *     abre o checkout e, em celular, a aba pode ser congelada antes de a
 *     fila de saída rodar. Clique perdido é justamente o número que importa.
 */
(function () {
  'use strict';
  var ROTA = '/api/medir';
  var SESSAO = 'lala_medida_id', VOLTOU = 'lala_ja_veio';

  function sorteia() {
    try {
      var a = new Uint8Array(9); crypto.getRandomValues(a);
      return Array.from(a).map(function (n) { return n.toString(36); }).join('').slice(0, 14);
    } catch (e) { return String(Math.random()).slice(2, 16); }
  }

  var id, retorno = false;
  try {
    id = sessionStorage.getItem(SESSAO);
    if (!id) { id = sorteia(); sessionStorage.setItem(SESSAO, id); }
    retorno = localStorage.getItem(VOLTOU) === '1';
    localStorage.setItem(VOLTOU, '1');
  } catch (e) { id = sorteia(); }

  /* robô de automação não é visita: Playwright, Puppeteer e os robôs de
     captura de tela da própria Netlify marcam navigator.webdriver. Ele continua
     MEDINDO (pra eu conseguir conferir a sonda), mas não MANDA nada. */
  var ROBO = !!navigator.webdriver;

  var t0 = Date.now();
  var seg = function () { return Math.round((Date.now() - t0) / 1000); };

  /* ── de onde veio ────────────────────────────────────────────────── */
  var q = new URLSearchParams(location.search);
  var ref = '';
  try { ref = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : ''; } catch (e) {}
  var ua = navigator.userAgent || '';
  var dentroDeApp =
    /Instagram/i.test(ua) ? 'instagram' :
    /FBAN|FBAV|FB_IAB/i.test(ua) ? 'facebook' :
    /WhatsApp/i.test(ua) ? 'whatsapp' :
    /Line\/|Twitter|TikTok/i.test(ua) ? 'outro app' : '';
  var origem =
    q.get('utm_source') ||
    (dentroDeApp || (ref ? ref : 'direto'));
  var aparelho =
    /iPhone|iPod/i.test(ua) ? 'iPhone' :
    /iPad/i.test(ua) ? 'iPad' :
    /Android/i.test(ua) ? 'Android' :
    /Macintosh/i.test(ua) ? 'Mac' :
    /Windows/i.test(ua) ? 'Windows' : 'outro';

  /* ── estado da visita ────────────────────────────────────────────── */
  var estado = {
    id: id, origem: origem, campanha: q.get('utm_campaign') || q.get('utm_content') || '',
    aparelho: aparelho, app: dentroDeApp, largura: window.innerWidth, retorno: retorno,
    rolagem: 0, segundos: 0, marcos: {}, secoes: {}, cliques: []
  };

  function manda(corpo, agora) {
    var txt = JSON.stringify(corpo);
    if (ROBO) { window.__medidaUltimo = JSON.parse(txt); return; }
    if (!agora && navigator.sendBeacon) {
      try { navigator.sendBeacon(ROTA, new Blob([txt], { type: 'application/json' })); return; } catch (e) {}
    }
    try {
      fetch(ROTA, { method: 'POST', body: txt, headers: { 'content-type': 'application/json' },
                    keepalive: true, cache: 'no-store' });
    } catch (e) {}
  }

  function marca(nome) {
    if (estado.marcos[nome] == null) estado.marcos[nome] = seg();
  }

  /* ── rolagem: 25 / 50 / 75 / 90% ─────────────────────────────────── */
  function olhaRolagem() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (h <= 0) return;
    var p = Math.min(100, Math.round(100 * (window.scrollY || 0) / h));
    if (p > estado.rolagem) estado.rolagem = p;
    if (p >= 25) marca('r25');
    if (p >= 50) marca('r50');
    if (p >= 75) marca('r75');
    if (p >= 90) marca('r90');
  }

  /* ── tempo por seção, e os marcos que importam ───────────────────── */
  var NOMES = {
    'hero': 'topo', 'lp1': 'como funciona', 'lp2': 'enquanto voce dorme',
    'lp3': 'quem sumiu', 'lp4': 'comparacao com recepcionista',
    'lp9': 'conversas reais', 'lp5': 'app e creditos', 'lp6': 'o que esta incluso',
    'lp7': 'preco', 'lpa': 'lancamento', 'lp8': 'perguntas'
  };
  function nomeDa(sec) {
    if (sec.classList.contains('bloco')) return 'passo ' + (sec.dataset.p || '?');
    if (sec.classList.contains('hero-wrap')) return 'topo';
    for (var c in NOMES) if (sec.classList.contains(c)) return NOMES[c];
    return '';
  }

  var vendo = {}; // nome -> instante em que entrou na tela
  function fecha(nome) {
    if (vendo[nome]) {
      estado.secoes[nome] = (estado.secoes[nome] || 0) + Math.round((Date.now() - vendo[nome]) / 1000);
      vendo[nome] = 0;
    }
  }

  function liga() {
    olhaRolagem();
    var passivo = { passive: true };
    var pendente = false;
    window.addEventListener('scroll', function () {
      if (pendente) return; pendente = true;
      setTimeout(function () { pendente = false; olhaRolagem(); }, 300);
    }, passivo);

    var secoes = document.querySelectorAll('section');
    if (window.IntersectionObserver) {
      var obs = new IntersectionObserver(function (itens) {
        itens.forEach(function (i) {
          var nome = nomeDa(i.target);
          if (!nome) return;
          if (i.isIntersecting) {
            if (!vendo[nome]) vendo[nome] = Date.now();
            if (nome === 'preco') marca('preco');
            if (nome === 'lancamento') marca('lancamento');
            if (nome === 'perguntas') marca('faq');
          } else fecha(nome);
        });
      }, { threshold: 0.35 });
      for (var i = 0; i < secoes.length; i++) obs.observe(secoes[i]);
    }

    /* cliques de compra — enviados na hora */
    var botoes = document.querySelectorAll('a[href*="kiwify"], .lpp a.bt, a[data-zap]');
    for (var j = 0; j < botoes.length; j++) {
      (function (a, k) {
        var nome = a.dataset.zap ? 'whatsapp'
                 : a.dataset.plano ? ('plano ' + a.dataset.plano)
                 : (a.classList.contains('cta') ? 'botao lancamento' : 'botao preco');
        try {
          if (a.dataset.plano || a.dataset.zap) throw 0;   // só o checkout recebe utm
          var u = new URL(a.href);
          u.searchParams.set('utm_source', origem);
          u.searchParams.set('utm_medium', 'landing');
          u.searchParams.set('utm_content', nome.replace(/ /g, '-'));
          u.searchParams.set('cid', id);
          a.href = u.toString();
        } catch (e) {}
        a.addEventListener('click', function () {
          estado.cliques.push({ nome: nome, t: seg(), rolagem: estado.rolagem });
          estado.segundos = seg();
          manda(estado, true);
        });
      })(botoes[j], j);
    }

    /* saída */
    function saiu() {
      for (var n in vendo) fecha(n);
      olhaRolagem();
      estado.segundos = seg();
      manda(estado, false);
    }
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') saiu();
    });
    window.addEventListener('pagehide', saiu);
  }

  window.__medida = estado; // só pra conferência; não guarda nada de ninguém

  /* a visita conta mesmo que a pessoa feche em 2 segundos */
  manda(estado, true);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', liga);
  else liga();
})();
