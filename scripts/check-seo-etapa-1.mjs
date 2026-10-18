import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
const base='9cbb3068bcdfe31f19426658496579898694abdd',root=process.cwd(),width=Number(process.env.SEO_WIDTH||390);
const names=['index','servicos','impressos','impressoes-rapidas','comunicacao-visual','cortes-especiais','criacao-sites','livros-digitais','portfolio','contato','sobre'];
const canonical=n=>'https://idygrafica.netlify.app'+(n==='index'?'/':'/'+n);
const route=n=>n==='index'?'/':'/'+n;
const require=createRequire(path.join(root,'.preview-tools/package.json')),{chromium}=require('playwright');
const out='.preview/seo-etapa-1/'+width;fs.mkdirSync(out,{recursive:true});
const originalCache=new Map();
function original(file){if(!originalCache.has(file))originalCache.set(file,execFileSync('git',['show',base+':'+file],{maxBuffer:8000000}));return originalCache.get(file);}
for(const f of ['assets/style.css','assets/mobile-phone-reference.css','assets/impressoes-rapidas.css','netlify.toml','robots.txt'])assert(fs.readFileSync(f).equals(original(f)),'Arquivo protegido alterado: '+f);
const modifiedImages=execFileSync('git',['diff','--name-only',base,'--','assets/'],{encoding:'utf8'}).trim().split('\n').filter(Boolean).filter(f=>!['assets/app.js','assets/navegacao.css','assets/titulos-mobile.css'].includes(f));
assert.deepEqual(modifiedImages,[],'Imagens ou estilos aprovados alterados');
const app=fs.readFileSync('assets/app.js','utf8');
assert.equal(app.split('// No mobile')[1],original('assets/app.js').toString().split('// No mobile')[1],'Funcionamento WhatsApp foi alterado');
const sitemap=fs.readFileSync('sitemap.xml','utf8'),locs=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
assert.deepEqual([...locs].sort(),names.map(canonical).sort());assert.equal(new Set(locs).size,11);
assert(!/Disallow:\s*\/\s*$/im.test(fs.readFileSync('robots.txt','utf8')));
assert(fs.readFileSync('robots.txt','utf8').includes('Sitemap: https://idygrafica.netlify.app/sitemap.xml'));
const printer=fs.readFileSync('impressoes-rapidas.html','utf8').match(/class="quick-printer" src="([^"]+)"/)[1].replaceAll('&amp;','&');
let photo;for(let i=0;i<3;i++){try{const r=await fetch(printer,{signal:AbortSignal.timeout(20000)});assert(r.ok);photo=Buffer.from(await r.arrayBuffer());break;}catch(e){if(i===2)throw e;}}
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.mp4':'video/mp4'};
function server(isBase){return http.createServer((req,res)=>{
 const u=new URL(req.url,'http://localhost');let p=decodeURIComponent(u.pathname);
 if(p.endsWith('/')&&p!=='/'&&p!=='/impressoes-rapidas/'){res.writeHead(301,{Location:p.slice(0,-1)==='/index'?'/':p.slice(0,-1)});res.end();return;}
 let f=p==='/'?'index.html':p.slice(1).replace(/\/$/,'');if(!path.extname(f))f+='.html';
 const local=path.resolve(root,f);if(!local.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 try{let data;if(isBase&&(['assets/app.js',...names.map(n=>n+'.html')].includes(f)))data=original(f);else data=fs.readFileSync(local);
 res.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream'});res.end(data);
 }catch{res.writeHead(404);res.end('Not found');}
 });}
const current=server(false),baseline=server(true);await Promise.all([new Promise(r=>current.listen(0,'127.0.0.1',r)),new Promise(r=>baseline.listen(0,'127.0.0.1',r))]);
const origin='http://127.0.0.1:'+current.address().port,baseOrigin='http://127.0.0.1:'+baseline.address().port;
for(const name of names){for(const p of [route(name),'/'+name+'.html']){const r=await fetch(origin+p);assert.equal(r.status,200,'Rota local indisponível '+p);}}
const browser=await chromium.launch({headless:true});
const signatures=()=>{const headerBottom=document.querySelector('.nav').getBoundingClientRect().bottom;
 return [...document.querySelectorAll('h1,h2,h3,p,.btn,.quick-btn')].filter(el=>!el.closest('.nav,.footer,.whats-widget')&&el.getClientRects().length).map(el=>{
 const b=el.getBoundingClientRect(),s=getComputedStyle(el);return{text:el.textContent.trim(),font:s.font,fontWeight:s.fontWeight,color:s.color,x:b.x,y:b.y-headerBottom,width:b.width,height:b.height};
 });};
try{
 const report=[];
 for(const name of names){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
  await context.route(printer,r=>r.fulfill({status:200,contentType:'image/jpeg',body:photo}));
  await context.route('https://wa.me/**',r=>r.fulfill({status:200,contentType:'text/html',body:'Destino verificado; nenhuma mensagem enviada.'}));
  await context.route('https://atendimento-idy.netlify.app/**',r=>r.fulfill({status:200,contentType:'text/html',body:'Destino verificado; nenhum atendimento iniciado.'}));
  await context.route('https://www.instagram.com/idygrafica/**',r=>r.fulfill({status:200,contentType:'text/html',body:'Destino oficial verificado.'}));
  const page=await context.newPage(),before=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin+route(name),{waitUntil:'networkidle'});await before.goto(baseOrigin+route(name),{waitUntil:'networkidle'});
  for(const p of [page,before]){await p.evaluate(()=>document.fonts.ready);await p.locator('img').evaluateAll(async imgs=>{await Promise.all(imgs.map(async img=>{img.loading='eager';await img.decode().catch(()=>{});}));});await p.mouse.move(0,0);await p.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));}
  const currentHtml=fs.readFileSync(name+'.html','utf8'),baseHtml=original(name+'.html').toString();
  const preservation=await page.evaluate(({currentHtml,baseHtml})=>{
   const parser=new DOMParser(),a=parser.parseFromString(currentHtml,'text/html'),b=parser.parseFromString(baseHtml,'text/html');
   return{bodyText:a.body.textContent===b.body.textContent,title:a.title===b.title,description:a.querySelector('meta[name=description]').content===b.querySelector('meta[name=description]').content,images:JSON.stringify([...a.images].map(i=>[...i.attributes].map(a=>[a.name,a.value])))===JSON.stringify([...b.images].map(i=>[...i.attributes].map(a=>[a.name,a.value])))};
  },{currentHtml,baseHtml});assert(Object.values(preservation).every(Boolean),'Preservação de conteúdo falhou em '+name);
  assert.equal(await page.locator('link[rel=canonical]').count(),1);assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),canonical(name));
  assert.equal(await page.locator('h1').count(),1);
  assert.equal(await page.locator('meta[name=robots],meta[name=googlebot]').count(),0);
  const links=await page.locator('a[href]').evaluateAll(as=>as.map(a=>a.getAttribute('href')));
  for(const href of links){if(/^https:\/\/wa\.me\//.test(href))assert.equal(new URL(href).pathname,'/5551981687562');if(href.startsWith('/')&&!href.startsWith('//')){const p=href.split(/[?#]/)[0];assert(names.some(n=>route(n)===p),'Link interno não padronizado '+href);}}
  const metrics=await page.evaluate(()=>{
   const header=document.querySelector('.nav'),controls=[header.querySelector('.logo'),header.querySelector('.cta-ai'),header.querySelector('.mobile-menu-toggle')].filter(e=>e&&e.getClientRects().length);
   const rects=controls.map(e=>{const b=e.getBoundingClientRect();return{class:e.className,left:b.left,right:b.right,top:b.top,bottom:b.bottom,width:b.width,height:b.height};});
   const overlapping=rects.some((a,i)=>rects.some((b,j)=>i<j&&Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1));
   const textOutside=[...document.querySelectorAll('h1,h2,h3,p,.btn,.quick-btn')].filter(e=>!e.closest('.nav,.footer,.whats-widget')&&e.getClientRects().length).filter(e=>{const b=e.getBoundingClientRect();return b.left<-.5||b.right>innerWidth+.5||e.scrollWidth>e.clientWidth+2;}).map(e=>e.textContent.trim());
   return{rects,overlapping,textOutside,scrollWidth:document.documentElement.scrollWidth};
  });
  assert(!metrics.overlapping,'Controles do cabeçalho se sobrepõem em '+name+' '+width);
  assert(metrics.rects.every(b=>b.left>=-.5&&b.right<=width+.5&&b.height>0),'Controle fora da tela em '+name+' '+width+': '+JSON.stringify(metrics.rects));
  const oldOutside=await before.evaluate(()=>[...document.querySelectorAll('h1,h2,h3,p,.btn,.quick-btn')].filter(e=>!e.closest('.nav,.footer,.whats-widget')&&e.getClientRects().length).filter(e=>{const b=e.getBoundingClientRect();return b.left<-.5||b.right>innerWidth+.5||e.scrollWidth>e.clientWidth+2;}).map(e=>e.textContent.trim()));
  assert.deepEqual(metrics.textOutside,[],'Conteúdo fora da área de leitura em '+name);
  const currentSign=await page.evaluate(signatures),baseSign=await before.evaluate(signatures);
  assert.equal(currentSign.length,baseSign.length);
  for(let i=0;i<currentSign.length;i++){const c=currentSign[i],b=baseSign[i];assert.equal(c.text,b.text);assert.equal(c.font,b.font);assert.equal(c.color,b.color);for(const k of ['x','y','width','height']){const titleWrapFix=width<=350&&['comunicacao-visual','cortes-especiais','criacao-sites'].includes(name)&&['y','height'].includes(k);if(!titleWrapFix)assert(Math.abs(c[k]-b[k])<1,'Organização do conteúdo alterada: '+name+' '+k+' '+c.text);}}
  let pixelIdentical=null;
  if(name==='impressoes-rapidas'||width===1440){const a=await page.screenshot({fullPage:true,animations:'disabled'}),b=await before.screenshot({fullPage:true,animations:'disabled'});pixelIdentical=a.equals(b);assert(pixelIdentical,'Captura fechada difere da versão aprovada: '+name+' '+width);}
  if([390,768,1440].includes(width)){const p=out+'/'+name+'.jpg';await page.screenshot({path:p,fullPage:true,type:'jpeg',quality:65,animations:'disabled'});console.log('SEO_CAPTURE '+JSON.stringify({name,width,data:fs.readFileSync(p).toString('base64')}));}
  await before.close();
  const toggle=page.locator('.mobile-menu-toggle'),nav=page.locator('.navlinks');
  if(width<=980){
   await toggle.click();assert.equal(await toggle.getAttribute('aria-expanded'),'true');assert(await nav.isVisible());
   for(const a of await nav.locator('a').all())await a.click({trial:true});
   await toggle.click();assert.equal(await toggle.getAttribute('aria-expanded'),'false');assert(!(await nav.isVisible()));
   await toggle.click();await page.keyboard.press('Escape');assert.equal(await toggle.getAttribute('aria-expanded'),'false');
   await toggle.click();await page.mouse.click(width-1,850);assert.equal(await toggle.getAttribute('aria-expanded'),'false');
  }else assert(await nav.isVisible());
  const ia=page.locator('.nav .cta-ai');assert.equal(await ia.getAttribute('href'),'https://atendimento-idy.netlify.app');
  const iap=context.waitForEvent('page');await ia.click();const ip=await iap;await ip.waitForLoadState();assert.equal(new URL(ip.url()).origin,'https://atendimento-idy.netlify.app');await ip.close();
  if(name==='impressoes-rapidas'){const ig=page.locator('.quick-instagram');assert.equal(await ig.getAttribute('href'),'https://www.instagram.com/idygrafica/');const opened=context.waitForEvent('page');await ig.click();const p=await opened;await p.waitForLoadState();assert.equal(p.url(),'https://www.instagram.com/idygrafica/');await p.close();}
  await page.locator('.footer a[href="https://wa.me/5551981687562"]').click();await page.waitForURL('https://wa.me/5551981687562');
  await page.goto(origin+route(name),{waitUntil:'networkidle'});
  if(width<=980)await toggle.click();
  await nav.getByRole('link',{name:'Serviços',exact:true}).click();await page.waitForURL(origin+'/servicos');
  assert.equal(await toggle.getAttribute('aria-expanded'),'false');
  await page.getByRole('link',{name:'Ver Impressões Rápidas',exact:false}).click();await page.waitForURL(origin+'/impressoes-rapidas');
  assert.deepEqual(errors,[],'Erro JS em '+name);
  report.push({page:name,width,canonical:canonical(name),headerControlsInsideViewport:true,menuOpenClose:width<=980,escapeAndOutsideClose:width<=980,servicesAndQuickPrintNavigation:true,whatsappClick:true,iaClick:true,instagramClick:name==='impressoes-rapidas',preservation,pixelIdentical,textOverflow:metrics.textOutside,previousTextOverflow:oldOutside});
  console.log('SEO_PAGE_VERIFIED '+JSON.stringify(report.at(-1)));
  await context.close();
 }
 fs.writeFileSync(out+'/report.json',JSON.stringify({base,width,checks:report,netlifyPublished:false,externalMessagesSent:false,aiProjectModified:false},null,2));
 console.log('SEO_WIDTH_VERIFIED '+JSON.stringify({width,pages:report.length,sourcePreserved:true,netlifyPublished:false,externalMessagesSent:false,aiProjectModified:false}));
}finally{await browser.close();current.close();baseline.close();}
