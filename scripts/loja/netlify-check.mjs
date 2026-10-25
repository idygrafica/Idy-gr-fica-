// Somente GET: confere destino/produção e credencial já existente, nunca publica.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const out='.preview/loja';await mkdir(out,{recursive:true});
const hash=data=>createHash('sha1').update(Buffer.from(`blob ${data.length}\0`)).update(data).digest('hex');
const baseline=JSON.parse(await readFile('scripts/loja/baseline.json','utf8'));
const report={url:'https://idygrafica.netlify.app/',checkedAt:new Date().toISOString(),productionChanged:false,credentialConfigured:Boolean(process.env.NETLIFY_AUTH_TOKEN)};
try{
 const response=await fetch(report.url,{signal:AbortSignal.timeout(20000)});
 const bytes=Buffer.from(await response.arrayBuffer());
 report.homeStatus=response.status;report.homeBlob=hash(bytes);
 report.productionMatchesBaseline=report.homeBlob===baseline.tree.find(x=>x.path==='index.html').sha;
}catch(e){report.publicCheckError=e.name;}
if(process.env.NETLIFY_AUTH_TOKEN){
 try{
  const response=await fetch('https://api.netlify.com/api/v1/sites?per_page=100',{headers:{Authorization:'Bearer '+process.env.NETLIFY_AUTH_TOKEN},signal:AbortSignal.timeout(20000)});
  report.authenticationStatus=response.status;
  if(response.ok){
   const sites=await response.json();const selected=sites.find(s=>s.name==='idygrafica'&&new URL(s.ssl_url||s.url).hostname==='idygrafica.netlify.app');
   report.site=selected?{id:selected.id,name:selected.name,url:selected.ssl_url||selected.url,repo:selected.build_settings?.repo_url,branch:selected.build_settings?.repo_branch,publish:selected.build_settings?.dir,deployPreviews:selected.build_settings?.enable_pull_request_previews,stopBuilds:selected.build_settings?.stop_builds}:null;
  }
 }catch(e){report.authenticationCheckError=e.name;}
}
await writeFile(out+'/netlify-check.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report));
