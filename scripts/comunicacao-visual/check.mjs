import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {makeServer} from '../seo-technical/server.mjs';
const base='713a57053bd0697a2663978176e5d82e833ea37f';
const allowed=['comunicacao-visual.html','assets/comunicacao-visual.css','scripts/comunicacao-visual/check.mjs','.github/workflows/comunicacao-visual-preview.yml','COMUNICACAO_VISUAL_REVISAO.md'];
const changed=execFileSync('git',['diff','--name-only',base,'HEAD'],{encoding:'utf8'}).trim().split('\n');
for(const p of changed)assert(allowed.includes(p),'Arquivo fora do escopo: '+p);
const html=await readFile('comunicacao-visual.html','utf8');
const reference=execFileSync('git',['show',base+':livros-digitais.html'],{encoding:'utf8'});
const section=(s,start,end)=>s.slice(s.indexOf(start),s.indexOf(end,s.indexOf(start)));
assert.equal(section(html,'<header','</header>'),section(reference,'<header','</header>'),'Cabeçalho deve seguir Livros Digitais');
assert.equal(html.slice(html.indexOf('<footer')).trimEnd(),reference.slice(reference.indexOf('<footer')).trimEnd());
assert(!/noindex|nofollow|R\$/i.test(html));
const xml=await readFile('sitemap.xml','utf8');assert.equal((xml.match(/<loc>/g)||[]).length,12);assert.equal((xml.match(/https:\/\/idygrafica.netlify.app\/comunicacao-visual</g)||[]).length,1);
for(const text of ['Fachadas comerciais','placas em ACM','Banners, faixas e lonas','vitrines','adesivos perfurados','Sinalização interna e externa','clínicas','Criação das artes','Porto Alegre'])assert(html.toLowerCase().includes(text.toLowerCase()),'Serviço ou informação ausente: '+text);
const shared=await readFile('assets/livros-digitais.css','utf8');assert.equal(shared,execFileSync('git',['show',base+':assets/livros-digitais.css'],{encoding:'utf8'}),'Estilo de Livros Digitais alterado');
await mkdir('.preview/comunicacao-visual',{recursive:true});
const require=createRequire(resolve('.preview-tools/package.json'));const {chromium}=require('playwright');
const current=makeServer(),previous=makeServer(base);
await Promise.all([current,previous].map(s=>new Promise(r=>s.listen(0,'127.0.0.1',r))));
const local='http://127.0.0.1:'+current.address().port,oldOrigin='http://127.0.0.1:'+previous.address().port;
const preview=process.env.PREVIEW_ORIGIN.replace(/\/$/,'');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/google-chrome',args:['--no-sandbox','--disable-dev-shm-usage','--disable-background-timer-throttling','--disable-backgrounding-occluded-windows','--disable-renderer-backgrounding']});const checks=[],comparisons=[];
const waitImages=async page=>{await page.evaluate(()=>document.fonts.ready);await page.locator('img').evaluateAll(async imgs=>{for(const img of imgs)img.loading='eager';await Promise.all(imgs.map(i=>i.decode().catch(()=>{})));});await page.waitForLoadState('load');await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));};
try{
 let raw,head;
 const expected=section(html,'<main','</main>');
 for(let i=0;i<35;i++){try{const r=await fetch(preview+'/comunicacao-visual',{signal:AbortSignal.timeout(20000),headers:{'Cache-Control':'no-cache'}});head=r.headers;raw=await r.text();if(r.ok&&raw.includes(expected))break;}catch{}await new Promise(r=>setTimeout(r,5000));}
 assert(raw?.includes(expected),'A prévia não está servindo a versão atual');assert.match(head.get('x-robots-tag')||'',/noindex/i,'Proteção da prévia');
 assert(!/<meta[^>]+(?:name="robots"|name="googlebot")[^>]+noindex/i.test(raw));
 for(const path of ['/comunicacao-visual.html','/comunicacao-visual/']){const r=await fetch(preview+path,{redirect:'manual'});assert.equal(r.status,301);assert.equal(new URL(r.headers.get('location'),preview).pathname,'/comunicacao-visual');}
 const pages=JSON.parse(await readFile('scripts/seo-technical/pages.json','utf8'));
 for(const item of pages)assert.equal((await fetch(preview+item.path)).status,200,item.path);
 assert.equal((await fetch(preview+'/nao-existe-revisao-comunicacao-visual')).status,404);
 const sitemap=await fetch(preview+'/sitemap.xml');assert.equal(sitemap.status,200);assert.equal((await sitemap.text()).match(/<loc>/g).length,12);
 const robots=await fetch(preview+'/robots.txt');assert.equal(robots.status,200);assert(!(await robots.text()).match(/^Disallow:\s*\/\s*$/mi));
 const sprite=await fetch(preview+'/assets/loja/referencia-aprovada.jpg');assert.equal(sprite.status,200);
 for(const origin of [local,preview]){
  for(const width of [1440,1024,768,390,320]){
   const ctx=await browser.newContext({viewport:{width,height:950},reducedMotion:'reduce'});
   await ctx.route('https://wa.me/**',r=>r.fulfill({contentType:'text/html',body:'Destino simulado, nenhuma mensagem enviada.'}));
   await ctx.route(/https:\/\/[^/]*netlify[^/]*\/.*(?:\.netlify\/cdp|netlify-cdp)/,r=>r.abort());
   const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   assert.equal((await page.goto(origin+'/comunicacao-visual',{waitUntil:'domcontentloaded'})).status(),200);await waitImages(page);
   assert.equal(await page.locator('h1').count(),1);assert.match(await page.locator('h1').innerText(),/Comunicação visual em[\s\S]*Porto Alegre/);
   const hierarchy=await page.locator('main h1,main h2,main h3').evaluateAll(els=>els.map(e=>({level:Number(e.tagName.slice(1)),text:e.textContent.trim()})));
   assert.equal(hierarchy[0].level,1);for(let i=0;i<hierarchy.length;i++){assert(hierarchy[i].text.length>0);if(i>0)assert(hierarchy[i].level<=hierarchy[i-1].level+1,'Salto de nível nos títulos');}
   for(const article of await page.locator('.ed-service').all()){const id=await article.getAttribute('aria-labelledby');assert(id);assert.equal(await article.locator('h3#'+id).count(),1);}
   assert.equal(await page.locator('link[rel="canonical"]').count(),1);assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'https://idygrafica.netlify.app/comunicacao-visual');
   assert.match(await page.title(),/Comunicação Visual em Porto Alegre/);
   assert((await page.locator('meta[name="description"]').getAttribute('content')).includes('IDY Gráfica'));
   assert.equal(await page.locator('.ed-service').count(),6);assert.equal(await page.locator('.ed-material-nav a').count(),3);
   for(const s of await page.locator('script[type="application/ld+json"]').allTextContents()){
    const d=JSON.parse(s),graph=d['@graph'];assert(graph.some(x=>x['@type']==='ItemList'&&x.numberOfItems===6));
    assert.equal(new Set(graph.map(x=>x['@id'])).size,graph.length,'IDs estruturados duplicados');
    const services=graph.filter(x=>x['@type']==='Service');assert.equal(services.length,6);
    const text=(await page.locator('main').innerText()).replace(/\s+/g,' ');
    for(const service of services){assert(service.description?.length>0);assert(text.includes(service.description.replace(/\s+/g,' ')),'Descrição estruturada diverge do texto visível');assert.equal(service.areaServed.name,'Porto Alegre');assert(!service.offers&&!service.aggregateRating);}
    const list=graph.find(x=>x['@type']==='ItemList');for(const item of list.itemListElement)assert(services.some(x=>x['@id']===item.item['@id']));
   }
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Rolagem horizontal: '+width);
   const broken=await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src));assert.deepEqual(broken,[]);
   const photos=await page.locator('.cv-approved-photo').evaluateAll(els=>els.map(e=>getComputedStyle(e).backgroundImage));assert(photos.length===1&&photos.every(x=>x.includes('referencia-aprovada.jpg')));

   assert.equal(await page.locator('.cv-gallery figure').count(),5,'Preservar cinco fotografias da galeria');
   const video=page.locator('video');assert.equal(await video.count(),1);
   assert.equal(await video.evaluate(v=>v.controls&&v.playsInline&&!v.autoplay),true);
   assert.equal(await video.locator('source').getAttribute('src'),'/assets/fachadas-trabalhos-idy.mp4');
   const mediaResponse=await page.request.head(origin+'/assets/fachadas-trabalhos-idy.mp4');assert.equal(mediaResponse.status(),200);
   assert.match(mediaResponse.headers()['content-type']||'',/video\/mp4/);
   assert.equal(await video.evaluate(v=>v.error),null);
   const ids=await page.locator('[id]').evaluateAll(els=>els.map(e=>e.id));assert.equal(new Set(ids).size,ids.length,'ID duplicado');
   assert.match(await page.locator('#placas p').innerText(),/confirma a disponibilidade/);
   assert.match(await page.locator('#adesivos p').innerText(),/dependem de confirmação/);
   for(const a of await page.locator('main a[href*="wa.me"]').all())assert.equal(new URL(await a.getAttribute('href')).pathname,'/5551981687562');
   const [popup]=await Promise.all([ctx.waitForEvent('page'),page.locator('.ed-button').first().click()]);await popup.waitForURL('https://wa.me/**',{waitUntil:'domcontentloaded'});assert.equal(new URL(popup.url()).hostname,'wa.me');await popup.close();
   for(const href of await page.locator('main a').evaluateAll(as=>as.map(a=>a.getAttribute('href')))){if(href.startsWith('#'))assert.equal(await page.locator('[id="'+href.slice(1)+'"]').count(),1);if(href.startsWith('/')){const response=await page.request.get(origin+href);assert.equal(response.status(),200);if(href.includes('#'))assert((await response.text()).includes('id="'+href.split('#')[1]+'"'),'Produto de destino ausente no HTML inicial');}}
   if(width<=980){const b=page.locator('.mobile-menu-toggle');await b.click();assert.equal(await b.getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await b.getAttribute('aria-expanded'),'false');}
   for(const href of ['#fachadas-materiais','#ambientes','#trabalhos']){await page.locator('.ed-material-nav a[href="'+href+'"]').click();assert.equal(new URL(page.url()).hash,href);}
   assert.equal(await page.locator('.ed-button').first().evaluate(e=>getComputedStyle(e).borderRadius),'0px');
   await page.goto(origin+'/comunicacao-visual',{waitUntil:'domcontentloaded'});await waitImages(page);await page.mouse.move(0,0);
   await page.screenshot({path:`.preview/comunicacao-visual/comunicacao-visual-${origin===preview?'netlify':'local'}-${width}.png`,fullPage:true,animations:'disabled'});
   if(origin===local&&[1440,768,390].includes(width)){
    for(const path of ['/','/livros-digitais','/servicos','/impressos']){
     // Compara as duas versões na mesma aba: mantém o mesmo renderer e
     // cache de redução do logotipo. Não aplica máscaras nem tolerância.
     const a=await ctx.newPage();
     const baselineHtml=execFileSync('git',['show',base+':'+(path==='/'?'index.html':path.slice(1)+'.html')]);
     let same=false,before,after,attempt=0;
     for(;attempt<3;attempt++){
      await a.route(local+path,r=>r.fulfill({contentType:'text/html; charset=utf-8',body:baselineHtml}));
      await a.goto(local+path,{waitUntil:'domcontentloaded'});await waitImages(a);await a.bringToFront();
      before=await a.screenshot({fullPage:true,animations:'disabled'});
      await a.unroute(local+path);
      await a.goto(local+path,{waitUntil:'domcontentloaded'});await waitImages(a);await a.bringToFront();
      after=await a.screenshot({fullPage:true,animations:'disabled'});
      if(after.equals(before)){same=true;break;}
     }
     if(!same){
      const name=path==='/'?'index':path.slice(1);
      await writeFile(`.preview/comunicacao-visual/comparacao-${name}-${width}-atual.png`,after);
      await writeFile(`.preview/comunicacao-visual/comparacao-${name}-${width}-anterior.png`,before);
     }
     assert(same,'Visual alterado em '+path+' '+width);
     comparisons.push({path,width,pixelIdentical:true,paintChecks:attempt+1});await a.close();
    }
   }
   assert.deepEqual(errors,[]);checks.push({origin:origin===preview?'Netlify':'local',width,brokenImages:broken,horizontalOverflow:false,whatsappVerified:true,javascriptErrors:errors});await ctx.close();
  }
 }
 const prod=await fetch('https://idygrafica.netlify.app/comunicacao-visual');assert.equal(prod.status,200);const prodBody=await prod.text();assert(prodBody.includes('<h1>Comunicação visual para sua marca</h1>'),'Produção deve continuar na versão anterior');assert(!prodBody.includes('id="cv-title"'));
 await writeFile('.preview/comunicacao-visual/report.json',JSON.stringify({verified:true,base,commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),changed,checks,comparisons,headingHierarchyValidated:true,structuredDescriptionsMatchVisibleText:6,importantPagesAccessible:12,serviceGroupsInInitialHtml:6,galleryAndVideoPreserved:true,materialsSubjectToConfirmation:true,protectedSourcesUnchanged:true,productionPublished:false,realWhatsAppMessagesSent:0},null,2));
 console.log(JSON.stringify({verified:true,responsiveChecks:checks.length,visualComparisons:comparisons.length,productionPublished:false,realWhatsAppMessagesSent:0}));
}finally{await browser.close();await Promise.all([current,previous].map(s=>new Promise(r=>s.close(r))));}


