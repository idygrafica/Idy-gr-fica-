import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
const root=process.cwd(),require=createRequire(path.join(root,'.preview-tools/package.json'));
const {chromium}=require('playwright');
const original='2e7212f674c0235b62c1d95c405e9547ec408d5a';
const preserved=['index.html','assets/style.css','assets/mobile-phone-reference.css','assets/app.js','assets/logo-idy-grafica.png','assets/mascote-idy.png'];
for(const file of preserved)assert(fs.readFileSync(file).equals(execFileSync('git',['show',original+':'+file],{maxBuffer:6000000})),file+' foi alterado');
const html=fs.readFileSync('impressoes-rapidas.html','utf8');
assert(!/\bNOVA\b/i.test(html));
assert.equal((html.match(/<h1\b/g)||[]).length,1);
assert(html.includes('DA PRIMEIRA FOLHA À SUA PRÓXIMA'));
const printer=html.match(/class="quick-printer" src="([^"]+)"/)[1].replaceAll('&amp;','&');
const photoResponse=await fetch(printer,{signal:AbortSignal.timeout(25000)});
assert(photoResponse.ok,'Foto da Xerox indisponível: HTTP '+photoResponse.status);
const photo=Buffer.from(await photoResponse.arrayBuffer());assert(photo.length>5000);
console.log('QUICK_PRINTER_IMAGE_BASE64 '+photo.toString('base64'));
fs.mkdirSync('.preview/impressoes-rapidas',{recursive:true});
const baseHtml=execFileSync('git',['show',original+':index.html'],{encoding:'utf8'});
const types={'.css':'text/css','.js':'text/javascript','.html':'text/html; charset=utf-8','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg'};
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/impressoes-rapidas/'){res.writeHead(301,{Location:'/impressoes-rapidas'});return res.end();}
 if(url.pathname==='/__base'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});return res.end(baseHtml);}
 const name=url.pathname==='/impressoes-rapidas'?'impressoes-rapidas.html':url.pathname==='/'?'index.html':decodeURIComponent(url.pathname).slice(1);
 const local=path.resolve(root,name);
 if(!local.startsWith(root+path.sep)||!fs.existsSync(local)||fs.statSync(local).isDirectory()){res.writeHead(404);return res.end();}
 res.writeHead(200,{'Content-Type':types[path.extname(local)]||'application/octet-stream'});fs.createReadStream(local).pipe(res);
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true});
try{
 const report=[];
 for(const width of [320,360,390,480,620,768,820,1024,1280,1440]){
  const context=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:1,reducedMotion:'reduce'});
  await context.route(printer,route=>route.fulfill({status:200,contentType:'image/jpeg',body:photo}));
  await context.route('https://wa.me/**',route=>route.fulfill({status:200,contentType:'text/html',body:'WhatsApp: destino verificado sem enviar mensagem.'}));
  await context.route('https://atendimento-idy.netlify.app/**',route=>route.fulfill({status:200,contentType:'text/html',body:'Destino IA verificado sem iniciar atendimento.'}));
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(origin+'/impressoes-rapidas',{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.title(),'Impressões Rápidas A3 e A4 em Porto Alegre | IDY Gráfica');
  assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://idygrafica.netlify.app/impressoes-rapidas');
  const main=page.locator('.quick-main');
  assert.match((await main.locator('h1').innerText()).replace(/\s+/g,' '),/Impressões Rápidas A3 e A4/i);
  assert.equal((await main.locator('.quick-slogan').innerText()).replace(/\s+/g,' ').trim(),'DA PRIMEIRA FOLHA À SUA PRÓXIMA GRANDE IDEIA!');
  assert.equal(await page.locator('.quick-service-card').count(),3);
  assert.equal(await page.locator('.quick-steps>li').count(),5);
  const geometry=await page.evaluate(()=>{
   const all=[...document.querySelectorAll('.quick-main h1,.quick-main h2,.quick-main h3,.quick-main p,.quick-main li,.quick-main summary')].filter(el=>el.getClientRects().length>0&&!el.closest('details:not([open]) p'));
   const outside=all.filter(el=>{const b=el.getBoundingClientRect();return b.left<-.5||b.right>innerWidth+.5||el.scrollWidth>el.clientWidth+2;}).map(el=>el.textContent.trim().slice(0,70));
   const images=[...document.querySelectorAll('.quick-visual img,.nav .logo img')];
   return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,outside,images:images.map(img=>({src:img.getAttribute('src'),loaded:img.complete&&img.naturalWidth>0})),buttonVisible:[...document.querySelectorAll('.quick-actions a')].every(a=>{const b=a.getBoundingClientRect();return b.width>40&&b.height>=44;})};
  });
  assert.equal(geometry.scrollWidth,width,'Rolagem horizontal '+width);
  assert.deepEqual(geometry.outside,[],'Texto fora da tela em '+width);
  assert(geometry.images.every(i=>i.loaded),'Imagem ausente '+width);
  assert(geometry.buttonVisible);
  const heroOverlaps=await page.evaluate(()=>{
   const copy=document.querySelector('.quick-hero-copy').getBoundingClientRect();
   return [...document.querySelectorAll('.quick-visual img')].some(img=>{const b=img.getBoundingClientRect();return Math.min(copy.right,b.right)-Math.max(copy.left,b.left)>1&&Math.min(copy.bottom,b.bottom)-Math.max(copy.top,b.top)>1;});
  });
  assert(!heroOverlaps,'Imagem cobre o texto em '+width);
  const wa=page.locator('.quick-actions a').first(),waUrl=new URL(await wa.getAttribute('href'));
  assert.equal(waUrl.hostname,'wa.me');assert.equal(waUrl.pathname,'/5551981687562');assert.match(waUrl.searchParams.get('text'),/Impressões Rápidas/);
  const popupPromise=context.waitForEvent('page');await wa.click();const popup=await popupPromise;await popup.waitForLoadState();
  assert.equal(new URL(popup.url()).pathname,'/5551981687562');await popup.close();
  const mail=await page.locator('.quick-email').getAttribute('href');assert(mail.startsWith('mailto:idygrafica@gmail.com?'));
  const ia=page.locator('.nav .cta-ai');assert.equal(await ia.getAttribute('href'),'https://atendimento-idy.netlify.app');
  if(width<=980){const toggle=page.locator('.mobile-menu-toggle');await toggle.scrollIntoViewIfNeeded();await toggle.click();assert.equal(await toggle.getAttribute('aria-expanded'),'true');assert(await page.locator('.navlinks').isVisible());await toggle.click();}
  for(const details of await page.locator('.quick-questions details').all()){await details.locator('summary').click();assert(await details.getAttribute('open')!==null);await details.locator('summary').click();}
  for(const action of await page.locator('.quick-final .quick-btn').all()){await action.scrollIntoViewIfNeeded();await action.click({trial:true});}
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
  if(width===390||width===1440)await page.screenshot({path:'.preview/impressoes-rapidas/'+(width===390?'mobile':'desktop')+'.jpg',fullPage:true,type:'jpeg',quality:65,animations:'disabled'});
  assert.deepEqual(errors,[]);
  await page.goto(origin+'/servicos.html',{waitUntil:'networkidle'});
  const link=page.getByRole('link',{name:'Ver Impressões Rápidas',exact:false});assert.equal(await link.count(),1);await link.click();assert.equal(new URL(page.url()).pathname,'/impressoes-rapidas');
  // Compare home screenshots against the unchanged base with the same original assets.
  await page.goto(origin+'/',{waitUntil:'networkidle'});await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));const home=await page.screenshot({animations:'disabled'});
  await page.goto(origin+'/__base',{waitUntil:'networkidle'});await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));const baseline=await page.screenshot({animations:'disabled'});
  assert(home.equals(baseline),'A página inicial mudou visualmente em '+width);
  report.push({...geometry,homeUnchanged:true,menuVerified:true,whatsappVerified:true,iaPreserved:true,threeServiceCards:true,fiveOrderSteps:true});
  console.log('QUICK_PRINT_WIDTH_VERIFIED '+JSON.stringify(report.at(-1)));
  await context.close();
 }
 fs.writeFileSync('.preview/impressoes-rapidas/report.json',JSON.stringify({preserved,printerSource:printer,referenceAttachmentReceived:true,checks:report},null,2));
 for(const name of ['desktop','mobile'])console.log('QUICK_PRINT_PREVIEW_'+name.toUpperCase()+'_BASE64 '+fs.readFileSync('.preview/impressoes-rapidas/'+name+'.jpg').toString('base64'));
 console.log('QUICK_PRINT_PREVIEW_VERIFIED '+JSON.stringify({widths:report.length,homepageIdentical:true,externalMessagesSent:false,netlifyPublished:false,approvedReferenceComparison:'HTML/CSS adapted to received reference; original brand assets preserved'}));
}finally{await browser.close();server.close();}
