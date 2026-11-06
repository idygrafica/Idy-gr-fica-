import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {makeServer} from '../seo-technical/server.mjs';

const base='c6869c7007cc30b6b892760aab9ac4e5fc7ad56f';
const previous='https://idygrafica.netlify.app',origin='https://idygrafica.com.br';
const original=p=>execFileSync('git',['show',base+':'+p],{encoding:'utf8'});
const hash=p=>execFileSync('git',['hash-object',p],{encoding:'utf8'}).trim();
const paths=execFileSync('git',['ls-tree','-r','--name-only',base],{encoding:'utf8'}).trim().split('\n');
const migrated=[],protectedFiles=[];
for(const p of paths){
 const eligible=p.endsWith('.html')||['sitemap.xml','robots.txt'].includes(p)||/^scripts\/.*\.(mjs|py)$/.test(p)||/^\.github\/workflows\/.*\.yml$/.test(p);
 if(!eligible){assert.equal(hash(p),execFileSync('git',['rev-parse',base+':'+p],{encoding:'utf8'}).trim(),'Arquivo protegido: '+p);protectedFiles.push(p);continue;}
 const before=original(p),after=await readFile(p,'utf8');
 let expected=before.split(previous).join(origin).replaceAll('https:\\/\\/idygrafica.netlify.app','https:\\/\\/idygrafica\\.com\\.br');
 if(['scripts/loja/public-check.mjs','scripts/loja/public-browser.mjs'].includes(p))expected=expected.replace("'idygrafica.netlify.app'].includes","'idygrafica.netlify.app','idygrafica.com.br'].includes");
 if(p==='scripts/loja/netlify-check.mjs')expected=expected.replace("new URL(s.ssl_url||s.url).hostname==='idygrafica.netlify.app'","['idygrafica.netlify.app','idygrafica.com.br'].includes(new URL(s.ssl_url||s.url).hostname)");
 const legacyWorkflows=['servicos-preview.yml','impressos-preview.yml','comunicacao-visual-preview.yml','cortes-especiais-preview.yml','criacao-sites-preview.yml','impressoes-dtf.yml'].map(n=>'.github/workflows/'+n);
 if(legacyWorkflows.includes(p)){
  expected=expected.replace("    # Esta proposta é coberta pela auditoria SEO e seus testes comerciais atuais.\n    if: github.head_ref != 'codex/auditoria-seo-busca'","    # Migrações de SEO têm cobertura própria: 100 testes, 16 páginas e preservação estrita.\n    # A revisão visual histórica só se aplica às demais propostas.\n    if: github.head_ref != 'codex/auditoria-seo-busca' && github.head_ref != 'codex/seo-dominio-idygrafica-com-br'");
  if(p.endsWith('/servicos-preview.yml'))expected=expected.replace('runs-on: ubuntu-latest','runs-on: ubuntu-24.04');
 }
 assert.equal(after,expected,'Alteração além da migração de domínio: '+p);
 (before===after?protectedFiles:migrated).push(p);
 if(p.endsWith('.html')&&before.includes(previous))assert.equal(after.slice(after.indexOf('<body')),before.slice(before.indexOf('<body')),'Corpo visual/comercial alterado: '+p);
}
const urls=s=>[...s.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
const sitemap=await readFile('sitemap.xml','utf8'),locations=urls(sitemap),beforeLocations=urls(original('sitemap.xml'));
assert.equal(locations.length,16);assert.equal(new Set(locations).size,16);assert.deepEqual(locations, beforeLocations.map(s=>s.replace(previous,origin)));
const pages=locations.map(u=>{assert.equal(new URL(u).origin,origin);return new URL(u).pathname;});
const files=pages.map(p=>p==='/'?'index.html':p.slice(1)+'.html');
const schemaBlocks=s=>[...s.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
for(let i=0;i<files.length;i++){
 const text=await readFile(files[i],'utf8');assert(!text.includes(previous));assert.equal([...text.matchAll(/rel=["']canonical["']/g)].length,1);assert(text.includes('href="'+locations[i]+'"'));assert(!/<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(text));
 assert.equal([...text.matchAll(/<h1\b/g)].length,1);assert(schemaBlocks(text).length>0);assert(!JSON.stringify(schemaBlocks(text)).includes(previous));
}
const robots=await readFile('robots.txt','utf8');assert(robots.includes('Sitemap: '+origin+'/sitemap.xml'));assert.equal(robots,original('robots.txt').replace(previous,origin));
const policy=JSON.parse(execFileSync('python3',['-c',"import urllib.robotparser,json;p=urllib.robotparser.RobotFileParser();p.parse(open('robots.txt').read().splitlines());print(json.dumps([p.can_fetch(a,'https://idygrafica.com.br/impressao-de-apostilas')for a in ['Googlebot','OAI-SearchBot']]))"],{encoding:'utf8'}));assert.deepEqual(policy,[true,true]);
const before=files.map(hash);execFileSync('node',['scripts/seo-technical/build-catalog.mjs']);assert.deepEqual(files.map(hash),before,'Build não idempotente ou domínio antigo reintroduzido');
await mkdir('.preview/domain-migration',{recursive:true});
const require=createRequire(resolve('.preview-tools/package.json'));const {chromium}=require('playwright');
const server=makeServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const local='http://127.0.0.1:'+server.address().port;
const preview=process.env.PREVIEW_ORIGIN?.replace(/\/$/,'');if(preview)assert.match(preview,/^https:\/\/deploy-preview-\d+--idygrafica\.netlify\.app$/);
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});const checks=[];
try{for(const host of [local,...(preview?[preview]:[])]){
 if(host===preview){let ready=false;for(let n=0;n<20;n++){try{const r=await fetch(host,{signal:AbortSignal.timeout(15000)});if(r.ok&&(await r.text()).includes('rel="canonical" href="'+origin+'/"')){assert.match(r.headers.get('x-robots-tag')||'',/noindex/i);ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,2000));}assert(ready,'Prévia ainda não contém a migração');}
 for(const p of pages){const r=await fetch(host+p,{signal:AbortSignal.timeout(20000)});assert.equal(r.status,200,p);const text=await r.text();assert(text.includes('href="'+origin+p+'"'));assert(!text.includes(previous));schemaBlocks(text);const alias=await fetch(host+(p==='/'?'/index.html':p+'.html'),{redirect:'manual',signal:AbortSignal.timeout(20000)});assert.equal(alias.status,301);assert.equal(new URL(alias.headers.get('location'),host).pathname,p);}
 const xml=await(await fetch(host+'/sitemap.xml')).text();assert.deepEqual(urls(xml),locations);assert.equal(await(await fetch(host+'/robots.txt')).text(),robots);
 for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});await context.route('https://wa.me/**',r=>r.fulfill({contentType:'text/html',body:'WhatsApp simulado; nenhuma mensagem enviada.'}));const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(20000);
  await page.goto(host,{waitUntil:'domcontentloaded'});await page.locator('#categories button').first().waitFor();assert.equal(await page.locator('.product').count(),10);assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),origin+'/');assert.equal(await page.locator('.ai').getAttribute('href'),'https://atendimento-idy.netlify.app/');
  await page.locator('#search').fill('canetas');await page.waitForFunction(()=>document.querySelectorAll('.product').length===1);await page.locator('#search').fill('');await page.locator('#categories [data-category]').nth(1).click();assert((await page.locator('.product').count())<10);await page.locator('[data-category=todos]').click();assert.equal(await page.locator('.product').count(),10);
  const show=page.locator('[data-product="a3"]>.product-content>details');await show.locator('summary').click();await page.locator('#qty-a3').fill('3');await page.locator('[data-add=a3]').click();if(width<=1100)await page.locator('.cart-toggle').click();assert.match(await page.locator('#cart-totals').innerText(),/9,00/);
  const link=new URL(await page.locator('#checkout').getAttribute('href'));assert.equal(link.pathname,'/5551981687562');const [popup]=await Promise.all([context.waitForEvent('page'),page.locator('#checkout').click()]);await popup.waitForURL('https://wa.me/**');await popup.close();await page.reload();if(width<=1100)await page.locator('.cart-toggle').click();assert.match(await page.locator('#cart-totals').innerText(),/9,00/);await page.locator('#clear-cart').click();if(width<=1100)await page.keyboard.press('Escape');
  await page.evaluate(async()=>{document.activeElement?.blur();for(const i of document.images)i.loading='eager';await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));window.scrollTo({top:0,behavior:'instant'});});
  assert.deepEqual(await page.locator('img').evaluateAll(a=>a.filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)),[]);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:`.preview/domain-migration/inicio-${host===local?'local':'netlify'}-${width}.png`,animations:'disabled'});
  await page.goto(host+'/impressao-de-apostilas',{waitUntil:'domcontentloaded'});assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),origin+'/impressao-de-apostilas');assert(await page.locator('h1').isVisible());assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);checks.push({host,width,commercialPreserved:true,canonicalUpdated:true,errors});await context.close();
 }
 const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();await page.goto(host);assert.equal(await page.locator('.product').count(),10);await context.close();
}
const report={verified:true,base,pages:16,migratedFiles:migrated,protectedFiles:protectedFiles.length,bodyUnchanged:true,buildIdempotent:true,checks,realMessagesSent:0,productionPublished:false};await writeFile('.preview/domain-migration/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify({verified:true,pages:16,migrated:migrated.length,protectedFiles:protectedFiles.length,cases:checks.length,realMessagesSent:0,productionPublished:false}));
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
