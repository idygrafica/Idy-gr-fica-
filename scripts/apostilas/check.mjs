import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {makeServer} from '../seo-technical/server.mjs';

const base='f7f37913811abfc953260faa136eefbd24b4657d';
const origin='https://idygrafica.com.br',path='/impressao-de-apostilas';
const title='Impressão de Apostilas em Porto Alegre | IDY Gráfica';
const message='Olá! Gostaria de solicitar um orçamento de impressão de apostilas na IDY Gráfica.';
const oldChanges=['impressos.html','livros-digitais.html','sitemap.xml','netlify.toml'];
const original=p=>execFileSync('git',['show',base+':'+p],{encoding:'utf8'});
const fileHash=p=>execFileSync('git',['hash-object',p],{encoding:'utf8'}).trim();
const files=execFileSync('git',['ls-tree','-r','--name-only',base],{encoding:'utf8'}).trim().split('\n');
let protectedFiles=0;
for(const p of files.filter(p=>!oldChanges.includes(p))){assert.equal(fileHash(p),execFileSync('git',['rev-parse',base+':'+p],{encoding:'utf8'}).trim(),'Arquivo preservado alterado: '+p);protectedFiles++;}
const impressos=await readFile('impressos.html','utf8');
const impressosAddition='<p>Para cursos e treinamentos, veja os formatos e as orientações para <a href="/impressao-de-apostilas">impressão de apostilas em Porto Alegre</a>.</p>';
assert.equal(impressos.replace(impressosAddition,''),original('impressos.html'));
const books=await readFile('livros-digitais.html','utf8');
const booksAddition=' Veja os <a href="/impressao-de-apostilas" style="color:#073a78;text-decoration:underline;text-underline-offset:3px">formatos e as orientações para impressão de apostilas em Porto Alegre</a>.';
assert.equal(books.replace(booksAddition,''),original('livros-digitais.html'));
const oldUrls=[...original('sitemap.xml').matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
const urls=[...(await readFile('sitemap.xml','utf8')).matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
assert.equal(urls.length,16);assert.equal(new Set(urls).size,16);assert.deepEqual(urls.filter(u=>u!==origin+path),oldUrls);assert(urls.includes(origin+path));
const config=JSON.parse(execFileSync('python3',['-c',"import tomllib,json;print(json.dumps(tomllib.load(open('netlify.toml','rb'))))"],{encoding:'utf8'}));
const beforeConfig=JSON.parse(execFileSync('python3',['-c',"import tomllib,json,sys;print(json.dumps(tomllib.loads(sys.stdin.read())))"],{input:original('netlify.toml'),encoding:'utf8'}));
assert.deepEqual(config.redirects.filter(r=>r.from!==path+'.html'),beforeConfig.redirects);assert.deepEqual(config.headers,beforeConfig.headers);assert.deepEqual(config.build,beforeConfig.build);
assert.deepEqual(config.redirects.find(r=>r.from===path+'.html'),{from:path+'.html',to:path,status:301,force:true});
const source=await readFile('impressao-de-apostilas.html','utf8');
assert.equal(source.match(/<title>(.*?)<\/title>/)[1],title);assert.equal([...source.matchAll(/<h1\b/g)].length,1);assert(source.includes('rel="canonical" href="'+origin+path+'"'));assert(!/noindex/i.test(source));
for(const text of ['A4','A5','75 g','preto e branco','pequenas tiragens','PDF','Travessa da Luz, 845','exclusivamente online','Xerox Color 560'])assert(source.includes(text),text);
assert(!/R\$|aggregateRating|priceCurrency|"offers"|"@type":"Product"/.test(source),'Preço ou avaliação indevida');
const schemas=[...source.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
const service=schemas.flatMap(s=>s['@graph']||[s]).find(n=>n['@type']==='Service');assert(service);assert.equal(service.url,origin+path);assert.equal(service.areaServed.name,'Porto Alegre');assert.equal(service.provider['@id'],origin+'/#business');
const pageFiles=urls.map(u=>new URL(u).pathname).map(p=>p==='/'?'index.html':p.slice(1)+'.html');
const hashes=pageFiles.map(fileHash);execFileSync('node',['scripts/seo-technical/build-catalog.mjs']);assert.deepEqual(pageFiles.map(fileHash),hashes,'Build altera páginas indevidamente');
const robotPolicy=execFileSync('python3',['-c',"import urllib.robotparser,json;p=urllib.robotparser.RobotFileParser();p.parse(open('robots.txt').read().splitlines());print(json.dumps([p.can_fetch(a,'https://idygrafica.com.br/impressao-de-apostilas')for a in ['Googlebot','OAI-SearchBot']]))"],{encoding:'utf8'});assert.deepEqual(JSON.parse(robotPolicy),[true,true]);
await mkdir('.preview/apostilas',{recursive:true});
const require=createRequire(resolve('.preview-tools/package.json'));const {chromium}=require('playwright');
const server=makeServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const local='http://127.0.0.1:'+server.address().port,preview=process.env.PREVIEW_ORIGIN?.replace(/\/$/,'');
if(preview)assert.match(preview,/^https:\/\/deploy-preview-\d+--idygrafica\.netlify\.app$/);
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
const checks=[];
try{for(const host of [local,...(preview?[preview]:[])]){
 if(host===preview){let ready=false;for(let i=0;i<20;i++){try{const r=await fetch(host+path,{signal:AbortSignal.timeout(15000)});if(r.ok&&(await r.text()).includes('ap-title')){assert.match(r.headers.get('x-robots-tag')||'',/noindex/i);ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,2000));}assert(ready,'Prévia não está disponível');}
 for(const url of urls){const p=new URL(url).pathname;const r=await fetch(host+p,{signal:AbortSignal.timeout(20000)});assert.equal(r.status,200,p);const html=await r.text();assert(html.includes('href="'+url+'"'),p);for(const m of html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g))JSON.parse(m[1]);}
 for(const agent of ['Googlebot','OAI-SearchBot']){const r=await fetch(host+path,{headers:{'User-Agent':agent}});assert.equal(r.status,200);assert((await r.text()).includes('Apostilas'));}
 const alias=await fetch(host+path+'.html',{redirect:'manual'});assert.equal(alias.status,301);assert.equal(new URL(alias.headers.get('location'),host).pathname,path);
 for(const width of [1440,1024,768,390,320]){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});await context.route('https://wa.me/**',r=>r.fulfill({contentType:'text/html',body:'WhatsApp simulado; nenhuma mensagem enviada.'}));
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(20000);
  await page.goto(host+path,{waitUntil:'domcontentloaded'});assert.equal((await page.locator('h1').innerText()).replace(/\s+/g,' ').trim(),'Impressão de Apostilas em Porto Alegre');
  await page.keyboard.press('Tab');assert.equal(await page.locator(':focus').getAttribute('href'),'#conteudo');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.equal(await page.locator('main details').count(),6);
  const faq=page.locator('main details').first();await faq.locator('summary').click();assert(await faq.getAttribute('open')!==null);await faq.locator('summary').click();
  if(width<=980){const menu=page.locator('.mobile-menu-toggle');assert.equal(await menu.getAttribute('aria-label'),'Abrir menu');await menu.click();assert.equal(await menu.getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await menu.getAttribute('aria-expanded'),'false');}
  const cta=page.locator('.ap-quote-button').first(),u=new URL(await cta.getAttribute('href'));assert.equal(u.pathname,'/5551981687562');assert.equal(u.searchParams.get('text'),message);
  const [popup]=await Promise.all([context.waitForEvent('page'),cta.click()]);await popup.waitForURL('https://wa.me/**');await popup.close();
  for(const a of await page.locator('main a[href^="#"]').all()){const id=(await a.getAttribute('href')).slice(1);assert.equal(await page.locator('[id="'+id+'"]').count(),1);}
  assert.equal(await page.locator('main a[href="mailto:idygrafica@gmail.com"]').count(),1);
  assert(await page.locator('.cta-ai').getAttribute('href')==='https://atendimento-idy.netlify.app');
  await page.evaluate(async()=>{document.activeElement?.blur();for(const i of document.images)i.loading='eager';await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));window.scrollTo({top:0,behavior:'instant'});});
  assert.deepEqual(await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)),[]);
  const machine=await page.locator('.ap-machine img').evaluate(e=>({natural:[e.naturalWidth,e.naturalHeight],fit:getComputedStyle(e).objectFit}));assert.deepEqual(machine,{natural:[960,960],fit:'contain'});
  assert(await page.locator('h1').evaluate(e=>e.getBoundingClientRect().top>=document.querySelector('header.nav').getBoundingClientRect().bottom),'Título encoberto pelo cabeçalho');
  if(width<=620){assert.equal(await page.locator('.whats-note').isVisible(),false);assert((await page.locator('.whats-widget a').boundingBox()).width<=56);assert.equal(await page.locator('.whats-widget a').getAttribute('href'),'https://wa.me/5551981687562');}
  const label=host===local?'local':'netlify';if([1440,768,390].includes(width)){await page.screenshot({path:`.preview/apostilas/apostilas-${label}-${width}.png`,fullPage:true,animations:'disabled'});await page.screenshot({path:`.preview/apostilas/abertura-${label}-${width}.png`,animations:'disabled'});}
  for(const related of ['/impressos','/livros-digitais']){await page.goto(host+related,{waitUntil:'domcontentloaded'});assert(await page.locator('a[href="'+path+'"]').first().isVisible());await page.locator('a[href="'+path+'"]').first().click();await page.waitForURL(host+path);}
  if([1440,390].includes(width)){
   await page.goto(host,{waitUntil:'domcontentloaded'});assert.equal(await page.locator('.product').count(),10);await page.locator('#search').fill('canetas');await page.waitForFunction(()=>document.querySelectorAll('.product').length===1);await page.locator('#search').fill('');await page.locator('#categories [data-category]').nth(1).click();assert((await page.locator('.product').count())<10);await page.locator('[data-category=todos]').click();
   await page.locator('[data-product="a3"]>.product-content>details>summary').click();await page.locator('#qty-a3').fill('3');await page.locator('[data-add=a3]').click();if(width<=1100)await page.locator('.cart-toggle').click();assert.match(await page.locator('#cart-totals').innerText(),/9,00/);await page.reload();if(width<=1100)await page.locator('.cart-toggle').click();assert.match(await page.locator('#cart-totals').innerText(),/9,00/);
  }
  assert.deepEqual(errors,[]);checks.push({host,width,faq:true,links:true,whatsappSimulated:true,machineUncropped:true,errors});await context.close();
 }
 const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();await page.goto(host+path);assert(await page.locator('h1').isVisible());assert.equal(await page.locator('main details').count(),6);assert.equal(await page.locator('.ap-quote-button').count(),2);await context.close();
}
const report={verified:true,base,protectedFiles,pages:16,checks,htmlWithoutJavaScript:true,realMessagesSent:0,productionPublished:false};await writeFile('.preview/apostilas/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify({verified:true,protectedFiles,pages:16,cases:checks.length,realMessagesSent:0,productionPublished:false}));
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
