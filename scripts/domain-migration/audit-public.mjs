// Somente GET, sem contas, credenciais, alterações de DNS ou publicação.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {Resolver} from 'node:dns/promises';
import tls from 'node:tls';
import {isIP} from 'node:net';
const origin='https://idygrafica.com.br',old='https://idygrafica.netlify.app';
const paths=[...(await readFile('sitemap.xml','utf8')).matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>new URL(m[1]).pathname);
const report={at:new Date().toISOString(),origin,productionModified:false,pages:[],aliases:[]};
const resolver=new Resolver({timeout:4000,tries:1});
async function dnsRecords(host){
 const queries={A:()=>resolver.resolve4(host,{ttl:true}),AAAA:()=>resolver.resolve6(host,{ttl:true}),CNAME:()=>resolver.resolveCname(host),CAA:()=>resolver.resolveCaa(host)};
 if(host==='idygrafica.com.br')queries.NS=()=>resolver.resolveNs(host);
 const result={host};
 await Promise.all(Object.entries(queries).map(async([type,query])=>{try{result[type]={answers:await query()};}catch(e){result[type]={answers:[],code:e.code,absent:['ENODATA','ENOTFOUND'].includes(e.code)};}}));
 return result;
}
const dnsPromise=Promise.all(['idygrafica.com.br','www.idygrafica.com.br'].map(dnsRecords));
const certificate=c=>c?{subject:c.subject?.CN,issuer:c.issuer?.CN,subjectaltname:c.subjectaltname,validFrom:c.valid_from,validTo:c.valid_to}:undefined;
function publicAddress(a){return isIP(a)===4&&!/^(127\.|10\.|192\.168\.|169\.254\.|0\.|172\.(1[6-9]|2\d|3[01])\.)/.test(a);}
function tlsAtAddress(host,address){
 // Nos runners públicos do GitHub não há proxy. Em ambiente com proxy, não o contornar.
 if(process.env.HTTPS_PROXY||process.env.HTTP_PROXY)return Promise.resolve({host,address,skipped:'proxy-configured'});
 if(!publicAddress(address))return Promise.resolve({host,address,skipped:'not-public-ipv4'});
 return new Promise(resolve=>{
  let done=false;const socket=tls.connect({host:address,port:443,servername:host,rejectUnauthorized:true});
  const finish=result=>{if(done)return;done=true;socket.destroy();resolve({host,address,...result});};
  socket.setTimeout(8000,()=>finish({ok:false,code:'TLS_TIMEOUT'}));
  socket.once('secureConnect',()=>finish({ok:socket.authorized,certificate:certificate(socket.getPeerCertificate())}));
  socket.once('error',e=>finish({ok:false,code:e.code,message:e.message,certificate:certificate(e.cert)}));
 });
}
async function check(url){
 const failures=[];const attempts=new URL(url).hostname==='idygrafica.com.br'?3:1;
 for(let n=0;n<attempts;n++){
  try{const r=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(15000)});const text=await r.text();return{url,status:r.status,location:r.headers.get('location'),noindex:r.headers.get('x-robots-tag'),title:text.match(/<title>(.*?)<\/title>/s)?.[1],canonical:text.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)/)?.[1],sitemapUrls:(text.match(/<loc>/g)||[]).length,oldDomainPresent:text.includes(old),...(failures.length?{transientFailures:failures}:{})};}
  catch(e){failures.push({name:e.name,message:e.message,causeCode:e.cause?.code,causeMessage:e.cause?.message,certificate:certificate(e.cause?.cert)});if(n+1<attempts)await new Promise(r=>setTimeout(r,400));}
 }
 return{url,error:failures.at(-1),attempts:failures};
}
report.pages.push(await check(origin+'/'));
if(report.pages[0].status===200){for(const p of paths.slice(1))report.pages.push(await check(origin+p));report.robots=await check(origin+'/robots.txt');report.sitemap=await check(origin+'/sitemap.xml');}
report.aliases=await Promise.all([old+'/', 'http://idygrafica.com.br/','https://www.idygrafica.com.br/'].map(check));
report.dns=await dnsPromise;
report.tlsByAddress=await Promise.all(report.dns.flatMap(d=>(d.A.answers||[]).slice(0,3).map(a=>tlsAtAddress(d.host,a.address))));
report.codeState='PR não publicada; domínio antigo no HTML público é esperado até aprovação e merge.';
report.externalIssues=report.tlsByAddress.filter(t=>t.ok===false).map(t=>({host:t.host,address:t.address,code:t.code,certificate:t.certificate}));
report.transportFailures=report.pages.filter(p=>p.error||p.transientFailures).map(p=>({url:p.url,error:p.error,transientFailures:p.transientFailures}));
await mkdir('.preview/domain-migration',{recursive:true});await writeFile('.preview/domain-migration/public-domain-audit.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({primary:report.pages[0],pagesChecked:report.pages.length,statusProblems:report.pages.filter(p=>p.status!==200),aliases:report.aliases,dns:report.dns,tlsByAddress:report.tlsByAddress,externalIssues:report.externalIssues,productionModified:false}));
