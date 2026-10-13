#!/usr/bin/env node
import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";

const allowed=new Map([
  ["/","../gallery/index.html"],["/index.html","../gallery/index.html"],
  ["/styles.css","../gallery/styles.css"],["/app.js","../gallery/app.js"],
  ["/catalog/design-patterns.json","../catalog/design-patterns.json"],
  ["/catalog/component-needs.json","../catalog/component-needs.json"],
  ["/catalog/targets.json","../catalog/targets.json"]
]);
const types={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8"};
const security={
 "Content-Security-Policy":"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
 "X-Content-Type-Options":"nosniff",
 "Referrer-Policy":"no-referrer",
 "Cache-Control":"no-store",
 "X-Frame-Options":"DENY"
};
function send(res,status,body,ct="text/plain; charset=utf-8",method="GET"){
 res.writeHead(status,{"Content-Type":ct,"Content-Length":Buffer.byteLength(body),...security});
 res.end(method==="HEAD" ? undefined : body);
}
export function makeServer(){
 return createServer(async (req,res)=>{
  const method=req.method||"GET";
  if(method!=="GET"&&method!=="HEAD")return send(res,405,"Method not allowed\n","text/plain; charset=utf-8",method);
  let url;
  try {url=new URL(req.url||"/","http://127.0.0.1");}catch {return send(res,400,"Bad URL\n","text/plain; charset=utf-8",method);}
  // The path is strictly whitelisted: no path traversal or arbitrary local file exposure.
  const pathname=url.pathname;
  if(!allowed.has(pathname))return send(res,404,"Not found\n","text/plain; charset=utf-8",method);
  const relative=allowed.get(pathname),fileUrl=new URL(relative,import.meta.url);
  try{
   const bytes=await readFile(fileUrl);
   const contentType=types[fileUrl.pathname.slice(fileUrl.pathname.lastIndexOf("."))]||"application/octet-stream";
   res.writeHead(200,{"Content-Type":contentType,"Content-Length":bytes.length,...security});
   res.end(method==="HEAD"?undefined:bytes);
  }catch{
   send(res,500,"Preview file unavailable\n","text/plain; charset=utf-8",method);
  }
 });
}
function main(){
 let port=4173;
 const args=process.argv.slice(2);
 if(args.includes("--port")){
  const val=args[args.indexOf("--port")+1];
  if(!/^\d+$/.test(val||""))throw Error("--port requires a numeric port");
  port=Number(val);
 }
 if(port<0||port>65535||!Number.isInteger(port))throw Error("Invalid port");
 const server=makeServer();
 server.on("error",e=>{console.error("Gallery server error: "+e.message);process.exitCode=1;});
 server.listen(port,"127.0.0.1",()=>console.log("Kneekura original-concept gallery: http://127.0.0.1:"+server.address().port+"/"));
}
import {resolve} from "node:path";
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
