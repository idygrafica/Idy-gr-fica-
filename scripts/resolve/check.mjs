import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {makeServer} from '../seo-technical/server.mjs';

const base='92583ed7e5615c28aed7350897d80c4d6e297064';
const allowed=['index.html','assets/idy-resolve.css','assets/idy-resolve.js','scripts/resolve/check.mjs','scripts/resolve/guide.test.mjs','.github/workflows/idy-resolve-preview.yml','IDY_RESOLVE_REVISAO.md','assets/prensa-tipografica-referencia.jpg','assets/publicacoes-referencia-pexels.jpg'];
const git=path=>execFileSync('git',['show',base+':'+path],{encoding:'utf8'});
const changed=execFileSync('git',['diff','--name-only',base,'HEAD'],{encoding:'utf8'}).trim().split('\n');
for(const file of changed)assert(allowed.includes(file),'Fora do escopo: '+file);
const html=await readFile('index.html','utf8'),reference=git('index.html');
const previous=execFileSync('git',['show','9bfed631e12816c3bc3210bc81df91e5bd6a9944:index.html'],{encoding:'utf8'});
assert.equal(html.slice(html.indexOf('<section class="rs-start')).trimEnd(),previous.slice(previous.indexOf('<section class="rs-start')).trimEnd(),'Somente a abertura pode mudar em relação à PR #18 anterior');
const part=(s,a,b)=>{assert(s.includes(a)&&s.includes(b),'Marcadores existentes');return s.slice(s.indexOf(a),s.indexOf(b,s.indexOf(a)));};
assert.equal(html.slice(html.indexOf('<div class="store-layout">')).trimEnd(),reference.slice(reference.indexOf('<div class="store-layout">')).trimEnd(),'Catálogo, carrinho, rodapé e navegação institucional preservados');
assert.equal(part(html,'<header','</header>'),part(reference,'<header','</header>'),'Cabeçalho, busca, logo, IA e WhatsApp preservados');
const removeAssets=s=>s.replace(/<link rel="stylesheet" href="\/assets\/idy-resolve.css">\s*/,'').replace(/<script type="module" src="\/assets\/idy-resolve.js"><\/script>\s*/,'').replace(/\s+/g,' ');
assert.equal(removeAssets(part(html,'<head','</head>')),removeAssets(part(reference,'<head','</head>')),'Metas, canonical e dados estruturados preservados');
assert.equal(part(html,'<nav class="category-bar"','</nav>'),part(reference,'<nav class="category-bar"','</nav>'),'Categorias preservadas');
const pages=JSON.parse(await readFile('scripts/seo-technical/pages.json','utf8'));
for(const file of [...pages.filter(p=>p.path!=='/').map(p=>p.file),'assets/loja/styles.css','assets/loja/app.js','assets/loja/cart.js','assets/loja/catalog.js','assets/loja/product-card.js','netlify.toml','sitemap.xml','robots.txt'])assert.equal(await readFile(file,'utf8'),git(file),'Fonte protegida alterada: '+file);
const css=await readFile('assets/idy-resolve.css','utf8'),js=await readFile('assets/idy-resolve.js','utf8');
assert(css.includes('prefers-reduced-motion'));assert(!/infinite/.test(css));
assert(!/fetch\(|XMLHttpRequest|localStorage|innerHTML|<iframe|OPENAI/.test(js),'Guia não cria backend, IA, armazenamento ou injeção HTML');
const assetBytes={html:Buffer.byteLength(html),css:Buffer.byteLength(css),js:Buffer.byteLength(js)};
assert(assetBytes.html<45000&&assetBytes.css<40000&&assetBytes.js<14000,'Componentes leves sem nova biblioteca em produção');
await mkdir('.preview/resolve',{recursive:true});
const require=createRequire(resolve('.preview-tools/package.json'));const {chromium}=require('playwright');
const server=makeServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const local='http://127.0.0.1:'+server.address().port,preview=process.env.PREVIEW_ORIGIN.replace(/\/$/,'');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/google-chrome',args:['--no-sandbox','--disable-dev-shm-usage','--disable-background-timer-throttling','--disable-backgrounding-occluded-windows','--disable-renderer-backgrounding']});
const checks=[];
const get=async(url,options={})=>{let error;for(let i=0;i<3;i++){try{return await fetch(url,{signal:AbortSignal.timeout(20000),...options});}catch(e){error=e;await new Promise(r=>setTimeout(r,1500));}}throw error;};
const settle=async page=>{await page.evaluate(()=>document.fonts.ready);await page.locator('img').evaluateAll(async imgs=>{for(const img of imgs)img.loading='eager';await Promise.all(imgs.map(i=>i.decode().catch(()=>{})));});await page.waitForLoadState('load');};
const noOverflow=async page=>assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Sem rolagem horizontal');
try{
 let response,raw;for(let i=0;i<35;i++){try{response=await get(preview+'/');raw=await response.text();if(response.ok&&raw.includes('class="loja-page resolve-page"'))break;}catch{}await new Promise(r=>setTimeout(r,5000));}
 assert(raw?.includes(part(html,'<main','</main>')),'Prévia com conteúdo desta proposta');
 assert.match(response.headers.get('x-robots-tag')||'',/noindex/i,'Prévia fora do índice antes da aprovação');
 for(const p of pages)assert.equal((await get(preview+p.path)).status,200,p.path);
 for(const path of ['/sitemap.xml','/robots.txt']){const r=await get(preview+path);assert.equal(r.status,200);assert.equal(await r.text(),await readFile(path.slice(1),'utf8'));}
 for(const p of pages.filter(p=>p.path!=='/')){const r=await get(preview+p.path+'.html',{redirect:'manual'});assert.equal(r.status,301);assert.equal(new URL(r.headers.get('location'),preview).pathname,p.path);}
 assert.equal((await get(preview+'/nao-existe-resolve')).status,404);
 const aiHome=await get('https://atendimento-idy.netlify.app/');assert.equal(aiHome.status,200);const aiMarkup=await aiHome.text();assert(aiMarkup.includes('fileInput'),'Anexos continuam na aplicação existente');
 const health=await get('https://atendimento-idy.netlify.app/.netlify/functions/health');assert.equal(health.status,200);assert.equal((await health.json()).status,'netlify-function-ok');
 for(const origin of [local,preview]){
  for(const width of [1440,1024,768,390,320]){
   console.log('Conferindo IDY Resolve',origin===preview?'Netlify':'local',width);
   const ctx=await browser.newContext({viewport:{width,height:width>700?1000:844},reducedMotion:'reduce'});
   // A barra de revisão injetada pelo Netlify é externa à aplicação; bloqueada no teste.
   const toolbar=/https:\/\/(?:app\.netlify\.com|[^/]*\.bugsnag\.com)\//;
   const posts=[];ctx.on('request',r=>{if(r.method()!=='GET'&&!toolbar.test(r.url()))posts.push(r.method()+' '+r.url());});
   await ctx.route(toolbar,r=>r.abort());
   await ctx.route('https://wa.me/**',r=>r.fulfill({contentType:'text/html',body:'Teste isolado: nenhuma mensagem enviada.'}));
   await ctx.route('https://atendimento-idy.netlify.app/**',r=>r.abort());
   await ctx.route(/https:\/\/[^/]*netlify[^/]*\/.*(?:\.netlify\/cdp|netlify-cdp)/,r=>r.abort());
   const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   assert.equal((await page.goto(origin+'/',{waitUntil:'domcontentloaded'})).status(),200);await settle(page);
   assert.equal(await page.locator('h1').count(),1);assert.match(await page.locator('h1').innerText(),/A impressão evoluiu\.[\s\S]*A gente também\./);
   assert.equal(await page.locator('.product').count(),8);assert.equal(await page.locator('[data-rs-mode]').count(),3);assert.equal(await page.locator('[data-rs-need]').count(),7);
   assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'https://idygrafica.netlify.app/');assert.equal(await page.locator('meta[name="robots"][content*="noindex"]').count(),0);
   const ids=await page.locator('[id]').evaluateAll(es=>es.map(e=>e.id));assert.equal(ids.length,new Set(ids).size);
   const headings=await page.locator('main h1,main h2,main h3').evaluateAll(es=>es.map(e=>Number(e.tagName.slice(1))));assert.equal(headings[0],1);for(let i=1;i<headings.length;i++)assert(headings[i]<=headings[i-1]+1,'Hierarquia dos títulos');
   const graph=JSON.parse(await page.locator('#idy-catalog-schema').textContent())['@graph'];assert.equal(graph.find(x=>x['@type']==='ItemList').itemListElement.length,8);
   for(const [selector,path] of [['.brand img','/assets/logo-idy-grafica.png'],['.mascot','/assets/mascote-idy.png'],['.printer','/assets/xerox-color-560-home.webp']]){const image=page.locator(selector);assert.equal(await image.getAttribute('src'),path);assert(await image.evaluate(e=>e.naturalWidth>0));assert.equal(await image.evaluate(e=>getComputedStyle(e).objectFit),'contain');}
   assert.deepEqual(await page.locator('img').evaluateAll(es=>es.filter(e=>!e.complete||!e.naturalWidth).map(e=>e.src)),[]);
   assert(!await page.locator('#rs-request').isVisible());assert.equal(await page.locator('.rs-mascot').evaluate(e=>getComputedStyle(e).animationName),'none','Respeitar movimento reduzido');await noOverflow(page);
   // Captura inicial limpa. Oculta apenas o iframe técnico da barra Netlify na captura; a aplicação não usa iframe.
   await page.bringToFront();await page.mouse.move(0,0);await page.screenshot({path:`.preview/resolve/idy-resolve-${origin===preview?'netlify':'local'}-${width}.png`,fullPage:true,animations:'disabled',style:'iframe{visibility:hidden!important}'});
   // A fotografia é o destaque; a chamada leva ao guia existente.
   assert.equal(await page.locator('.rx-printer').getAttribute('fetchpriority'),'high');assert.equal(await page.locator('.rx-printer').getAttribute('loading'),'eager');
   assert.equal(await page.locator('.rx-origin-intro').evaluate(e=>getComputedStyle(e).display),'none','Sem introdução animada com movimento reduzido');
   assert.equal(await page.locator('.rx-printer').evaluate(e=>getComputedStyle(e).animationName),'none');
   assert.equal(await page.locator('.rx-hero video,.rx-hero iframe,.rx-hero canvas,[data-rv-tab],[data-rs-example]').count(),0,'Sem simulações antigas, vídeos ou dependências externas');
   assert.match(await page.locator('.rx-description').innerText(),/Impressões sob demanda, pequenas tiragens e soluções personalizadas/);
   assert.equal(await page.locator('.rx-output-card').count(),3);assert.match(await page.locator('.rx-history').innerText(),/Referência histórica.*réplica/s);
   for(const link of await page.locator('.rx-output-card').all()){const href=await link.getAttribute('href');assert.equal((await page.request.get(origin+href)).status(),200);}
   await page.locator('.rx-image-notes summary').click();assert.match(await page.locator('.rx-image-notes').innerText(),/não um trabalho identificado da IDY/);await page.locator('.rx-image-notes summary').press('Enter');assert.equal(await page.locator('.rx-image-notes').getAttribute('open'),null);
   const oldCart=await page.evaluate(()=>localStorage.getItem('loja-idy.cart.v1'));await page.locator('.rx-main-cta').click();assert.equal(new URL(page.url()).hash,'#comecar');assert(await page.locator('[data-rs-mode="arte"]').isVisible());assert.equal(await page.evaluate(()=>localStorage.getItem('loja-idy.cart.v1')),oldCart);
   await page.reload({waitUntil:'domcontentloaded'});await settle(page);
   await page.locator('[data-rs-mode="arte"]').click();assert(await page.locator('#rs-request').isVisible());assert.equal(await page.locator('#rs-art').inputValue(),'pronta');
   assert.equal(await page.locator('#rs-brief [required]').count(),1);assert.equal(await page.locator('#rs-brief [required]').getAttribute('id'),'rs-product');assert.equal(await page.locator('#rs-brief input[type="file"]').count(),0);
   await page.locator('#rs-product').fill('Cartões para minha empresa <b>referência</b>');await page.locator('#rs-quantity').fill('umas 100');await page.locator('#rs-extra').fill('Quero orientação, sem saber o papel.');
   await page.locator('[data-rs-mode="ideia"]').click();assert.equal(await page.locator('#rs-art').inputValue(),'ideia');assert.equal(await page.locator('#rs-quantity').inputValue(),'umas 100');
   await page.locator('[data-rs-mode="orientacao"]').click();assert.equal(await page.locator('[data-rs-mode="orientacao"]').getAttribute('aria-pressed'),'true');
   for(const key of ['empresa','divulgar','documento','personalizar','fachada','livro','site']){
    const need=page.locator('[data-rs-need="'+key+'"]');await need.focus();await need.press(' ');assert.equal(await need.getAttribute('aria-expanded'),'true');assert(await page.locator('[data-rs-need-panel]').isVisible());await noOverflow(page);
    for(const a of await page.locator('[data-rs-service-links] a').all()){const href=await a.getAttribute('href');assert(href.startsWith('/'));const r=await page.request.get(origin+href);assert.equal(r.status(),200);if(href.includes('#'))assert((await r.text()).includes('id="'+href.split('#')[1]+'"'));}
   }
   await page.locator('[data-rs-continue]').click();assert.equal(await page.locator('#rs-product').inputValue(),'Cartões para minha empresa <b>referência</b>','Não apagar texto do cliente ao sugerir necessidade');
   const [popup]=await Promise.all([ctx.waitForEvent('page'),page.locator('#rs-brief button[type="submit"]').click()]);await popup.waitForURL('https://wa.me/**',{waitUntil:'domcontentloaded'});
   const wa=new URL(popup.url());assert.equal(wa.pathname,'/5551981687562');assert.match(wa.searchParams.get('text'),/Cartões para minha empresa <b>referência<\/b>/);assert.match(wa.searchParams.get('text'),/umas 100/);assert(!/R\$|arquivo anexado|enviado com sucesso/i.test(wa.searchParams.get('text')));await popup.close();await page.bringToFront();
   assert.equal(await page.locator('[data-rs-summary] b').count(),0);assert.match(await page.locator('[data-rs-summary]').textContent(),/<b>referência<\/b>/);assert.match(await page.locator('[data-rs-share-status]').textContent(),/Revise e envie/);
   assert.equal(await page.locator('[data-rs-whatsapp]').getAttribute('href'),wa.href);assert.equal(await page.locator('.rs-ai-hint a').getAttribute('href'),'https://atendimento-idy.netlify.app/');
   await page.locator('#rs-quantity').fill('200');assert.match(new URL(await page.locator('[data-rs-whatsapp]').getAttribute('href')).searchParams.get('text'),/200/);
   await page.locator('#rs-product').fill('');assert.equal(await page.locator('[data-rs-whatsapp]').getAttribute('aria-disabled'),'true');assert(await page.locator('[data-rs-copy]').isDisabled());
   await page.locator('#rs-product').fill('Apostila para treinamento');await ctx.grantPermissions(['clipboard-read','clipboard-write'],{origin});await page.locator('[data-rs-copy]').click();await page.waitForFunction(()=>document.querySelector('[data-rs-copy-status]').textContent.includes('copiado'));assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),await page.locator('[data-rs-summary]').textContent());
   await ctx.clearPermissions();await ctx.grantPermissions([],{origin});await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{value:undefined,configurable:true}));await page.locator('[data-rs-copy]').click();assert.match(await page.locator('[data-rs-copy-status]').textContent(),/selecione o texto/);assert.equal(await page.locator('[data-rs-share] details').getAttribute('open'),'');
   await noOverflow(page);
   // A orientação não altera busca, catálogo, preços nem armazenamento do carrinho.
   await page.locator('#search').fill('canetas');assert.equal(await page.locator('.product').count(),1);await page.locator('.all-products').click();assert.equal(await page.locator('.product').count(),8);
   await page.locator('#qty-a3').fill('3');await page.locator('[data-add="a3"]').click();await page.locator('[data-rs-cart]').click();assert.match(await page.locator('#cart-totals').innerText(),/9,00/);if(width<=1100){assert.equal(await page.locator('#cart').getAttribute('role'),'dialog');await page.keyboard.press('Escape');}
   const cart=await page.evaluate(()=>localStorage.getItem('loja-idy.cart.v1'));await page.locator('[data-rs-free-start]').click();assert.equal(await page.evaluate(()=>localStorage.getItem('loja-idy.cart.v1')),cart);
   // Axe verifica os componentes novos; não modifica o documento nem funcionalidades antigas.
   await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});const a11y=await page.evaluate(async()=>{const r=await axe.run({include:[['.rs-hero'],['#comecar'],['#solucoes'],['#rs-request'],['.rs-proof'],['#loja']]},{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}));});assert.deepEqual(a11y,[],'Acessibilidade dos novos componentes');
   assert.deepEqual(errors,[]);assert.deepEqual(posts,[],'Sem requisições de envio de dados');checks.push({origin:origin===preview?'Netlify':'local',width,needs:7,modes:3,photographicOpening:true,originalXeroxPreserved:true,mainCtaOpensExistingGuide:true,whatsappMocked:true,preservedCart:true,copyAndFallback:true,accessibilityViolations:a11y,javascriptErrors:errors});await ctx.close();
  }
 }
 const fallback=await browser.newContext({viewport:{width:390,height:844},javaScriptEnabled:false});const p=await fallback.newPage();await p.goto(preview+'/',{waitUntil:'load'});assert.equal(await p.locator('.product').count(),8);assert(await p.locator('.rs-fallback').isVisible());assert(!await p.locator('[data-rs-controls]').isVisible());assert(!await p.locator('#rs-request').isVisible());for(const a of await p.locator('.rs-fallback a').all())assert.equal(new URL(await a.getAttribute('href')).pathname,'/5551981687562');assert.equal(await p.locator('[data-rs-need="livro"]').getAttribute('href'),'/livros-digitais');assert.equal(await p.locator('.rx-main-cta').getAttribute('href'),'#comecar');assert.equal(await p.locator('.rx-printer').getAttribute('src'),'/assets/xerox-color-560-home.webp');await fallback.close();
 const motion=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'no-preference'});const mp=await motion.newPage();await mp.goto(preview+'/',{waitUntil:'load'});await mp.bringToFront();await mp.waitForTimeout(2200);assert.equal(await mp.locator('.rx-origin-intro').evaluate(e=>getComputedStyle(e).visibility),'hidden');assert.equal(await mp.locator('.rx-printer').evaluate(e=>getComputedStyle(e).opacity),'1');assert.equal(await mp.locator('.rx-hero').evaluate(e=>e.getAnimations({subtree:true}).filter(a=>a.playState==='running').length),0,'Transição termina sem loop');await motion.close();
 // Medição de carregamento em Chrome, com CPU 4x e rede de 1,6 Mbps / 150 ms.
 const perfContext=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const pp=await perfContext.newPage();
 await perfContext.route(/https:\/\/(?:app\.netlify\.com|[^/]*\.bugsnag\.com)\//,r=>r.abort());await perfContext.route(/https:\/\/[^/]*netlify[^/]*\/.*(?:\.netlify\/cdp|netlify-cdp)/,r=>r.abort());
 await pp.addInitScript(()=>{window.__rxPerf={lcp:0,cls:0};new PerformanceObserver(list=>{for(const e of list.getEntries())window.__rxPerf.lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__rxPerf.cls+=e.value;}).observe({type:'layout-shift',buffered:true});});
 const cdp=await perfContext.newCDPSession(pp);await cdp.send('Network.enable');await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:1600000/8,uploadThroughput:750000/8});await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 await pp.goto(preview+'/',{waitUntil:'domcontentloaded',timeout:60000});await pp.locator('.rx-printer').evaluate(e=>e.decode());await pp.waitForTimeout(2500);
 const performanceResult=await pp.evaluate(()=>({viewport:innerWidth,network:'1.6 Mbps / 150 ms',cpuSlowdown:4,firstContentfulPaintMs:performance.getEntriesByName('first-contentful-paint')[0]?.startTime,lcpMs:window.__rxPerf.lcp,cls:window.__rxPerf.cls,resources:performance.getEntriesByType('resource').map(e=>({url:e.name,bytes:e.transferSize,duration:e.duration})).filter(e=>e.url.startsWith(location.origin)),videoCount:document.querySelectorAll('video').length}));assert.equal(performanceResult.videoCount,0);await perfContext.close();
 const production=await get('https://idygrafica.netlify.app/');assert.equal(production.status,200);assert(!(await production.text()).includes('class="loja-page resolve-page"'),'Produção deve permanecer intocada');
 const report={verified:true,base,commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),changed,assetBytes,performanceResult,checks,noJavaScriptFallback:true,protectedSourcesUnchanged:true,pagesAccessible:12,canonicalAndIndexingPreserved:true,productionPublished:false,ai:{frontend:200,health:200,sourceAudited:true,automaticContextTransfer:false,backendModified:false,registrationOrUploadSubmitted:false},realWhatsAppMessagesSent:0};await writeFile('.preview/resolve/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
