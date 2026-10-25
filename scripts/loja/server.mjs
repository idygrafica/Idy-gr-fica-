import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=process.cwd();
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.json':'application/json','.xml':'application/xml','.txt':'text/plain','.mp4':'video/mp4'};
export const server=http.createServer(async(req,res)=>{
 try{
  const p=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let f=p==='/'?'index.html':p.slice(1).replace(/\/$/,'');
  if(!extname(f))f+='.html';
  const file=resolve(root,f);if(!file.startsWith(root+sep)){res.writeHead(403).end();return;}
  res.writeHead(200,{'Content-Type':mime[extname(f)]||'application/octet-stream'}).end(await readFile(file));
 }catch{res.writeHead(404).end('Não encontrado');}
});
if(process.argv[1]?.endsWith('/server.mjs'))server.listen(Number(process.env.PORT||4173),'127.0.0.1',()=>console.log('Prévia local: http://localhost:4173'));
