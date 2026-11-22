import { FRAME_CSS } from './frames';

/**
 * The storyboard page of «Conocer a Ignacio» (lote 8.1): the animatic (every shot on its bar, with its colour wave and
 * its entrances on the beat), the score (36 bars, one cell each), the grammar of the film, a card per shot (frame, time,
 * the words on screen and the director's notes) and what is left to approve. It is the body of an artifact: no
 * <html>/<head>/<body> of its own. Both languages and both formats travel in the page; two toggles choose.
 */
export type BoardShot = {
  id: string; no: string; chapter: string; bar: number; len: number; start: number; dur: number; theme: string;
  title: string; frames: { w: string; t: string }; words: { es: string[]; en: string[] }; count?: { to: number; cue: number };
  note: { see: string; move: string; sound: string; tall: string; src: string };
};
export type BoardData = {
  title: Record<'es' | 'en', string>; logline: string; bpm: number; bars: number; seconds: number; drops: number[];
  chapters: { id: string; name: string; bar: number; len: number; music: string }[];
  shots: BoardShot[]; grammar: { t: string; d: string }[]; ask: { t: string; d: string }[]; sprite: string; wordCount: number;
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const CELL: Record<string, string> = { ink: '#16123a', coral: '#ff5a3c', blue: '#2b50ff', paper: '#eeeae3', amber: '#ffc247', lime: '#b6f36a', orange: '#ffa04a', mint: '#3fe0b0', pink: '#ff5fa2' };

export function board(d: BoardData): string {
  const beat = 60 / d.bpm;
  const range = (bar: number, len: number) => `${clock((bar - 1) * 4 * beat)} – ${clock((bar - 1 + len) * 4 * beat)}`;
  const barsOf = (bar: number, len: number) => (len === 1 ? `compás ${bar}` : `compases ${bar}–${bar + len - 1}`);
  const cells = d.shots.flatMap((s) => Array.from({ length: s.len }, (_, i) => ({ bar: s.bar + i, s })));
  const js = JSON.stringify({ beat, total: d.seconds, shots: d.shots.map((s) => ({ id: s.id, no: s.no, start: s.start, dur: s.dur, ch: s.chapter, title: s.title, count: s.count })), chapters: d.chapters.map((c) => ({ id: c.id, start: (c.bar - 1) * 4 * beat })) });
  return `<title>Storyboard Conocer a Ignacio</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=JetBrains+Mono:wght@400..800&display=swap">
<style>
/* Layout: the film first (animatic and its score), then the reading (grammar, a card per shot, what to approve). */
:root{--bg:#090720;--surface:#0f0b2c;--raised:#16123a;--line:rgba(255,255,255,.13);--text:#e4e0f2;--muted:#b9b4d2;--head:#fff;--accent:#ff5a3c;--on-accent:#0c0a24;--focus:#ffc247;--cell-line:rgba(255,255,255,.3);
  --sans:'Archivo',system-ui,-apple-system,'Segoe UI',sans-serif;--mono:'JetBrains Mono',ui-monospace,'SF Mono',Menlo,monospace;color-scheme:dark}
@media (prefers-color-scheme: light){:root:not([data-theme="dark"]){--bg:#eeeae3;--surface:#f7f5f1;--raised:#fff;--line:rgba(6,5,19,.16);--text:#16123a;--muted:#3f3a66;--head:#060513;--accent:#c93414;--on-accent:#fff;--focus:#2b50ff;--cell-line:rgba(6,5,19,.4);color-scheme:light}}
:root[data-theme="light"]{--bg:#eeeae3;--surface:#f7f5f1;--raised:#fff;--line:rgba(6,5,19,.16);--text:#16123a;--muted:#3f3a66;--head:#060513;--accent:#c93414;--on-accent:#fff;--focus:#2b50ff;--cell-line:rgba(6,5,19,.4);color-scheme:light}
*{box-sizing:border-box}
body{background:var(--bg);color:var(--text);font:400 16px/1.5 var(--sans)}
.wrap{max-width:1180px;margin:0 auto;padding-block:40px 80px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));display:flex;flex-direction:column;gap:56px}
h1,h2,h3,p,ul,ol,dl,dd,figure{margin:0;padding:0}ul,ol{list-style:none}
h1{font-weight:900;font-stretch:118%;font-size:clamp(40px,7vw,84px);line-height:.95;letter-spacing:-.03em;color:var(--head);text-wrap:balance}
h2{font-weight:800;font-stretch:112%;font-size:clamp(24px,3vw,34px);line-height:1.05;letter-spacing:-.02em;color:var(--head);text-wrap:balance}
h3{font-weight:700;font-size:18px;line-height:1.2;color:var(--head)}
.k{font:500 13px/1.3 var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--accent)}
.lead{font-size:clamp(18px,2vw,22px);line-height:1.4;max-width:46ch;color:var(--text)}
.top{display:flex;flex-direction:column;gap:18px}
.facts{display:flex;flex-wrap:wrap;gap:8px 10px;margin-top:6px}
.facts li{font:500 13px/1 var(--mono);padding:9px 12px;border-radius:999px;border:1px solid var(--line);font-variant-numeric:tabular-nums}
.facts b{color:var(--head);font-weight:700}
button{font:inherit;color:inherit;cursor:pointer}
:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
[data-lang=es] .l-en,[data-lang=en] .l-es{display:none}
[data-fmt=w] .card .fr.t,[data-fmt=t] .card .fr.w,[data-fmt=w] .stage.t,[data-fmt=t] .stage.w{display:none}
/* player */
.player{display:flex;flex-direction:column;gap:14px}
.stage{position:relative;width:100%;border-radius:14px;overflow:hidden;background:#060513;box-shadow:0 0 0 1px var(--line)}
.stage.w{aspect-ratio:16/9}.stage.t{aspect-ratio:9/16;max-width:min(100%,380px);margin-inline:auto}
.stage .fr{position:absolute;inset:0;visibility:hidden}
.stage .fr.was{visibility:visible;z-index:1}.stage .fr.on{visibility:visible;z-index:2}
.stage .fr [data-at]{opacity:0;translate:0 calc(var(--u)*2.4);scale:.96}
.stage .fr.on [data-at]{opacity:1;translate:0 0;scale:1;transition:opacity .25s linear,translate .5s cubic-bezier(.2,1.5,.4,1),scale .5s cubic-bezier(.2,1.5,.4,1);transition-delay:calc(var(--at)*var(--beat))}
.stage .fr.on.cut [data-at]{transition:none}
.stage .fr.on:not(.cut){animation:wave .6s cubic-bezier(.2,.7,.2,1) both}
.stage .fr.on:not(.cut) .f-dot{animation:land .62s cubic-bezier(.3,1.4,.5,1) both}
@keyframes wave{from{clip-path:circle(0% at var(--ox,50%) var(--oy,50%))}to{clip-path:circle(150% at var(--ox,50%) var(--oy,50%))}}
@keyframes land{0%{translate:0 calc(var(--u)*-16);scale:.82 1.22}55%{translate:0 0;scale:1.28 .72}78%{scale:.94 1.08}100%{scale:1 1}}
@media (prefers-reduced-motion: reduce){.stage .fr.on:not(.cut),.stage .fr.on:not(.cut) .f-dot{animation:none}.stage .fr.on [data-at]{transition:none}}
.chapters{display:flex;gap:4px}
.chapters button{flex:var(--len) 1 0;min-width:0;min-height:44px;padding:0;border:0;background:none;display:flex;flex-direction:column;gap:7px;text-align:left}
.chapters i{display:block;height:6px;border-radius:3px;background:var(--line);overflow:hidden;font-style:normal}
.chapters i::after{content:"";display:block;height:100%;width:calc(var(--p,0)*100%);background:var(--accent)}
.chapters span{font:500 12px/1.2 var(--mono);letter-spacing:.04em;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.chapters [aria-current=true] span{color:var(--head)}
.chapters em{font-style:normal}
@media (max-width:640px){.chapters em{display:none}}
.ctl{display:flex;flex-wrap:wrap;align-items:center;gap:10px 14px}
.btn{min-height:44px;padding:0 18px;border-radius:10px;border:1px solid var(--line);background:var(--raised);font-weight:700;font-size:15px}
.btn.main{background:var(--accent);color:var(--on-accent);border-color:transparent;min-width:128px}
.btn.sq{width:44px;padding:0;font-size:18px}
.now{font:500 13px/1.35 var(--mono);color:var(--muted);font-variant-numeric:tabular-nums;margin-right:auto}
.now b{display:block;color:var(--head);font:700 15px/1.3 var(--sans)}
.seg{display:inline-flex;border:1px solid var(--line);border-radius:10px;overflow:hidden}
.seg button{min-height:42px;padding:0 14px;border:0;background:none;font:500 13px/1 var(--mono)}
.seg button[aria-pressed=true]{background:var(--head);color:var(--bg)}
/* score */
.score{display:flex;flex-direction:column;gap:14px}
.score-x{overflow-x:auto;padding-bottom:6px}
.score-in{min-width:720px;display:grid;grid-template-columns:repeat(${d.bars},minmax(0,1fr));gap:3px;row-gap:6px}
.score-ch{grid-row:1;font:500 12px/1.2 var(--mono);letter-spacing:.04em;color:var(--muted);border-top:2px solid var(--line);padding-top:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.score-c{grid-row:2;height:44px;border:0;border-radius:4px;padding:0;background:var(--c);box-shadow:inset 0 0 0 1px var(--cell-line);position:relative}
.score-c[data-drop]::after{content:"";position:absolute;left:50%;top:-5px;border:5px solid transparent;border-top-color:var(--head);margin-left:-5px}
.score-c[aria-current=true]{outline:2px solid var(--head);outline-offset:1px}
.score-n{grid-row:3;font:500 12px/1 var(--mono);color:var(--muted);text-align:center;font-variant-numeric:tabular-nums}
.hint{font-size:14px;color:var(--muted);max-width:70ch}
/* grammar and ask */
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:22px 28px}
.grid li{display:flex;flex-direction:column;gap:6px;min-width:0;padding-top:14px;border-top:1px solid var(--line)}
.grid p{font-size:15px;color:var(--muted)}
/* board */
.board{display:flex;flex-direction:column;gap:44px}
.ch-head{display:flex;flex-direction:column;gap:8px;margin-bottom:18px}
.ch-head p{font-size:15px;color:var(--muted);max-width:70ch}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,330px),1fr));gap:26px 22px}
[data-fmt=t] .cards{grid-template-columns:repeat(auto-fill,minmax(min(100%,250px),1fr))}
.card{display:flex;flex-direction:column;gap:12px;min-width:0}
.card .fr{border-radius:10px;box-shadow:0 0 0 1px var(--line)}
.card-go{display:block;width:100%;padding:0;border:0;background:none;border-radius:10px;text-align:left}
.card .meta{font:500 12px/1.3 var(--mono);letter-spacing:.04em;color:var(--muted);font-variant-numeric:tabular-nums}
.card .meta b{color:var(--accent);font-weight:700;margin-right:8px}
.words{display:flex;flex-wrap:wrap;gap:6px}
.words li{font-size:13px;line-height:1.25;padding:5px 9px;border-radius:6px;background:var(--raised);box-shadow:inset 0 0 0 1px var(--line)}
.card dl{display:grid;grid-template-columns:auto minmax(0,1fr);gap:6px 12px;font-size:14px;line-height:1.4}
.card dt{font:500 12px/1.6 var(--mono);letter-spacing:.04em;text-transform:uppercase;color:var(--muted)}
.card dd{color:var(--text)}
${FRAME_CSS}
</style>
${d.sprite}
<div class="wrap" data-lang="es" data-fmt="w" id="sb">
  <header class="top">
    <p class="k">Lote 8.1 · Guion y storyboard del tráiler</p>
    <h1><i class="l-es" style="font-style:normal">${esc(d.title.es)}</i><i class="l-en" style="font-style:normal">${esc(d.title.en)}</i></h1>
    <p class="lead">${esc(d.logline)}</p>
    <ul class="facts"><li><b>${d.seconds}</b> segundos</li><li><b>${d.bars}</b> compases a <b>${d.bpm}</b> pulsos por minuto</li><li><b>${d.chapters.length}</b> capítulos</li><li><b>${d.shots.length}</b> planos</li><li><b>${d.wordCount}</b> palabras en pantalla</li><li>16:9 y 9:16</li></ul>
  </header>

  <section class="player" id="player" aria-label="Animático" hidden>
    <div class="stage w" id="stage-w"></div>
    <div class="stage t" id="stage-t"></div>
    <div class="chapters" id="chapters">${d.chapters.map((c, i) => `<button type="button" data-ch="${i}" style="--len:${c.len}" aria-label="Capítulo ${i + 1}: ${esc(c.name)}"><i></i><span>${String(i + 1).padStart(2, '0')}<em> ${esc(c.name)}</em></span></button>`).join('')}</div>
    <div class="ctl">
      <button type="button" class="btn main" id="play">Reproducir</button>
      <button type="button" class="btn sq" id="prev" aria-label="Plano anterior">←</button>
      <button type="button" class="btn sq" id="next" aria-label="Plano siguiente">→</button>
      <p class="now" aria-live="off"><b id="now-t"></b><span id="now-m"></span></p>
      <span class="seg" role="group" aria-label="Formato"><button type="button" data-fmt="w" aria-pressed="true">16:9</button><button type="button" data-fmt="t" aria-pressed="false">9:16</button></span>
      <span class="seg" role="group" aria-label="Idioma de los textos en pantalla"><button type="button" data-lang="es" aria-pressed="true">ES</button><button type="button" data-lang="en" aria-pressed="false">EN</button></span>
    </div>
    <p class="hint">Es un animático: cada plano entra en su compás, con su onda de color y sus entradas a tiempo. La película final suma la cámara continua, el giro de los paneles y la música. Espacio reproduce o pausa; las flechas cambian de plano.</p>
  </section>

  <section class="score" aria-labelledby="h-score">
    <div><p class="k">La partitura</p><h2 id="h-score">36 compases, un color por aterrizaje.</h2></div>
    <div class="score-x"><div class="score-in">
      ${d.chapters.map((c, i) => `<span class="score-ch" style="grid-column:${c.bar} / span ${c.len}">${String(i + 1).padStart(2, '0')} ${esc(c.name)}</span>`).join('')}
      ${cells.map(({ bar, s }) => `<button type="button" class="score-c" data-bar="${bar}" style="--c:${CELL[s.theme]};grid-column:${bar}"${d.drops.includes(bar) ? ' data-drop' : ''} aria-label="Compás ${bar}: ${esc(s.title)}${d.drops.includes(bar) ? ' (golpe de la música)' : ''}"></button>`).join('')}
      ${cells.map(({ bar }) => `<span class="score-n" style="grid-column:${bar}">${bar % 4 === 1 ? bar : ''}</span>`).join('')}
    </div></div>
    <p class="hint">Cada celda es un compás de 2,2 segundos. El triángulo marca los golpes de la música: compases ${d.drops.join(', ')}.</p>
  </section>

  <section aria-labelledby="h-gr" style="display:flex;flex-direction:column;gap:22px">
    <div><p class="k">La gramática</p><h2 id="h-gr">${d.grammar.length === 8 ? 'Ocho' : d.grammar.length} reglas para toda la película.</h2></div>
    <ul class="grid">${d.grammar.map((g) => `<li><h3>${esc(g.t)}</h3><p>${esc(g.d)}</p></li>`).join('')}</ul>
  </section>

  <section class="board" aria-labelledby="h-board">
    <div><p class="k">El storyboard</p><h2 id="h-board">Plano por plano.</h2></div>
    ${d.chapters.map((c, i) => `<div><div class="ch-head"><p class="k">${String(i + 1).padStart(2, '0')} · ${range(c.bar, c.len)} · ${barsOf(c.bar, c.len)}</p><h3>${esc(c.name)}</h3><p>${esc(c.music)}</p></div>
      <ol class="cards">${d.shots.filter((s) => s.chapter === c.id).map((s) => `<li class="card" id="p-${s.id}">
        <button type="button" class="card-go" data-shot="${s.id}" aria-label="Ver el plano ${s.no} en el animático">${s.frames.w}${s.frames.t}</button>
        <p class="meta"><b>${s.no}</b>${range(s.bar, s.len)} · ${barsOf(s.bar, s.len)} · ${s.dur.toFixed(1).replace('.', ',')} s</p>
        <h3>${esc(s.title)}</h3>
        <ul class="words" aria-label="En pantalla">${s.words.es.map((x, j) => `<li><i class="l-es" style="font-style:normal">${esc(x)}</i><i class="l-en" style="font-style:normal">${esc(s.words.en[j] ?? x)}</i></li>`).join('')}</ul>
        <dl><dt>Se ve</dt><dd>${esc(s.note.see)}</dd><dt>Se mueve</dt><dd>${esc(s.note.move)}</dd><dt>Suena</dt><dd>${esc(s.note.sound)}</dd><dt>En 9:16</dt><dd>${esc(s.note.tall)}</dd><dt>Sale de</dt><dd>${esc(s.note.src)}</dd></dl>
      </li>`).join('')}</ol></div>`).join('')}
  </section>

  <section aria-labelledby="h-ask" style="display:flex;flex-direction:column;gap:22px">
    <div><p class="k">Para aprobar</p><h2 id="h-ask">Cinco decisiones tuyas.</h2></div>
    <ul class="grid">${d.ask.map((g) => `<li><h3>${esc(g.t)}</h3><p>${esc(g.d)}</p></li>`).join('')}</ul>
  </section>
</div>
<script>
(function(){
  var D=${js}, root=document.getElementById('sb'), player=document.getElementById('player');
  var stages={w:document.getElementById('stage-w'),t:document.getElementById('stage-t')};
  var calm=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // the stage is the frames of the cards, copied once
  D.shots.forEach(function(s){['w','t'].forEach(function(f){
    var src=document.querySelector('#p-'+s.id+' .fr.'+f), c=src.cloneNode(true), dot=c.querySelector('.f-dot');
    if(dot){c.style.setProperty('--ox',dot.style.getPropertyValue(f==='w'?'--wx':'--tx')+'%');c.style.setProperty('--oy',dot.style.getPropertyValue(f==='w'?'--wy':'--ty')+'%');}
    c.style.setProperty('--beat',D.beat+'s');stages[f].appendChild(c);
  });});
  player.hidden=false;
  var t=0, playing=false, last=0, cur=-1, raf=0;
  var bPlay=document.getElementById('play'), nowT=document.getElementById('now-t'), nowM=document.getElementById('now-m');
  var chBtns=[].slice.call(document.querySelectorAll('#chapters button')), cellBtns=[].slice.call(document.querySelectorAll('.score-c'));
  function idx(time){for(var i=D.shots.length-1;i>=0;i--)if(time>=D.shots[i].start-1e-6)return i;return 0;}
  function clock(s){return Math.floor(s/60)+':'+('0'+Math.floor(s%60)).slice(-2);}
  function lang(){return root.getAttribute('data-lang');}
  function show(i,cut){
    ['w','t'].forEach(function(f){var fr=stages[f].children;for(var j=0;j<fr.length;j++){
      var on=j===i, was=!cut&&j===cur&&j!==i;fr[j].classList.toggle('was',was);
      if(on){fr[j].classList.remove('on');fr[j].classList.toggle('cut',!!cut);void fr[j].offsetWidth;fr[j].classList.add('on');}else fr[j].classList.remove('on','cut');
    }});
    cur=i;
  }
  function counts(final){
    var s=D.shots[cur]; if(!s||!s.count)return;
    var k=final?1:Math.max(0,Math.min(1,(t-s.start-s.count.cue*D.beat)/1.3)), v=Math.round(s.count.to*(1-Math.pow(1-k,3)));
    var txt=v.toLocaleString(lang()==='en'?'en-US':'es-AR');
    ['w','t'].forEach(function(f){var b=stages[f].children[cur].querySelector('[data-count]');if(b&&b.textContent!==txt)b.textContent=txt;});
  }
  function paint(){
    var s=D.shots[cur], bar=Math.min(${d.bars},Math.floor(t/(D.beat*4))+1);
    nowT.textContent=s.no+' · '+s.title;
    nowM.textContent=clock(t)+' / '+clock(D.total)+' · compás '+bar+' de ${d.bars}';
    var ci=0;D.chapters.forEach(function(c,i){if(t>=c.start-1e-6)ci=i;});
    chBtns.forEach(function(b,i){var a=D.chapters[i].start,z=i+1<D.chapters.length?D.chapters[i+1].start:D.total;b.style.setProperty('--p',Math.max(0,Math.min(1,(t-a)/(z-a))));b.setAttribute('aria-current',i===ci);});
    cellBtns.forEach(function(b){b.setAttribute('aria-current',+b.getAttribute('data-bar')===bar);});
    bPlay.textContent=playing?'Pausar':t>=D.total?'Repetir':'Reproducir';
  }
  function seek(time){t=Math.max(0,Math.min(D.total,time));show(idx(Math.min(t,D.total-.01)),true);counts(!playing);paint();}
  function tick(now){
    if(!playing)return; t+=Math.min(.1,(now-last)/1000); last=now;
    if(t>=D.total){t=D.total;playing=false;counts(true);paint();return;}
    var i=idx(t); if(i!==cur)show(i,calm); counts(false); paint(); raf=requestAnimationFrame(tick);
  }
  function play(){ if(t>=D.total)t=0; playing=true; last=performance.now(); show(idx(t),calm); paint(); raf=requestAnimationFrame(tick); }
  function pause(){ playing=false; cancelAnimationFrame(raf); ['w','t'].forEach(function(f){stages[f].children[cur].classList.add('cut');}); counts(true); paint(); }
  bPlay.addEventListener('click',function(){playing?pause():play();});
  function step(d){var was=playing; if(was)pause(); var i=Math.max(0,Math.min(D.shots.length-1,cur+d)); seek(D.shots[i].start);}
  document.getElementById('prev').addEventListener('click',function(){step(-1);});
  document.getElementById('next').addEventListener('click',function(){step(1);});
  chBtns.forEach(function(b,i){b.addEventListener('click',function(){if(playing)pause();seek(D.chapters[i].start);});});
  cellBtns.forEach(function(b){b.addEventListener('click',function(){if(playing)pause();seek((+b.getAttribute('data-bar')-1)*D.beat*4);player.scrollIntoView({block:'nearest',behavior:calm?'auto':'smooth'});});});
  [].forEach.call(document.querySelectorAll('.card-go'),function(b){b.addEventListener('click',function(){
    if(playing)pause(); var id=b.getAttribute('data-shot'); for(var i=0;i<D.shots.length;i++)if(D.shots[i].id===id)seek(D.shots[i].start);
    player.scrollIntoView({block:'start',behavior:calm?'auto':'smooth'});
  });});
  player.addEventListener('keydown',function(e){
    if(e.target.closest('.seg'))return;
    if(e.key===' '&&e.target.tagName!=='BUTTON'){e.preventDefault();playing?pause():play();}
    else if(e.key==='ArrowRight'){e.preventDefault();step(1);} else if(e.key==='ArrowLeft'){e.preventDefault();step(-1);}
  });
  function set(attr,v){root.setAttribute('data-'+attr,v);[].forEach.call(document.querySelectorAll('.seg [data-'+attr+']'),function(b){b.setAttribute('aria-pressed',b.getAttribute('data-'+attr)===v);});try{localStorage.setItem('sb:'+attr,v);}catch(e){} if(attr==='lang')counts(!playing);}
  [].forEach.call(document.querySelectorAll('.seg button'),function(b){b.addEventListener('click',function(){var a=b.hasAttribute('data-fmt')?'fmt':'lang';set(a,b.getAttribute('data-'+a));});});
  try{var f=localStorage.getItem('sb:fmt'),l=localStorage.getItem('sb:lang');if(f==='t')set('fmt','t');if(l==='en')set('lang','en');}catch(e){}
  seek(0);
})();
</script>`;
}
