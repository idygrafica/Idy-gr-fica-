import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';

// Read-only comparison with the production base; never deploys or sends messages.
const BASE = 'aa413ee9736fe1b2061e1ed58ca70b359e233ad0';
const root = process.cwd();
const pages = ['index','servicos','impressos','impressoes-rapidas','comunicacao-visual','cortes-especiais','criacao-sites','livros-digitais','portfolio','contato','sobre'];
const selectedPages = process.env.SEO_PAGES ? pages.filter(n => process.env.SEO_PAGES.split(',').includes(n)) : pages;
const widths = (process.env.SEO_WIDTHS || '320,360,375,390,430,620,621,768,980,1024,1440').split(',').map(Number);
const route = name => name === 'index' ? '/' : '/' + name;
const canonical = name => 'https://idygrafica.netlify.app' + route(name);
const output = path.resolve(root, process.env.SEO_OUTPUT || '.preview/seo-etapa-2');
fs.mkdirSync(output, {recursive:true});
const originalCache = new Map();
function original(file) {
  if (!originalCache.has(file)) originalCache.set(file, execFileSync('git', ['show', BASE + ':' + file], {maxBuffer:12000000}));
  return originalCache.get(file);
}
const changed = execFileSync('git', ['diff','--name-only',BASE], {encoding:'utf8'}).trim().split('\n').filter(Boolean);
const modifiedPages = changed.filter(p => pages.some(n => p === n + '.html')).map(p => p.slice(0,-5));
assert(changed.every(p => pages.some(n => p === n + '.html') || ['scripts/check-seo-etapa-2.mjs','SEO_ETAPA_2_REVISAO.md'].includes(p)), 'Arquivo fora do escopo: ' + changed);
for (const file of execFileSync('git',['ls-tree','-r','--name-only',BASE,'assets/','.github/','netlify.toml','robots.txt','sitemap.xml','googlea370a5b2e9c8d30f.html'],{encoding:'utf8'}).trim().split('\n')) {
  assert(fs.readFileSync(file).equals(original(file)), 'Arquivo protegido alterado: ' + file);
}
for (const name of pages) {
  const current = fs.readFileSync(name + '.html','utf8'), before = original(name + '.html').toString();
  for (const re of [/<header\b[\s\S]*?<\/header>/i, /<footer\b[\s\S]*?<\/footer>/i, /<div\b[^>]*class="whats-widget"[\s\S]*$/i, /<div\b[^>]*class="whats-widget"/i]) {
    const old = before.match(re)?.[0], now = current.match(re)?.[0];
    if (old) assert.equal(now, old, 'Cabeçalho, rodapé ou WhatsApp alterado: ' + name);
  }
  assert(Buffer.byteLength(current) - Buffer.byteLength(before) < 2500, 'Aumento de HTML inesperado');
}
const quickBefore = original('impressoes-rapidas.html').toString(), quickNow = fs.readFileSync('impressoes-rapidas.html','utf8');
const hero = s => s.match(/<section class="quick-hero"[\s\S]*?<\/section>/)[0];
assert.equal(hero(quickNow),hero(quickBefore),'Composição principal de Impressões Rápidas alterada');
const printerUrl = quickNow.match(/class="quick-printer" src="([^"]+)"/)[1].replaceAll('&amp;','&');
// Reuse the actual unchanged printer image in both views, avoiding CDN timing differences.
const photo = execFileSync('curl',['--fail','--silent','--show-error','--connect-timeout','10','--max-time','30',printerUrl],{maxBuffer:8000000});
assert(photo.length > 1000, 'Foto original da Xerox indisponível');

const types = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.mp4':'video/mp4','.xml':'application/xml','.txt':'text/plain'};
function serve(base) {
  return http.createServer((req,res) => {
    let file = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    file = file === '/' ? 'index.html' : file.slice(1).replace(/\/$/,'');
    if (!path.extname(file)) file += '.html';
    if (!path.resolve(root,file).startsWith(root + path.sep)) {res.writeHead(403).end();return;}
    try {
      const data = base ? original(file) : fs.readFileSync(path.join(root,file));
      const type=types[path.extname(file)] || 'application/octet-stream';
      const range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
      if (range) {
        const start=Number(range[1]),end=range[2]?Math.min(Number(range[2]),data.length-1):data.length-1;
        if (start>=data.length) {res.writeHead(416,{'Content-Range':`bytes */${data.length}`}).end();return;}
        res.writeHead(206,{'Content-Type':type,'Accept-Ranges':'bytes','Content-Range':`bytes ${start}-${end}/${data.length}`,'Content-Length':end-start+1}).end(data.subarray(start,end+1));
      } else res.writeHead(200, {'Content-Type':type,'Accept-Ranges':'bytes','Content-Length':data.length}).end(data);
    } catch {res.writeHead(404).end('Not found');}
  });
}
const currentServer = serve(false), baseServer = serve(true);
await Promise.all([currentServer,baseServer].map(server => new Promise(resolve => server.listen(0,'127.0.0.1',resolve))));
const origin = 'http://127.0.0.1:' + currentServer.address().port;
const baseOrigin = 'http://127.0.0.1:' + baseServer.address().port;
const locs = [...fs.readFileSync('sitemap.xml','utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
assert.deepEqual(locs.slice().sort(),pages.map(canonical).sort());
assert.equal(new Set(locs).size,11);
for (const name of pages) {
  for (const url of [route(name), '/' + name + '.html']) assert.equal((await fetch(origin + url)).status,200);
}
const require = createRequire(import.meta.url);
let chromium;
try {({chromium}=require('playwright'));}
catch {({chromium}=createRequire(path.join(root,'.preview-tools/package.json'))('playwright'));}
const browser = await chromium.launch({headless:true,...(fs.existsSync('/usr/bin/chromium') ? {executablePath:'/usr/bin/chromium'} : {})});
const results = [], captures = [], failures = [];
let cursor = 0;
async function interiorShot(page, selector) {
  const b=await page.locator(selector).boundingBox();
  // Avoid the partial pixel outside a fractional element boundary picking up the following section.
  const x=Math.ceil(b.x),y=Math.ceil(b.y);
  return page.screenshot({clip:{x,y,width:Math.floor(b.x+b.width)-x,height:Math.floor(b.y+b.height)-y},animations:'disabled'});
}

const inspect = () => {
  const all = selector => [...document.querySelectorAll(selector)];
  const attrs = node => [...node.attributes].map(a => [a.name,a.value]).sort((a,b) => a[0].localeCompare(b[0]));
  const bounds = node => {const r=node.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
  const structure = all('body *').filter(n => !((n.tagName==='A' || n.tagName==='STRONG') && n.closest('p'))).map(n => [n.tagName,attrs(n)]);
  const media = all('img,video,source').map(n => [n.tagName,attrs(n)]);
  const css = all('body *').filter(n => !['SVG','PATH'].includes(n.tagName) && !((n.tagName==='A' || n.tagName==='STRONG') && n.closest('p'))).map(n => {
    const s=getComputedStyle(n);return [n.tagName,n.className?.baseVal ?? n.className,s.font,s.color,s.backgroundColor,s.display,s.position,s.gridTemplateColumns.replace(/[0-9.]+px/g,'SIZE'),s.gap];
  });
  const external = all('a[href]').filter(n => /^https?:|^mailto:/.test(n.getAttribute('href'))).map(n => [n.getAttribute('href'),n.textContent,n.getAttribute('target'),n.getAttribute('rel')]);
  const textOverflow = all('h1,h2,h3,p,li,.tick,.btn,.quick-btn').filter(n => !n.closest('.nav,.footer,.whats-widget') && n.getClientRects().length).filter(n => {
    const b=bounds(n);return b.x<-.5 || b.right>innerWidth+.5 || n.scrollWidth>n.clientWidth+2;
  }).map(n => n.textContent.trim());
  const clippedText = all('h1,h2,h3,p,li,.tick').filter(n => !n.closest('.nav,.footer,.whats-widget') && n.getClientRects().length).flatMap((n,index) => {
    const r=document.createRange();r.selectNodeContents(n);const t=r.getBoundingClientRect();
    // Glyphs may exceed a tight line-height without being clipped. Check actual clipping ancestors.
    let excess=0;
    for (let p=n;p && p!==document.body;p=p.parentElement) {
      const s=getComputedStyle(p),b=p.getBoundingClientRect();
      if (/^(hidden|clip)$/.test(s.overflowX)) excess=Math.max(excess,b.left-t.left,t.right-b.right);
      if (/^(hidden|clip)$/.test(s.overflowY)) excess=Math.max(excess,b.top-t.top,t.bottom-b.bottom);
    }
    return excess>3 ? [{index,text:n.textContent.trim(),excess}] : [];
  });
  const controls=all('.nav .logo,.nav .cta-ai,.nav .mobile-menu-toggle').filter(n => n.getClientRects().length).map(bounds);
  const headerOverlap=controls.some((a,i) => controls.some((b,j) => i<j && Math.min(a.right,b.right)-Math.max(a.x,b.x)>1 && Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y)>1));
  return {structure,media,css,external,textOverflow,clippedText,controls,headerOverlap,
    scrollWidth:document.documentElement.scrollWidth,
    title:document.title,description:document.querySelector('meta[name=description]')?.content,
    canonical:all('link[rel=canonical]').map(n => n.href),h1:all('h1').length,
    robots:all('meta[name=robots],meta[name=googlebot]').map(n => n.content),
    sheets:all('link[rel=stylesheet]').map(n => n.getAttribute('href')),
    scripts:all('script[src]').map(n => n.getAttribute('src')),
    json:all('script[type="application/ld+json"]').map(n => JSON.parse(n.textContent)),
    brokenImages:all('img').filter(n => !n.complete || !n.naturalWidth).map(n => n.getAttribute('src')),
    localLinks:all('a[href]').filter(n => n.origin===location.origin).map(n => n.getAttribute('href'))};
};

async function runWidth(width) {
  for (const name of selectedPages) {
    console.log('SEO2_PAGE_BEGIN '+JSON.stringify({page:name,width}));
    const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
    context.setDefaultTimeout(20000);
    await context.route(printerUrl,r => r.fulfill({status:200,contentType:'image/jpeg',body:photo}));
    for (const url of ['https://wa.me/**','https://atendimento-idy.netlify.app/**','https://www.instagram.com/idygrafica/**']) {
      await context.route(url,r => r.fulfill({status:200,contentType:'text/html',body:'Destino verificado sem envio ou atendimento.'}));
    }
    const page=await context.newPage(), before=await context.newPage(), errors=[];
    page.on('pageerror',e => errors.push(e.message));
    const response=await page.goto(origin+route(name),{waitUntil:'networkidle'});
    assert.equal(response.status(),200);
    await before.goto(baseOrigin+route(name),{waitUntil:'networkidle'});
    for (const p of [page,before]) {
      await p.evaluate(() => document.fonts.ready);
      await p.locator('img').evaluateAll(async imgs => {await Promise.all(imgs.map(async img => {img.loading='eager';await img.decode().catch(() => {});}));});
      await p.mouse.move(0,0);
    }
    if (process.env.SEO_DEBUG) console.log('SEO2_PAGE_LOADED '+JSON.stringify({page:name,width}));
    const now=await page.evaluate(inspect),old=await before.evaluate(inspect);
    if (process.env.SEO_DEBUG) console.log('SEO2_PAGE_INSPECTED '+JSON.stringify({page:name,width}));
    assert.deepEqual(now.structure,old.structure,'Estrutura ou atributos alterados: '+name);
    assert.deepEqual(now.media,old.media,'Imagens alteradas: '+name);
    assert.deepEqual(now.css,old.css,'Cores, fontes ou estrutura visual alteradas: '+name);
    assert.deepEqual(now.external,old.external,'Botões ou destinos externos alterados: '+name);
    assert.deepEqual(now.sheets,old.sheets);assert.deepEqual(now.scripts,old.scripts);
    assert.deepEqual(now.textOverflow,[],'Texto fora da tela: '+name+' '+width);
    const newClipping=now.clippedText.filter(n => !old.clippedText.some(b => b.index===n.index && n.excess<=b.excess+1));
    assert.deepEqual(newClipping,[],'Novo recorte de texto: '+name+' '+width);
    assert.equal(now.scrollWidth,width,'Rolagem horizontal: '+name+' '+width);
    assert.deepEqual(now.brokenImages,[],'Imagem indisponível: '+name);
    assert(!now.headerOverlap,'Cabeçalho sobreposto: '+name);
    assert(now.controls.every(r => r.x>=-.5 && r.right<=width+.5),'Controle fora da tela: '+name);
    assert.deepEqual(now.canonical,[canonical(name)]);assert.equal(now.h1,1);assert(now.title&&now.description);
    assert(!now.robots.some(s => /noindex|nofollow|none/i.test(s)));
    for (const href of now.localLinks) {
      const url=new URL(href,origin),pathname=url.pathname;
      assert(pages.some(n => route(n)===pathname),'URL interna não padronizada: '+href);
      if (url.hash) assert(await page.locator(url.hash).count(),'Âncora inexistente: '+url.hash);
    }
    const headCurrent=await interiorShot(page,'.nav'),headBefore=await interiorShot(before,'.nav');
    if (process.env.SEO_DEBUG) console.log('SEO2_HEADER_CAPTURED '+JSON.stringify({page:name,width}));
    if (!headCurrent.equals(headBefore)) {
      fs.writeFileSync(path.join(output,`header-${name}-${width}-current.png`),headCurrent);
      fs.writeFileSync(path.join(output,`header-${name}-${width}-base.png`),headBefore);
    }
    assert(headCurrent.equals(headBefore),'Cabeçalho visualmente alterado: '+name+' '+width);
    let heroPixelsIdentical=null;
    if (['index','impressoes-rapidas'].includes(name)) {
      const selector=name==='index'?'.hero':'.quick-hero';
      const a=await page.locator(selector).screenshot({animations:'disabled'}),b=await before.locator(selector).screenshot({animations:'disabled'});
      heroPixelsIdentical=a.equals(b);assert(heroPixelsIdentical,'Composição principal alterada: '+name+' '+width);
    }
    if ([390,768,1440].includes(width) && modifiedPages.includes(name)) {
      await page.evaluate(() => window.scrollTo({top:0,behavior:'instant'}));
      const file=path.join(output,name+'-'+width+'.jpg');
      await page.screenshot({path:file,type:'jpeg',quality:75,fullPage:true,animations:'disabled'});
      captures.push({page:name,width,file});
    }
    await before.close();
    const toggle=page.locator('.mobile-menu-toggle'),nav=page.locator('.navlinks');
    if (width<=980) {
      await toggle.click();assert.equal(await toggle.getAttribute('aria-expanded'),'true');assert(await nav.isVisible());
      for (const a of await nav.locator('a').all()) await a.click({trial:true});
      await toggle.click();assert.equal(await toggle.getAttribute('aria-expanded'),'false');assert(!(await nav.isVisible()));
      await toggle.click();await page.keyboard.press('Escape');assert.equal(await toggle.getAttribute('aria-expanded'),'false');
      await toggle.click();await page.mouse.click(width-1,850);assert.equal(await toggle.getAttribute('aria-expanded'),'false');
    } else assert(await nav.isVisible());
    // Exercise the contextual links added to existing paragraphs, including keyboard activation.
    if (['index','impressos','servicos'].includes(name)) {
      const contextual=page.locator('p a[href="/impressoes-rapidas"]');assert.equal(await contextual.count(),1);
      await contextual.focus();await page.keyboard.press('Enter');await page.waitForURL(origin+'/impressoes-rapidas');
      await page.goto(origin+route(name),{waitUntil:'networkidle'});
    }
    const ia=page.locator('.nav .cta-ai'), opened=context.waitForEvent('page');await ia.click();
    const ip=await opened;await ip.waitForLoadState();assert.equal(new URL(ip.url()).origin,'https://atendimento-idy.netlify.app');await ip.close();
    if (name==='impressoes-rapidas') {
      const opened=context.waitForEvent('page');await page.locator('.quick-instagram').click();const ig=await opened;await ig.waitForLoadState();
      assert.equal(ig.url(),'https://www.instagram.com/idygrafica/');await ig.close();
      // Every quotation/WhatsApp control on the page, including pre-filled messages.
      const links=await page.locator('a[href^="https://wa.me/"]').evaluateAll(as => as.map(a => ({href:a.href,target:a.target})));
      for (let i=0;i<links.length;i++) {
        const button=page.locator('a[href^="https://wa.me/"]').nth(i);
        if (links[i].target==='_blank') {
          const opened=context.waitForEvent('page');await button.click();const wa=await opened;await wa.waitForLoadState();
          assert.equal(new URL(wa.url()).pathname,'/5551981687562');assert.equal(new URL(wa.url()).search,new URL(links[i].href).search);await wa.close();
        } else {await button.click();await page.waitForURL('https://wa.me/5551981687562');await page.goto(origin+route(name),{waitUntil:'networkidle'});}
      }
    } else {
      await page.locator('.footer a[href="https://wa.me/5551981687562"]').click();await page.waitForURL('https://wa.me/5551981687562');
      await page.goto(origin+route(name),{waitUntil:'networkidle'});
    }
    if (width<=980) await toggle.click();
    await nav.getByRole('link',{name:'Serviços',exact:true}).click();await page.waitForURL(origin+'/servicos');
    assert.equal(await toggle.getAttribute('aria-expanded'),'false');
    await page.getByRole('link',{name:'Ver Impressões Rápidas',exact:false}).click();await page.waitForURL(origin+'/impressoes-rapidas');
    assert.deepEqual(errors,[],'Erro JavaScript: '+name);
    results.push({page:name,width,sourceStructurePreserved:true,imagesAndStylesPreserved:true,headerPixelsIdentical:true,heroPixelsIdentical,menu:true,internalLinks:true,whatsapp:true,ia:true,instagram:name==='impressoes-rapidas',canonical:true,noOverflow:true,noNewTextClipping:true,baselineClipping:old.clippedText,noJavaScriptErrors:true});
    console.log('SEO2_PAGE_VERIFIED '+JSON.stringify({page:name,width}));
    await context.close();
  }
  console.log('SEO2_WIDTH_VERIFIED '+JSON.stringify({width,pages:selectedPages.length}));
}

try {
  await Promise.all(Array.from({length:Math.min(3,widths.length)},async () => {
    while (cursor<widths.length) {
      const width=widths[cursor++];
      try {await runWidth(width);} catch (error) {failures.push({width,error:error.stack});console.error('SEO2_FAILURE '+JSON.stringify(failures.at(-1)));}
    }
  }));
  const report={base:BASE,modifiedPages,widths,checks:results,captures,failures,externalMessagesSent:false,aiProjectModified:false,netlifyPublished:false};
  fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));
  assert.deepEqual(failures,[],'Falhas encontradas; ver relatório');assert.equal(results.length,widths.length*selectedPages.length);
  console.log('SEO2_VERIFIED '+JSON.stringify({checks:results.length,captures:captures.length,externalMessagesSent:false,netlifyPublished:false}));
} finally {await browser.close();currentServer.close();baseServer.close();}
