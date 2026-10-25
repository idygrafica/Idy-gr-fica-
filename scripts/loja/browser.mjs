import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {server} from './server.mjs';
import {resolve} from 'node:path';
import {readFileSync} from 'node:fs';
const require=createRequire(resolve('.preview-tools/package.json'));
const {chromium}=require('playwright');
await mkdir('.preview/loja',{recursive:true});

await new Promise(r=>server.listen(4173,'127.0.0.1',r));
const browser=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage']});
const results=[];
try {
 for(const width of [1440,1280,768,390,360,320]) {
  const context=await browser.newContext({viewport:{width,height:width>700?1000:844},deviceScaleFactor:1});
  const page=await context.newPage();const errors=[];const network=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>{const url=new URL(route.request().url());if(url.hostname!=='127.0.0.1'){network.push(url.hostname);return route.abort();}return route.continue();});
  await page.goto('http://127.0.0.1:4173/');await page.waitForSelector('[data-product="a3"]');
  assert.equal(await page.locator('.product').count(),8);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'página sem rolagem horizontal');
  assert.equal(await page.locator('.brand img').evaluate(el=>el.naturalWidth>0),true);
  assert.equal(await page.locator('.printer').evaluate(el=>el.naturalWidth>0),true);
  assert.equal(await page.locator('.mascot').evaluate(el=>el.naturalWidth>0),true);
  for(const [cat,count] of [['impressoes',1],['cartoes',1],['pastas',2],['comandas',1],['adesivos',1],['brindes',2],['todos',8]]){
   await page.locator('[data-category="'+cat+'"]').click();assert.equal(await page.locator('.product').count(),count);
  }
  await page.locator('.all-products').click();assert.equal(await page.locator('.product').count(),8);
  await page.locator('#search').fill('CANETAS');assert.equal(await page.locator('.product').count(),1);
  await page.locator('#search').fill('receituarios');assert.equal(await page.locator('.product').count(),1);
  await page.locator('#search').fill('inexistente');assert(await page.locator('.empty-results').isVisible());
  await page.locator('.all-products').click();
  await page.locator('#qty-a3').fill('3');await page.locator('[data-add="a3"]').click();
  const open=async()=>{if(width<=1100&&!await page.locator('#cart').isVisible())await page.locator('.cart-toggle').click();};
  const close=async()=>{if(width<=1100)await page.keyboard.press('Escape');};
  await open();assert.match(await page.locator('#cart-totals').innerText(),/9,00/);
  assert.match(new URL(await page.locator('#checkout').getAttribute('href')).searchParams.get('text'),/Total: R\$\s9,00/);
  await page.locator('[data-change="0"][data-delta="1"]').click();assert.match(await page.locator('#cart-totals').innerText(),/12,00/);
  await page.locator('[data-quantity="0"]').fill('3');await page.locator('[data-quantity="0"]').press('Tab');
  await close();await page.reload();await open();assert.match(await page.locator('#cart-totals').innerText(),/9,00/);
  await close();
  await page.locator('[data-add="cartoes"]').click();await open();
  const url=new URL(await page.locator('#checkout').getAttribute('href'));
  assert.equal(url.pathname,'/5551981687562');assert.match(url.searchParams.get('text'),/Preço a confirmar/);
  assert.match(await page.locator('#cart-totals').innerText(),/Subtotal calculado/);assert.match(await page.locator('#cart-totals').innerText(),/9,00/);
  await page.locator('[data-remove="1"]').click();assert.equal(await page.locator('.cart-item').count(),1);
  await page.locator('#clear-cart').click();assert.equal(await page.locator('#checkout').getAttribute('aria-disabled'),'true');
  await close();await page.locator('#option-a3').selectOption('duplex');assert.match(await page.locator('[data-product="a3"] .price').innerText(),/6,00/);
  await page.locator('#qty-a3').fill('100');await page.locator('[data-add="a3"]').click();await open();
  assert.match(await page.locator('#cart-totals').innerText(),/600,00/);
  await page.locator('[data-quantity="0"]').fill('-2');await page.locator('[data-quantity="0"]').press('Tab');assert.equal(await page.locator('[data-quantity="0"]').inputValue(),'100');
  await page.locator('#clear-cart').click();await close();
  assert.equal(await page.locator('.ai').getAttribute('href'),'https://atendimento-idy.netlify.app/');
  for(const id of ['cartoes','pastas','blocos','comandas','adesivos','brindes','canetas']){
   await page.locator('[data-add="'+id+'"]').click();
  }
  await open();assert.equal(await page.locator('.cart-item').count(),7);assert.equal(await page.locator('#cart-totals strong').innerText(),'R$ 0,00');
  await page.locator('#clear-cart').click();await close();
  // Navegação verdadeira até as páginas existentes e volta com carrinho preservado.
  await page.locator('#option-a3').selectOption('frente');await page.locator('#qty-a3').fill('3');await page.locator('[data-add="a3"]').click();
  for(const path of ['/sobre','/servicos','/impressoes-do-dia-a-dia','/impressoes-rapidas','/impressos','/comunicacao-visual','/cortes-especiais','/livros-digitais','/criacao-sites','/portfolio','/contato']) {
   const link=page.locator('.institution-links a[href="'+path+'"]');assert.equal(await link.count(),1);
   // Os destinos são arquivos mantidos no repositório: verificados por HTTP local.
   const response=await page.request.get('http://127.0.0.1:4173'+path);assert.equal(response.status(),200);
  }
  await page.locator('.institution-links a[href="/sobre"]').click();await page.waitForURL('**/sobre');
  await page.locator('a[href="/"]').first().click();await page.waitForURL('http://127.0.0.1:4173/');await open();assert.match(await page.locator('#cart-totals').innerText(),/9,00/);
  await page.locator('#clear-cart').click();await close();
  // Capturas mostram dados reais de teste: 3 folhas A3 + cartões sob orçamento.
  await page.locator('#option-a3').selectOption('frente');await page.locator('#qty-a3').fill('3');await page.locator('[data-add="a3"]').click();await page.locator('[data-add="cartoes"]').click();
  await page.waitForTimeout(4300);await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:`.preview/loja/loja-${width}.png`,fullPage:true});
  if(width<=1100){await open();assert.equal(await page.locator('#cart').getAttribute('role'),'dialog');await page.screenshot({path:`.preview/loja/carrinho-${width}.png`,fullPage:true});await page.keyboard.press('Escape');assert.equal(await page.locator('.cart-toggle').getAttribute('aria-expanded'),'false');}
  assert.deepEqual(errors,[]);assert(network.every(host=>!host.includes('wa.me')&&!host.includes('atendimento-idy')));
  results.push({viewport:width,result:'passed',scenarios:['8 produtos','categorias','pesquisa com acento','sem resultados','A3 3=9','100 duplex=600','alteração de quantidade','persistência','orçamento misto sem preço inventado','remover','limpar','WhatsApp','link IA','sem overflow','imagens carregadas','quantidade inválida','sem envio externo'],javascriptErrors:errors,externalRequestsBlocked:network,realMessagesSent:0,institutionalRoutes:11});
  await context.close();
 }
 console.log(JSON.stringify(results,null,2));await writeFile('.preview/loja/browser-report.json',JSON.stringify(results,null,2));
}finally{await browser.close();await new Promise(r=>server.close(r));}
