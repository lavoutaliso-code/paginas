const { chromium } = require(require('os').homedir()+'/ferramentas-visual/node_modules/playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({viewport:{width:1100,height:900}});
  const erros = [];
  p.on('console', m => m.type()==='error' && erros.push(m.text()));
  await p.goto('http://localhost:8790/clube/auladehoje/', {waitUntil:'load'});
  await p.waitForTimeout(3000);
  const r = await p.evaluate(async () => {
    const v = document.getElementById('v');
    v.muted = true;
    try { await v.play(); } catch(e) { return {erro: e.message}; }
    await new Promise(r => setTimeout(r, 4000));
    return {duracao: Math.round(v.duration), tocando: !v.paused, tempo: v.currentTime.toFixed(1),
            largura: v.videoWidth, altura: v.videoHeight, bufferado: v.buffered.length ? v.buffered.end(0).toFixed(1) : 0};
  });
  console.log(JSON.stringify(r));
  console.log('erros console:', erros.slice(0,5));
  await p.screenshot({path:'/tmp/pags/aula.png'});
  await b.close();
})();
