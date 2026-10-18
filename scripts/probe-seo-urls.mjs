import fs from 'node:fs';
import assert from 'node:assert/strict';
const origin='https://idygrafica.netlify.app';
const names=['index','servicos','impressos','impressoes-rapidas','comunicacao-visual','cortes-especiais','criacao-sites','livros-digitais','portfolio','contato','sobre'];
const queue=names.flatMap(name=>(name==='index'?['/','/index.html','/index/']:['/'+name,'/'+name+'.html','/'+name+'/']).map(path=>({name,path})));
const results=[];let next=0;
async function worker(){while(next<queue.length){const {name,path}=queue[next++];let r;
 for(let attempt=0;attempt<2;attempt++){try{
  const started=Date.now(),response=await fetch(origin+path,{redirect:'manual',signal:AbortSignal.timeout(12000)});
  const html=await response.text();r={name,path,status:response.status,location:response.headers.get('location'),server:response.headers.get('server'),title:html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1],canonical:html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)/i)?.[1],noindex:/noindex/i.test(response.headers.get('x-robots-tag')||''),ms:Date.now()-started};
  break;
 }catch(error){r={name,path,error:error.message};if(attempt===0)await new Promise(resolve=>setTimeout(resolve,300));}}
 results.push(r);console.log('SEO_PUBLIC_VARIANT '+JSON.stringify(r));}}
await Promise.all([worker(),worker(),worker()]);
const usable=names.filter(n=>n!=='index').every(n=>results.some(r=>r.name===n&&r.path==='/'+n&&r.status===200&&r.title)&&results.some(r=>r.name===n&&r.path==='/'+n+'.html'&&(r.status===200||[301,308].includes(r.status))));
const report={origin,checkedAt:new Date().toISOString(),cleanUrlsAvailable:usable,results:results.sort((a,b)=>a.path.localeCompare(b.path)),redirectsChanged:false,netlifyPublished:false};
fs.mkdirSync('.preview/seo-etapa-1',{recursive:true});fs.writeFileSync('.preview/seo-etapa-1/urls-publicadas.json',JSON.stringify(report,null,2));
console.log('SEO_PUBLIC_VARIANTS_SUMMARY '+JSON.stringify(report));
