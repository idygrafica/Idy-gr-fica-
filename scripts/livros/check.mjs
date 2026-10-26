import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {makeServer} from '../seo-technical/server.mjs';
const base='9e20e9009c503b8e1854689e49c02521d85b048e';
const changed=execFileSync('git',['diff','--name-only',base,'HEAD'],{encoding:'utf8'}).trim().split('\n');
const allowed=['livros-digitais.html','assets/livros-digitais.css','scripts/livros/check.mjs','.github/workflows/livros-digitais.yml','LIVROS_DIGITAIS_REVISAO.md'];
assert(changed.length>0);for(const path of changed)assert(allowed.includes(path),'Arquivo fora do escopo: '+path);
const html=await readFile('livros-digitais.html','utf8');
const old=execFileSync('git',['show',base+':livros-digitais.html'],{encoding:'utf8'});
const section=(s,from,to)=>s.slice(s.indexOf(from),s.indexOf(to,s.indexOf(from)));
assert.equal(section(html,'<header','</header>'),section(old,'<header','</header>'));
assert.equal(html.slice(html.indexOf('<footer')).trimEnd(),old.slice(old.indexOf('<footer')).trimEnd());
assert.equal((html.match(/<h1\b/g)||[]).length,1);
assert(!/noindex|nofollow/i.test(html));assert(!/R\$/.test(html),'Sem preços novos');
assert(html.includes('https://idygrafica.netlify.app/livros-digitais'));
const sitemap=await readFile('sitemap.xml','utf8');assert.equal((sitemap.match(/<loc>/g)||[]).length,12);assert.equal((sitemap.match(/https:\/\/idygrafica.netlify.app\/livros-digitais</g)||[]).length,1);
const css=await readFile('assets/livros-digitais.css','utf8');assert(css.includes('.editorial-page'));assert(!css.includes(':root'));
await mkdir('.preview/livros',{recursive:true});
const require=createRequire(resolve('.preview-tools/package.json'));
const {chromium}=require('playwright');
const server=makeServer(),previous=makeServer(base);
await Promise.all([server,previous].map(s=>new Promise(r=>s.listen(0,'127.0.0.1',r))));
const local='http://127.0.0.1:'+server.address().port,oldOrigin='http://127.0.0.1:'+previous.address().port;
const preview=process.env.PREVIEW_ORIGIN?.replace(/\/$/,'');
const browser=await chromium.launch();const checks=[];
const waitImages=async p=>{await p.evaluate(()=>document.fonts.ready);await p.locator('img').evaluateAll(async imgs=>{for(const img of imgs)img.loading='eager';await Promise.all(imgs.map(i=>i.decode().catch(()=>{})));});};
const pages=JSON.parse(await readFile('scripts/seo-technical/pages.json','utf8'));
try{
 for(const origin of [local,...(preview?[preview]:[])]){
  const isPreview=origin===preview;
  if(isPreview){
   // A prévia mantém o canonical de produção e o noindex automático do Netlify.
   const response=await fetch(origin+'/livros-digitais',{signal:AbortSignal.timeout(30000)});assert.equal(response.status,200);
   const body=await response.text();assert(body.includes('Seu orçamento começa com estas informações.'));
   assert(!/<meta[^>]+(?:name="robots"|name="googlebot")[^>]+noindex/i.test(body));
   const alias=await fetch(origin+'/livros-digitais.html',{redirect:'manual'});assert.equal(alias.status,301);assert.equal(new URL(alias.headers.get('location'),origin).pathname,'/livros-digitais');
   const slash=await fetch(origin+'/livros-digitais/',{redirect:'manual'});assert.equal(slash.status,301);
   for(const item of pages){const r=await fetch(origin+item.path);assert.equal(r.status,200,item.path);}
   assert.equal((await fetch(origin+'/nao-existe-livros-revisao')).status,404);
  }
  for(const width of [1440,1024,768,390,320]){
   const context=await browser.newContext({viewport:{width,height:950},reducedMotion:'reduce'});
   await context.route('https://wa.me/**',r=>r.fulfill({contentType:'text/html',body:'Simulação: nenhuma mensagem enviada.'}));
   // A barra de colaboração do Netlify não integra o visual publicado.
   await context.route(/https:\/\/[^/]*netlify[^/]*\/.*(?:\.netlify\/cdp|netlify-cdp)/,r=>r.abort());
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   const response=await page.goto(origin+'/livros-digitais',{waitUntil:'domcontentloaded'});assert.equal(response.status(),200);
   await waitImages(page);
   assert.equal(await page.locator('h1').count(),1);assert.match(await page.locator('h1').innerText(),/Impressão de livros/);
   assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'https://idygrafica.netlify.app/livros-digitais');
   assert.match(await page.title(),/Impressão de Livros e Apostilas em Porto Alegre/);
   assert((await page.locator('meta[name="description"]').getAttribute('content')).includes('catálogos'));
   assert.equal(await page.locator('.ed-service').count(),3);assert.equal(await page.locator('.ed-checklist li').count(),6);
   assert(await page.locator('.ed-finishing-note').innerText().then(t=>t.includes('serão confirmadas')));
   const snippets=await page.locator('script[type="application/ld+json"]').allTextContents();for(const s of snippets)JSON.parse(s);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Rolagem horizontal em '+width);
   const images=await page.locator('img').evaluateAll(imgs=>imgs.map(i=>({src:i.getAttribute('src'),ok:i.complete&&i.naturalWidth>0})));assert(images.every(i=>i.ok),JSON.stringify(images));
   const box=await page.locator('.ed-button').first().boundingBox();assert(box.width<=width&&box.height>=44);
   assert.equal(await page.locator('.ed-button').first().evaluate(e=>getComputedStyle(e).borderRadius),'0px');
   const links=await page.locator('main a').evaluateAll(as=>as.map(a=>a.getAttribute('href')));
   for(const href of links){if(href.startsWith('#'))assert.equal(await page.locator('[id="'+href.slice(1)+'"]').count(),1);if(href.startsWith('/'))assert.equal((await page.request.get(origin+href)).status(),200);}
   for(const a of await page.locator('main a[href*="wa.me"]').all()){assert.equal(new URL(await a.getAttribute('href')).pathname,'/5551981687562');}
   const [popup]=await Promise.all([context.waitForEvent('page'),page.locator('.ed-button').first().click()]);await popup.waitForLoadState('domcontentloaded');assert.equal(new URL(popup.url()).hostname,'wa.me');await popup.close();
   if(width<=980){const menu=page.locator('.mobile-menu-toggle');await menu.click();assert.equal(await menu.getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await menu.getAttribute('aria-expanded'),'false');}
   await page.locator('.ed-service-content>a').first().click();await page.waitForFunction(()=>location.hash==='#orcamento-editorial');
   await page.goto(origin+'/livros-digitais',{waitUntil:'domcontentloaded'});await waitImages(page);await page.mouse.move(0,0);
   await page.screenshot({path:`.preview/livros/livros-${isPreview?'netlify':'local'}-${width}.png`,fullPage:true,animations:'disabled'});
   if(!isPreview&&[1440,768,390].includes(width)){
    const home=await context.newPage(),oldHome=await context.newPage();await Promise.all([home.goto(local,{waitUntil:'domcontentloaded'}),oldHome.goto(oldOrigin,{waitUntil:'domcontentloaded'})]);await Promise.all([waitImages(home),waitImages(oldHome)]);
    assert.equal(await home.locator('[data-product]').count(),8);assert.match(await home.locator('[data-product="canetas"]').innerText(),/3,60/);
    const a=await home.screenshot({fullPage:true,animations:'disabled'}),b=await oldHome.screenshot({fullPage:true,animations:'disabled'});assert(a.equals(b),'Visual da loja mudou em '+width);
    await home.close();await oldHome.close();
   }
   assert.deepEqual(errors,[]);checks.push({origin:isPreview?'Netlify':'local',width,brokenImages:images.filter(x=>!x.ok),horizontalOverflow:false,whatsappClickVerified:true,javascriptErrors:errors});await context.close();
  }
 }
 await writeFile('.preview/livros/report.json',JSON.stringify({verified:true,base,commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),changed,checks,unchangedHomeVisualWidths:[1440,768,390],allOtherSourcesPreserved:true,realMessagesSent:0,productionPublished:false,previewNoindexIsExpected:true},null,2));
 console.log(JSON.stringify({verified:true,checks:checks.length,realMessagesSent:0,productionPublished:false}));
}finally{await browser.close();await Promise.all([server,previous].map(s=>new Promise(r=>s.close(r))));}
