#!/usr/bin/env node
/**
 * Evidence-oriented design selection for the Kneekura AI agents.
 * No API, model, web, or third-party UI code: the AI agent makes the final decision.
 *
 * Run from repository root (or anywhere with explicit paths).
 */
import {readFileSync, writeFileSync, mkdirSync, existsSync} from "node:fs";
import {resolve, dirname, relative, sep, extname} from "node:path";
import {fileURLToPath} from "node:url";
import {createHash} from "node:crypto";

const ROOT=fileURLToPath(new URL("../",import.meta.url));
const load=name=>JSON.parse(readFileSync(new URL("../catalog/"+name,import.meta.url),"utf8"));
const data=load("design-patterns.json");
const needs=load("component-needs.json");
const sources=load("sources.json");
const targets=load("targets.json");
const genres=load("genres.json");
const usecases=load("use-cases.json");
const effortRank={low:0,medium:1,high:2};
const motionRank={none:0,subtle:1,expressive:2};
const densityRank={dense:0,comfortable:1,spacious:2};
const tones=new Set(["professional","friendly","technical","bold"]);
const contrastModes=new Set(["standard","high"]);
const slug=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const hash=content=>createHash("sha256").update(content).digest("hex");
function fail(m){throw new Error(m);}
function assert(c,m){if(!c)fail(m);}
function rootPath(p){
  assert(typeof p==="string" && p.length>0,"Path required");
  const absolute=resolve(process.cwd(),p), rel=relative(ROOT,absolute);
  assert(rel!=="" && rel!==".." && !rel.startsWith(".."+sep) && !rel.startsWith("/") && !rel.includes("\0"),"Path must remain inside repository");
  return {absolute,rel:rel.split(sep).join("/")};
}
function contrast(a,b){
  const l=h=>{
    assert(/^#[0-9a-f]{6}$/i.test(h),"Invalid color token: "+h);
    const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
    return c[0]*.2126+c[1]*.7152+c[2]*.0722;
  };
  const x=l(a),y=l(b);
  return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
function schemaCheck(){
  const errors=[];
  const add=m=>errors.push(m);
  if(data.schema_version!==1 || !Array.isArray(data.patterns) || !data.palettes) add("Invalid pattern catalog");
  if(needs.schema_version!==1 || !Array.isArray(needs.needs)) add("Invalid component catalog");
  const targetIds=new Set(targets.targets.map(t=>t.id));
  const familyIds=new Set(targets.targets.map(t=>t.family));
  const sourceIds=new Set(sources.sources.map(s=>s.id));
  const genreIds=new Set(genres.genres.map(g=>g.id));
  const caseIds=new Set(usecases.use_cases.map(c=>c.id));
  const ids=new Set();
  for(const [id,p] of Object.entries(data.palettes || {})){
    try {
      if(contrast(p.text,p.background)<7 || contrast(p.text,p.surface)<7 || contrast(p.muted,p.surface)<4.5) add("Contrast fails: "+id);
      contrast(p.accent,p.background);
      contrast(p.border,p.background);
    }catch(e){add("Invalid palette: "+id+" "+e.message);}
  }
  for(const p of data.patterns||[]){
    if(!slug.test(p.id||"") || ids.has(p.id))add("Invalid or duplicate pattern: "+p.id);
    ids.add(p.id);
    if(!p.name || !p.description || p.description.length<18 || p.origin!=="kneekura-original-concept")add("Missing provenance/description: "+p.id);
    if(!genreIds.has(p.genre))add("Unknown genre: "+p.id);
    if(!data.palettes[p.visual?.palette])add("Unknown palette: "+p.id);
    if(!tones.has(p.visual?.tone))add("Invalid tone: "+p.id);
    if(!(p.visual?.density in densityRank) || !(p.visual?.motion in motionRank) || !contrastModes.has(p.visual?.contrast))add("Invalid style axes: "+p.id);
    if(!(p.estimate?.integration_effort in effortRank)||p.estimate.kind!=="qualitative-unverified")add("Invalid estimate: "+p.id);
    if(!Array.isArray(p.tags)||p.tags.length<2||!Array.isArray(p.strengths)||!p.strengths.length||!Array.isArray(p.tradeoffs)||!p.tradeoffs.length)add("Missing design evidence: "+p.id);
    if(!Array.isArray(p.supported_target_families)||!p.supported_target_families.length||p.supported_target_families.some(f=>!familyIds.has(f)))add("Invalid target family: "+p.id);
    if(p.stack!=="browser-preview-only"||!p.preview_kind?.includes("locally-rendered"))add("Preview/source confusion: "+p.id);
  }
  const componentIds=new Set();
  for(const c of needs.needs||[]){
    if(!slug.test(c.id||"")||componentIds.has(c.id))add("Duplicate/invalid component need: "+c.id);
    componentIds.add(c.id);
    if(!genreIds.has(c.genre)||!c.label||!Array.isArray(c.functional_requirements)||!c.functional_requirements.length)add("Invalid component need: "+c.id);
    for(const id of c.pattern_ids||[]) if(!ids.has(id))add("Component "+c.id+" unknown pattern "+id);
    for(const id of c.research_sources||[]) if(!sourceIds.has(id))add("Component "+c.id+" unknown source "+id);
  }
  for(const p of data.patterns||[])if(!needs.needs.some(c=>c.pattern_ids.includes(p.id)))add("Pattern has no component need: "+p.id);
  if(!targetIds.size || !caseIds.size)add("Missing base index");
  return errors;
}
function loadBrief(path){
  const {absolute,rel}=rootPath(path);
  const bytes=readFileSync(absolute);
  const brief=JSON.parse(bytes.toString("utf8"));
  assert(brief.schema_version===1,"Brief must use schema_version 1");
  assert(slug.test(brief.id||""),"Invalid brief id");
  assert(typeof brief.project==="string"&&brief.project.length>2,"Missing project");
  assert(typeof brief.goal==="string"&&brief.goal.length>=16,"Goal must describe the task");
  const target=targets.targets.find(x=>x.id===brief.target);
  assert(target,"Unknown target: "+brief.target);
  assert(genres.genres.some(x=>x.id===brief.genre),"Unknown genre: "+brief.genre);
  assert(typeof brief.current_ui_sufficient==="boolean","Specify whether the current UI already meets requirements (true/false)");
  const d=brief.desired,c=brief.constraints;
  assert(d&&tones.has(d.tone)&&d.density in densityRank&&d.motion in motionRank&&contrastModes.has(d.contrast),"Invalid desired visual attributes");
  assert(c&&c.max_effort in effortRank&&c.max_motion in motionRank&&contrastModes.has(c.minimum_contrast),"Invalid hard constraints");
  assert(Array.isArray(brief.intent_tags)&&brief.intent_tags.every(x=>typeof x==="string"&&x.length>1),"Invalid intent_tags");
  return {brief,target,rel,sha256:hash(bytes)};
}
const contrastRank={standard:0,high:1};
function assess({brief,target},p){
  const reasons=[];
  if(brief.genre!==p.genre) reasons.push("different-ui-genre");
  if(!p.supported_target_families.includes(target.family)) reasons.push("target-family-not-covered-as-visual-concept");
  if(effortRank[p.estimate.integration_effort]>effortRank[brief.constraints.max_effort]) reasons.push("exceeds-effort-budget");
  if(motionRank[p.visual.motion]>motionRank[brief.constraints.max_motion]) reasons.push("exceeds-motion-budget");
  if(contrastRank[p.visual.contrast]<contrastRank[brief.constraints.minimum_contrast]) reasons.push("does-not-meet-requested-contrast-tier");
  if(reasons.length)return {id:p.id,name:p.name,eligible:false,vetoes:reasons};
  const scores={};
  scores.tone=p.visual.tone===brief.desired.tone?28:
    ((p.visual.tone==="technical"&&brief.desired.tone==="professional")||
    (p.visual.tone==="professional"&&brief.desired.tone==="technical"))?13:0;
  scores.density=p.visual.density===brief.desired.density?22:
    Math.abs(densityRank[p.visual.density]-densityRank[brief.desired.density])===1?9:0;
  scores.motion=p.visual.motion===brief.desired.motion?12:
    motionRank[p.visual.motion]<motionRank[brief.desired.motion]?7:1;
  scores.contrast=p.visual.contrast===brief.desired.contrast?12:5;
  const hits=brief.intent_tags.filter(x=>p.tags.includes(x.toLowerCase()));
  scores.intent=Math.min(3,hits.length)*7;
  scores.estimated_effort=p.estimate.integration_effort==="low"?10:p.estimate.integration_effort==="medium"?6:2;
  const total=Object.values(scores).reduce((a,b)=>a+b,0);
  return {
    id:p.id,name:p.name,eligible:true,score:total,scores,matched_intent_tags:hits,
    tradeoffs:p.tradeoffs,strengths:p.strengths,
    visual:p.visual,
    cost:{...p.estimate},
    preview:{kind:"original-browser-concept",url:"http://127.0.0.1:4173/#design="+encodeURIComponent(p.id)},
    evidence_status:"metadata-reviewed-only",
    caution:"Score is a deterministic filter, not visual judgment or proof of production compatibility."
  };
}
function evaluate(input){
  const assessed=data.patterns.map(p=>assess(input,p));
  const candidates=assessed.filter(p=>p.eligible).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
  const rejected=assessed.filter(p=>!p.eligible);
  return {
    brief_id:input.brief.id,brief_sha256:input.sha256,target:input.brief.target,genre:input.brief.genre,goal:input.brief.goal,
    recommended_action:input.brief.current_ui_sufficient?"NO_CHANGE_NEEDED":"AI_REVIEW_REQUIRED",
    shortlist:input.brief.current_ui_sufficient?[]:candidates.slice(0,4),
    eligible_candidates:candidates,rejected,
    guidance:["Inspect the current implementation before changing it.","Rankings are metadata heuristics, not an AI aesthetic verdict.","View original demos if a visual decision requires it.","For non-browser targets, demo is visual reference only; implement native code.","The AI agent must choose explicitly, explain tradeoffs, and record uncertainty."]
  };
}
function parseFlags(args){
  const flags={},pos=[];
  for(let i=0;i<args.length;i++){
    const x=args[i];
    if(x==="--json"){flags.json=true;continue;}
    if(["--design","--reason","--tradeoff","--review","--evidence","--out","--genre"].includes(x)){
      assert(args[i+1] && !args[i+1].startsWith("--"),"Missing value for "+x);
      flags[x.slice(2)]=args[++i];continue;
    }
    if(x==="--no-change"){flags.noChange=true;continue;}
    if(x.startsWith("--"))fail("Unknown option "+x);
    pos.push(x);
  }
  return {flags,pos};
}
function createDecision(input,flags) {
  assert(typeof flags.reason==="string"&&flags.reason.trim().length>=24,"AI must supply a substantive --reason (24+ characters)");
  if(flags.noChange){
    assert(!flags.design,"Use either --no-change or --design");
    const score=evaluate(input);
    return {
      schema_version:1,brief_path:input.rel,brief_sha256:input.sha256,brief_id:input.brief.id,
      project:input.brief.project,target:input.brief.target,genre:input.brief.genre,
      decision:"NO_CHANGE_NEEDED",chosen_id:null,
      rationale:flags.reason.trim(),tradeoff:"Avoids unnecessary changes to an already sufficient UI.",
      visual_review:{mode:"not-needed",evidence:"No redesign undertaken"},
      alternatives:score.eligible_candidates.slice(0,3).map(x=>x.id),
      assessment:"Agent-authored decision; the CLI checks structure, not whether the underlying application is adequate."
    };
  }
  assert(typeof flags.design==="string"&&flags.design,"Specify --design id or --no-change");
  assert(typeof flags.tradeoff==="string"&&flags.tradeoff.trim().length>=16,"The agent must acknowledge a concrete --tradeoff (16+ characters)");
  assert(["metadata","preview"].includes(flags.review),"Specify --review metadata or --review preview");
  assert(flags.review!=="preview" || typeof flags.evidence==="string"&&flags.evidence.trim().length>=24,"A preview review needs an honest --evidence observation (24+ characters)");
  assert(!input.brief.current_ui_sufficient,"The brief says the current UI is sufficient; document --no-change or revise the brief based on verified evidence");
  const ev=evaluate(input);
  const chosen=ev.eligible_candidates.find(x=>x.id===flags.design);
  assert(chosen,"Chosen pattern is unavailable or vetoed by hard constraints: "+flags.design);
  return {
    schema_version:1,brief_path:input.rel,brief_sha256:input.sha256,brief_id:input.brief.id,
    project:input.brief.project,target:input.brief.target,genre:input.brief.genre,
    decision:flags.review==="preview"?"SELECTED":"PROVISIONAL_SELECTION",
    chosen_id:chosen.id,score_at_choice:chosen.score,
    rationale:flags.reason.trim(),tradeoff:flags.tradeoff.trim(),
    visual_review:{
      mode:flags.review,
      evidence:flags.review==="preview"?flags.evidence.trim():"Catalog attributes only; the local visual preview was not inspected.",
      verification:"AI-reported; tool cannot prove the agent inspected pixels."
    },
    alternatives:ev.eligible_candidates.filter(x=>x.id!==chosen.id).slice(0,3).map(x=>x.id),
    assessment:"AI picks based on project requirements. Score orders options; it is not the selector. The browser preview is only an original concept, not runtime integration proof."
  };
}
function verifyDecision(decision){
  const problems=[];
  if(decision.schema_version!==1)problems.push("invalid schema_version");
  let brief;
  try{
    assert(typeof decision.brief_path==="string","missing brief path");
    assert(!decision.brief_path.startsWith("/")&&!decision.brief_path.includes("\\"),"invalid brief path");
    brief=loadBrief(resolve(ROOT,decision.brief_path));
  }catch(e){return ["brief unavailable: "+e.message];}
  if(brief.sha256!==decision.brief_sha256)problems.push("brief SHA mismatch (stale decision)");
  if(brief.brief.id!==decision.brief_id||brief.brief.target!==decision.target||brief.brief.genre!==decision.genre||brief.brief.project!==decision.project)problems.push("brief identity mismatch");
  if(typeof decision.rationale!=="string"||decision.rationale.trim().length<24)problems.push("missing rationale");
  const ev=evaluate(brief);
  if(decision.decision==="NO_CHANGE_NEEDED"){
    if(decision.chosen_id!==null)problems.push("NO_CHANGE_NEEDED cannot choose design");
    if(decision.visual_review?.mode!=="not-needed")problems.push("no-change has inconsistent review");
  }else if(["SELECTED","PROVISIONAL_SELECTION"].includes(decision.decision)){
    const c=ev.eligible_candidates.find(x=>x.id===decision.chosen_id);
    if(!c)problems.push("chosen design is invalid or vetoed");
    if(brief.brief.current_ui_sufficient)problems.push("selected redesign conflicts with sufficient existing UI");
    if(typeof decision.tradeoff!=="string"||decision.tradeoff.trim().length<16)problems.push("missing tradeoff");
    if(decision.decision==="SELECTED"&&(decision.visual_review?.mode!=="preview"||(decision.visual_review?.evidence||"").length<24))problems.push("selected requires preview observation");
    if(decision.decision==="PROVISIONAL_SELECTION"&&decision.visual_review?.mode!=="metadata")problems.push("provisional selection must identify metadata-only review");
    if(c && decision.score_at_choice!==c.score)problems.push("score has changed");
  }else problems.push("unknown decision status");
  if(!Array.isArray(decision.alternatives)||decision.alternatives.some(id=>typeof id!=="string"||id===decision.chosen_id))problems.push("invalid alternatives");
  return problems;
}
function main(argv){
  const errors=schemaCheck();
  if(errors.length){errors.forEach(e=>console.error("INVALID",e));process.exitCode=1;return;}
  const [cmd,...rest]=argv;
  if(!cmd||cmd==="help"||cmd==="--help"){
    console.log([
      "Kneekura design selection for an AI coding agent",
      "  node tools/design-select.mjs validate",
      "  node tools/design-select.mjs self-test",
      "  node tools/design-select.mjs patterns [--genre chat|navigation|dashboards|node-graphs|forms] [--json]",
      "  node tools/design-select.mjs components [--genre chat|navigation|dashboards|node-graphs|forms] [--json]",
      "  node tools/design-select.mjs shortlist examples/brief-agent-workspace.json --json",
      "  node tools/design-select.mjs choose examples/brief-agent-workspace.json --design graph-linear --reason \"...\" --tradeoff \"...\" --review metadata --out decisions/your-decision.json",
      "  node tools/design-select.mjs choose examples/brief-agent-workspace.json --design graph-linear --reason \"...\" --tradeoff \"...\" --review preview --evidence \"...\" --out decisions/your-decision.json",
      "  node tools/design-select.mjs choose examples/brief-agent-workspace.json --no-change --reason \"...\" --out decisions/no-change.json",
      "  node tools/design-select.mjs verify decisions/your-decision.json"
    ].join("\n"));return;
  }
  if(cmd==="validate")return console.log("PASS:",data.patterns.length,"original patterns /",needs.needs.length,"component needs /",Object.keys(data.palettes).length,"palettes");
  if(cmd==="self-test"){
    const graph=loadBrief(resolve(ROOT,"examples/brief-agent-workspace.json"));
    const e=evaluate(graph);
    assert(e.shortlist[0]?.id==="graph-linear","Expected technical pipeline front runner");
    assert(e.rejected.some(x=>x.id==="graph-showcase"&&x.vetoes.includes("exceeds-motion-budget")),"Expected motion veto");
    const javafx=loadBrief(resolve(ROOT,"examples/brief-chat-javafx.json"));
    const p=evaluate(javafx);
    assert(p.shortlist[0]?.id==="chat-focused","Expected high-readability chat");
    const choice=createDecision(graph,{design:"graph-linear",reason:"Dense pipeline layout exposes each processing stage and strengthens debugging.","tradeoff":"Linear layout makes complex branching less visible.",review:"metadata"});
    assert(choice.decision==="PROVISIONAL_SELECTION"&&!verifyDecision(choice).length,"Expected valid provisional AI selection");
    const reviewed=createDecision(graph,{design:"graph-linear",reason:"An agent inspected the candidate and preferred clear pipeline states.","tradeoff":"Complex branching becomes less readable in the linear model.",review:"preview",evidence:"In the local preview, stage labels remain visible and the status text is distinguishable."});
    assert(reviewed.decision==="SELECTED"&&!verifyDecision(reviewed).length,"Expected valid inspected selection");
    const stale={...choice,brief_sha256:"0000"};
    assert(verifyDecision(stale).some(x=>x.includes("SHA")),"Expected stale-brief rejection");
    const forced={...choice,chosen_id:"graph-showcase"};
    assert(verifyDecision(forced).some(x=>x.includes("vetoed")),"Expected hard-veto enforcement");
    const sufficient={...graph,brief:{...graph.brief,current_ui_sufficient:true}};
    assert(evaluate(sufficient).recommended_action==="NO_CHANGE_NEEDED","Expected no-change policy");
    const nc=createDecision(sufficient,{noChange:true,reason:"Existing screen already passes relevant keyboard, layout and status tasks."});
    assert(nc.decision==="NO_CHANGE_NEEDED","Expected abstention");
    console.log("PASS: shortlist, AI choice, veto, stale brief, review evidence, no-change, JavaFX");
    return;
  }
  const {flags,pos}=parseFlags(rest);
  if(cmd==="patterns"||cmd==="components"){
    assert(pos.length===0,"Unexpected positional argument for "+cmd);
    const items=cmd==="patterns"?data.patterns:needs.needs;
    const rows=items.filter(x=>!flags.genre||x.genre===flags.genre);
    if(flags.json)return console.log(JSON.stringify(rows,null,2));
    rows.forEach(x=>console.log(x.id+" | "+(x.name||x.label)));
    return;
  }
  if(cmd==="shortlist"){
    assert(pos.length===1,"shortlist needs a brief path");
    const result=evaluate(loadBrief(pos[0]));
    if(flags.json)return console.log(JSON.stringify(result,null,2));
    console.log("ACTION:",result.recommended_action);
    for(const c of result.shortlist)console.log(c.id+" | score "+c.score+" | "+Object.entries(c.scores).map(([k,v])=>k+"="+v).join(" "));
    if(!result.shortlist.length)console.log("No feasible candidate. No change recommended without further research.");
    console.log("REJECTED:",result.rejected.filter(x=>x.vetoes.includes("different-ui-genre")===false).map(x=>x.id).join(",")||"none");
    return;
  }
  if(cmd==="choose"){
    assert(pos.length===1 && flags.out,"choose needs a brief path and --out");
    const input=loadBrief(pos[0]);
    const receipt=createDecision(input,flags);
    const defects=verifyDecision(receipt);
    assert(!defects.length,defects.join("; "));
    const {absolute,rel}=rootPath(flags.out);
    assert(rel.startsWith("decisions/")&&extname(absolute)===".json","Output must be decisions/*.json within repository");
    assert(!existsSync(absolute),"Decision exists; create a new version instead of overwriting history");
    mkdirSync(dirname(absolute),{recursive:true});
    writeFileSync(absolute,JSON.stringify(receipt,null,2)+"\n",{flag:"wx",encoding:"utf8"});
    console.log("DECISION:",receipt.decision,receipt.chosen_id||"NO_CHANGE_NEEDED");
    console.log("RECORDED:",rel);
    return;
  }
  if(cmd==="verify"){
    assert(pos.length===1,"verify needs decision JSON path");
    const {absolute}=rootPath(pos[0]);
    const defects=verifyDecision(JSON.parse(readFileSync(absolute,"utf8")));
    if(defects.length){defects.forEach(s=>console.error("INVALID:",s));process.exitCode=1;return;}
    console.log("PASS: decision receipt valid relative to current brief");
    return;
  }
  fail("Unknown command "+cmd);
}
try{main(process.argv.slice(2));}catch(e){console.error("ERROR:",e.message);process.exitCode=1;}

