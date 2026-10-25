import http from 'node:http';
import {readFileSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
import {execFileSync} from 'node:child_process';
const root=process.cwd();
const config=JSON.parse(execFileSync('python3',['-c',"import json,tomllib;print(json.dumps(tomllib.load(open('netlify.toml','rb'))))"],{encoding:'utf8'}));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.mp4':'video/mp4','.xml':'application/xml','.txt':'text/plain'};
export function makeServer(baselineCommit){return http.createServer((req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');let p=decodeURIComponent(url.pathname);
  if(!baselineCommit){
   const rule=config.redirects.find(r=>r.from===p);
   if(rule?.status===301){res.writeHead(301,{Location:rule.to+url.search}).end();return;}
   if(rule?.status===200)p=rule.to;
   if(p!=='/'&&p.endsWith('/')){res.writeHead(301,{Location:p.slice(0,-1)+url.search}).end();return;}
  }
  let f=p==='/'?'index.html':p.slice(1).replace(/\/$/,'');if(!extname(f))f+='.html';
  const local=resolve(root,f);if(!local.startsWith(root+sep)){res.writeHead(403).end();return;}
  const body=baselineCommit?execFileSync('git',['show',baselineCommit+':'+f],{maxBuffer:10000000,stdio:['ignore','pipe','ignore']}):readFileSync(local);
  res.writeHead(200,{'Content-Type':mime[extname(f)]||'application/octet-stream'}).end(body);
 }catch{res.writeHead(404).end('Não encontrado');}
});}
