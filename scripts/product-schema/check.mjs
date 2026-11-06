import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {makeServer} from '../seo-technical/server.mjs';
const base='a4ae9e6a97726ffaf839c15a8048efbfab119de0';
const changed=['index.html','blocos-personalizados.html','pastas-digitais-simples.html','scripts/seo-technical/build-catalog.mjs','scripts/digital-products/build-pages.mjs'];
const original=p=>execFileSync('git',['show',base+':'+p],{encoding:'utf8'});
const schemaBlocks=html=>[...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
function* nodes(value){if(Array.isArray(value)){for(const x of value)yield* nodes(x);}else if(value&&typeof value==='object'){yield value;for(const x of Object.values(value))yield* nodes(x);}}
const withoutSchema=s=>s.replace(/<script\b[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g,'');
let protectedFiles=0;
for(const p of execFileSync('git',['ls-tree','-r','--name-only',base],{encoding:'utf8'}).trim().split('\n').filter(p=>!changed.includes(p))){assert.equal(execFileSync('git',['hash-object',p],{encoding:'utf8'}),execFileSync('git',['rev-parse',base+':'+p],{encoding:'utf8'}),'Arquivo fora do escopo: '+p);protectedFiles++;}
for(const file of changed.filter(p=>p.endsWith('.html'))){
 const before=original(file),after=await readFile(file,'utf8');
 assert.equal(withoutSchema(after),withoutSchema(before),'Alteração visual/comercial: '+file);
 const oldSchemas=schemaBlocks(before),newSchemas=schemaBlocks(after);assert.equal(oldSchemas.length,newSchemas.length);
 for(let i=0;i<oldSchemas.length;i++){
  const old=structuredClone(oldSchemas[i]);
  if(file==='index.html'&&old['@graph']?.some(n=>n['@type']==='ItemList')){for(const item of old['@graph'].find(n=>n['@type']==='ItemList').itemListElement)if(item.item['@type']==='Product')item.item['@type']='Thing';}
  else if(file!=='index.html'&&old['@graph']?.some(n=>n['@type']==='Product')){const n=old['@graph'].find(n=>n['@type']==='Product');n['@type']='Service';delete n.brand;n.provider={'@id':'https://idygrafica.com.br/#business'};n.areaServed={'@type':'City',name:'Porto Alegre'};}
  assert.deepEqual(newSchemas[i],old,'Mudança de schema além dos dois itens sob consulta: '+file);
 }
 assert(!schemaBlocks(after).flatMap(s=>[...nodes(s)]).some(n=>[].concat(n['@type']||[]).includes('Product')),'Product incompleto: '+file);
}
const pages=[...((await readFile('sitemap.xml','utf8')).matchAll(/<loc>(.*?)<\/loc>/g))].map(m=>new URL(m[1]).pathname);assert.equal(pages.length,15);
for(const path of pages){const file=path==='/'?'index.html':path.slice(1)+'.html';for(const schema of schemaBlocks(await readFile(file,'utf8')))for(const n of nodes(schema)){assert(![].concat(n['@type']||[]).includes('Product'),'Product remanescente: '+file);assert(!n.review&&!n.aggregateRating,'Avaliação indevida');}}
const hashes=changed.slice(0,3).map(p=>execFileSync('git',['hash-object',p],{encoding:'utf8'}));execFileSync('node',['scripts/seo-technical/build-catalog.mjs']);assert.deepEqual(changed.slice(0,3).map(p=>execFileSync('git',['hash-object',p],{encoding:'utf8'})),hashes,'Build não idempotente');
await mkdir('.preview/product-schema',{recursive:true});
for(const file of changed.slice(0,3))await writeFile('.preview/product-schema/google-code-'+file,await readFile(file));
const require=createRequire(resolve('.preview-tools/package.json'));const {chromium}=require('playwright');
const server=makeServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const local='http://127.0.0.1:'+server.address().port;
const preview=process.env.PREVIEW_ORIGIN?.replace(/\/$/,'');if(preview)assert.match(preview,/^https:\/\/deploy-preview-\d+--idygrafica\.netlify\.app$/);
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});const checks=[];
try{
 for(const host of [local,...(preview?[preview]:[])]){
  if(host===preview){let ready=false;for(let n=0;n<30;n++){const r=await fetch(host,{signal:AbortSignal.timeout(20000)});const source=await r.text();if(r.ok&&schemaBlocks(source).flatMap(s=>[...nodes(s)]).every(n=>n['@type']!=='Product')){assert.match(r.headers.get('x-robots-tag')||'',/noindex/i);ready=true;break;}await new Promise(r=>setTimeout(r,3000));}assert(ready,'Prévia ainda não atualizada');}
  for(const width of [1440,768,390,320]){
   const ctx=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});await ctx.route('https://wa.me/**',r=>r.fulfill({contentType:'text/html',body:'WhatsApp simulado; nenhum envio.'}));
   const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(20000);await page.goto(host,{waitUntil:'domcontentloaded'});assert.equal(await page.locator('.product').count(),10);assert.equal(await page.locator('.ai').getAttribute('href'),'https://atendimento-idy.netlify.app/');
   const show=async id=>{const d=page.locator(`[data-product="${id}"]>.product-content>details`);if(await d.getAttribute('open')===null)await d.locator(':scope>summary').click();};
   const open=async()=>{if(width<=1100&&!await page.locator('#cart').isVisible())await page.locator('.cart-toggle').click();};const close=async()=>{if(width<=1100&&await page.locator('body').evaluate(e=>e.classList.contains('cart-open')))await page.keyboard.press('Escape');};
   for(const id of ['blocos-personalizados','pastas-digitais-simples']){
    const card=page.locator(`[data-product="${id}"]`);assert(await card.isVisible());assert.match(await card.locator('.price').innerText(),/Sob consulta/);assert.match(await card.locator('summary').innerText(),/VER PRODUTO/);await show(id);const form=card.locator('[data-digital]');await form.locator('[name=artwork][value=create]').check();await form.locator('[name=reference]').fill('Mesma arte');await form.locator('[data-digital-add]').click();
   }
   await open();assert.equal(await page.locator('.cart-item').count(),2);assert.match(await page.locator('#cart-totals').innerText(),/100,00/);const u=new URL(await page.locator('#checkout').getAttribute('href'));assert.equal(u.pathname,'/5551981687562');assert.match(u.searchParams.get('text'),/Total final: sob consulta/);assert.match(u.searchParams.get('text'),/Blocos personalizados/);assert.match(u.searchParams.get('text'),/Pastas digitais simples/);const [popup]=await Promise.all([ctx.waitForEvent('page'),page.locator('#checkout').click()]);await popup.waitForURL('https://wa.me/**');await popup.close();await page.locator('#clear-cart').click();await close();
   await show('a3');await page.locator('#option-a3').selectOption('a4-75g-frente');await page.locator('#qty-a3').fill('10');await page.locator('[data-add="a3"]').click();await open();assert.match(await page.locator('#cart-totals').innerText(),/22,00/);await page.reload();await open();assert.match(await page.locator('#cart-totals').innerText(),/22,00/);await page.locator('#clear-cart').click();await close();
   for(const path of ['/','/blocos-personalizados','/pastas-digitais-simples']){
    const response=await page.goto(host+path,{waitUntil:'domcontentloaded'});assert.equal(response.status(),200);assert.equal(await page.locator('.product').count(),path==='/'?10:1);assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://idygrafica.com.br'+path);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    assert((await page.locator('script[type="application/ld+json"]').allTextContents()).flatMap(s=>[...nodes(JSON.parse(s))]).every(n=>n['@type']!=='Product'));
    if([1440,390].includes(width)){await page.evaluate(async()=>{for(const i of document.images)i.loading='eager';await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});assert.deepEqual(await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)),[]);await page.screenshot({path:`.preview/product-schema/${path==='/'?'inicio':path.slice(1)}-${host===local?'local':'netlify'}-${width}.png`,fullPage:true,animations:'disabled'});}
   }
   assert.deepEqual(errors,[]);checks.push({host,width,products:10,quoteProductsVisible:true,artworkOnce:true,cartAndWhatsApp:true,productionModified:false});await ctx.close();
  }
 }
 const report={verified:true,base,protectedFiles,pages:15,checks,productionModified:false,realMessagesSent:0};await writeFile('.preview/product-schema/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify({verified:true,protectedFiles,browserCases:checks.length,productionModified:false}));
}finally{await browser.close();await new Promise(r=>server.close(r));}
