import {readFileSync,existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const baseline=JSON.parse(readFileSync('scripts/loja/baseline.json','utf8'));
const blobHash=data=>createHash('sha1').update(Buffer.from(`blob ${data.length}\0`)).update(data).digest('hex');
for(const f of baseline.tree){
 if(f.path==='index.html')continue;
 assert(existsSync(f.path),'Arquivo anterior ausente: '+f.path);
 assert.equal(blobHash(readFileSync(f.path)),f.sha,'Arquivo anterior alterado: '+f.path);
}
const original=execFileSync('git',['show',baseline.commit+':index.html'],{encoding:'utf8'});
const current=readFileSync('index.html','utf8');
for(const pattern of [/<title>[\s\S]*?<\/title>/g,/<meta name="description"[^>]*>/g,/<link rel="canonical"[^>]*>/g,/<meta property="og:[^"]+"[^>]*>/g,/<script type="application\/ld\+json">[\s\S]*?<\/script>/g])assert.deepEqual(current.match(pattern),original.match(pattern),'Metadados SEO originais alterados');
assert(!/name="robots" content="noindex/.test(current),'Página oficial marcada como noindex');
assert(!current.includes('Loja demonstrativa'),'Texto de ambiente demonstrativo na página oficial');
assert(current.includes('https://atendimento-idy.netlify.app/'));
for(const f of baseline.tree.filter(x=>x.path.endsWith('.html')&&!x.path.startsWith('google')&&x.path!=='index.html'))assert(current.includes('href="/'+f.path.replace(/\.html$/,'')+'"'),'Navegação ausente: '+f.path);
const modified=execFileSync('git',['diff','--name-only',baseline.commit,'HEAD'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
for(const f of modified)assert(f==='index.html'||f==='LOJA_INTEGRACAO.md'||f.startsWith('assets/loja/')||f.startsWith('scripts/loja/')||f==='.github/workflows/loja-inicio.yml','Mudança fora do escopo: '+f);
mkdirSync('.preview/loja',{recursive:true});
const report={base:baseline.commit,preservedFiles:baseline.tree.length-1,onlyHomeReplaced:true,metadataPreserved:true,originalAssetsUnchanged:true,routesUnchanged:true,aiProjectModified:false};
writeFileSync('.preview/loja/preservation.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
