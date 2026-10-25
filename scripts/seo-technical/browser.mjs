import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {makeServer} from './server.mjs';
const require=createRequire(resolve('.preview-tools/package.json'));
const {chromium}=require('playwright');
const pages=JSON.parse(await readFile('scripts/seo-technical/pages.json','utf8'));
const baseline=JSON.parse(await readFile('scripts/seo-technical/baseline.json','utf8'));
const current=makeServer(),previous=makeServer(baseline.commit);
const listen=s=>new Promise((resolve,reject)=>{s.once('error',reject);s.listen(0,'127.0.0.1',resolve);});
await Promise.all([listen(current),listen(previous)]);
const origin='http://127.0.0.1:'+current.address().port,oldOrigin='http://127.0.0.1:'+previous.address().port;
await mkdir('.preview/seo-technical',{recursive:true});
const browser=await chromium.launch();const report=[];const badLinks=[];
try{
 for(const width of [1440,768,390]){
  const context=await browser.newContext({viewport:{width,height:950},reducedMotion:'reduce'});
  // Recursos externos legados e destinos comerciais são simulados igualmente nos dois lados.
  await context.route('**/*',r=>{
   const u=new URL(r.request().url());
   if(u.hostname==='127.0.0.1')return r.continue();
   if(r.request().resourceType()==='image')return r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"></svg>'});
   return r.fulfill({contentType:'text/html',body:'Destino externo verificado sem enviar mensagens.'});
  });
  for(const item of pages){
   const page=await context.newPage(),before=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await Promise.all([page.goto(origin+item.path,{waitUntil:'networkidle'}),before.goto(oldOrigin+item.path,{waitUntil:'networkidle'})]);
   for(const p of [page,before]){await p.evaluate(()=>document.fonts.ready);await p.locator('img').evaluateAll(async imgs=>{await Promise.all(imgs.map(async i=>{i.loading='eager';await i.decode().catch(()=>{});}));});await p.mouse.move(0,0);}
   assert.equal(await page.title(),item.title);
   assert.equal(await page.locator('meta[name="description"]').getAttribute('content'),item.description);
   assert.equal(await page.locator('link[rel="canonical"]').count(),1);
   assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'https://idygrafica.netlify.app'+item.path);
   assert.equal(await page.locator('h1').count(),1);
   assert.equal(await page.locator('html').getAttribute('lang'),'pt-BR');
   assert.equal(await page.locator('meta[name="robots"],meta[name="googlebot"]').count(),0);
   const snippets=await page.locator('script[type="application/ld+json"]').allTextContents();for(const raw of snippets)JSON.parse(raw);
   const a=await page.screenshot({fullPage:true,animations:'disabled'}),b=await before.screenshot({fullPage:true,animations:'disabled'});
   if(!a.equals(b)){
    const name=item.path==='/'?'index':item.path.slice(1);
    await writeFile(`.preview/seo-technical/diff-${name}-${width}-current.png`,a);
    await writeFile(`.preview/seo-technical/diff-${name}-${width}-before.png`,b);
   }
   assert(a.equals(b),'Visual mudou: '+item.path+' em '+width+'px');
   if(item.path==='/'&&[390,1440].includes(width))await page.screenshot({path:`.preview/seo-technical/loja-${width}.png`,fullPage:true});
   if(width===1440){
    const links=await page.locator('a[href]').evaluateAll(as=>as.map(a=>a.getAttribute('href')));
    for(const href of links){
     if(href.startsWith('/')&&!href.startsWith('//')){const response=await page.request.get(origin+href);if(response.status()!==200)badLinks.push({page:item.path,href,status:response.status()});}
     if(href.startsWith('#'))assert.equal(await page.locator('[id="'+href.slice(1)+'"]').count(),1,'Âncora quebrada: '+item.path+' '+href);
    }
   }
   assert.deepEqual(errors,[]);report.push({path:item.path,width,pixelIdentical:true,metadataCorrect:true,javascriptErrors:errors});
   await page.close();await before.close();
  }
  await context.close();
 }
 assert.deepEqual(badLinks,[],'Links internos quebrados');
 // O catálogo também precisa existir quando JavaScript não é executado.
 const nojs=await browser.newContext({javaScriptEnabled:false});const page=await nojs.newPage();await page.goto(origin);
 assert.equal(await page.locator('[data-product]').count(),8);assert.match(await page.locator('[data-product="canetas"]').innerText(),/3,60/);
 assert.equal(await page.locator('.institution-links a').count(),12);await nojs.close();
 for(const p of pages){
  const path=p.path==='/'?'/index.html':p.path+'.html';const r=await fetch(origin+path,{redirect:'manual'});assert.equal(r.status,301);assert.equal(r.headers.get('location'),p.path);
  if(p.path!=='/'){const slash=await fetch(origin+p.path+'/',{redirect:'manual'});assert.equal(slash.status,301);assert.equal(slash.headers.get('location'),p.path);}
 }
 assert.equal((await fetch(origin+'/nao-existe-auditoria-seo-20261025')).status,404);
 assert.equal((await fetch(origin+'/googlea370a5b2e9c8d30f.html')).status,200);
 await writeFile('.preview/seo-technical/browser-report.json',JSON.stringify({checks:report,staticProductsWithoutJs:8,brokenInternalLinks:badLinks,productionPublished:false,realMessagesSent:0},null,2));
 console.log(JSON.stringify({visualComparisons:report.length,pixelIdentical:report.every(x=>x.pixelIdentical),staticProductsWithoutJs:8,brokenInternalLinks:badLinks,productionPublished:false}));
}finally{await browser.close();await Promise.all([new Promise(r=>current.close(r)),new Promise(r=>previous.close(r))]);}
