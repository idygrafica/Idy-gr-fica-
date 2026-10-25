// Verificação HTTP somente leitura da prévia ou produção. Não publica nem envia pedidos.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const origin=new URL(process.env.LOJA_PUBLIC_URL||'https://deploy-preview-9--idygrafica.netlify.app/');
assert(['deploy-preview-9--idygrafica.netlify.app','idygrafica.netlify.app'].includes(origin.hostname));
const hash=data=>createHash('sha1').update(Buffer.from(`blob ${data.length}\0`)).update(data).digest('hex');
const report={url:origin.href,commit:process.env.GITHUB_SHA,checkedAt:new Date().toISOString(),verified:false,realWhatsAppMessagesSent:0,checks:[]};
await mkdir('.preview/loja',{recursive:true});
const get=async path=>{const r=await fetch(new URL(path,origin),{signal:AbortSignal.timeout(20000),headers:{'Cache-Control':'no-cache'}});return{status:r.status,bytes:Buffer.from(await r.arrayBuffer())};};
try{
 const expected=hash(await readFile('index.html'));let home;
 for(let i=0;i<30;i++){
  try{home=await get('/');if(home.status===200&&hash(home.bytes)===expected)break;}catch{}
  if(i<29)await new Promise(r=>setTimeout(r,8000));
 }
 assert.equal(home?.status,200,'Página inicial indisponível');assert.equal(hash(home.bytes),expected,'Página publicada difere da versão validada');
 report.checks.push({path:'/',status:200,exactSource:true});
 for(const path of ['assets/loja/app.js','assets/loja/cart.js','assets/loja/catalog.js','assets/loja/styles.css','assets/loja/referencia-aprovada.jpg']){
  const actual=await get('/'+path);assert.equal(actual.status,200);assert.equal(hash(actual.bytes),hash(await readFile(path)),path+' publicado difere do repositório');
  report.checks.push({path:'/'+path,status:200,exactSource:true});
 }
 const baseline=JSON.parse(await readFile('scripts/loja/baseline.json','utf8'));
 const protectedFiles=baseline.tree.filter(x=>(x.path.endsWith('.html')&&!x.path.startsWith('google')&&x.path!=='index.html')||['assets/logo-idy-grafica.png','assets/mascote-idy.png','assets/xerox-color-560-home.webp','robots.txt','sitemap.xml'].includes(x.path));
 for(const file of protectedFiles){
  const path='/'+file.path.replace(/\.html$/,'');const actual=await get(path);
  assert.equal(actual.status,200,path+' indisponível');assert.equal(hash(actual.bytes),file.sha,path+' difere da versão preservada');
  report.checks.push({path,status:200,exactSource:true});
 }
 const ai=await fetch('https://atendimento-idy.netlify.app/',{signal:AbortSignal.timeout(20000)});assert.equal(ai.status,200,'Atendimento independente não abre');
 report.aiHomeStatus=ai.status;report.verified=true;report.completedAt=new Date().toISOString();
}finally{await writeFile('.preview/loja/public-check.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));}
