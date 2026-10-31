import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {makeServer} from '../seo-technical/server.mjs';
const base='7c50aee196b4c0b0e9969812f5b6a2d64b69856f';
const allowed=new Set(['index.html','assets/loja/app.js','assets/loja/cart.js','assets/loja/product-card.js','assets/loja/showcase.js','assets/loja/vitrine.css','scripts/seo-technical/build-catalog.mjs']);
const original=p=>execFileSync('git',['show',base+':'+p]);
const files=execFileSync('git',['ls-tree','-r','--name-only',base],{encoding:'utf8'}).trim().split('\n');let protectedFiles=0;
for(const p of files.filter(p=>!allowed.has(p))){assert.equal(execFileSync('git',['hash-object',p],{encoding:'utf8'}),execFileSync('git',['rev-parse',base+':'+p],{encoding:'utf8'}),'Alterado fora do escopo: '+p);protectedFiles++;}
const before=original('index.html').toString(),html=await readFile('index.html','utf8');
const part=(s,a,b)=>s.slice(s.indexOf(a),s.indexOf(b,s.indexOf(a))+b.length);
for(const [a,b]of [['<header','</header>'],['<section class="hero"','</section>'],['<aside class="cart"','</aside>'],['<footer','</footer>']])assert.equal(part(html,a,b),part(before,a,b));
for(const re of [/<title>.*?<\/title>/,/<meta name="description"[^>]+>/,/<link rel="canonical"[^>]+>/])assert.equal(html.match(re)[0],before.match(re)[0]);
// Os seis cartões fora do escopo devem manter exatamente o HTML pré-renderizado.
for(const id of ['cartoes','a3','comandas','adesivos','brindes','canetas'])assert.equal(part(html,`<article class="product" data-product="${id}"`,'</article>'),part(before,`<article class="product" data-product="${id}"`,'</article>'));
assert(!/637,44|374,60|1\.979,40/.test(html),'Preço de concorrente na loja');
const schema=JSON.parse(html.match(/id="idy-catalog-schema">([\s\S]*?)<\/script>/)[1]);assert(!JSON.stringify(schema).includes('Offer'));assert.match(JSON.stringify(schema),/Pastas digitais simples/);
const initial=html;execFileSync('node',['scripts/seo-technical/build-catalog.mjs']);assert.equal(await readFile('index.html','utf8'),initial);
const require=createRequire(resolve('.preview-tools/package.json'));const {chromium}=require('playwright');
await mkdir('.preview/digital-products',{recursive:true});const server=makeServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const local='http://127.0.0.1:'+server.address().port,origins=[local,...(process.env.PREVIEW_ORIGIN?[process.env.PREVIEW_ORIGIN.replace(/\/$/,'')]:[])];
assert(origins.every(o=>o===local||/^https:\/\/deploy-preview-\d+--idygrafica\.netlify\.app$/.test(o)),'Somente prévia, nunca produção');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});const checks=[];
try{for(const origin of origins){
 if(origin!==local){let ok=false;for(let n=0;n<30;n++){const r=await fetch(origin);if(r.ok&&(await r.text()).includes('data-digital="blocos"')){ok=true;break;}await new Promise(r=>setTimeout(r,5000));}assert(ok,'Prévia não atualizada');}
 for(const width of [1440,768,390,320]){
 const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});await context.route('https://wa.me/**',r=>r.fulfill({contentType:'text/html',body:'WhatsApp simulado. Nenhuma mensagem enviada.'}));
 const page=await context.newPage(),errors=[];page.setDefaultTimeout(20000);page.setDefaultNavigationTimeout(20000);console.log('Verificando',origin,width);page.on('pageerror',e=>errors.push(e.message));await page.goto(origin,{waitUntil:'domcontentloaded'});await page.waitForSelector('[data-digital="blocos"]',{state:'attached'});
 await page.evaluate(async()=>{for(const i of document.images)i.loading='eager';await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
 assert.equal(await page.locator('.product').count(),8);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 const show=async id=>{const d=page.locator(`[data-product="${id}"]>.product-content>details`);if(await d.getAttribute('open')===null)await d.locator(':scope>summary').click();};
 const openCart=async()=>{if(width<=1100&&!await page.locator('#cart').isVisible())await page.locator('.cart-toggle').click();};
 const closeCart=async()=>{if(width<=1100&&await page.locator('body').evaluate(e=>e.classList.contains('cart-open')))await page.keyboard.press('Escape');};
 console.log('Etapa: '+"await show('blocos');const blocks");const summary=page.locator('[data-product="blocos"]>.product-content>details>summary');await summary.focus();await page.keyboard.press('Enter');assert(await page.locator('[data-product="blocos"]>.product-content>details').getAttribute('open')!==null);
 await show('blocos');const blocks=page.locator('[data-digital="blocos"]');
 assert.deepEqual(await blocks.locator('[name=format] option').allTextContents(),['A5','A4','A6']);
 for(const format of ['A5','A4','A6']){await blocks.locator('[name=format]').selectOption(format);for(const qty of ['5','10','20','50','100']){await blocks.locator('[name=quantity]').selectOption(qty);assert.match(await blocks.locator('.digital-totals').innerText(),/Total final\s+Sob consulta/);assert.match(await blocks.locator('[data-artwork-cost]').innerText(),/0,00/);}}
 await blocks.locator('[name=artwork][value=create]').check();await blocks.locator('[name=reference]').fill('Marca');assert.match(await blocks.locator('[data-artwork-cost]').innerText(),/100,00/);
 await blocks.locator('[data-digital-add]').click();await openCart();assert.match(await page.locator('#cart-totals').innerText(),/100,00/);assert.match(await page.locator('#cart-totals').innerText(),/sob orçamento/);await closeCart();
 console.log('Etapa: '+"await show('pastas');const folders");await show('pastas');const folders=page.locator('[data-digital="pastas"]');assert.deepEqual(await folders.locator('[name=quantity] option').evaluateAll(a=>a.map(o=>o.value)),['100','200','500','1000']);await folders.locator('[name=quantity]').selectOption('1000');await folders.locator('[name=artwork][value=create]').check();await folders.locator('[name=reference]').fill('marca');
 await folders.locator('[data-digital-add]').click();await openCart();assert.match(await page.locator('#cart-totals').innerText(),/100,00/);assert(!/200,00/.test(await page.locator('#cart-totals').innerText()));
 await page.locator('[data-quantity="0"]').fill('500');await page.locator('[data-quantity="0"]').press('Tab');assert.match(await page.locator('#cart-totals').innerText(),/100,00/);await closeCart();
 console.log('Etapa: '+'await page.reload();');await page.reload();await openCart();assert.equal(await page.locator('.cart-item').count(),2);assert.match(await page.locator('#cart-totals').innerText(),/100,00/);const url=new URL(await page.locator('#checkout').getAttribute('href'));assert.equal(url.pathname,'/5551981687562');assert.match(url.searchParams.get('text'),/Total final: sob consulta/);assert.match(url.searchParams.get('text'),/sem bolsa/);
 await page.locator('[data-remove="0"]').click();assert.match(await page.locator('#cart-totals').innerText(),/100,00/);await page.locator('#clear-cart').click();await closeCart();
 await show('blocos');const form=page.locator('[data-digital="blocos"]');await form.locator('[name=artwork][value=create]').check();await form.locator('[name=reference]').fill('<img src=x onerror=alert(1)>');await form.locator('[data-digital-add]').click();await openCart();assert.equal(await page.locator('#cart-items img').count(),0);assert.match(await page.locator('#cart-items').innerText(),/<img/);await page.locator('#clear-cart').click();await closeCart();
 console.log('Etapa: '+"await form.locator('[name=artwork][value=ready]').check();");await form.locator('[name=artwork][value=ready]').check();const [popup]=await Promise.all([context.waitForEvent('page'),form.locator('button[type=submit]').click()]);await popup.waitForURL('https://wa.me/**');assert.match(new URL(popup.url()).searchParams.get('text'),/Arte pronta/);await popup.close();
 await openCart();await page.locator('#clear-cart').click();await closeCart();
 for(const id of ['a3','canetas']){await show(id);if(id==='a3')await page.locator('#qty-a3').fill('3');await page.locator(`[data-add="${id}"]`).click();}await openCart();assert.match(await page.locator('#cart-totals').innerText(),/529,00/);await page.locator('#clear-cart').click();await closeCart();
 await page.locator('#search').fill('pastas digitais simples');assert.equal(await page.locator('.product').count(),1);await page.locator('.all-products').click();await page.locator('#category-filter').selectOption('pastas');assert.equal(await page.locator('.product').count(),2);await page.locator('.all-products').click();
 console.log('Etapa: '+'const prefix=origin===local');const prefix=origin===local?'local':'netlify';await page.locator('.catalog').screenshot({path:`.preview/digital-products/vitrine-${prefix}-${width}.png`,animations:'disabled',style:'#toast{visibility:hidden!important}'});
 for(const id of ['blocos','pastas']){await show(id);const f=page.locator(`[data-digital="${id}"]`);await f.locator('[name=artwork][value=create]').check();await page.locator(`[data-product="${id}"]`).screenshot({path:`.preview/digital-products/${id}-${prefix}-${width}.png`,animations:'disabled',style:'#toast{visibility:hidden!important}'});const img=page.locator(`[data-product="${id}"] .showcase-photo img`);assert(await img.evaluate(i=>i.naturalWidth>=1200));}
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.equal(await page.locator('.ai').getAttribute('href'),'https://atendimento-idy.netlify.app/');assert.deepEqual(errors,[]);checks.push({origin,width,cartAndArtwork:true,unknownPricesBlocked:true,whatsappSimulated:true,javascriptErrors:errors});await context.close();
 }
 const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();await page.goto(origin);assert.equal(await page.locator('.product').count(),8);assert.equal(await page.locator('.digital-product noscript a[href="https://wa.me/5551981687562"]').count(),2);await context.close();
 for(const m of (await readFile('sitemap.xml','utf8')).matchAll(/<loc>(.*?)<\/loc>/g))assert.equal((await fetch(origin+new URL(m[1]).pathname)).status,200);
 }
 await writeFile('.preview/digital-products/report.json',JSON.stringify({verified:true,base,protectedFiles,checks,productionPublished:false,realMessagesSent:0},null,2));console.log(JSON.stringify({verified:true,cases:checks.length,protectedFiles,productionPublished:false}));
}finally{await browser.close();await new Promise(r=>server.close(r));}
