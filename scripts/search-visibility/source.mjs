// Protege a versão comercial publicada e permite somente a proposta SEO aprovada.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const base='3e7d3a1baf70cde9d564caa93fcb7a76501110be',origin='https://idygrafica.netlify.app';
const paths=[...((await readFile('sitemap.xml','utf8')).matchAll(/<loc>(.*?)<\/loc>/g))].map(m=>new URL(m[1]).pathname),files=paths.map(p=>p==='/'?'index.html':p.slice(1)+'.html');
const workflowChanges=[".github/workflows/criacao-sites-preview.yml", ".github/workflows/comunicacao-visual-preview.yml", ".github/workflows/cortes-especiais-preview.yml", ".github/workflows/servicos-preview.yml", ".github/workflows/impressoes-dtf.yml", ".github/workflows/impressos-preview.yml", "scripts/digital-products/browser.mjs", "scripts/approved-prices/browser.mjs", "scripts/pastas-prices/browser.mjs", "scripts/impressoes-dtf/check.mjs", "scripts/livros/check.mjs"];
const original=p=>execFileSync('git',['show',base+':'+p]);let protectedFiles=0;
for(const p of execFileSync('git',['ls-tree','-r','--name-only',base],{encoding:'utf8'}).trim().split('\n').filter(p=>!files.includes(p)&&p!=='robots.txt'&&!workflowChanges.includes(p))){assert.equal(execFileSync('git',['hash-object',p],{encoding:'utf8'}),execFileSync('git',['rev-parse',base+':'+p],{encoding:'utf8'}),'Fora do escopo: '+p);protectedFiles++;}
const html=await readFile('index.html','utf8'),old=original('index.html').toString();const section=(s,a,b)=>s.slice(s.indexOf(a),s.indexOf(b,s.indexOf(a))+b.length);
assert.equal(section(html,'<header','</header>'),section(old,'<header','</header>'));assert.equal(section(html,'<aside class="cart"','</aside>'),section(old,'<aside class="cart"','</aside>'));
assert.equal(section(html,'<!-- idy:catalog:start -->','<!-- idy:catalog:end -->'),section(old,'<!-- idy:catalog:start -->','<!-- idy:catalog:end -->'),'HTML comercial alterado');
const oldData=JSON.parse(old.match(/<script type="application\/ld\+json">(.*?)<\/script>/g).map(s=>s.slice(s.indexOf('>')+1,s.lastIndexOf('<'))).find(s=>JSON.parse(s)['@type']==='LocalBusiness'));const newData=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/g).map(s=>s.slice(s.indexOf('>')+1,s.lastIndexOf('<'))).find(s=>JSON.parse(s)['@type']==='LocalBusiness'));for(const k of Object.keys(oldData))assert.deepEqual(newData[k],oldData[k],k);
for(const p of files)assert.deepEqual([...(await readFile(p,'utf8')).matchAll(/<img\b[^>]*>/g)].map(m=>m[0]),[...original(p).toString().matchAll(/<img\b[^>]*>/g)].map(m=>m[0]),'Imagem alterada: '+p);
const h=files.map(p=>execFileSync('git',['hash-object',p],{encoding:'utf8'}));execFileSync('node',['scripts/seo-technical/build-catalog.mjs']);assert.deepEqual(files.map(p=>execFileSync('git',['hash-object',p],{encoding:'utf8'})),h,'Build não idempotente');
const policy=execFileSync('python',['-c',"import urllib.robotparser,json;p=urllib.robotparser.RobotFileParser();p.parse(open('robots.txt').read().splitlines());print(json.dumps({a:p.can_fetch(a,'https://idygrafica.netlify.app/') for a in ['Googlebot','OAI-SearchBot','GPTBot']}))"],{encoding:'utf8'});assert.deepEqual(JSON.parse(policy),{Googlebot:true,'OAI-SearchBot':true,GPTBot:true});
export {base,origin,paths,files,html,protectedFiles};
