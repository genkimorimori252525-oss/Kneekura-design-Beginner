#!/usr/bin/env node
import {strict as assert} from "node:assert";
import {makeServer} from "./serve-gallery.mjs";

const server=makeServer();
async function main(){
 await new Promise((resolve,reject)=>{server.once("error",reject);server.listen(0,"127.0.0.1",resolve);});
 const root="http://127.0.0.1:"+server.address().port;
 async function request(path){
  const r=await fetch(root+path);
  return {status:r.status,body:await r.text(),headers:r.headers};
 }
 for(const [path,needle] of [["/","Kneekura Design Lab"],["/styles.css",".gallery"],["/app.js","function renderPreview"],["/catalog/design-patterns.json","chat-focused"],["/catalog/component-needs.json","chat-composer"]]){
  const r=await request(path);
  assert.equal(r.status,200,"GET "+path);
  assert.ok(r.body.includes(needle),"Expected marker in "+path);
  assert.ok(r.headers.get("content-security-policy"),"Missing content security policy");
 }
 for(const path of ["/../../AGENTS.md","/AGENTS.md","/catalog/sources.json","/not-found"]){
  const r=await request(path);assert.equal(r.status,404,"Must deny path "+path);
 }
 const head=await fetch(root+"/styles.css",{method:"HEAD"});
 assert.equal(head.status,200);
 assert.ok(Number(head.headers.get("content-length"))>100);
 const post=await fetch(root+"/",{method:"POST"});
 assert.equal(post.status,405);
 console.log("PASS: local-only gallery, static assets, JSON indexes, CSP, 404 path hardening, HEAD, method reject");
}
try{await main();}finally{await new Promise(resolve=>server.close(resolve));}
