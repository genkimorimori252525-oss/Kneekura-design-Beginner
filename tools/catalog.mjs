#!/usr/bin/env node
import {readFileSync} from "node:fs";

const here = "../catalog/";
const parse = file => JSON.parse(readFileSync(new URL(here + file, import.meta.url), "utf8"));
const read = () => ({
  catalog: parse("sources.json"), cases: parse("use-cases.json"),
  genres: parse("genres.json"), targets: parse("targets.json"),
  compat: parse("compatibility.json")
});
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const codeStates = new Set(["direct", "adapt", "incompatible", "unverified", "tool-only"]);
const visualStates = new Set(["high", "medium", "low", "none"]);
const licenseStates = new Set(["permissive_verified", "conditional_verified", "restricted", "unverified", "site_claim_only", "service_terms", "spec_reference"]);
const adoptionStates = new Set(["reference-only", "review-upstream"]);
const url = u => typeof u === "string" && /^https:\/\/[^/\s]+\S*$/.test(u);
function validId(id) { return typeof id === "string" && slug.test(id); }
function unique(id, seen, errs, path) {
  if (!validId(id)) errs.push(path + " invalid id: " + String(id));
  if (seen.has(id)) errs.push(path + " duplicate: " + String(id));
  seen.add(id);
}
function validate(db) {
  const errs = [];
  const {catalog, cases, genres, targets, compat} = db;
  for (const [name, obj] of Object.entries(db)) {
    if (obj?.schema_version !== 1) errs.push(name + ": unsupported schema version");
  }
  const sourceIds = new Set(), targetIds = new Set(), genreIds = new Set(), caseIds = new Set();
  if (!Array.isArray(catalog.sources)) {errs.push("sources missing");return errs;}
  if (!Array.isArray(cases.use_cases)) {errs.push("use_cases missing");return errs;}
  if (!Array.isArray(targets.targets)) {errs.push("targets missing");return errs;}
  if (!Array.isArray(genres.genres)) {errs.push("genres missing");return errs;}
  if (!genres.assignments || typeof genres.assignments !== "object") errs.push("genres assignments missing");
  if (!compat.sources || typeof compat.sources !== "object") errs.push("compat sources missing");

  for (const s of catalog.sources) {
    unique(s.id, sourceIds, errs, "source");
    if (!s.name || !s.kind || !s.notes) errs.push(s.id + " missing descriptive fields");
    for (const k of ["website", "repository"]) if (!url(s[k])) errs.push(s.id + ": invalid " + k);
    for (const k of ["stack", "tags"]) if (!Array.isArray(s[k]) || !s[k].length || s[k].some(v => typeof v !== "string" || !v)) errs.push(s.id + ": invalid " + k);
    if (!s.license || !licenseStates.has(s.license.state) || !s.license.label || !url(s.license.evidence)) errs.push(s.id + ": license");
    if (!adoptionStates.has(s.adoption)) errs.push(s.id + ": adoption");
    if (!["permissive_verified","conditional_verified"].includes(s.license?.state) && s.adoption !== "reference-only") errs.push(s.id + ": external copying risk; use reference-only");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s.verified_on || "")) errs.push(s.id + ": verified_on");
  }
  for (const t of targets.targets) {
    unique(t.id, targetIds, errs, "target");
    if (!t.label || !t.family || !t.notes || !Array.isArray(t.technology)) errs.push(t.id + ": target data");
  }
  for (const g of genres.genres) {
    unique(g.id, genreIds, errs, "genre");
    if (!g.label || !g.goal) errs.push(g.id + ": genre description");
  }
  for (const [id, mapped] of Object.entries(genres.assignments || {})) {
    if (!sourceIds.has(id)) errs.push("genre assignment unknown source: " + id);
    if (!Array.isArray(mapped) || !mapped.length || new Set(mapped).size !== mapped.length) errs.push(id + ": invalid/duplicate genres");
    for (const gid of Array.isArray(mapped) ? mapped : []) if (!genreIds.has(gid)) errs.push(id + ": unknown genre: " + gid);
  }
  for (const id of sourceIds) if (!(id in (genres.assignments || {}))) errs.push(id + ": missing genre assignments");
  for (const [id, row] of Object.entries(compat.sources || {})) {
    if (!sourceIds.has(id)) errs.push("compat unknown source: " + id);
    if (!row || !row.note || !row.platforms) {errs.push(id + ": missing compatibility note/platforms"); continue;}
    for (const [target, pair] of Object.entries(row.platforms)) {
      if (!targetIds.has(target)) errs.push(id + ": unknown target: " + target);
      if (!pair || !codeStates.has(pair.code) || !visualStates.has(pair.visual)) errs.push(id + ": invalid compatibility: " + target);
    }
    for (const tid of targetIds) if (!(tid in row.platforms)) errs.push(id + ": unassessed target: " + tid);
  }
  for (const id of sourceIds) if (!(id in (compat.sources || {}))) errs.push(id + ": missing compatibility assessment");
  for (const u of cases.use_cases) {
    unique(u.id, caseIds, errs, "usecase");
    if (!u.label || !u.objective || !Array.isArray(u.checks) || !u.checks.length) errs.push(u.id + ": incomplete usecase");
    if (!Array.isArray(u.source_ids) || !u.source_ids.length || new Set(u.source_ids).size !== u.source_ids.length) errs.push(u.id + ": duplicate/empty source_ids");
    for (const id of u.source_ids || []) if (!sourceIds.has(id)) errs.push(u.id + ": unknown source: " + id);
  }
  return errs;
}
function getFlags(args) {
  const filters = {}, terms = [];
  for (let i=0; i<args.length; i++) {
    const arg=args[i];
    if (arg === "--json") {filters.json=true; continue;}
    if (["--target","--genre","--code","--visual","--license","--stack","--kind"].includes(arg)) {
      const val=args[++i];
      if (!val || val.startsWith("--")) throw Error("Missing value after " + arg);
      filters[arg.slice(2)] = val.toLowerCase();
      continue;
    }
    if (arg.startsWith("--")) throw Error("Unknown flag " + arg);
    terms.push(arg.toLowerCase());
  }
  return {filters,terms};
}
const statusRank={direct:0,adapt:1,unverified:2,incompatible:3,"tool-only":4};
const visualRank={high:0,medium:1,low:2,none:3};
function decision(s, technical) {
  const code=technical?.code || "unverified";
  if (code==="tool-only") return "research-tool-not-component";
  if (code==="incompatible") return "visual-reference-only; never import original code";
  if (code==="unverified") return "research-source-availability-before-use";
  if (s.adoption==="reference-only") return "technical-fit-only; check upstream item rights before local installation; do not mirror here";
  if (code==="adapt") return "adapt-native-code-after-licence-and-version-review";
  return "potential-fit; review exact licence-version-dependencies before local use";
}
function snapshot(db,s,target) {
  const tech=target?db.compat.sources[s.id].platforms[target]:null;
  return {id:s.id,name:s.name,kind:s.kind,website:s.website,
    genres:db.genres.assignments[s.id],stack:s.stack,
    technical:tech?{target,code:tech.code,visual:tech.visual}:null,
    catalog_policy:s.adoption,license:s.license,
    decision:decision(s,tech),warning:db.compat.sources[s.id].note};
}
function recommend(db,caseId,targetId) {
  const useCase=db.cases.use_cases.find(x=>x.id===caseId);
  if (!useCase) throw Error("Unknown use-case "+caseId);
  if (!db.targets.targets.some(x=>x.id===targetId)) throw Error("Unknown target "+targetId);
  const byId=new Map(db.catalog.sources.map(s=>[s.id,s]));
  const ranked=useCase.source_ids.map((id,i)=>{
    const s=byId.get(id), tech=db.compat.sources[id].platforms[targetId];
    return {...snapshot(db,s,targetId),ranking:{code:statusRank[tech.code],visual:visualRank[tech.visual],usecase_order:i}};
  }).sort((a,b)=>(a.ranking.code-b.ranking.code)||(a.ranking.visual-b.ranking.visual)||(a.ranking.usecase_order-b.ranking.usecase_order));
  return {use_case:useCase.id,goal:useCase.objective,target:targetId,
    checks:useCase.checks,limitations:"Technical ranking only. A candidate is not proof of necessary UI changes, license permission, or target-version compatibility.",
    candidates:ranked.map(({ranking,...rest})=>rest)};
}
function help() {
  console.log([
    "Kneekura Design Beginner — AI-first research index (offline, zero dependencies)",
    "  node tools/catalog.mjs validate",
    "  node tools/catalog.mjs self-test",
    "  node tools/catalog.mjs list [--genre g] [--target t] [--code direct|adapt|incompatible|unverified|tool-only] [--json]",
    "  node tools/catalog.mjs search [keywords] [--genre g] [--target t] [--code status] [--visual high|medium|low|none] [--stack name] [--license state] [--kind name] [--json]",
    "  node tools/catalog.mjs recommend <use-case> --target <target> [--json]",
    "  node tools/catalog.mjs targets|genres|use-cases [--json]"
  ].join("\n"));
}
function main(argv){
  if (!argv.length || ["--help","help"].includes(argv[0])) return help();
  const db=read(), errors=validate(db);
  if (errors.length) {
    for (const e of errors) console.error("INVALID",e);
    process.exitCode=1; return;
  }
  const [cmd,...args]=argv;
  if (cmd==="validate") return console.log("PASS:",db.catalog.sources.length,"sources /",db.targets.targets.length,"targets /",db.genres.genres.length,"genres /",db.cases.use_cases.length,"use cases");
  if (cmd==="self-test") {
    const checks=[
      ["fabric-libgui","minecraft-fabric-gui","direct"],
      ["fabric-libgui","minecraft-forge-gui","incompatible"],
      ["shadcn-ui","react-web","direct"],
      ["shadcn-ui","javafx-desktop","incompatible"],
      ["atlantafx","javafx-desktop","direct"],
      ["androidx-compose","android-compose","direct"],
      ["androidx-compose","android-views","adapt"],
      ["android-material-views","android-views","direct"],
      ["21st-dev","react-web","tool-only"]
    ];
    for (const [s,t,expected] of checks) {
      const got=db.compat.sources[s].platforms[t].code;
      if(got!==expected) throw Error("Compatibility regression "+s+"/"+t+" expected="+expected+" got="+got);
    }
    for(const id of ["scrollx-ui","react-bits","morphin","viora-ui","designpass"]){
      const source=db.catalog.sources.find(s=>s.id===id);
      if(source?.adoption!=="reference-only") throw Error("Rights regression: "+id);
    }
    const r=recommend(db,"minecraft-gui","minecraft-forge-gui");
    if (!r.candidates.some(x=>x.id==="fabric-libgui"&&x.technical.code==="incompatible"&&x.decision.startsWith("visual-reference-only"))) throw Error("Forge/Fabric separation regression");
    console.log("PASS: technical-vs-visual compatibility, source-policy and recommendation checks");
    return;
  }
  const {filters,terms}=getFlags(args);
  const target=filters.target;
  if(target && !db.targets.targets.some(x=>x.id===target)) throw Error("Unknown target "+target);
  if(filters.genre && !db.genres.genres.some(x=>x.id===filters.genre)) throw Error("Unknown genre "+filters.genre);
  if(filters.code && !codeStates.has(filters.code)) throw Error("Unknown code status "+filters.code);
  if(filters.visual && !visualStates.has(filters.visual)) throw Error("Unknown visual value "+filters.visual);
  if(cmd==="targets"||cmd==="genres"||cmd==="use-cases"){
    if(terms.length) throw Error("Unexpected free-text argument");
    const rows=cmd==="targets"?db.targets.targets:cmd==="genres"?db.genres.genres:db.cases.use_cases;
    if(filters.json) console.log(JSON.stringify(rows,null,2));
    else rows.forEach(x=>console.log(x.id+" | "+(x.label||"")));
    return;
  }
  if(cmd==="recommend"){
    const caseId=terms[0];
    if(terms.length!==1 || !target) throw Error("Use: recommend <use-case> --target <target>");
    const out=recommend(db,caseId,target);
    if(filters.json) return console.log(JSON.stringify(out,null,2));
    console.log("USE CASE:",out.use_case,"TARGET:",target);
    console.log("GOAL:",out.goal);
    for(const c of out.candidates){
      console.log(c.id+" | "+c.technical.code+" / visual:"+c.technical.visual+" | "+c.catalog_policy);
      console.log("  "+c.decision+" | "+c.website);
    }
    console.log("DISCLAIMER:",out.limitations);
    return;
  }
  if(!["search","list"].includes(cmd)) throw Error("Unknown command "+cmd);
  const results=db.catalog.sources.filter(s=>{
    const mapping=db.compat.sources[s.id].platforms[target];
    if(target && !mapping) return false;
    if(filters.genre && !db.genres.assignments[s.id].includes(filters.genre)) return false;
    if(filters.code && (!target || mapping.code!==filters.code)) return false;
    if(filters.visual && (!target || mapping.visual!==filters.visual)) return false;
    if(filters.stack && !s.stack.includes(filters.stack)) return false;
    if(filters.kind && s.kind!==filters.kind) return false;
    if(filters.license && s.license.state!==filters.license) return false;
    const text=[s.id,s.name,s.kind,s.notes,...s.tags,...s.stack,...db.genres.assignments[s.id]].join(" ").toLowerCase();
    return terms.every(t=>text.includes(t));
  }).map(s=>snapshot(db,s,target));
  if(filters.json) return console.log(JSON.stringify(results,null,2));
  for(const s of results){
    console.log(s.id+" | "+s.name+" | "+s.genres.join(",")+(s.technical?" | "+s.technical.code+" / visual:"+s.technical.visual:""));
    console.log("  "+s.website+" | "+s.decision);
  }
  console.log("RESULTS:",results.length);
}
try {main(process.argv.slice(2));}
catch(e){console.error("ERROR:",e.message);process.exitCode=1;}

