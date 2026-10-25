// Auditoria somente GET. Não publica, envia pedidos ou usa credenciais.
import {readFile,mkdir,writeFile} from 'node:fs/promises';
const origin='https://idygrafica.netlify.app';
const sitemap=await readFile('sitemap.xml','utf8');
const pages=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>new URL(m[1]).pathname);
const urls=['/robots.txt','/sitemap.xml',...pages,'/index','/index.html','/index/','/?utm_source=seo-audit','/nao-existe-auditoria-seo-20261025',...pages.filter(p=>p!=='/').flatMap(p=>[p+'.html',p+'/'])];
const report=[];
async function probe(path){
 const chain=[];let url=new URL(path,origin).href;
 try{
  for(let i=0;i<6;i++){
   let response;
   for(let attempt=0;attempt<2;attempt++){
    try{response=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(15000)});break;}catch(e){if(attempt===1)throw e;}
   }
   const location=response.headers.get('location'),type=response.headers.get('content-type');
   const step={url,status:response.status,location,robotsHeader:response.headers.get('x-robots-tag')};chain.push(step);
   if(response.status>=300&&response.status<400&&location){url=new URL(location,url).href;continue;}
   const text=type?.includes('text/')||type?.includes('xml')?await response.text():'';
   step.canonical=text.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)/i)?.[1];
   step.title=text.match(/<title>([\s\S]*?)<\/title>/i)?.[1];
   step.metaRobots=[...text.matchAll(/<meta\b[^>]*(?:robots|googlebot)[^>]*>/gi)].map(m=>m[0]);
   step.productArticles=(text.match(/data-product=/g)||[]).length;
   if(path==='/')step.rawProductText=text.includes('Canetas personalizadas');
   break;
  }
  return{path,chain};
 }catch(e){return{path,chain,error:e.name};}
}
for(let i=0;i<urls.length;i+=6)report.push(...await Promise.all(urls.slice(i,i+6).map(probe)));
await mkdir('.preview/seo-technical',{recursive:true});
await writeFile('.preview/seo-technical/public-audit.json',JSON.stringify({checkedAt:new Date().toISOString(),origin,pages:pages.length,requests:report,published:false},null,2));
console.log(JSON.stringify(report.map(x=>({path:x.path,chain:x.chain.map(s=>({status:s.status,url:s.url,robots:s.robotsHeader,canonical:s.canonical,productArticles:s.productArticles})),error:x.error})),null,2));
