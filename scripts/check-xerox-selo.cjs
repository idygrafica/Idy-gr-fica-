const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const out=path.resolve('.preview/xerox-selo');fs.mkdirSync(out,{recursive:true});
const source=process.env.SOURCE_SHA;
const base='f1486d87561e81f690b3afeb18e7956aa2767cac';
const original=execFileSync('git',['show',base+':index.html'],{encoding:'utf8'});
const originalCSS=execFileSync('git',['show',base+':assets/home-vitrine.css'],{encoding:'utf8'});
const current=fs.readFileSync('index.html','utf8');
const expected=original.replace(/(class="home-hero-printer"><img src=")[^"]+/, '$1assets/xerox-color-560-home.webp');
const results=[];let failures=0;
function check(condition,message,detail){results.push({ok:!!condition,message,detail});if(!condition){failures++;console.error('FAIL',message,detail||'');}}
check(current.trimEnd()===expected.trimEnd(),'HTML preservado fora da URL da Xerox da abertura');
const changed=execFileSync('git',['diff','--name-only',base,source],{encoding:'utf8'}).trim().split('\n').sort();
check(JSON.stringify(changed)===JSON.stringify(['assets/home-vitrine.css','assets/xerox-color-560-home.webp','index.html']),'Somente três arquivos de produção alterados',changed);
for(const [p,sha] of [['assets/mascote-idy.png','462b89ded5c0849159378b42431062fe08a9a78e'],['assets/logo-idy-grafica.png','4bcfcd8ba8a5f859da376a4f9a6ac15755249266']])check(execFileSync('git',['hash-object',p],{encoding:'utf8'}).trim()===sha,'Arquivo oficial preservado: '+p);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg'};
const server=http.createServer((req,res)=>{let u=decodeURIComponent(req.url.split('?')[0]);if(u==='/_before'){res.setHeader('Content-Type',mime['.html']);return res.end(original.replace('href="assets/home-vitrine.css"','href="/_before.css"'));}if(u==='/_before.css'){res.setHeader('Content-Type',mime['.css']);return res.end(originalCSS);}if(u==='/')u='/index.html';let p=path.resolve('.'+u);if(!p.startsWith(process.cwd()+path.sep)){res.writeHead(403);return res.end();}if(!fs.existsSync(p)&&!path.extname(p))p+='.html';if(!fs.existsSync(p)){res.writeHead(404);return res.end();}res.setHeader('Content-Type',mime[path.extname(p)]||'application/octet-stream');fs.createReadStream(p).pipe(res);});
(async()=>{
 await new Promise(r=>server.listen(8765,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true});
 const errors=[];
 const page=await browser.newPage({viewport:{width:390,height:900},deviceScaleFactor:1});
 const before=await browser.newPage({viewport:{width:390,height:900},deviceScaleFactor:1});
 for(const p of [page,before]){p.on('pageerror',e=>errors.push(e.message));await p.route('**/*',route=>route.request().url().startsWith('http://127.0.0.1:8765/')?route.continue():route.abort());}
 for(const width of [320,360,390,430,620,621,768,900,901,1024,1150,1151,1440]){
  await page.setViewportSize({width,height:1000});await before.setViewportSize({width,height:1000});
  await page.goto('http://127.0.0.1:8765/',{waitUntil:'networkidle'});await before.goto('http://127.0.0.1:8765/_before',{waitUntil:'networkidle'});
  const d=await page.evaluate(()=>{
   const $=s=>document.querySelector(s),r=s=>{const a=$(s).getBoundingClientRect();return {x:a.x,y:a.y,right:a.right,bottom:a.bottom,width:a.width,height:a.height};};
   const img=$('.home-hero-printer img');const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0);const w=canvas.width,h=canvas.height;const alpha=[[0,0],[w-1,0],[0,h-1],[w-1,h-1]].map(([x,y])=>ctx.getImageData(x,y,1,1).data[3]);
   return {composition:r('.home-composition'),badge:r('.home-printer-badge'),image:r('.home-hero-printer img'),font:parseFloat(getComputedStyle($('.home-printer-badge>span')).fontSize),overflow:document.documentElement.scrollWidth>innerWidth,loaded:img.complete&&img.naturalWidth>0,alpha,badgeText:$('.home-printer-badge').innerText,badgeColor:getComputedStyle($('.home-printer-badge')).color,badgeBackground:getComputedStyle($('.home-printer-badge')).backgroundColor,textOverflow:[...document.querySelectorAll('.home-printer-badge span,.home-printer-badge strong,.home-printer-badge li')].some(e=>e.scrollWidth>e.clientWidth+1),openingLoaded:[...document.querySelectorAll('header img,.home-composition img')].every(i=>i.complete&&i.naturalWidth>0)};
  });
  const oldFont=await before.locator('.home-printer-badge>span').evaluate(e=>parseFloat(getComputedStyle(e).fontSize));
  check(!d.overflow,'Sem rolagem horizontal em '+width);
  check(d.loaded&&d.openingLoaded,'Imagens da abertura carregadas em '+width);
  check(d.alpha.every(v=>v===0),'Transparência real nos quatro cantos em '+width);
  check(d.badge.bottom<=d.image.y-10,'Selo separado da impressora em '+width,{badge:d.badge,image:d.image});
  check(d.badge.y>=d.composition.y-1&&d.badge.x>=d.composition.x-1&&d.badge.right<=d.composition.right+1,'Selo inteiro dentro da composição em '+width,d);
  check(d.image.x>=d.composition.x-1&&d.image.right<=d.composition.right+1&&d.image.bottom<=d.composition.bottom+1,'Imagem da máquina inteira dentro da composição em '+width);
  check(!d.textOverflow&&Math.abs(d.font/oldFont-1.15)<0.01,'Letras menores 15% maiores, sem recorte, em '+width,{oldFont,font:d.font});
  check(d.badgeColor==='rgb(7, 54, 106)'&&d.badgeBackground==='rgb(255, 227, 75)','Selo amarelo e texto azul-escuro em '+width);
  const screenshotName=width===390?'celular-390':width===1440?'computador-1440':width===320?'celular-320':width===1024?'computador-1024':width===901?'computador-901':width===1151?'computador-1151':null;
  if(screenshotName){await page.evaluate(()=>scrollTo(0,0));const bottom=await page.locator('.home-opening').evaluate(e=>e.getBoundingClientRect().bottom);await page.screenshot({path:path.join(out,screenshotName+'.png'),clip:{x:0,y:0,width,height:Math.ceil(bottom)}});await page.locator('.home-composition').screenshot({path:path.join(out,screenshotName+'-detalhe.png')});}
  for(const p of [page,before]){await p.mouse.move(0,0);await p.addStyleTag({content:'.nav,.whats-widget{visibility:hidden!important}.home-product{transition:none!important}'});}
  for(const p of [page,before])await p.locator('.home-showcase').evaluate(e=>{const y=e.getBoundingClientRect().y;e.style.transform='translateY('+(Math.round(y)-y)+'px)';});
  const nowShowcase=await page.locator('.home-showcase').screenshot({animations:'disabled'});const beforeShowcase=await before.locator('.home-showcase').screenshot({animations:'disabled'});
  if(!nowShowcase.equals(beforeShowcase)){fs.writeFileSync(path.join(out,'vitrine-'+width+'-depois.png'),nowShowcase);fs.writeFileSync(path.join(out,'vitrine-'+width+'-antes.png'),beforeShowcase);}
  check(nowShowcase.equals(beforeShowcase),'Vitrine idêntica em pixels em '+width);
  await page.locator('#home-query').fill('A4');await page.locator('.home-search-bar button').click();check((await page.locator('#home-search-results a').count())>0,'Busca A4 funcional em '+width);await page.locator('.home-search-clear').click();check(await page.locator('#home-search-results').isHidden(),'Limpeza da busca em '+width);
  check(await page.locator('.home-button-wa').first().getAttribute('href')==='https://wa.me/5551981687562'&&await page.locator('.home-button-ai').getAttribute('href')==='https://atendimento-idy.netlify.app','Destinos dos botões preservados em '+width);
  console.log('WIDTH',width,JSON.stringify(d));
 }
 check(errors.length===0,'Sem erros JavaScript',errors);
 await browser.close();server.close();
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({source,base,total:results.length,passed:results.filter(r=>r.ok).length,failures,results},null,2));
 console.log(JSON.stringify({source,total:results.length,passed:results.filter(r=>r.ok).length,failures}));if(failures)process.exitCode=1;
})().catch(e=>{console.error(e);server.close();process.exit(1)});
