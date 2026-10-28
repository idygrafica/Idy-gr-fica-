import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {makeServer} from '../seo-technical/server.mjs';

const base='9108af2831824c0bcb32a6f54289479303eaed6b';
const allowed=['criacao-sites.html','assets/criacao-sites.css','assets/criacao-sites.js','scripts/criacao-sites/check.mjs','.github/workflows/criacao-sites-preview.yml','CRIACAO_SITES_REVISAO.md'];
const changed=execFileSync('git',['diff','--name-only',base,'HEAD'],{encoding:'utf8'}).trim().split('\n');
for(const file of changed)assert(allowed.includes(file),'Arquivo fora do escopo: '+file);
const html=await readFile('criacao-sites.html','utf8');
const reference=execFileSync('git',['show',base+':cortes-especiais.html'],{encoding:'utf8'});
const part=(s,start,end)=>s.slice(s.indexOf(start),s.indexOf(end,s.indexOf(start)));
assert.equal(part(html,'<header','</header>'),part(reference,'<header','</header>').replace('<a class="" href="/criacao-sites">','<a class="active" href="/criacao-sites">'));
assert.equal(html.slice(html.indexOf('<footer')).replace('<script src="/assets/criacao-sites.js" defer></script>','').trimEnd(),reference.slice(reference.indexOf('<footer')).trimEnd());
assert(!/noindex|nofollow|R\$/i.test(html));
assert(!/<iframe|<video|https:\/\/images\./i.test(html),'Sem dependências de demonstrações externas');
const css=await readFile('assets/criacao-sites.css','utf8'),js=await readFile('assets/criacao-sites.js','utf8');
const assetBytes={html:Buffer.byteLength(html),css:Buffer.byteLength(css),js:Buffer.byteLength(js)};
assert(assetBytes.html<50000&&assetBytes.css<35000&&assetBytes.js<5000,'Orçamento de tamanho da vitrine');
assert(css.includes('prefers-reduced-motion'));assert(!/infinite/.test(css),'Movimento automático não deve ser contínuo');
for(const file of ['assets/livros-digitais.css','assets/style.css','assets/navegacao.css','assets/app.js','assets/loja/catalog.js','assets/loja/cart.js','assets/loja/app.js','netlify.toml','robots.txt','sitemap.xml'])assert.equal(await readFile(file,'utf8'),execFileSync('git',['show',base+':'+file],{encoding:'utf8'}),'Fonte protegida alterada: '+file);
const pages=JSON.parse(await readFile('scripts/seo-technical/pages.json','utf8'));
for(const item of pages.filter(p=>p.path!=='/criacao-sites'&&p.path!=='/'))assert.equal(await readFile(item.file,'utf8'),execFileSync('git',['show',base+':'+item.file],{encoding:'utf8'}),'Outra página alterada');
// O build local pré-renderiza a home; a fonte comercial original continua intacta no commit.
assert.equal(execFileSync('git',['show','HEAD:index.html'],{encoding:'utf8'}),execFileSync('git',['show',base+':index.html'],{encoding:'utf8'}));
await mkdir('.preview/criacao-sites',{recursive:true});
const require=createRequire(resolve('.preview-tools/package.json'));const {chromium}=require('playwright');
const server=makeServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const local='http://127.0.0.1:'+server.address().port,preview=process.env.PREVIEW_ORIGIN.replace(/\/$/,'');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/google-chrome',args:['--no-sandbox','--disable-dev-shm-usage','--disable-background-timer-throttling','--disable-backgrounding-occluded-windows','--disable-renderer-backgrounding']});
const checks=[];
const settle=async page=>{await page.evaluate(()=>document.fonts.ready);await page.locator('img').evaluateAll(async imgs=>{for(const img of imgs)img.loading='eager';await Promise.all(imgs.map(i=>i.decode().catch(()=>{})));});await page.waitForLoadState('load');await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));};
const clean=text=>text.replace(/\s+/g,' ').trim();
try{
 const expected=part(html,'<main','</main>');let raw,headers;
 for(let i=0;i<35;i++){try{const r=await fetch(preview+'/criacao-sites',{signal:AbortSignal.timeout(20000),headers:{'Cache-Control':'no-cache'}});headers=r.headers;raw=await r.text();if(r.ok&&raw.includes(expected))break;}catch{}await new Promise(r=>setTimeout(r,5000));}
 assert(raw?.includes(expected),'Prévia deve servir a versão atual');assert.match(headers.get('x-robots-tag')||'',/noindex/i,'Proteção da prévia');
 for(const alias of ['/criacao-sites.html','/criacao-sites/']){const r=await fetch(preview+alias,{redirect:'manual'});assert.equal(r.status,301);assert.equal(new URL(r.headers.get('location'),preview).pathname,'/criacao-sites');}
 for(const page of pages)assert.equal((await fetch(preview+page.path)).status,200,page.path);
 assert.equal((await fetch(preview+'/nao-existe-revisao-sites')).status,404);
 const sitemap=await fetch(preview+'/sitemap.xml');assert.equal(sitemap.status,200);assert.equal(await sitemap.text(),await readFile('sitemap.xml','utf8'));
 const robots=await fetch(preview+'/robots.txt');assert.equal(robots.status,200);assert.equal(await robots.text(),await readFile('robots.txt','utf8'));
 for(const origin of [local,preview]){
  for(const width of [1440,1024,768,390,320]){
   console.log('Conferindo',origin===preview?'Netlify':'local',width);
   const ctx=await browser.newContext({viewport:{width,height:950},reducedMotion:'reduce'});
   await ctx.route('https://wa.me/**',r=>r.fulfill({contentType:'text/html',body:'Destino simulado. Nenhuma mensagem enviada.'}));
   await ctx.route(/https:\/\/[^/]*netlify[^/]*\/.*(?:\.netlify\/cdp|netlify-cdp)/,r=>r.abort());
   const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   assert.equal((await page.goto(origin+'/criacao-sites',{waitUntil:'domcontentloaded'})).status(),200);await settle(page);
   assert.equal(await page.locator('h1').count(),1);assert.match(await page.locator('h1').innerText(),/Sua empresa merece um site[\s\S]*à altura/);
   assert.match(await page.title(),/Criação de Sites Profissionais em Porto Alegre/);
   assert.equal(await page.locator('link[rel="canonical"]').count(),1);assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'https://idygrafica.netlify.app/criacao-sites');
   assert.equal(await page.locator('meta[name="robots"][content*="noindex"]').count(),0);
   const headings=await page.locator('main h1,main h2,main h3').evaluateAll(es=>es.map(e=>Number(e.tagName.slice(1))));assert.equal(headings[0],1);for(let i=1;i<headings.length;i++)assert(headings[i]<=headings[i-1]+1,'Salto na hierarquia');
   const ids=await page.locator('[id]').evaluateAll(es=>es.map(e=>e.id));assert.equal(ids.length,new Set(ids).size);
   assert.equal(await page.locator('.wb-format').count(),3);assert.equal(await page.locator('.wb-process li').count(),4);assert.equal(await page.locator('.wb-faq details').count(),6);
   const graph=JSON.parse(await page.locator('script[type="application/ld+json"]').textContent())['@graph'];
   const service=graph.find(x=>x['@type']==='Service');assert(service&&!service.offers&&!service.aggregateRating);assert(clean(await page.locator('main').innerText()).includes(clean(service.description)));
   const faq=graph.find(x=>x['@type']==='FAQPage');assert.equal(faq.mainEntity.length,6);
   for(let i=0;i<faq.mainEntity.length;i++){
    const item=page.locator('.wb-faq details').nth(i),summary=item.locator('summary');
    assert.equal(clean(await summary.evaluate(e=>[...e.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).map(n=>n.textContent).join(''))),faq.mainEntity[i].name);
    assert.equal(clean(await item.locator('p').textContent()),faq.mainEntity[i].acceptedAnswer.text);
    await summary.click();assert(await item.locator('p').isVisible());await summary.press('Enter');assert.equal(await item.getAttribute('open'),null);
   }
   for(const kind of ['catalogo','campanha','institucional']){
    const button=page.locator('[data-demo="'+kind+'"]');await button.click();assert.equal(await button.getAttribute('aria-selected'),'true');
    assert.equal(await page.locator('[data-demo-screen]>.demo-'+kind).count(),3,'Demonstração sincronizada nas três telas');
    assert.equal(await page.locator('#wb-demo-panel').getAttribute('aria-labelledby'),await button.getAttribute('id'));
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Overflow ao trocar exemplo '+width);
   }
   await page.locator('#wb-tab-institucional').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#wb-tab-catalogo').getAttribute('aria-selected'),'true');
   await page.keyboard.press('End');assert.equal(await page.locator('#wb-tab-campanha').getAttribute('aria-selected'),'true');await page.keyboard.press('Home');assert.equal(await page.locator('#wb-tab-institucional').getAttribute('aria-selected'),'true');
   assert(await page.locator('.wb-demo-label').isVisible());assert.match(await page.locator('.wb-showcase figcaption p').innerText(),/não representam projetos de clientes/);
   const broken=await page.locator('img').evaluateAll(es=>es.filter(e=>!e.complete||e.naturalWidth===0).map(e=>e.src));assert.deepEqual(broken,[]);
   for(const link of await page.locator('main a[href*="wa.me"]').all())assert.equal(new URL(await link.getAttribute('href')).pathname,'/5551981687562');
   const [popup]=await Promise.all([ctx.waitForEvent('page'),page.locator('.wb-hero-actions .wb-button').click()]);await popup.waitForURL('https://wa.me/**',{waitUntil:'domcontentloaded'});assert.equal(new URL(popup.url()).pathname,'/5551981687562');await popup.close();
   for(const href of new Set(await page.locator('main a').evaluateAll(es=>es.map(e=>e.getAttribute('href'))))){if(href.startsWith('#'))assert.equal(await page.locator('[id="'+href.slice(1)+'"]').count(),1);if(href.startsWith('/'))assert.equal((await page.request.get(origin+href)).status(),200);}
   if(width<=980){const button=page.locator('.mobile-menu-toggle');await button.click();assert.equal(await button.getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await button.getAttribute('aria-expanded'),'false');}
   await page.locator('.wb-hero-actions a[href="#formatos"]').click();assert.equal(new URL(page.url()).hash,'#formatos');
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Rolagem horizontal '+width);
   assert.equal(await page.locator('.wb-laptop').evaluate(e=>getComputedStyle(e).animationName),'none','Respeitar redução de movimento');
   await page.goto(origin+'/criacao-sites',{waitUntil:'domcontentloaded'});await settle(page);await page.mouse.move(0,0);
   await page.screenshot({path:`.preview/criacao-sites/criacao-sites-${origin===preview?'netlify':'local'}-${width}.png`,fullPage:true,animations:'disabled'});
   assert.deepEqual(errors,[]);checks.push({origin:origin===preview?'Netlify':'local',width,brokenImages:[],horizontalOverflow:false,demosSynced:3,keyboardTabs:true,faqVerified:6,whatsappVerified:true,javascriptErrors:errors});await ctx.close();
  }
 }
 const fallback=await browser.newContext({viewport:{width:390,height:844},javaScriptEnabled:false});const page=await fallback.newPage();await page.goto(local+'/criacao-sites',{waitUntil:'load'});
 assert.equal(await page.locator('[data-demo-screen]>.demo-institucional').count(),3);assert(!await page.locator('[data-demo-tabs]').isVisible());assert(await page.locator('.wb-hero-actions .wb-button').isVisible());await page.locator('.wb-faq summary').first().click();assert(await page.locator('.wb-faq details').first().locator('p').isVisible());await fallback.close();
 const prod=await fetch('https://idygrafica.netlify.app/criacao-sites');assert.equal(prod.status,200);assert(!(await prod.text()).includes('id="wb-title"'),'Não publicar em produção antes da aprovação');
 const report={verified:true,base,commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),changed,assetBytes,checks,noJavaScriptFallback:true,protectedSourcesUnchanged:true,importantPagesAccessible:12,canonicalAndIndexingPreserved:true,productionPublished:false,realWhatsAppMessagesSent:0};
 await writeFile('.preview/criacao-sites/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
