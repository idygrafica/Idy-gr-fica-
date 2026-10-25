// Somente GET na prévia: não altera produção, dados ou credenciais.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const origin='https://deploy-preview-11--idygrafica.netlify.app';
const pages=JSON.parse(await readFile('scripts/seo-technical/pages.json','utf8'));
const report={origin,checkedAt:new Date().toISOString(),pages:[],aliases:[],productionPublished:false,verified:false};
await mkdir('.preview/seo-technical',{recursive:true});
async function get(path,redirect='follow'){
 let error;
 for(let i=0;i<2;i++)try{return await fetch(origin+path,{redirect,signal:AbortSignal.timeout(20000),headers:{'Cache-Control':'no-cache'}});}catch(e){error=e;}
 throw error;
}
try{
 let html='';
 for(let i=0;i<20;i++){const r=await get('/');html=await r.text();if((html.match(/data-product=/g)||[]).length===8)break;await new Promise(r=>setTimeout(r,5000));}
 assert.equal((html.match(/data-product=/g)||[]).length,8,'Catálogo ainda não está no HTML da prévia');
 for(const p of pages){
  const r=await get(p.path);assert.equal(r.status,200,p.path);const text=await r.text();
  assert(text.includes('<title>'+p.title+'</title>'),'Título incorreto: '+p.path);
  assert(text.includes('href="https://idygrafica.netlify.app'+p.path+'"'),'Canonical incorreto: '+p.path);
  report.pages.push({path:p.path,status:r.status,robotsHeader:r.headers.get('x-robots-tag'),metadataCorrect:true});
  for(const alias of [p.path==='/'?'/index.html':p.path+'.html',...(p.path==='/'?[]:[p.path+'/'])]){
   const first=await get(alias,'manual');assert.equal(first.status,301,'Alias não consolidado: '+alias);
   const target=new URL(first.headers.get('location'),origin);assert.equal(target.pathname,p.path);assert.equal(target.origin,origin);
   const end=await get(target.pathname);assert.equal(end.status,200,'Destino do alias indisponível: '+alias);
   report.aliases.push({from:alias,status:301,to:p.path,finalStatus:200});
  }
 }
 assert.equal((await get('/nao-existe-auditoria-seo-20261025')).status,404);
 const robots=await get('/robots.txt');assert.equal(robots.status,200);assert((await robots.text()).includes('Allow: /'));
 const sitemap=await get('/sitemap.xml');assert.equal(sitemap.status,200);assert.equal((await sitemap.text()).match(/<loc>/g).length,12);
 const verification=await get('/googlea370a5b2e9c8d30f.html');assert.equal(verification.status,200);assert.equal((await verification.text()).trim(),'google-site-verification: googlea370a5b2e9c8d30f.html');
 for(const resource of ['/assets/loja/product-card.js','/assets/loja/catalog.js','/assets/loja/cart.js'])assert.equal((await get(resource)).status,200,resource+' indisponível');
 report.staticProducts=8;report.notFoundStatus=404;report.googleVerificationPreserved=true;report.verified=true;
}finally{await writeFile('.preview/seo-technical/preview-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));}
