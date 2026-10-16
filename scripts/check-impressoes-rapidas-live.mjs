import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
const origin='https://idygrafica.netlify.app';
const merged='9cbb3068bcdfe31f19426658496579898694abdd';
const original='2e7212f674c0235b62c1d95c405e9547ec408d5a';
const out='.preview/impressoes-rapidas-publicada';
fs.mkdirSync(out,{recursive:true});
const expected=p=>execFileSync('git',['show',merged+':'+p],{maxBuffer:6000000});
async function get(p){return fetch(origin+p,{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(20000)});}
let publication;
const htmlResponses=[];
for(let attempt=1;attempt<=1;attempt++){
 try{
  const response=await get('/impressoes-rapidas');
  const body=Buffer.from(await response.arrayBuffer());
  publication={attempt,status:response.status,server:response.headers.get('server'),netlifyRequestId:response.headers.get('x-nf-request-id'),exactApprovedHtml:body.equals(expected('impressoes-rapidas.html')),approvedPagePresent:body.toString().includes('quick-page')&&body.toString().includes('Gráfica rápida em Porto Alegre: impressão A3 e A4'),url:response.url};
  console.log('IDY_PUBLICATION_PROBE '+JSON.stringify(publication));
  if(response.ok&&publication.approvedPagePresent)break;
 }catch(error){console.log('IDY_PUBLICATION_PROBE '+JSON.stringify({attempt,error:error.message}));}
 if(attempt<1)await new Promise(r=>setTimeout(r,10000));
}
fs.writeFileSync(out+'/publication.json',JSON.stringify(publication||{},null,2));
assert(publication?.status===200&&publication.approvedPagePresent,'A versão aprovada ainda não está disponível no domínio público');
const files=[
 ['/impressoes-rapidas','impressoes-rapidas.html'],
 ['/assets/impressoes-rapidas.css','assets/impressoes-rapidas.css'],
 ['/servicos.html','servicos.html'],['/sitemap.xml','sitemap.xml'],['/robots.txt','robots.txt'],
 ['/','index.html'],['/assets/style.css','assets/style.css'],
 ['/assets/mobile-phone-reference.css','assets/mobile-phone-reference.css'],
 ['/assets/app.js','assets/app.js'],['/assets/logo-idy-grafica.png','assets/logo-idy-grafica.png'],
 ['/assets/mascote-idy.png','assets/mascote-idy.png']
];
const results=await Promise.all(files.map(async([url,file])=>{
 const response=await get(url),body=Buffer.from(await response.arrayBuffer());
 assert.equal(response.status,200,file+' não responde HTTP 200');
 const isHtml=file.endsWith('.html');
 if(isHtml)htmlResponses.push({file,actual:body.toString(),expected:expected(file).toString()});
 else assert(body.equals(expected(file)),'Conteúdo público diferente do merge: '+file);
 assert(!/noindex/i.test(response.headers.get('x-robots-tag')||''),'Indexação bloqueada em '+file);
 if(['index.html','assets/style.css','assets/mobile-phone-reference.css','assets/app.js','assets/logo-idy-grafica.png','assets/mascote-idy.png'].includes(file))
  assert(expected(file).equals(execFileSync('git',['show',original+':'+file],{maxBuffer:6000000})),'Arquivo original mudou: '+file);
 return{url:origin+url,status:response.status,exactMergedFile:isHtml?undefined:true,htmlComparisonPending:isHtml};
}));
assert(expected('sitemap.xml').toString().includes(origin+'/impressoes-rapidas'));
const ia=await fetch('https://atendimento-idy.netlify.app',{signal:AbortSignal.timeout(20000)});
assert.equal(ia.status,200,'Página da IA indisponível');
const redirect=await fetch(origin+'/impressoes-rapidas/',{redirect:'manual',signal:AbortSignal.timeout(20000)});
if(redirect.status===200){
 htmlResponses.push({file:'impressoes-rapidas.html',servedUrl:origin+'/impressoes-rapidas/',actual:await redirect.text(),expected:expected('impressoes-rapidas.html').toString()});
 results.push({url:origin+'/impressoes-rapidas/',status:200,htmlComparisonPending:true});
}else{
 assert([301,308].includes(redirect.status),'Resposta inesperada para URL com barra');
 assert.equal(new URL(redirect.headers.get('location'),origin).href,origin+'/impressoes-rapidas');
}
console.log('IDY_LIVE_HTTP_READY '+JSON.stringify({files:results,iaStatus:ia.status,sitemapContainsNewPage:true,sharedFilesUnchanged:true,externalMessagesSent:false}));
if(process.argv.includes('--http-only'))process.exit(0);
const require=createRequire(path.join(process.cwd(),'.preview-tools/package.json'));
const {chromium}=require('playwright');
const browser=await chromium.launch({headless:true});
try{
 const comparisonPage=await browser.newPage();
 for(const item of htmlResponses){
  const compared=await comparisonPage.evaluate(({actual,expected,origin})=>{
   function canonical(node){
    if(node.nodeType===Node.ELEMENT_NODE){
     const attrs=[...node.attributes].map(a=>{
      let value=a.value;
      if(a.name==='href'&&node.tagName==='A'){
       const url=new URL(value,origin);
       if(url.origin===origin){url.pathname=url.pathname.replace(/\/index\.html$/,'/').replace(/\.html$/,'');value=url.pathname+url.search+url.hash;}
      }
      return[a.name,value];
     }).sort((a,b)=>a[0].localeCompare(b[0]));
     return[node.tagName,attrs,[...node.childNodes].map(canonical)];
    }
    if(node.nodeType===Node.TEXT_NODE||node.nodeType===Node.COMMENT_NODE)return[node.nodeType,node.textContent];
    return[node.nodeType,[...node.childNodes].map(canonical)];
   }
   const parser=new DOMParser(),a=JSON.stringify(canonical(parser.parseFromString(actual,'text/html'))),b=JSON.stringify(canonical(parser.parseFromString(expected,'text/html')));
   let index=0;while(index<a.length&&index<b.length&&a[index]===b[index])index++;
   return{equivalent:a===b,normalization:'Only Netlify Pretty URLs and standard HTML parsing',actualDifference:a===b?undefined:a.slice(Math.max(0,index-80),index+240),expectedDifference:a===b?undefined:b.slice(Math.max(0,index-80),index+240)};
  },{...item,origin});
  console.log('IDY_LIVE_HTML_COMPARISON '+JSON.stringify({file:item.file,servedUrl:item.servedUrl,...compared}));
  assert(compared.equivalent,'Conteúdo público difere do aprovado: '+item.file);
  const result=results.find(r=>r.url===(item.servedUrl||origin+(item.file==='index.html'?'/':item.file==='impressoes-rapidas.html'?'/impressoes-rapidas':'/'+item.file)));
  result.htmlComparisonPending=false;result.approvedHtmlEquivalent=true;
 }
 await comparisonPage.close();
 const report=[];
 for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
  // Exercise the real published UI, intercepting only external messaging/social destinations.
  await context.route('https://wa.me/**',route=>route.fulfill({status:200,contentType:'text/html',body:'Destino WhatsApp verificado sem envio de mensagem.'}));
  await context.route('https://atendimento-idy.netlify.app/**',route=>route.fulfill({status:200,contentType:'text/html',body:'Destino IA verificado sem iniciar conversa.'}));
  await context.route('https://www.instagram.com/idygrafica/**',route=>route.fulfill({status:200,contentType:'text/html',body:'Instagram oficial: destino verificado.'}));
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const response=await page.goto(origin+'/impressoes-rapidas',{waitUntil:'networkidle'});
  assert.equal(response.status(),200);await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.title(),'Impressões Rápidas A3 e A4 em Porto Alegre | IDY Gráfica');
  assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),origin+'/impressoes-rapidas');
  assert(await page.locator('.quick-printer').evaluate(img=>img.complete&&img.naturalWidth>0));
  assert(await page.locator('.quick-mascot').evaluate(img=>img.complete&&img.naturalWidth>0));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width);
  const outside=await page.locator('.quick-main h1,.quick-main h2,.quick-main h3,.quick-main p,.quick-main li').evaluateAll(elements=>elements.filter(el=>{const b=el.getBoundingClientRect();return b.left<-.5||b.right>innerWidth+.5||el.scrollWidth>el.clientWidth+2;}).map(el=>el.textContent));
  assert.deepEqual(outside,[]);
  const count=await page.locator('a[href^="https://wa.me/"]').count();assert.equal(count,4);
  for(let i=0;i<count;i++){
   const button=page.locator('a[href^="https://wa.me/"]').nth(i),url=new URL(await button.getAttribute('href'));
   assert.equal(url.pathname,'/5551981687562');
   if(await button.getAttribute('target')==='_blank'){
    const opened=context.waitForEvent('page');await button.click();const popup=await opened;await popup.waitForLoadState();assert.equal(new URL(popup.url()).pathname,'/5551981687562');await popup.close();
   }else{
    await button.click();await page.waitForURL('https://wa.me/5551981687562');await page.goto(origin+'/impressoes-rapidas',{waitUntil:'networkidle'});
   }
  }
  for(const [selector,url] of [['.nav .cta-ai','https://atendimento-idy.netlify.app/'],['.quick-instagram','https://www.instagram.com/idygrafica/']]){
   const opened=context.waitForEvent('page');await page.locator(selector).click();const popup=await opened;await popup.waitForLoadState();assert.equal(popup.url(),url);await popup.close();
  }
  if(width<=980){const menu=page.locator('.mobile-menu-toggle');await menu.click();assert.equal(await menu.getAttribute('aria-expanded'),'true');}
  await page.locator('.navlinks').getByRole('link',{name:'Serviços',exact:true}).click();await page.waitForURL(url=>url.origin===origin&&/^\/servicos(?:\.html)?$/.test(url.pathname));
  await page.getByRole('link',{name:'Ver Impressões Rápidas',exact:false}).click();await page.waitForURL(origin+'/impressoes-rapidas');
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
  const name=width===390?'mobile':'desktop';
  await page.screenshot({path:out+'/'+name+'.jpg',fullPage:true,type:'jpeg',quality:65,animations:'disabled'});
  await page.goto(origin+'/',{waitUntil:'networkidle'});assert(await page.locator('.nav .logo img').isVisible());
  assert.deepEqual(errors,[]);
  report.push({width,publishedPage:true,whatsappLinksTested:count,iaLinkVerified:true,instagramVerified:true,servicesNavigationVerified:true,homepageWorks:true,noHorizontalOverflow:true});
  console.log('IDY_LIVE_BROWSER_VERIFIED '+JSON.stringify(report.at(-1)));
  await context.close();
 }
 fs.writeFileSync(out+'/report.json',JSON.stringify({merged,publication,files:results,viewports:report,externalMessagesSent:false,aiProjectModified:false},null,2));
 console.log('IDY_PUBLICATION_VERIFIED '+JSON.stringify({url:origin+'/impressoes-rapidas',netlify:publication.server,approvedFilesServed:true,netlifyPrettyUrlsVerified:true,homepageContentUnchanged:true,sitemapContainsNewPage:true,viewports:report.length,externalMessagesSent:false,aiProjectModified:false}));
}finally{await browser.close();}
