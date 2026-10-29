import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {makeServer} from '../seo-technical/server.mjs';
import {products,categories} from '../../assets/loja/catalog.js';
import {paperFilters,matchesProduct} from '../../assets/loja/showcase.js';
const base='43139fea92c669dfa9a15a605a5db6ab487cd194';
const allowed=new Set(['index.html','assets/loja/app.js','assets/loja/product-card.js','assets/loja/showcase.js','assets/loja/vitrine.css','scripts/seo-technical/build-catalog.mjs','scripts/vitrine/check.mjs','.github/workflows/vitrine-preview.yml','VITRINE_IDY_REVISAO.md',...products.map(p=>'assets/loja/produtos/'+p.id+'.webp')]);
const diff=execFileSync('git',['diff','--name-only',base],{encoding:'utf8'}).trim().split('\n').filter(Boolean);for(const p of diff)assert(allowed.has(p),'Fora do escopo: '+p);
const original=path=>execFileSync('git',['show',base+':'+path],{encoding:'utf8'});
const files=execFileSync('git',['ls-tree','-r','--name-only',base],{encoding:'utf8'}).trim().split('\n');let protectedFiles=0;
for(const p of files.filter(p=>!allowed.has(p))){assert.equal(execFileSync('git',['hash-object',p],{encoding:'utf8'}),execFileSync('git',['rev-parse',base+':'+p],{encoding:'utf8'}),p);protectedFiles++;}
const before=original('index.html'),html=await readFile('index.html','utf8');
const part=(s,a,b)=>s.slice(s.indexOf(a),s.indexOf(b,s.indexOf(a))+b.length);
for(const [a,b] of [['<header','</header>'],['<section class="hero"','</section>'],['<aside class="cart"','</aside>'],['<footer','</footer>']])assert.equal(part(html,a,b),part(before,a,b),'Região protegida: '+a);
assert.equal(html.slice(html.indexOf('<meta property="og:type"'),html.indexOf('</head>')),before.slice(before.indexOf('<meta property="og:type"'),before.indexOf('</head>')),'Open Graph alterado');
for(const re of [/<title>[\s\S]*?<\/title>/,/<meta name="description"[^>]+>/,/<link rel="canonical"[^>]+>/])assert.equal(html.match(re)[0],before.match(re)[0]);
assert.deepEqual([...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1])),[...before.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1])),'Dados estruturados alterados');
const app=await readFile('assets/loja/app.js','utf8'),oldApp=original('assets/loja/app.js');
const cartBlock=s=>s.slice(s.indexOf('function renderCart()'),s.indexOf("$('#categories').addEventListener"));assert.equal(cartBlock(app),cartBlock(oldApp),'Renderização do carrinho alterada');
const handlerStart="$('#product-grid').addEventListener('change'";
assert.equal(app.slice(app.indexOf(handlerStart),app.indexOf("$('#showcase-filter-slot').innerHTML")),oldApp.slice(oldApp.indexOf(handlerStart),oldApp.lastIndexOf('renderCategories();renderProducts();renderCart();')),'Handlers comerciais alterados');
assert.deepEqual(paperFilters,[{id:'couche-300',label:'Couchê 300 g'},{id:'sulfite',label:'Sulfite comum'}]);
for(const [q,ids] of [['couche 300g',['cartoes']],['9x5',['cartoes']],['A5 50',['blocos']],['DTF UV',['canetas']],['receituarios',['blocos']]])assert.deepEqual(products.filter(p=>matchesProduct(p,{query:q})).map(p=>p.id),ids);
const hash=()=>execFileSync('git',['hash-object','index.html'],{encoding:'utf8'});const h=hash();execFileSync('node',['scripts/seo-technical/build-catalog.mjs']);assert.equal(hash(),h,'Build não idempotente');
await mkdir('.preview/vitrine',{recursive:true});
const require=createRequire(resolve('.preview-tools/package.json'));const {chromium}=require('playwright');
const server=makeServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const local='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
const origins=[local,...(process.env.PREVIEW_ORIGIN?[process.env.PREVIEW_ORIGIN.replace(/\/$/,'')]:[])],checks=[];
try{
 for(const origin of origins){
  if(origin!==local){let actual;for(let n=0;n<35;n++){const r=await fetch(origin,{signal:AbortSignal.timeout(20000)});actual=await r.text();if(r.ok&&actual.includes('class="showcase-photo"')&&actual.includes('id="paper-filter"'))break;await new Promise(r=>setTimeout(r,5000));}assert(actual.includes('class="showcase-photo"'));}
  for(const width of [1440,1280,1024,768,520,390,320]){
   const ctx=await browser.newContext({viewport:{width,height:950},reducedMotion:'reduce'});const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await ctx.route('https://wa.me/**',r=>r.fulfill({contentType:'text/html',body:'WhatsApp simulado; nenhuma mensagem enviada.'}));
   await page.goto(origin,{waitUntil:'domcontentloaded'});
   const waitPhotos=async()=>page.evaluate(async()=>{await document.fonts.ready;for(const i of document.images)i.loading='eager';await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});await waitPhotos();
   assert.equal(await page.locator('.product').count(),8);assert.equal(await page.locator('.view-product').count(),8);
   const columns=await page.locator('#product-grid').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);assert.equal(columns,width>900?3:width>520?2:1);
   const images=await page.locator('.showcase-photo img').evaluateAll(a=>a.map(i=>({src:i.src,width:i.naturalWidth,height:i.naturalHeight,renderWidth:i.getBoundingClientRect().width,loaded:i.complete&&i.naturalWidth>0})));
   assert.equal(images.length,8);for(const i of images){assert(i.loaded);assert(i.width>=1200&&i.height>=800,'Imagem pequena');assert(i.width>=i.renderWidth*2,'Imagem insuficiente para o tamanho de exibição');}
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Rolagem horizontal');
   const showcaseBox=await page.locator('.catalog').boundingBox();await page.screenshot({path:'.preview/vitrine/vitrine-'+(origin===local?'local':'netlify')+'-'+width+'.png',fullPage:true,animations:'disabled'});
   await page.locator('.catalog').screenshot({path:'.preview/vitrine/produtos-'+(origin===local?'local':'netlify')+'-'+width+'.png',animations:'disabled'});
   // Detalhes nativos funcionam por teclado e não revelam informações inventadas.
   const first=page.locator('[data-product="cartoes"] .view-product');await first.focus();await page.keyboard.press('Enter');assert(await page.locator('[data-product="cartoes"] details').getAttribute('open')!==null);
   await page.locator('[data-product="a3"] .view-product').click();await page.waitForFunction(()=>document.querySelectorAll('.product-details[open]').length===1);assert.equal(await page.locator('.product-details[open]').count(),1);
   for(const c of categories){await page.locator('#category-filter').selectOption(c.id);assert.equal(await page.locator('.product').count(),products.filter(p=>c.id==='todos'||p.category===c.id).length);assert.equal(await page.locator('[data-category="'+c.id+'"]').getAttribute('aria-pressed'),'true');}
   await page.locator('.all-products').click();await page.locator('#paper-filter').selectOption('couche-300');assert.equal(await page.locator('.product').count(),1);assert.equal(await page.locator('.product').getAttribute('data-product'),'cartoes');
   await page.locator('#paper-filter').selectOption('sulfite');assert.equal(await page.locator('.product').getAttribute('data-product'),'a3');
   await page.locator('#category-filter').selectOption('brindes');assert.equal(await page.locator('.product').count(),0);assert(await page.locator('.empty-results').isVisible());
   await page.locator('.all-products').click();assert.equal(await page.locator('#paper-filter').inputValue(),'todos');assert.equal(await page.locator('#category-filter').inputValue(),'todos');
   for(const [q,id] of [['COUCHÊ 300g','cartoes'],['A5 50','blocos'],['dtf uv','canetas'],['9x5','cartoes']]){await page.locator('#search').fill(q);assert.equal(await page.locator('.product').count(),1);assert.equal(await page.locator('.product').getAttribute('data-product'),id);}
   await page.locator('#search').fill('<img src=x onerror=alert(1)>');assert.equal(await page.locator('.product').count(),0);assert.equal(await page.locator('#search-status img').count(),0);await page.locator('.all-products').click();
   const details=async id=>{const el=page.locator('[data-product="'+id+'"] details');if(await el.getAttribute('open')===null)await el.locator('summary').click();};
   const openCart=async()=>{if(width<=1100&&!await page.locator('#cart').isVisible())await page.locator('.cart-toggle').click();};const closeCart=async()=>{if(width<=1100)await page.keyboard.press('Escape');};
   await details('a3');await page.locator('#qty-a3').fill('3');await page.locator('[data-add="a3"]').click();await openCart();assert.match(await page.locator('#cart-totals').innerText(),/9,00/);
   await page.locator('[data-change="0"][data-delta="1"]').click();assert.match(await page.locator('#cart-totals').innerText(),/12,00/);await page.locator('[data-quantity="0"]').fill('3');await page.locator('[data-quantity="0"]').press('Tab');
   await closeCart();await page.reload();await openCart();assert.match(await page.locator('#cart-totals').innerText(),/9,00/);await page.locator('#clear-cart').click();await closeCart();
   await details('a3');await page.locator('#option-a3').selectOption('duplex');await page.locator('#qty-a3').fill('100');await page.locator('[data-add="a3"]').click();await openCart();assert.match(await page.locator('#cart-totals').innerText(),/600,00/);await page.locator('#clear-cart').click();await closeCart();
   await details('canetas');for(const [n,total] of [['100',/520,00/],['500',/2\.000,00/],['1000',/3\.600,00/]]){await page.locator('#option-canetas').selectOption(n);await page.locator('[data-add="canetas"]').click();await openCart();assert.match(await page.locator('#cart-totals').innerText(),total);await page.locator('#clear-cart').click();await closeCart();}
   await page.locator('#qty-canetas').fill('101');await page.locator('[data-add="canetas"]').click();await openCart();assert.match(await page.locator('.cart-item').innerText(),/Sob orçamento/);await page.locator('#clear-cart').click();await closeCart();
   await details('a3');await page.locator('#option-a3').selectOption('frente');await page.locator('#qty-a3').fill('3');await page.locator('[data-add="a3"]').click();await details('cartoes');await page.locator('[data-add="cartoes"]').click();await openCart();
   assert.match(await page.locator('#cart-totals').innerText(),/9,00/);let u=new URL(await page.locator('#checkout').getAttribute('href'));assert.equal(u.pathname,'/5551981687562');assert.match(u.searchParams.get('text'),/Preço a confirmar/);
   const [pop]=await Promise.all([ctx.waitForEvent('page'),page.locator('#checkout').click()]);await pop.waitForURL('https://wa.me/**',{waitUntil:'domcontentloaded'});await pop.close();
   await page.locator('[data-remove="1"]').click();assert.equal(await page.locator('.cart-item').count(),1);await page.locator('#clear-cart').click();assert.equal(await page.locator('#checkout').getAttribute('aria-disabled'),'true');await closeCart();
   assert.equal(await page.locator('.ai').getAttribute('href'),'https://atendimento-idy.netlify.app/');
   assert.deepEqual(errors,[]);checks.push({origin,width,columns,images:8,searchAndFilters:true,commercialFlows:true,whatsappSimulated:true,javascriptErrors:errors,realMessagesSent:0,showcaseWidth:showcaseBox.width});await ctx.close();
  }
  const nojs=await browser.newContext({javaScriptEnabled:false});const p=await nojs.newPage();await p.goto(origin);assert.equal(await p.locator('.product').count(),8);await p.locator('[data-product="cartoes"] summary').click();assert(await p.locator('#option-cartoes').isVisible());await nojs.close();
  const xml=await readFile('sitemap.xml','utf8');for(const m of xml.matchAll(/<loc>(.*?)<\/loc>/g))assert.equal((await fetch(origin+new URL(m[1]).pathname)).status,200,m[1]);
 }
 await writeFile('.preview/vitrine/report.json',JSON.stringify({verified:true,base,protectedFiles,checks,originalPricesAndCalculationsPreserved:true,productionPublished:false,realMessagesSent:0},null,2));console.log(JSON.stringify({verified:true,cases:checks.length,protectedFiles,productionPublished:false}));
}finally{await browser.close();await new Promise(r=>server.close(r));}
