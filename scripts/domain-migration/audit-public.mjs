// Somente GET, sem contas, credenciais, alterações de DNS ou publicação.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const origin='https://idygrafica.com.br',old='https://idygrafica.netlify.app';
const paths=[...(await readFile('sitemap.xml','utf8')).matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>new URL(m[1]).pathname);
const report={at:new Date().toISOString(),origin,productionModified:false,pages:[],aliases:[]};
async function check(url){
 const failures=[];const attempts=new URL(url).hostname==='idygrafica.com.br'?3:1;
 for(let n=0;n<attempts;n++){
  try{const r=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(15000)});const text=await r.text();return{url,status:r.status,location:r.headers.get('location'),noindex:r.headers.get('x-robots-tag'),title:text.match(/<title>(.*?)<\/title>/s)?.[1],canonical:text.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)/)?.[1],sitemapUrls:(text.match(/<loc>/g)||[]).length,oldDomainPresent:text.includes(old),...(failures.length?{transientFailures:failures}:{})};}
  catch(e){failures.push({name:e.name,message:e.message,causeCode:e.cause?.code,causeMessage:e.cause?.message});if(n+1<attempts)await new Promise(r=>setTimeout(r,400));}
 }
 return{url,error:failures.at(-1),attempts:failures};
}
report.pages.push(await check(origin+'/'));
if(report.pages[0].status===200){for(const p of paths.slice(1))report.pages.push(await check(origin+p));report.robots=await check(origin+'/robots.txt');report.sitemap=await check(origin+'/sitemap.xml');}
report.aliases=await Promise.all([old+'/', 'http://idygrafica.com.br/','https://www.idygrafica.com.br/'].map(check));
await mkdir('.preview/domain-migration',{recursive:true});await writeFile('.preview/domain-migration/public-domain-audit.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({primary:report.pages[0],pagesChecked:report.pages.length,statusProblems:report.pages.filter(p=>p.status!==200),aliases:report.aliases,productionModified:false}));
