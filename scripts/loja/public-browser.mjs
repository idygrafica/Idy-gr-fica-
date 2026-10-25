import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(resolve('.preview-tools/package.json'));
const {chromium}=require('playwright');
const origin=process.env.LOJA_PUBLIC_URL||'https://deploy-preview-9--idygrafica.netlify.app/';
assert(['deploy-preview-9--idygrafica.netlify.app','idygrafica.netlify.app'].includes(new URL(origin).hostname));
await mkdir('.preview/loja',{recursive:true});
const browser=await chromium.launch();const report=[];
try{
 for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:900}});const page=await context.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  // Apenas simular a abertura do WhatsApp: nenhum pedido é enviado.
  await context.route('https://wa.me/**',r=>r.fulfill({contentType:'text/html',body:'Link verificado. Nenhuma mensagem enviada.'}));
  await page.goto(origin,{waitUntil:'networkidle'});await page.waitForSelector('[data-product="a3"]');
  assert.equal(await page.locator('.product').count(),8);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  for(const selector of ['.brand img','.mascot','.printer'])assert(await page.locator(selector).evaluate(el=>el.complete&&el.naturalWidth>0));
  await page.locator('#qty-a3').fill('3');await page.locator('[data-add="a3"]').click();
  if(width===390)await page.locator('.cart-toggle').click();
  assert.match(await page.locator('#cart-totals').innerText(),/9,00/);
  const popup=context.waitForEvent('page');await page.locator('#checkout').click();const whatsapp=await popup;await whatsapp.waitForLoadState();
  const target=new URL(whatsapp.url());assert.equal(target.hostname,'wa.me');assert.equal(target.pathname,'/5551981687562');assert.match(target.searchParams.get('text'),/Total: R\$\s9,00/);await whatsapp.close();
  await page.locator('#clear-cart').click();if(width===390)await page.keyboard.press('Escape');
  await page.locator('#option-a3').selectOption('duplex');await page.locator('#qty-a3').fill('100');await page.locator('[data-add="a3"]').click();
  if(width===390)await page.locator('.cart-toggle').click();assert.match(await page.locator('#cart-totals').innerText(),/600,00/);
  assert.deepEqual(errors,[]);report.push({width,publicUrl:origin,products:8,front3Cents:900,duplex100Cents:60000,whatsappClickVerified:true,realMessagesSent:0,javascriptErrors:errors});
  await context.close();
 }
 await writeFile('.preview/loja/public-browser.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close();}
