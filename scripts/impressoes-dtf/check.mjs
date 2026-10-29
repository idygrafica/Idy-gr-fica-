import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {makeServer} from '../seo-technical/server.mjs';
const base='92583ed7e5615c28aed7350897d80c4d6e297064';
const allowed=new Set(['impressoes-rapidas.html','dtf-personalizacao.html','assets/impressoes-rapidas-v2.css','assets/personalizacao/camiseta-bone-estudio.jpg','sitemap.xml','netlify.toml','scripts/impressoes-dtf/check.mjs','.github/workflows/impressoes-dtf.yml','IMPRESSOES_DTF_REVISAO.md']);
const files=execFileSync('git',['diff','--name-only',base],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
for(const f of files)assert(allowed.has(f),'Alteração fora do escopo: '+f);
// Protege todos os arquivos anteriores, inclusive preço, carrinho, imagens e páginas.
const originals=execFileSync('git',['ls-tree','-r','--name-only',base],{encoding:'utf8'}).trim().split('\n');
let protectedFiles=0;
for(const f of originals.filter(f=>!allowed.has(f))){
 const before=execFileSync('git',['rev-parse',base+':'+f],{encoding:'utf8'}).trim();
 const after=execFileSync('git',['hash-object',f],{encoding:'utf8'}).trim();assert.equal(after,before,f);protectedFiles++;
}
const old=execFileSync('git',['show',base+':impressoes-rapidas.html'],{encoding:'utf8'});
const quick=await readFile('impressoes-rapidas.html','utf8'),dtf=await readFile('dtf-personalizacao.html','utf8');
for(const re of [/<title>[\s\S]*?<\/title>/,/<meta name="description"[^>]*>/,/<link rel="canonical"[^>]*>/])assert.equal(quick.match(re)[0],old.match(re)[0],'SEO original alterado');
const priorConfig=execFileSync('git',['show',base+':netlify.toml'],{encoding:'utf8'});
const currentConfig=await readFile('netlify.toml','utf8');assert(currentConfig.startsWith(priorConfig));
assert(currentConfig.endsWith('[[redirects]]\n  from = "/dtf-personalizacao.html"\n  to = "/dtf-personalizacao"\n  status = 301\n  force = true\n'));
const xml=await readFile('sitemap.xml','utf8');const locs=[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
assert.equal(new Set(locs).size,13);assert.equal(locs.length,13);assert(locs.includes('https://idygrafica.netlify.app/dtf-personalizacao'));
assert(!/noindex|nofollow|R\$/i.test(quick+dtf));
const unchangedBefore=execFileSync('git',['hash-object','index.html'],{encoding:'utf8'});execFileSync('node',['scripts/seo-technical/build-catalog.mjs']);assert.equal(execFileSync('git',['hash-object','index.html'],{encoding:'utf8'}),unchangedBefore);
await mkdir('.preview/impressoes-dtf',{recursive:true});
const require=createRequire(resolve('.preview-tools/package.json'));const {chromium}=require('playwright');
const server=makeServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
const local='http://127.0.0.1:'+server.address().port;
const origins=[process.env.VERIFY_ORIGIN||local];
if(process.env.PREVIEW_ORIGIN)origins.push(process.env.PREVIEW_ORIGIN.replace(/\/$/,''));
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
const checks=[];
try{
 for(const origin of origins){
  for(const path of ['/impressoes-rapidas','/dtf-personalizacao']){
   const expected=path==='/impressoes-rapidas'?quick:dtf;
   const main=expected.match(/<main[\s\S]*?<\/main>/)[0];
   let body='',head,status;
   for(let i=0;i<(origin===local?1:40);i++){
    try{const r=await fetch(origin+path,{signal:AbortSignal.timeout(20000),headers:{'Cache-Control':'no-cache'}});status=r.status;head=r.headers;body=await r.text();if(status===200&&body.includes(main))break;}catch{}
    await new Promise(r=>setTimeout(r,5000));
   }
   assert.equal(status,200);assert(body.includes(main),'Página não corresponde à versão testada: '+origin+path);
   if(origin.includes('deploy-preview-'))assert.match(head.get('x-robots-tag')||'',/noindex/);
   if(origin==='https://idygrafica.netlify.app')assert(!/noindex/i.test(head.get('x-robots-tag')||''));
   for(const width of [1440,1024,768,390,320]){
    const ctx=await browser.newContext({viewport:{width,height:950},reducedMotion:'reduce'});
    await ctx.route('https://wa.me/**',r=>r.fulfill({contentType:'text/html',body:'Destino verificado. Nenhuma mensagem enviada.'}));
    await ctx.route('https://atendimento-idy.netlify.app/**',r=>r.fulfill({contentType:'text/html',body:'Destino verificado. Nenhuma conversa iniciada.'}));
    const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    assert.equal((await page.goto(origin+path,{waitUntil:'domcontentloaded'})).status(),200);
    await page.evaluate(async()=>{await document.fonts.ready;const imgs=[...document.images];imgs.forEach(i=>i.loading='eager');await Promise.all(imgs.map(i=>i.decode().catch(()=>{})));});
    assert.equal(await page.locator('h1').count(),1);assert.equal(await page.locator('main').count(),1);
    const levels=await page.locator('main h1,main h2,main h3').evaluateAll(a=>a.map(e=>Number(e.tagName[1])));
    assert.equal(levels[0],1);for(let i=1;i<levels.length;i++)assert(levels[i]<=levels[i-1]+1,'Hierarquia dos títulos');
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Rolagem horizontal: '+path+' '+width);
    const broken=await page.locator('img').evaluateAll(a=>a.filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src));assert.deepEqual(broken,[]);
    const photo=page.locator('img[src*="camiseta-bone-estudio"]');assert.equal(await photo.count(),1);
    const quality=await photo.evaluate(i=>({naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight,displayWidth:i.getBoundingClientRect().width}));
    assert(quality.naturalWidth>=1800&&quality.naturalHeight>=1200);assert(quality.naturalWidth>=quality.displayWidth*2,'Fotografia insuficiente para retina');
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'https://idygrafica.netlify.app'+path);
    assert((await page.locator('meta[name="description"]').getAttribute('content')).length>80);
    for(const s of await page.locator('script[type="application/ld+json"]').allTextContents()){const data=JSON.parse(s);assert(data['@graph'].some(x=>x['@type']==='Service'));assert(data['@graph'].some(x=>x['@type']==='BreadcrumbList'));}
    for(const a of await page.locator('main a[href*="wa.me"]').all()){const u=new URL(await a.getAttribute('href'));assert.equal(u.pathname,'/5551981687562');assert(u.searchParams.get('text')?.includes('orçamento'));assert.equal(await a.getAttribute('target'),'_blank');}
    for(const a of await page.locator('main a[href^="#"]').all()){const href=await a.getAttribute('href');assert.equal(await page.locator('[id="'+href.slice(1)+'"]').count(),1);await a.click();assert.equal(new URL(page.url()).hash,href);}
    for(const href of await page.locator('main a[href^="/"]').evaluateAll(a=>[...new Set(a.map(e=>e.getAttribute('href')))])){const r=await page.request.get(origin+href);assert.equal(r.status(),200);if(href.includes('#'))assert((await r.text()).includes('id="'+href.split('#')[1]+'"'));}
    if(width<=980){const b=page.locator('.mobile-menu-toggle');await b.click();assert.equal(await b.getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await b.getAttribute('aria-expanded'),'false');}
    const [popup]=await Promise.all([ctx.waitForEvent('page'),page.locator('main .ed-button').first().click()]);await popup.waitForURL('https://wa.me/**',{waitUntil:'domcontentloaded'});assert.equal(new URL(popup.url()).pathname,'/5551981687562');await popup.close();
    if(path==='/dtf-personalizacao'){assert.equal(await page.locator('.ed-faq details').count(),4);for(const detail of await page.locator('.ed-faq details').all()){await detail.locator('summary').click();assert(await detail.getAttribute('open')!==null);}}
    assert.equal(await page.locator('header .cta-ai').getAttribute('href'),'https://atendimento-idy.netlify.app');
    await page.goto(origin+path,{waitUntil:'load'});await page.evaluate(async()=>{for(const i of document.images)i.loading='eager';await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
    await page.screenshot({path:'.preview/impressoes-dtf/'+path.slice(1)+'-'+(origin===local?'local':origin.includes('deploy-preview-')?'netlify':'producao')+'-'+width+'.png',fullPage:true,animations:'disabled'});
    assert.deepEqual(errors,[]);checks.push({origin,path,width,photo:quality,horizontalOverflow:false,javascriptErrors:errors,whatsappVerified:true});await ctx.close();
   }
  }
  const routes=locs.map(x=>new URL(x).pathname);for(const p of routes)assert.equal((await fetch(origin+p)).status,200,p);
  assert.equal((await fetch(origin+'/caminho-inexistente-dtf')).status,404);
  for(const p of ['/impressoes-rapidas','/dtf-personalizacao']){const r=await fetch(origin+p+'.html',{redirect:'manual'});assert.equal(r.status,301);assert.equal(new URL(r.headers.get('location'),origin).pathname,p);}
  // As informações centrais permanecem disponíveis sem JavaScript.
  const nojs=await browser.newContext({javaScriptEnabled:false});const p=await nojs.newPage();for(const route of ['/impressoes-rapidas','/dtf-personalizacao']){await p.goto(origin+route);assert(await p.locator('h1').isVisible());assert(await p.locator('main .ed-button').first().isVisible());}await nojs.close();
 }
 await writeFile('.preview/impressoes-dtf/report.json',JSON.stringify({verified:true,base,checks,protectedFiles,sitemapUrls:13,originalQuickMetadataPreserved:true,storeUnchanged:true,realWhatsAppMessagesSent:0,aiConversationsStarted:0},null,2));
 console.log(JSON.stringify({verified:true,responsiveCases:checks.length,protectedFiles,sitemapUrls:13,realMessagesSent:0}));
}finally{await browser.close();await new Promise(r=>server.close(r));}
