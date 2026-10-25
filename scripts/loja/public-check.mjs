// Verificação HTTP somente leitura da prévia ou produção. Não publica nem envia pedidos.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const origin=new URL(process.env.LOJA_PUBLIC_URL||'https://deploy-preview-9--idygrafica.netlify.app/');
assert(['deploy-preview-9--idygrafica.netlify.app','idygrafica.netlify.app'].includes(origin.hostname));
const hash=data=>createHash('sha1').update(Buffer.from(`blob ${data.length}\0`)).update(data).digest('hex');
const report={url:origin.href,commit:process.env.GITHUB_SHA,checkedAt:new Date().toISOString(),verified:false,realWhatsAppMessagesSent:0,checks:[]};
// A prévia adiciona este bloco do próprio Netlify depois de </html>. Não faz parte
// do código publicado. Só essa assinatura exata do projeto oficial é reconhecida.
const toolbar=/^<div data-netlify-deploy-id="[a-f0-9]{24}" data-netlify-site-id="185cd817-87b6-424a-99a7-2747e362593a" data-vcs="github" style="position:fixed">\n  <!-- This div is automatically inserted by Netlify for all Deploy Preview URLs\. -->\n  <script async src="\/\.netlify\/scripts\/cdp"><\/script>\n<\/div>\n$/;
const sourceHash=(bytes,isHtml=false,expectedBytes)=>{
 if(isHtml&&expectedBytes&&origin.hostname.startsWith('deploy-preview-')){
  const text=bytes.toString('utf8'),source=expectedBytes.toString('utf8');
  if(text.startsWith(source)){
   const suffix=text.slice(source.length);
   if(toolbar.test(suffix)||toolbar.test(suffix.replace(/^\n/,''))){report.netlifyPreviewToolbarRecognized=true;return hash(expectedBytes);}
  }
 }
 return hash(bytes);
};
await mkdir('.preview/loja',{recursive:true});
const get=async path=>{const r=await fetch(new URL(path,origin),{signal:AbortSignal.timeout(20000),headers:{'Cache-Control':'no-cache'}});return{status:r.status,bytes:Buffer.from(await r.arrayBuffer())};};
try{
 const expectedHome=await readFile('index.html'),expected=hash(expectedHome);let home;
 const attempts=origin.hostname.startsWith('deploy-preview-')?1:30;
 for(let i=0;i<attempts;i++){
  try{home=await get('/');if(home.status===200&&sourceHash(home.bytes,true,expectedHome)===expected)break;}catch(e){report.homeError=e.message;}
  if(i<attempts-1)await new Promise(r=>setTimeout(r,8000));
 }
 if(home){report.homeStatus=home.status;report.observedHomeHash=hash(home.bytes);report.expectedHomeHash=expected;await writeFile('.preview/loja/public-home.html',home.bytes);}
 assert.equal(home?.status,200,'Página inicial indisponível');assert.equal(sourceHash(home.bytes,true,expectedHome),expected,'Página publicada difere da versão validada');
 report.checks.push({path:'/',status:200,exactSource:true});
 for(const path of ['assets/loja/app.js','assets/loja/cart.js','assets/loja/catalog.js','assets/loja/styles.css','assets/loja/product-card.js','assets/loja/referencia-aprovada.jpg']){
  const expectedAsset=hash(await readFile(path));let actual;
  for(let attempt=0;attempt<30;attempt++){actual=await get('/'+path);if(actual.status===200&&hash(actual.bytes)===expectedAsset)break;await new Promise(r=>setTimeout(r,5000));}
  assert.equal(actual.status,200);assert.equal(hash(actual.bytes),expectedAsset,path+' publicado difere do repositório');
  report.checks.push({path:'/'+path,status:200,exactSource:true});
 }
 const baseline=JSON.parse(await readFile('scripts/loja/baseline.json','utf8'));
 const protectedFiles=baseline.tree.filter(x=>(x.path.endsWith('.html')&&!x.path.startsWith('google')&&x.path!=='index.html')||['assets/logo-idy-grafica.png','assets/mascote-idy.png','assets/xerox-color-560-home.webp','robots.txt','sitemap.xml'].includes(x.path));
 const mismatches=[];
 for(const file of protectedFiles){
  const path='/'+file.path.replace(/\.html$/,'');const actual=await get(path);
  const exactSource=sourceHash(actual.bytes,file.path.endsWith('.html'),await readFile(file.path))===hash(await readFile(file.path));
  report.checks.push({path,status:actual.status,exactSource});
  if(actual.status!==200||!exactSource){mismatches.push(path);if(file.path.endsWith('.html')){await writeFile('.preview/loja/public-'+file.path,actual.bytes);await writeFile('.preview/loja/expected-'+file.path,await readFile(file.path));}}
 }
 assert.deepEqual(mismatches,[],'Páginas publicadas diferem da versão preservada');
 const ai=await fetch('https://atendimento-idy.netlify.app/',{signal:AbortSignal.timeout(20000)});assert.equal(ai.status,200,'Atendimento independente não abre');
 report.aiHomeStatus=ai.status;report.verified=true;report.completedAt=new Date().toISOString();
}finally{await writeFile('.preview/loja/public-check.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));}
