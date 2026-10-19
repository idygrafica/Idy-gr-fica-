import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';

// Read-only comparison with the approved stage-2 version before the banner fix.
// Never deploys or sends messages.
const BASE = '961bfa9d2298b24aa746f620f64967f309cea4ae';
const bannerPages = ['impressos','cortes-especiais','sobre'];
const root = process.cwd();
const pages = ['index','servicos','impressos','impressoes-rapidas','comunicacao-visual','cortes-especiais','criacao-sites','livros-digitais','portfolio','contato','sobre'];
const selectedPages = process.env.SEO_PAGES ? pages.filter(n => process.env.SEO_PAGES.split(',').includes(n)) : pages;
const widths = (process.env.SEO_WIDTHS || '320,360,375,390,430,620,621,768,980,1024,1440').split(',').map(Number);
const route = name => name === 'index' ? '/' : '/' + name;
const canonical = name => 'https://idygrafica.netlify.app' + route(name);
const output = path.resolve(root, process.env.SEO_OUTPUT || '.preview/banners-mobile');
fs.mkdirSync(output, {recursive:true});
const originalCache = new Map();
function original(file) {
  if (!originalCache.has(file)) originalCache.set(file, execFileSync('git', ['show', BASE + ':' + file], {maxBuffer:12000000}));
  return originalCache.get(file);
}
const changed = execFileSync('git', ['diff','--name-only',BASE], {encoding:'utf8'}).trim().split('\n').filter(Boolean);
const reviewedPages = pages;
assert(changed.every(p => pages.some(n => p === n + '.html') || ['scripts/check-seo-etapa-2.mjs','SEO_ETAPA_2_REVISAO.md','assets/mobile-phone-reference.css'].includes(p)), 'Arquivo fora do escopo: ' + changed);
for (const file of execFileSync('git',['ls-tree','-r','--name-only',BASE,'assets/','.github/','netlify.toml','robots.txt','sitemap.xml','googlea370a5b2e9c8d30f.html'],{encoding:'utf8'}).trim().split('\n')) {
  if (file !== 'assets/mobile-phone-reference.css') assert(fs.readFileSync(file).equals(original(file)), 'Arquivo protegido alterado: ' + file);
}
const cssBefore=original('assets/mobile-phone-reference.css').toString();
const oldRule='  .hero-copy{position:absolute!important;inset:0!important;padding:0!important;max-width:none!important}';
const fixedRule='  .hero-copy{max-width:none!important}\n  /* Posicionamento e padding do banner inicial não devem cortar os banners internos. */\n  .hero .hero-copy{position:absolute!important;inset:0!important;padding:0!important;max-width:none!important}';
assert.equal(fs.readFileSync('assets/mobile-phone-reference.css','utf8'),cssBefore.replace(oldRule,fixedRule),'Mudança de CSS além da correção autorizada');
for (const name of pages) {
  const current = fs.readFileSync(name + '.html','utf8'), before = original(name + '.html').toString();
  assert.equal(current, before, 'Conteúdo/SEO da etapa 2 alterado: ' + name);
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
const prior=process.env.SEO_RESUME ? JSON.parse(fs.readFileSync(process.env.SEO_RESUME,'utf8')) : null;
if (prior) assert.equal(prior.base,BASE,'Base de retomada divergente');
const results = prior?.checks?.filter(r=>selectedPages.includes(r.page) && widths.includes(r.width)) || [];
const captures = prior?.captures?.filter(r=>selectedPages.includes(r.page) && widths.includes(r.width)) || [];
const failures = [];
function checkpoint() {
  fs.writeFileSync(path.join(output,'checkpoint.json'),JSON.stringify({base:BASE,widths,checks:results,captures},null,2));
}
let cursor = 0;
async function settlePaint(page) {
  const height=await page.evaluate(()=>document.documentElement.scrollHeight);
  for (let top=0;top<height;top+=800) {
    await page.evaluate(top=>window.scrollTo({top,behavior:'instant'}),top);
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  }
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
}
async function interiorShot(page, selector) {
  const b=await page.locator(selector).boundingBox();
  // Avoid the partial pixel outside a fractional element boundary picking up the following section.
  const x=Math.ceil(b.x),y=Math.ceil(b.y);
  return page.screenshot({clip:{x,y,width:Math.floor(b.x+b.width)-x,height:Math.floor(b.y+b.height)-y},animations:'disabled'});
}
async function compareHero(page,a,b) {
  if (a.equals(b)) return {exact:true,preserved:true,changedPixels:0,maxChannelDelta:0};
  return page.evaluate(async ({a,b}) => {
    const decode=async data => createImageBitmap(new Blob([Uint8Array.from(atob(data),c=>c.charCodeAt(0))],{type:'image/png'}));
    const [x,y]=await Promise.all([decode(a),decode(b)]);
    if (x.width!==y.width || x.height!==y.height) return {exact:false,preserved:false,dimensionsChanged:true};
    const pixels=image => {const canvas=new OffscreenCanvas(image.width,image.height),ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);return ctx.getImageData(0,0,image.width,image.height).data;};
    const p=pixels(x),q=pixels(y);let changedPixels=0,maxChannelDelta=0;
    for (let i=0;i<p.length;i+=4) {
      let delta=0;for (let c=0;c<4;c++) delta=Math.max(delta,Math.abs(p[i+c]-q[i+c]));
      if (delta) changedPixels++;maxChannelDelta=Math.max(maxChannelDelta,delta);
    }
    // Permit only tiny antialiasing noise: <=2/255 per channel on <=0.005% of pixels.
    const pixelBudget=Math.max(1,Math.floor(x.width*x.height*0.00005));
    return {exact:false,preserved:maxChannelDelta<=2 && changedPixels<=pixelBudget,changedPixels,maxChannelDelta,pixelBudget};
  },{a:a.toString('base64'),b:b.toString('base64')});
}

const inspect = () => {
  const all = selector => [...document.querySelectorAll(selector)];
  const attrs = node => [...node.attributes].map(a => [a.name,a.value]).sort((a,b) => a[0].localeCompare(b[0]));
  const bounds = node => {const r=node.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
  const structure = all('body *').filter(n => !((n.tagName==='A' || n.tagName==='STRONG') && n.closest('p'))).map(n => [n.tagName,attrs(n)]);
  const media = all('img,video,source').map(n => [n.tagName,attrs(n)]);
  const css = all('body *').filter(n => !['SVG','PATH'].includes(n.tagName) && !((n.tagName==='A' || n.tagName==='STRONG') && n.closest('p'))).map(n => {
    const s=getComputedStyle(n);return [n.tagName,n.className?.baseVal ?? n.className,s.font,s.color,s.backgroundColor,s.display,n.matches('.service-hero .hero-copy') && innerWidth<=620 ? 'MOBILE_BANNER_FLOW' : s.position,s.gridTemplateColumns.replace(/[0-9.]+px/g,'SIZE'),s.gap];
  });
  const external = all('a[href]').filter(n => /^https?:|^mailto:/.test(n.getAttribute('href'))).map(n => [n.getAttribute('href'),n.textContent,n.getAttribute('target'),n.getAttribute('rel')]);
  const textOverflow = all('h1,h2,h3,p,li,.tick,.btn,.quick-btn').filter(n => !n.closest('.nav,.footer,.whats-widget') && n.getClientRects().length).filter(n => {
    const b=bounds(n);return b.x<-.5 || b.right>innerWidth+.5 || n.scrollWidth>n.clientWidth+2;
  }).map(n => n.textContent.trim());
  const clippedText = all('h1,h2,h3,p,li,.tick,.btn,.quick-btn').filter(n => !n.closest('.nav,.footer,.whats-widget') && n.getClientRects().length).flatMap((n,index) => {
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
  const banner=document.querySelector('.service-hero');
  const bannerItems=banner ? [...banner.querySelectorAll('.eyebrow,h1,p,.btn')].map(n=>({text:n.textContent.trim(),...bounds(n)})) : [];
  const bannerOverlap=bannerItems.some((a,i)=>bannerItems.some((b,j)=>i<j && Math.min(a.right,b.right)-Math.max(a.x,b.x)>1 && Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y)>1));
  return {structure,media,css,external,textOverflow,clippedText,controls,headerOverlap,bannerItems,bannerOverlap,
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
    if (results.some(r=>r.page===name && r.width===width)) continue;
    console.log('SEO2_PAGE_BEGIN '+JSON.stringify({page:name,width}));
    const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
    context.setDefaultTimeout(45000);
    await context.route(printerUrl,r => r.fulfill({status:200,contentType:'image/jpeg',body:photo}));
    for (const url of ['https://wa.me/**','https://atendimento-idy.netlify.app/**','https://www.instagram.com/idygrafica/**']) {
      await context.route(url,r => r.fulfill({status:200,contentType:'text/html',body:'Destino verificado sem envio ou atendimento.'}));
    }
    try {
    const page=await context.newPage(), before=await context.newPage(), errors=[];
    page.on('pageerror',e => errors.push(e.message));
    const response=await page.goto(origin+route(name),{waitUntil:'load'});
    assert.equal(response.status(),200);
    await before.goto(baseOrigin+route(name),{waitUntil:'load'});
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
    assert.deepEqual(now.clippedText,[],'Texto ou botão cortado: '+name+' '+width);
    assert(!now.bannerOverlap,'Blocos do banner sobrepostos: '+name+' '+width);
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
    await Promise.all([page,before].map(settlePaint));
    const headCurrent=await interiorShot(page,'.nav'),headBefore=await interiorShot(before,'.nav');
    if (process.env.SEO_DEBUG) console.log('SEO2_HEADER_CAPTURED '+JSON.stringify({page:name,width}));
    if (!headCurrent.equals(headBefore)) {
      fs.writeFileSync(path.join(output,`header-${name}-${width}-current.png`),headCurrent);
      fs.writeFileSync(path.join(output,`header-${name}-${width}-base.png`),headBefore);
    }
    assert(headCurrent.equals(headBefore),'Cabeçalho visualmente alterado: '+name+' '+width);
    let heroPixelsIdentical=null,heroComparison=null;
    if (['index','impressoes-rapidas'].includes(name)) {
      const selector=name==='index'?'.hero':'.quick-hero';
      await Promise.all([page,before].map(p => p.evaluate(() => window.scrollTo({top:0,behavior:'instant'}))));
      let a=await interiorShot(page,selector),b=await interiorShot(before,selector);
      heroComparison=await compareHero(page,a,b);
      if (!heroComparison.preserved) {
        await Promise.all([page,before].map(settlePaint));
        a=await interiorShot(page,selector);b=await interiorShot(before,selector);
        heroComparison={...await compareHero(page,a,b),recaptured:true};
      }
      if (!heroComparison.preserved) {
        fs.writeFileSync(path.join(output,`hero-${name}-${width}-current.png`),a);
        fs.writeFileSync(path.join(output,`hero-${name}-${width}-base.png`),b);
      }
      heroPixelsIdentical=heroComparison.exact;assert(heroComparison.preserved,'Composição principal alterada: '+name+' '+width+': '+JSON.stringify(heroComparison));
    }
    let pageComparison=null;
    if (width>=621 || !bannerPages.includes(name)) {
      await Promise.all([page,before].map(settlePaint));
      let a=await page.screenshot({fullPage:true,animations:'disabled'}), b=await before.screenshot({fullPage:true,animations:'disabled'});
      pageComparison=await compareHero(page,a,b);
      if (!pageComparison.preserved) {
        // A second bounded capture distinguishes transient browser paint from a regression.
        await Promise.all([page,before].map(p=>p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))))));
        a=await page.screenshot({fullPage:true,animations:'disabled'});b=await before.screenshot({fullPage:true,animations:'disabled'});
        pageComparison={...await compareHero(page,a,b),recaptured:true};
      }
      if (!pageComparison.preserved) {
        fs.writeFileSync(path.join(output,`page-${name}-${width}-current.png`),a);
        fs.writeFileSync(path.join(output,`page-${name}-${width}-base.png`),b);
      }
      assert(pageComparison.preserved,'Página fora dos banners mobile alterada: '+name+' '+width+': '+JSON.stringify(pageComparison));
    }
    if (bannerPages.includes(name) && [320,360,375,390,430,620,621,768,1440].includes(width)) {
      for (const [version,p] of [['antes',before],['depois',page]]) {
        await p.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
        const heroBottom=await p.locator('.service-hero').evaluate(el=>el.getBoundingClientRect().bottom);
        await p.screenshot({path:path.join(output,`banner-${name}-${width}-${version}.jpg`),type:'jpeg',quality:85,clip:{x:0,y:0,width,height:Math.ceil(heroBottom+90)},animations:'disabled'});
      }
    }
    if ([390,768,1440].includes(width) && reviewedPages.includes(name)) {
      await page.evaluate(() => window.scrollTo({top:0,behavior:'instant'}));
      await settlePaint(page);
      const file=path.join(output,name+'-'+width+'.jpg');
      await page.screenshot({path:file,type:'jpeg',quality:75,fullPage:true,animations:'disabled'});
      captures.push({page:name,width,file});
    }
    for (const button of await page.locator('.service-hero .btn').all()) await button.click({trial:true});
    await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
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
      await page.goto(origin+route(name),{waitUntil:'load'});
    }
    // Exercise every WhatsApp, Instagram and AI anchor against intercepted destinations.
    // No messages, customer sessions or remote mutations are performed.
    const externalSelector='a[href^="https://wa.me/"],a[href^="https://www.instagram.com/idygrafica"],a[href^="https://atendimento-idy.netlify.app"]';
    const destinations=await page.locator(externalSelector).evaluateAll(as=>as.flatMap((a,index)=>a.getClientRects().length ? [{index,href:a.href,target:a.target}] : []));
    let externalButtonsTested=0;
    for (let i=0;i<destinations.length;i++) {
      if (process.env.SEO_DEBUG) console.log('SEO2_EXTERNAL_BEGIN '+JSON.stringify({page:name,width,index:i,href:destinations[i].href}));
      const destination=destinations[i],button=page.locator(externalSelector).nth(destination.index);
      if (!(await button.isVisible()) && await button.evaluate(a=>!!a.closest('.whats-widget'))) {
        await page.locator('.footer').scrollIntoViewIfNeeded();await button.waitFor({state:'visible'});
      }
      assert(await button.isVisible(),'Botão de atendimento oculto: '+name+' '+width+' '+i);
      if (destination.target==='_blank') {
        const opened=context.waitForEvent('page');await button.click();const popup=await opened;await popup.waitForLoadState();
        assert.equal(new URL(popup.url()).href,new URL(destination.href).href);await popup.close();
      } else {
        await button.click();await page.waitForURL(destination.href);
        await page.goto(origin+route(name),{waitUntil:'load'});
      }
      if (destination.href.startsWith('https://wa.me/')) assert.equal(new URL(destination.href).pathname,'/5551981687562');
      externalButtonsTested++;
    }
    await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
    if (width<=980) await toggle.click();
    if (process.env.SEO_DEBUG) console.log('SEO2_MENU_LINK_BEGIN '+JSON.stringify({page:name,width}));
    await nav.getByRole('link',{name:'Serviços',exact:true}).click();await page.waitForURL(origin+'/servicos');
    assert.equal(await toggle.getAttribute('aria-expanded'),'false');
    await page.getByRole('link',{name:'Ver Impressões Rápidas',exact:false}).click();await page.waitForURL(origin+'/impressoes-rapidas');
    assert.deepEqual(errors,[],'Erro JavaScript: '+name);
    results.push({page:name,width,sourceStructurePreserved:true,externalButtonsTested,fullPageComparison:pageComparison,noClippedTextOrButtons:true,noBannerOverlap:true,bannerItems:now.bannerItems,imagesAndStylesPreserved:true,headerPixelsIdentical:true,heroPixelsIdentical,heroComparison,menu:true,internalLinks:true,whatsapp:true,ia:true,instagram:name==='impressoes-rapidas',canonical:true,noOverflow:true,noNewTextClipping:true,baselineClipping:old.clippedText,noJavaScriptErrors:true});
    checkpoint();
    console.log('SEO2_PAGE_VERIFIED '+JSON.stringify({page:name,width}));
    } finally {await context.close();}
  }
  console.log('SEO2_WIDTH_VERIFIED '+JSON.stringify({width,pages:selectedPages.length}));
}

try {
  await Promise.all(Array.from({length:Math.min(Number(process.env.SEO_WORKERS || 2),widths.length)},async () => {
    while (cursor<widths.length) {
      const width=widths[cursor++];
      try {await runWidth(width);} catch (error) {failures.push({width,error:error.stack});console.error('SEO2_FAILURE '+JSON.stringify(failures.at(-1)));}
    }
  }));
  const report={base:BASE,reviewedPages,widths,checks:results,captures,failures,externalMessagesSent:false,aiProjectModified:false,netlifyPublished:false};
  fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));
  assert.deepEqual(failures,[],'Falhas encontradas; ver relatório');assert.equal(results.length,widths.length*selectedPages.length);
  console.log('SEO2_VERIFIED '+JSON.stringify({checks:results.length,captures:captures.length,externalMessagesSent:false,netlifyPublished:false}));
} finally {await browser.close();currentServer.close();baseServer.close();}
