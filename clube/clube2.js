/* ══════════════════════════════════════════════════════════════════════
   O cronômetro e o CARROSSEL de conversas. Os quatro mockups puxam daqui
   para que o conteúdo seja idêntico e a escolha dela seja só do desenho.
   ══════════════════════════════════════════════════════════════════════ */

/* ── 1 · o cronômetro: hoje às 17:00 no horário de BRASÍLIA ────────── */
const FUSO = 'America/Sao_Paulo', HORA_AULA = 17;

function segundosEmBrasilia(){
  const p = new Intl.DateTimeFormat('en-CA', {
    timeZone: FUSO, hour12:false, hour:'2-digit', minute:'2-digit', second:'2-digit',
  }).formatToParts(new Date());
  const v = {}; for (const i of p) v[i.type] = i.value;
  return ((v.hour === '24' ? 0 : +v.hour))*3600 + (+v.minute)*60 + (+v.second);
}
const dois = n => String(n).padStart(2, '0');

function ligaRelogio(){
  const hh = document.getElementById('hh');
  if (!hh) return;
  const mm = document.getElementById('mm'), ss = document.getElementById('ss');
  const tique = () => {
    const falta = HORA_AULA*3600 - segundosEmBrasilia();
    if (falta <= 0){
      hh.textContent = mm.textContent = ss.textContent = '00';
      document.querySelectorAll('[data-sob]').forEach(e => e.innerHTML = 'a aula de hoje <b>já começou</b>');
      document.querySelectorAll('[data-chamada]').forEach(e => e.textContent = 'Ao vivo agora');
      document.querySelectorAll('[data-bt]').forEach(e => e.textContent = 'Entrar agora no clube');
      return;
    }
    hh.textContent = dois(Math.floor(falta/3600));
    mm.textContent = dois(Math.floor(falta%3600/60));
    ss.textContent = dois(falta%60);
  };
  tique(); setInterval(tique, 1000);
}

/* ── 2 · as CINCO conversas do carrossel ───────────────────────────── */
const CHECK = '<svg viewBox="0 0 24 24"><path d="M2 13.2l3.6 3.4L13 8.6"/><path d="M10.4 16.6L17.8 8.6"/></svg>';
const PLAY  = '<svg viewBox="0 0 24 24"><path d="M7 4.5l13 7.5L7 19.5z"/></svg>';
const onda  = () => `<span class="onda">${Array.from({length:22},(_,i)=>
  `<i style="height:${[5,9,14,7,17,11,6,15,10,13,6,16,11][i%13]}px"></i>`).join('')}</span>`;

/* ⚠️ Avatar e nome são EXEMPLO. Rosto de gente real em depoimento que não
   existe é inventar prova — por isso ninguém aqui tem foto. */
const CONVERSAS = [
  { tema:'o que elas fecham', falas:[
    {de:'Camila · Goiânia', cor:'c1', h:'08:12',
     t:'Meninas, apliquei o que a Izabela ensinou terça e fechei <mark>11 progressivas</mark> essa semana 😮'},
    {de:'Dani · Recife', cor:'c2', h:'08:14',
     t:'CAMILA. Manda o print! Eu ainda travo na hora de falar o preço'},
    {de:'Camila · Goiânia', cor:'c1', h:'08:15',
     t:'O segredo foi <mark>não dar o valor antes dela falar a dor dela</mark>'},
  ]},
  { tema:'networking que vira dinheiro', falas:[
    {de:'Rô · Belo Horizonte', cor:'c3', h:'09:40',
     t:'Alguém de BH quer dividir fornecedor de insumo? Meu frete tá comendo a margem'},
    {de:'Aline · Contagem', cor:'c4', h:'09:41', t:'Eu quero! Te chamo no particular'},
    {de:'Aline · Contagem', cor:'c4', h:'19:02',
     t:'Fechei com a Rô aqui do grupo. <mark>18% a menos</mark> no insumo esse mês 🤝'},
  ]},
  { tema:'toda semana ela entra ao vivo', falas:[
    {eu:true, link:true, h:'11:02',
     t:'Meninas, hoje <mark>17h</mark> eu entro ao vivo. Tema: o funil que enche a agenda sem dar desconto'},
    {de:'Patrícia · Uberlândia', cor:'c5', h:'11:04',
     t:'Já tô aqui, avisei a recepção que hoje <mark>não atendo 17h</mark>'},
  ]},
  { tema:'o que elas dizem depois', falas:[
    {de:'Jéssica · Fortaleza', cor:'c1', h:'18:33',
     t:'Izabela, o <mark>OURO</mark> que você entregou hoje... anotei 4 páginas'},
    {de:'Letícia · Curitiba', cor:'c2', h:'18:34',
     t:'A parte de <mark>ancorar o preço na dor</mark> mudou a minha cabeça. Vou refazer todo o meu atendimento'},
    {de:'Jéssica · Fortaleza', cor:'c1', h:'18:36', t:'Toda terça é assim, gente'},
  ]},
  { tema:'e fica gravado pra sempre', falas:[
    {eu:true, audio:true, seg:'1:12', h:'18:31'},
    {eu:true, h:'18:40',
     t:'A aula de hoje já está <mark>gravada na área de membros</mark>. Assiste na hora que der, fica lá pra sempre'},
    {de:'Rô · Belo Horizonte', cor:'c3', h:'19:03',
     t:'Paguei <mark>uma vez só</mark> e já voltou em dobro com a parceria que fechei aqui'},
  ]},
  { tema:'parou de fazer tudo sozinha', falas:[
    {de:'Vanessa · Natal', cor:'c2', h:'10:12',
     t:'Gente, contratei a segunda cabeleireira. <mark>Saí da cadeira</mark> pela primeira vez em 6 anos'},
    {de:'Camila · Goiânia', cor:'c1', h:'10:14', t:'VANESSAAA que orgulho'},
    {de:'Vanessa · Natal', cor:'c2', h:'10:15',
     t:'Foi a aula de <mark>escala</mark> que destravou. Eu achava que ninguém faria igual a mim'},
  ]},
  { tema:'o ticket subiu', falas:[
    {de:'Simone · Salvador', cor:'c5', h:'14:22',
     t:'Reajustei o preço com medo de perder cliente. Resultado: <mark>nenhuma saiu</mark> e o mês fechou 31% maior'},
    {de:'Letícia · Curitiba', cor:'c2', h:'14:25', t:'Esse é o print que eu precisava ver hoje'},
  ]},
  { tema:'indicação entre nós', falas:[
    {de:'Patrícia · Uberlândia', cor:'c5', h:'16:40',
     t:'Preciso de uma colorista boa aqui na região. Alguém indica?'},
    {de:'Aline · Contagem', cor:'c4', h:'16:43',
     t:'Tenho uma! Trabalhou comigo 3 anos, <mark>mão de ouro</mark>. Te passo o contato'},
    {de:'Patrícia · Uberlândia', cor:'c5', h:'16:51', t:'Contratada. Começa segunda'},
  ]},
  { tema:'quase fechou as portas', falas:[
    {de:'Débora · Campinas', cor:'c3', h:'09:02',
     t:'Entrei aqui em março achando que ia <mark>fechar o salão</mark> em junho'},
    {de:'Débora · Campinas', cor:'c3', h:'09:03',
     t:'Hoje tenho <mark>agenda cheia</mark> até o fim do mês. Não tenho como agradecer'},
  ]},
  { tema:'ela responde no grupo', falas:[
    {de:'Jéssica · Fortaleza', cor:'c1', h:'20:11',
     t:'Izabela, quando a cliente fala "vou pensar", eu insisto ou deixo?'},
    {eu:true, h:'20:19',
     t:'<mark>Nem um, nem outro.</mark> Você devolve a pergunta: o que te deixou em dúvida? Quem pensa não está dizendo não, está dizendo que falta informação'},
    {de:'Jéssica · Fortaleza', cor:'c1', h:'20:20', t:'Anotado. Testo amanhã'},
  ]},
];


const SINAL = '<svg viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>';
const WIFI  = '<svg viewBox="0 0 16 12" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M1.2 4.2a10 10 0 0 1 13.6 0"/><path d="M3.8 7a6.4 6.4 0 0 1 8.4 0"/><path d="M6.4 9.7a2.6 2.6 0 0 1 3.2 0"/></svg>';
const PILHA = '<svg viewBox="0 0 26 12"><rect x="0.6" y="0.6" width="21" height="10.8" rx="3" fill="none" stroke="currentColor" stroke-opacity=".38" stroke-width="1.1"/><rect x="2.2" y="2.2" width="16" height="7.6" rx="1.8"/><path d="M23.4 4.2c1.2.4 1.2 3.2 0 3.6z" fill-opacity=".45"/></svg>';
const IC_VID = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="2.6" y="6" width="13" height="12" rx="2.6"/><path d="M15.6 10.4l5.8-3.2v9.6l-5.8-3.2z"/></svg>';
const IC_TEL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6.2 3.6h3.2l1.6 4-2 1.4a12 12 0 0 0 5.9 5.9l1.4-2 4 1.6v3.2a1.6 1.6 0 0 1-1.7 1.6C11.6 18.8 5.1 12.3 4.6 5.3a1.6 1.6 0 0 1 1.6-1.7z"/></svg>';

const cabecaIphone = hora => `
  <div class="ip-status"><span class="hr">${hora}</span>
    <span class="dir">${SINAL}${WIFI}${PILHA}</span></div>
  <div class="ip-nav">
    <span class="volta"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></span>
    <img class="pf" src="assets/foto-grupo.png" alt="">
    <span class="nm"><b>Clube das Empresárias</b><span>600 participantes</span></span>
    <span class="ic">${IC_VID}${IC_TEL}</span>
  </div>`;

function bolha(m){
  const hora = `<span class="h">${m.h}${m.eu ? CHECK : ''}</span>`;
  if (m.audio) return `<div class="msg out"><div class="audio">
      <span class="play">${PLAY}</span>${onda()}<span class="seg">${m.seg}</span></div>${hora}</div>`;
  const quem = m.eu ? '' : `<span class="de ${m.cor}">${m.de}</span>`;
  const cartao = m.link ? `<a class="link" href="#">
      <span class="lf"><span>Clube das Empresárias · ao vivo</span></span>
      <span class="lt"><b>Aula de hoje, 17h</b><span>encontro semanal · só para membros</span></span></a>` : '';
  return `<div class="msg ${m.eu ? 'out' : ''}">${quem}${cartao}${m.t}${hora}</div>`;
}

function montaCarrossel(raiz){
  const trilho = raiz.querySelector('.trilho');
  trilho.innerHTML = CONVERSAS.map(c => {
    const hora = (c.falas.find(f => f.h) || {}).h || '9:41';
    return `<article class="slide">
      <div class="print"><div class="ip">${cabecaIphone(hora)}
        <div class="ip-papel">${c.falas.map(bolha).join('')}</div></div></div>
      <div class="legenda">${c.tema}</div></article>`;
  }).join('');

  const escalaPrints = () => raiz.querySelectorAll('.print').forEach(p => {
    const ip = p.querySelector('.ip');
    if (ip) ip.style.transform = `scale(${p.clientWidth / 390})`;
  });
  escalaPrints();
  addEventListener('resize', escalaPrints);

  const pontos = raiz.querySelector('.pontos');
  if (pontos) pontos.innerHTML = CONVERSAS.map((_,i) => `<i class="${i?'':'on'}"></i>`).join('');
  const conta = raiz.querySelector('.conta');
  const total = CONVERSAS.length;
  if (conta) conta.textContent = `1 de ${total}`;

  const slides = [...trilho.children];
  const atual = () => {
    const meio = trilho.scrollLeft + trilho.clientWidth/2;
    let i = 0, menor = Infinity;
    slides.forEach((s,k) => {
      const d = Math.abs(s.offsetLeft + s.offsetWidth/2 - meio);
      if (d < menor){ menor = d; i = k; }
    });
    return i;
  };
  const pinta = () => {
    const i = atual();
    if (pontos) [...pontos.children].forEach((p,k) => p.classList.toggle('on', k === i));
    if (conta) conta.textContent = `${i+1} de ${total}`;
  };
  trilho.addEventListener('scroll', () => { clearTimeout(trilho._t); trilho._t = setTimeout(pinta, 60); });

  const vai = passo => {
    const i = Math.min(total-1, Math.max(0, atual() + passo));
    trilho.scrollTo({ left: slides[i].offsetLeft - (trilho.clientWidth - slides[i].offsetWidth)/2,
                      behavior:'smooth' });
  };
  raiz.querySelector('[data-ant]')?.addEventListener('click', () => vai(-1));
  raiz.querySelector('[data-prox]')?.addEventListener('click', () => vai(1));
}

/* ── 3 · como funciona a comunidade ───────────────────────────────── */
const CK = '<svg viewBox="0 0 24 24"><path d="M5 12.6l4.6 4.4L19 7.4"/></svg>';
const COMO = [
  'Aula <mark>ao vivo toda semana</mark> com a Izabela',
  'Fica <mark>tudo gravado</mark> na área do aluno',
  'Networking com <mark>+600 empresárias beauty</mark>',
  'Não é mais um curso, é uma <mark>comunidade beauty</mark>',
];
function montaChecks(ul){
  ul.innerHTML = COMO.map(t => `<li><span class="ck">${CK}</span><span>${t}</span></li>`).join('');
}

addEventListener('DOMContentLoaded', () => {
  ligaRelogio();
  document.querySelectorAll('[data-como]').forEach(montaChecks);
  document.querySelectorAll('.carrossel').forEach(montaCarrossel);
});
