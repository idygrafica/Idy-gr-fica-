const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const root='https://idygrafica.netlify.app';
const commit='ee009bc6882ff0e81fb59237d233c417899eef2e';
const approved='7d2f0faf28ff25dee89741cd8809208a9f7ced98';
const before='a9efdad5c56b48174cd00457f0e8f46f2f8a0997';
const out='.preview/xerox-publicada';fs.mkdirSync(out,{recursive:true});
const results=[];let failures=0;
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const text=b=>Buffer.from(b).toString('utf8').replace(/\r\n/g,'\n').trim();
const normal=s=>s.replace(/(href=["'])([^"']*?)\.html(?=[?#"'])/g,(_,a,b)=>a+(b==='index'||b==='/index'?'/':b));
function check(ok,message,detail){results.push({ok:!!ok,message,detail});if(!ok){failures++;console.error('FAIL',message,detail||'');}}
async function get(p){const r=await fetch(root+p+(p.includes('?')?'&':'?')+'verify='+commit.slice(0,12),{headers:{'cache-control':'no-cache'},signal:AbortSignal.timeout(25000)});return {status:r.status,body:Buffer.from(await r.arrayBuffer()),url:r.url,headers:{server:r.headers.get('server'),netlifyRequest:r.headers.get('x-nf-request-id'),etag:r.headers.get('etag'),date:r.headers.get('date')}};}
(async()=>{
 const approvedDiff=execFileSync('git',['diff','--name-only',approved,commit],{encoding:'utf8'}).trim();check(approvedDiff==='','Commit integrado contém exatamente a versão aprovada',approvedDiff);
 const changed=execFileSync('git',['diff','--name-only',before,commit],{encoding:'utf8'}).trim().split('\n').sort();check(JSON.stringify(changed)===JSON.stringify(['assets/home-vitrine.css','assets/xerox-color-560-home.webp','index.html']),'Escopo publicado restrito aos três arquivos aprovados',changed);
 const expectedHTML=normal(text(fs.readFileSync('index.html'))),expectedCSS=sha(fs.readFileSync('assets/home-vitrine.css')),expectedImage=sha(fs.readFileSync('assets/xerox-color-560-home.webp'));
 let ready=false,latest;
 for(let attempt=1;attempt<=12;attempt++){
  try{const [home,css,img]=await Promise.all([get('/'),get('/assets/home-vitrine.css'),get('/assets/xerox-color-560-home.webp')]);latest={attempt,status:[home.status,css.status,img.status],homeMatches:normal(text(home.body))===expectedHTML,cssMatches:sha(css.body)===expectedCSS,imageMatches:sha(img.body)===expectedImage,headers:home.headers};console.log('PUBLICATION',JSON.stringify(latest));if(home.status===200&&css.status===200&&img.status===200&&latest.homeMatches&&latest.cssMatches&&latest.imageMatches){ready=true;fs.writeFileSync(path.join(out,'index-publicada.html'),home.body);break;}}catch(e){latest={attempt,error:e.message};console.log('PUBLICATION',JSON.stringify(latest));}
  if(attempt<12)await new Promise(r=>setTimeout(r,20000));
 }
 check(ready,'Netlify serve a home, o CSS e a nova imagem da versão aprovada',latest);
 fs.writeFileSync(path.join(out,'deployment.json'),JSON.stringify({commit,approved,ready,latest},null,2));
 if(!ready)throw new Error('A versão aprovada ainda não está disponível no site público.');
 const files=execFileSync('git',['ls-tree','-r','--name-only',commit],{encoding:'utf8'}).trim().split('\n');
 const pages=files.filter(p=>p.endsWith('.html')&&!p.includes('/')&&p!=='index.html');
 for(const file of pages){const url=file.startsWith('google')?'/'+file:'/'+file.replace(/\.html$/,'');const r=await get(url);check(r.status===200,'Página pública disponível: '+url,r.status);check(normal(text(r.body))===normal(text(fs.readFileSync(file))),'Conteúdo da outra página preservado: '+file);}
 for(const file of ['assets/logo-idy-grafica.png','assets/mascote-idy.png','assets/home-vitrine.js','assets/app.js','assets/style.css','assets/navegacao.css','robots.txt','sitemap.xml']){const r=await get('/'+file);check(r.status===200&&sha(r.body)===sha(fs.readFileSync(file)),'Arquivo público íntegro: '+file,{status:r.status});}
 const browser=await chromium.launch({headless:true});
 const errors=[];
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:1000},deviceScaleFactor:1});page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>{const req=route.request();if(req.isNavigationRequest()&&new URL(req.url()).hostname!=='idygrafica.netlify.app')return route.abort();return route.continue();});
  await page.goto(root+'/?verify='+commit.slice(0,12),{waitUntil:'domcontentloaded'});
  await page.locator('.home-hero-printer img').evaluate(i=>i.decode());await page.locator('.home-mascot').evaluate(i=>i.decode());
  const d=await page.evaluate(()=>{const img=document.querySelector('.home-hero-printer img'),b=document.querySelector('.home-printer-badge').getBoundingClientRect(),p=img.getBoundingClientRect(),c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;const ctx=c.getContext('2d');ctx.drawImage(img,0,0);return {src:img.getAttribute('src'),overflow:document.documentElement.scrollWidth>innerWidth,gap:p.top-b.bottom,alpha:ctx.getImageData(0,0,1,1).data[3],badgeText:document.querySelector('.home-printer-badge').innerText,products:document.querySelectorAll('[data-home-service]').length,loaded:[...document.querySelectorAll('header img,.home-composition img')].every(i=>i.complete&&i.naturalWidth>0)};});
  check(d.src==='assets/xerox-color-560-home.webp'&&d.alpha===0,'Imagem pública nova e transparente em '+width);
  check(!d.overflow&&d.loaded&&d.gap>=10,'Abertura pública sem recortes ou sobreposição entre selo e impressora em '+width,d);
  check(d.products===10,'Dez produtos preservados em '+width,d.products);
  await page.screenshot({path:path.join(out,width===390?'celular-publicado.png':'computador-publicado.png'),fullPage:false});
  await page.locator('#home-query').fill('A4');await page.locator('.home-search-bar button').click();check(await page.locator('#home-search-results a').count()>0,'Busca pública A4 em '+width);await page.locator('.home-search-clear').click();check(await page.locator('#home-search-results').isHidden(),'Limpeza da busca pública em '+width);
  const targets=await page.locator('.home-actions a').evaluateAll(nodes=>nodes.map(n=>({href:n.href,target:n.target,rel:n.rel})));check(targets[0].href==='https://wa.me/5551981687562'&&targets[1].href==='https://atendimento-idy.netlify.app/'&&targets.every(t=>t.target==='_blank'&&t.rel.includes('noopener')),'Botões públicos de WhatsApp e IA preservados em '+width,targets);
  if(width===390){await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.locator('.mobile-menu-toggle').click();check(await page.locator('.mobile-menu-toggle').getAttribute('aria-expanded')==='true','Menu público mobile abre');await page.keyboard.press('Escape');check(await page.locator('.mobile-menu-toggle').getAttribute('aria-expanded')==='false','Menu público mobile fecha com Escape');}
  await page.close();
 }
 check(errors.length===0,'Sem erros JavaScript na home pública',errors);
 await browser.close();
 const ai=await fetch('https://atendimento-idy.netlify.app/',{signal:AbortSignal.timeout(25000)});check(ai.ok,'Destino público do Orçamento com IA disponível',ai.status);
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({commit,total:results.length,passed:results.filter(x=>x.ok).length,failures,results},null,2));
 console.log('PUBLIC_REPORT',JSON.stringify({commit,total:results.length,passed:results.filter(x=>x.ok).length,failures}));if(failures)process.exitCode=1;
})().catch(e=>{fs.writeFileSync(path.join(out,'error.txt'),e.stack);console.error(e);process.exit(1)});
