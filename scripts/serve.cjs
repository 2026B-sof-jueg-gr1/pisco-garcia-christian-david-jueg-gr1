// Servidor de desarrollo sin dependencias. Ejecutar: npm start
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png'};
const server=http.createServer((req,res)=>{
  let pathname;
  try { pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname); } catch { res.writeHead(400).end();return; }
  const target=path.resolve(root,'.'+pathname);
  const relative=path.relative(root,target);
  if(relative.startsWith('..')||path.isAbsolute(relative)||relative.split(path.sep).some(part=>part.startsWith('.'))){res.writeHead(403).end();return;}
  let file=target;
  try { if(fs.statSync(file).isDirectory())file=path.join(file,'index.html'); } catch { res.writeHead(404).end('No encontrado');return; }
  fs.readFile(file,(err,body)=>{if(err){res.writeHead(404).end('No encontrado');return;}res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'}).end(body);});
});
server.listen(4173,'127.0.0.1',()=>console.log('ECO listo en http://127.0.0.1:4173/mi-primer-juego/'));
server.on('error',error=>{console.error(error.message);process.exitCode=1;});
