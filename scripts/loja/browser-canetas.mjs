import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {server} from './server.mjs';
const require=createRequire(resolve('.preview-tools/package.json'));
const {chromium}=require('playwright');
const published=process.env.PUBLICATION==='true';
const origin=published?'https://idygrafica.netlify.app/':'http://127.0.0.1:4173/';
await mkdir('.preview/canetas',{recursive:true});
const baseline=JSON.parse(await readFile('scripts/loja/canetas-baseline.json','utf8'));
const hash=b=>createHash('sha1').update(Buffer.from(`blob ${b.length}\0`)).update(b).digest('hex');
if(published){
 // Confere o código implantado antes de testar a interface pública.
 for(const path of ['assets/loja/catalog.js','assets/loja/cart.js','assets/loja/app.js']){
  const expected=hash(await readFile(path));let matched=false;
  for(let i=0;i<30;i++){
   try{const response=await fetch(new URL(path,origin),{signal:AbortSignal.timeout(15000),headers:{'Cache-Control':'no-cache'}});if(response.ok&&hash(Buffer.from(await response.arrayBuffer()))===expected){matched=true;break;}}catch{}
   await new Promise(r=>setTimeout(r,5000));
  }
  assert(matched,'Código publicado desatualizado: '+path);
 }
}else await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(4173,'127.0.0.1',resolve);});
const browser=await chromium.launch();const report=[];
try{
 for(const width of [1440,768,390]){
  const context=await browser.newContext({viewport:{width,height:950}});const page=await context.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await context.route('https://wa.me/**',r=>r.fulfill({contentType:'text/html',body:'Link verificado sem envio de mensagem.'}));
  await page.goto(origin,{waitUntil:'networkidle'});await page.waitForSelector('[data-product="canetas"]');
  assert.equal(await page.locator('.product').count(),8);
  const card=page.locator('[data-product="canetas"]');
  assert.match((await card.locator('.price').innerText()).replace(/\s+/g,' '),/A partir de R\$ 3,60\/un\.\s*— para 1\.000 unidades/);
  assert.match(await card.locator('.product-description').innerText(),/DTF UV/);
  assert(await card.locator('.product-photo').evaluate(el=>el.classList.contains('photo-7')));
  if(!published){
   const previous=await context.newPage();
   await previous.route('**/assets/loja/*.js',r=>{
    const path=new URL(r.request().url()).pathname.slice(1);
    const body=execFileSync('git',['show',baseline.commit+':'+path]);
    return r.fulfill({contentType:'text/javascript',body});
   });
   await previous.goto(origin,{waitUntil:'networkidle'});await previous.waitForSelector('[data-product="canetas"]');
   const otherCards=p=>p.locator('.product:not([data-product="canetas"])').evaluateAll(els=>els.map(el=>el.outerHTML));
   assert.deepEqual(await otherCards(page),await otherCards(previous),'Outro produto teve sua apresentação alterada');
   await previous.close();
  }
  const open=async()=>{if(width<=1100&&!await page.locator('#cart').isVisible())await page.locator('.cart-toggle').click();};
  const close=async()=>{if(width<=1100)await page.keyboard.press('Escape');};
  const check=(n,unit,total)=>({n,unit,total});
  for(const scenario of [check('100','5,20','520,00'),check('500','4,00','2.000,00'),check('1000','3,60','3.600,00')]){
   await page.locator('#option-canetas').selectOption(scenario.n);assert.equal(await page.locator('#qty-canetas').inputValue(),scenario.n);
   await page.locator('[data-add="canetas"]').click();await open();
   assert.match(await page.locator('.cart-item strong').innerText(),new RegExp(scenario.total.replace('.','\\.')));
   assert((await page.locator('.cart-item small').innerText()).includes(scenario.unit));
   const text=new URL(await page.locator('#checkout').getAttribute('href')).searchParams.get('text');
   assert(text.includes(scenario.unit)&&text.includes(scenario.total));assert.match(text,/DTF UV/);
   await page.locator('#clear-cart').click();await close();
  }
  // Edição direta e persistência recalculam a partir da tabela atual.
  await page.locator('#qty-canetas').fill('500');assert.equal(await page.locator('#option-canetas').inputValue(),'500');
  await page.locator('[data-add="canetas"]').click();await open();
  await page.locator('[data-quantity="0"]').fill('101');await page.locator('[data-quantity="0"]').press('Tab');
  assert.match(await page.locator('.cart-item strong').innerText(),/Sob orçamento/);assert.equal(await page.locator('.cart-item small').count(),0);
  await page.locator('[data-quantity="0"]').fill('1000');await page.locator('[data-quantity="0"]').press('Tab');
  assert.match(await page.locator('#cart-totals').innerText(),/3\.600,00/);
  await close();await page.reload();await open();assert.match(await page.locator('#cart-totals').innerText(),/3\.600,00/);
  await page.locator('#clear-cart').click();await close();
  await page.locator('#option-canetas').selectOption('other');await page.locator('#qty-canetas').fill('250');
  assert.equal(await page.locator('[data-add="canetas"]').innerText(),'Solicitar orçamento');
  await page.locator('[data-add="canetas"]').click();await page.locator('#qty-a3').fill('3');await page.locator('[data-add="a3"]').click();await open();
  assert.match(await page.locator('#cart-totals').innerText(),/9,00/);
  const pending=new URL(await page.locator('#checkout').getAttribute('href')).searchParams.get('text');
  assert.match(pending,/250 unidade/);assert.match(pending,/Preço a confirmar/);assert.doesNotMatch(pending,/5,20|4,00|3,60/);
  const popup=context.waitForEvent('page');await page.locator('#checkout').click();const whatsapp=await popup;await whatsapp.waitForLoadState();
  assert.equal(new URL(whatsapp.url()).pathname,'/5551981687562');await whatsapp.close();
  await close();await page.locator('#search').fill('canetas');assert.equal(await page.locator('.product').count(),1);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.waitForTimeout(4300);await card.scrollIntoViewIfNeeded();
  await page.screenshot({path:`.preview/canetas/canetas-${width}.png`});
  assert.deepEqual(errors,[]);
  report.push({width,url:origin,tableTotalsCents:[52000,200000,360000],unlistedQuantityQuoted:true,cartEditingRepriced:true,persistence:true,otherProductsDomPreserved:!published,whatsappClick:true,realMessagesSent:0,javascriptErrors:errors,published});
  await context.close();
 }
 await writeFile('.preview/canetas/browser-report.json',JSON.stringify({commit:process.env.GITHUB_SHA,checks:report},null,2));console.log(JSON.stringify(report));
}finally{await browser.close();if(!published)await new Promise(r=>server.close(r));}
