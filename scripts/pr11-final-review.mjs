// Revisão do deploy preview existente. Só GET e navegador; nenhum merge/deploy.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const require=createRequire(resolve('.preview-tools/package.json'));
const {chromium}=require('playwright');
const preview='https://deploy-preview-11--idygrafica.netlify.app';
const production='https://idygrafica.netlify.app';
const subject='b00cbfcb25f0935e8faf0b9ebec290c201a7a439';
const pages=JSON.parse(await readFile('scripts/seo-technical/pages.json','utf8'));
const report={subjectCommit:subject,preview,production,pages:[],images:[],commerce:[],productionPublished:false,realWhatsAppMessagesSent:0,verified:false};
await mkdir('.preview/pr11-final',{recursive:true});
const changes=execFileSync('git',['diff','--name-only',subject,'HEAD'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
assert.deepEqual(changes.sort(),['.github/workflows/pr11-final-review.yml','scripts/pr11-final-review.mjs'].sort(),'A branch de revisão modificou código da PR');
const hash=b=>createHash('sha1').update(Buffer.from(`blob ${b.length}\0`)).update(b).digest('hex');
const get=async(url,options={})=>{
 let last;
 for(let i=0;i<3;i++)try{return await fetch(url,{signal:AbortSignal.timeout(20000),...options});}catch(e){last=e;}
 throw last;
};
const browser=await chromium.launch();
try{
 for(const file of ['assets/logo-idy-grafica.png','assets/mascote-idy.png','assets/xerox-color-560-home.webp','assets/loja/referencia-aprovada.jpg','assets/loja/styles.css','assets/loja/catalog.js','assets/loja/cart.js']){
  const [a,b]=await Promise.all([get(preview+'/'+file),get(production+'/'+file)]);assert.equal(a.status,200);assert.equal(b.status,200);
  const [x,y]=await Promise.all([a.arrayBuffer(),b.arrayBuffer()]);const expected=hash(await readFile(file));
  assert.equal(hash(Buffer.from(x)),expected,file+' diverge na prévia');assert.equal(hash(Buffer.from(y)),expected,file+' diverge da produção');
  report.images.push({file,previewMatchesApproved:true,productionMatchesApproved:true});
 }
 const robots=await get(preview+'/robots.txt');assert.equal(robots.status,200);const robotsText=await robots.text();assert(!/Disallow:\s*\/\s*$/m.test(robotsText));assert(robotsText.includes('Sitemap: '+production+'/sitemap.xml'));
 const sitemap=await get(preview+'/sitemap.xml');assert.equal(sitemap.status,200);
 const locs=[...(await sitemap.text()).matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);assert.deepEqual([...locs].sort(),pages.map(p=>production+p.path).sort());
 report.sitemapUrls=locs.length;report.robotsAllowsCrawl=true;
 for(const p of pages){
  const [a,b]=await Promise.all([get(preview+p.path),get(production+p.path)]);assert.equal(a.status,200,p.path);assert.equal(b.status,200,p.path);
  const html=await a.text(),prodHtml=await b.text();
  assert(!/<meta\b[^>]*(?:name=["'](?:robots|googlebot)["'][^>]*content=["'][^"']*noindex|content=["'][^"']*noindex[^"']*["'][^>]*name=["'](?:robots|googlebot)["'])/i.test(html));
  assert(!/noindex/i.test(b.headers.get('x-robots-tag')||''),'Produção com bloqueio de indexação');
  assert(!/<meta\b[^>]*(?:name=["'](?:robots|googlebot)["'][^>]*content=["'][^"']*noindex|content=["'][^"']*noindex[^"']*["'][^>]*name=["'](?:robots|googlebot)["'])/i.test(prodHtml));
  if(p.path==='/'){assert.equal((html.match(/data-product=/g)||[]).length,8);for(const id of ['cartoes','a3','pastas','blocos','comandas','adesivos','brindes','canetas'])assert(html.includes('id="produto-'+id+'"'));report.productsInInitialHtml=8;}
  report.pages.push({path:p.path,previewStatus:a.status,productionStatus:b.status,previewRobotsHeader:a.headers.get('x-robots-tag'),productionRobotsHeader:b.headers.get('x-robots-tag'),noHtmlNoindex:true});
 }
 for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:950},reducedMotion:'reduce'});
  // A barra de colaboração não pertence à loja; bloqueada só no navegador de QA.
  await context.route(/\/\.netlify\/scripts\/cdp(?:\?|$)/,r=>r.fulfill({contentType:'text/javascript',body:''}));
  // Simular abertura do aplicativo sem enviar mensagens nem iniciar atendimento.
  await context.route('https://wa.me/**',r=>r.fulfill({contentType:'text/html',body:'Destino conferido sem enviar mensagem.'}));
  const page=await context.newPage(),before=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  for(const p of pages){
   await Promise.all([page.goto(preview+p.path,{waitUntil:'domcontentloaded'}),before.goto(production+p.path,{waitUntil:'domcontentloaded'})]);
   for(const site of [page,before]){
    await site.evaluate(()=>document.fonts.ready);
    await site.locator('img').evaluateAll(async images=>{await Promise.race([Promise.all(images.map(async img=>{img.loading='eager';await img.decode().catch(()=>{});})),new Promise(r=>setTimeout(r,20000))]);});
    const missing=await site.locator('img').evaluateAll(images=>images.filter(i=>new URL(i.src).origin===location.origin&&(!i.complete||!i.naturalWidth)).map(i=>i.src));assert.deepEqual(missing,[],'Imagem local não carregou');
    await site.mouse.move(0,0);
   }
   assert.equal(await page.title(),p.title);assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),production+p.path);
   const a=await page.screenshot({fullPage:true,animations:'disabled',mask:[page.locator('video')]}),b=await before.screenshot({fullPage:true,animations:'disabled',mask:[before.locator('video')]});
   const identical=a.equals(b);const name=p.path==='/'?'index':p.path.slice(1);
   if(p.path==='/'||!identical){await writeFile(`.preview/pr11-final/${name}-${width}-preview.png`,a);await writeFile(`.preview/pr11-final/${name}-${width}-production.png`,b);}
   assert(identical,'Diferença visual na prévia real: '+p.path+' '+width);
   if(p.path==='/'){
    assert.equal(await page.locator('.product').count(),8);
    for(const selector of ['.brand img','.mascot','.printer'])assert(await page.locator(selector).evaluate(i=>i.complete&&i.naturalWidth>0));
    const classes=await page.locator('.product-photo').evaluateAll(els=>els.map(e=>e.className));for(let n=0;n<8;n++)assert(classes[n].includes('photo-'+n));
   }
   report.pages.find(x=>x.path===p.path)['visual'+width]={pixelIdentical:true,nativeVideoRegionMasked:await page.locator('video').count()>0,previewToolbarExcluded:true};
  }
  await before.close();await page.goto(preview+'/',{waitUntil:'domcontentloaded'});
  const open=async()=>{if(width<1101&&!await page.locator('#cart').isVisible())await page.locator('.cart-toggle').click();};
  const close=async()=>{if(width<1101)await page.keyboard.press('Escape');};
  for(const [cat,count] of [['impressoes',1],['cartoes',1],['pastas',2],['comandas',1],['adesivos',1],['brindes',2],['todos',8]]){await page.locator('[data-category="'+cat+'"]').click();assert.equal(await page.locator('.product').count(),count);}
  await page.locator('#search').fill('canetas');assert.equal(await page.locator('.product').count(),1);await page.locator('.all-products').click();
  const cases=[{id:'a3',option:'frente',qty:'3',unit:'3,00',total:'9,00'},{id:'a3',option:'duplex',qty:'100',unit:'6,00',total:'600,00'},...[[100,'5,20','520,00'],[500,'4,00','2.000,00'],[1000,'3,60','3.600,00']].map(([n,unit,total])=>({id:'canetas',option:String(n),qty:String(n),unit,total}))];
  for(const c of cases){
   await page.locator('#option-'+c.id).selectOption(c.option);await page.locator('#qty-'+c.id).fill(c.qty);await page.locator('[data-add="'+c.id+'"]').click();await open();
   assert((await page.locator('.cart-item strong').innerText()).includes(c.total));assert((await page.locator('.cart-item small').innerText()).includes(c.unit));
   const text=new URL(await page.locator('#checkout').getAttribute('href')).searchParams.get('text');assert(text.includes(c.total)&&text.includes(c.unit));
   await page.locator('#clear-cart').click();await close();
  }
  await page.locator('#option-canetas').selectOption('other');await page.locator('#qty-canetas').fill('250');await page.locator('[data-add="canetas"]').click();await open();
  assert.match(await page.locator('.cart-item strong').innerText(),/Sob orçamento/);assert.equal(await page.locator('.cart-item small').count(),0);
  const quoted=new URL(await page.locator('#checkout').getAttribute('href'));assert.equal(quoted.pathname,'/5551981687562');assert.match(quoted.searchParams.get('text'),/Preço a confirmar/);
  const popup=context.waitForEvent('page');await page.locator('#checkout').click();const external=await popup;await external.waitForLoadState();assert.equal(new URL(external.url()).pathname,'/5551981687562');await external.close();
  await page.locator('[data-quantity="0"]').fill('500');await page.locator('[data-quantity="0"]').press('Tab');assert.match(await page.locator('#cart-totals').innerText(),/2\.000,00/);
  await close();await page.reload({waitUntil:'domcontentloaded'});await open();assert.match(await page.locator('#cart-totals').innerText(),/2\.000,00/);
  await page.locator('[data-remove="0"]').click();assert.equal(await page.locator('#checkout').getAttribute('aria-disabled'),'true');await close();
  assert.equal(new URL(await page.locator('.ai').getAttribute('href')).origin,'https://atendimento-idy.netlify.app');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);
  report.commerce.push({width,a3Front3:900,a3Duplex100:60000,pensTotals:[52000,200000,360000],unlistedQuantityQuoted:true,quantityEditing:true,persistence:true,categories:true,search:true,remove:true,whatsappOpenedWithoutSending:true,javascriptErrors:errors});
  await context.close();
 }
 const nojs=await browser.newContext({javaScriptEnabled:false});const page=await nojs.newPage();await page.goto(preview);assert.equal(await page.locator('[data-product]').count(),8);await nojs.close();
 const ai=await get('https://atendimento-idy.netlify.app/');assert.equal(ai.status,200);report.aiStatus=200;
 report.previewNoindexExpected=report.pages.every(p=>/noindex/i.test(p.previewRobotsHeader||''));report.noProductionNoindex=report.pages.every(p=>!/noindex/i.test(p.productionRobotsHeader||''));
 report.verified=true;report.completedAt=new Date().toISOString();
}finally{await writeFile('.preview/pr11-final/report.json',JSON.stringify(report,null,2));await browser.close();console.log(JSON.stringify(report));}
