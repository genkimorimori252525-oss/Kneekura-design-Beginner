// Browser-only, dependency-free gallery. All previews and metadata are authored for this repository.
// No third-party UI modules, remote assets, analytics, or arbitrary HTML injection.
const $=selector=>document.querySelector(selector);
const make=(tag,cls,txt)=>{
 const node=document.createElement(tag);
 if(cls)node.className=cls;
 if(txt!==undefined && txt!==null)node.textContent=String(txt);
 return node;
};
const add=(parent,...children)=>{for(const child of children)if(child)parent.appendChild(child);return parent;};
const genreLabels={
 chat:"Chat",navigation:"Navigation",dashboards:"Dashboards","node-graphs":"Agent graph",forms:"Forms"
};
const state={patterns:[],palettes:{},targets:[],genre:"all",query:"",target:"react-web",selected:null,compare:[]};
function label(s){return (s||"").replaceAll("-"," ");}
function toast(msg){
 const n=$("#toast");n.textContent=msg;n.classList.add("visible");
 window.clearTimeout(toast.timer);
 toast.timer=window.setTimeout(()=>n.classList.remove("visible"),3500);
}
function makeHead(title){
 const head=make("div","demo-head");
 const dots=make("span","window-dots");dots.setAttribute("aria-hidden","true");
 for(let n=0;n<3;n++)dots.appendChild(make("i"));
 return add(head,dots,make("span","demo-title",title));
}
function staticText(tag,cls,value){return make(tag,cls,value);}
function renderPreview(pattern,interactive=false){
 const v=pattern.visual,pal=state.palettes[v.palette];
 const root=make("div","demo demo-"+v.density+" demo-"+v.motion+" preview-"+pattern.genre);
 for(const [key,name] of [["background","bg"],["surface","surface"],["text","text"],["muted","muted"],["accent","accent"],["border","border"]]){
   root.style.setProperty("--demo-"+name,pal[key]);
 }
 root.setAttribute("aria-label",pattern.name+" concept preview");
 root.appendChild(makeHead(genreLabels[pattern.genre]));
 const content=make("div","demo-content");
 if(pattern.genre==="chat"){
  const conversation=make("div","demo-conversation");
  add(conversation,make("div","demo-message","この画面で進捗を確認できます。"),make("div","demo-message out","状況を見せて"),make("div","demo-message","確認しました。問題は1件です。"));
  content.appendChild(conversation);
  const compose=make("div","demo-composer");
  if(interactive){
   const input=make("input");
   input.type="text";input.placeholder="メッセージを入力";input.setAttribute("aria-label","デモメッセージ");
   const send=make("button",null,"送信");send.type="button";
   const submit=()=>{
     const value=input.value.trim();
     if(!value){input.focus();return;}
     conversation.appendChild(make("div","demo-message out",value));
     input.value="";input.focus();
   };
   send.addEventListener("click",submit);
   input.addEventListener("keydown",event=>{if(event.key==="Enter"){event.preventDefault();submit();}});
   add(compose,input,send);
  }else add(compose,make("div","demo-placeholder","Message…"),make("span","accent","↗"));
  content.appendChild(compose);
 }else if(pattern.genre==="navigation"){
  const layout=make("div","demo-layout");
  const rail=make("nav","demo-rail");rail.setAttribute("aria-label","Preview navigation");
  const body=make("div","demo-nav-main");
  const title=make("strong",null,"Overview");
  const note=make("span","small muted","Recent activity");
  const sections=["Overview","Research","Settings"];
  const buttons=[];
  for(const item of sections){
   const btn=make(interactive?"button":"div",interactive?"":"demo-nav-item",item);
   if(item===sections[0])btn.classList.add("current");
   if(interactive){
    btn.type="button";btn.setAttribute("aria-current",item===sections[0]?"page":"false");
    btn.addEventListener("click",()=>{
      buttons.forEach(b=>{b.classList.remove("current");b.setAttribute("aria-current","false");});
      btn.classList.add("current");btn.setAttribute("aria-current","page");title.textContent=item;note.textContent=item+" panel";
    });
    buttons.push(btn);
   }
   rail.appendChild(btn);
  }
  add(body,title,note,make("div","skeleton"),make("div","skeleton short"),make("div","skeleton"));
  add(layout,rail,body);add(content,layout);
 }else if(pattern.genre==="dashboards"){
  const top=make("div","small muted","OPERATIONAL OVERVIEW");
  const stats=make("div","demo-stat-row");
  const values=[["Checks","12"],["Passed","11"],["Issues","1"]];
  const statValues=[];
  for(const [key,value] of values){
   const box=make("div","demo-stat");
   const val=make("b",null,value);
   statValues.push(val);
   add(box,make("small",null,key),val);
   stats.appendChild(box);
  }
  const bars=make("div","demo-graph-bars");bars.setAttribute("aria-label","Illustrative bar chart, not live data");
  for(const h of [50,70,45,85,58,77,96,73,82,65,90,68]){const b=make("i");b.style.setProperty("--h",h+"%");bars.appendChild(b);}
  const footer=make("span","small muted","Example metrics, not live project data");
  add(content,top,stats,bars,footer);
  if(interactive){
   const toggle=make("button","small-btn","サンプル値を切替");toggle.type="button";
   let changed=false;toggle.addEventListener("click",()=>{
     changed=!changed;["24","23","1"].forEach((n,i)=>statValues[i].textContent=changed?n:values[i][1]);
     toast("サンプル値を切り替えたで（実測データではない）");
   });
   content.appendChild(toggle);
  }
 }else if(pattern.genre==="node-graphs"){
  const top=make("div","small muted","FIVE-DEPARTMENT WORKFLOW / EXAMPLE");
  const nodes=make("div","demo-graph-line");
  const detail=make("div","demo-graph-detail","Node status: review the highlighted stage.");
  const descriptors=[["Plan","Ready"],["Sol","Working"],["Astra","Advising"]];
  for(let i=0;i<descriptors.length;i++){
   const [name,status]=descriptors[i];
   if(i)nodes.appendChild(make("span","demo-connector"));
   const node=make(interactive?"button":"div","demo-node"+(i===1?" selected":""),name);
   node.appendChild(make("span","small",status));
   if(interactive){
    node.type="button";
    node.addEventListener("click",()=>{
     nodes.querySelectorAll(".demo-node").forEach(b=>b.classList.remove("selected"));
     node.classList.add("selected");
     detail.textContent=name+" — "+status+" (illustrative status only)";
    });
   }
   nodes.appendChild(node);
  }
  add(content,top,nodes,detail);
 }else if(pattern.genre==="forms"){
  const form=make("div","demo-form");
  const title=make("label",null,"Project title");
  const input=make(interactive?"input":"div",interactive?"":"demo-placeholder",interactive?undefined:"Research board");
  if(interactive){input.value="Research board";}
  title.appendChild(input);
  const row=make("label","demo-checkbox");
  if(interactive){
   const chk=make("input");chk.type="checkbox";chk.checked=true;
   add(row,chk,make("span",null,"Reduced motion"));
  }else add(row,make("span","accent","☑"),make("span",null,"Reduced motion"));
  const status=make("div","demo-result",interactive?"Unsaved demo changes":"All changes local");
  add(form,title,row);
  if(interactive){
   const btn=make("button","demo-save","Save in preview");btn.type="button";
   btn.addEventListener("click",()=>{status.textContent="Preview saved locally only: "+(input.value.trim()||"(empty)");});
   form.appendChild(btn);
  }else form.appendChild(make("div","demo-save","Save"));
  form.appendChild(status);content.appendChild(form);
 }
 root.appendChild(content);
 return root;
}
function findPattern(id){return state.patterns.find(p=>p.id===id);}
function visiblePatterns(){
 return state.patterns.filter(p=>{
  if(state.genre!=="all"&&p.genre!==state.genre)return false;
  const q=state.query;
  return !q||[p.id,p.name,p.description,p.genre,...p.tags].join(" ").toLowerCase().includes(q);
 });
}
function select(id){
 const p=findPattern(id);if(!p)return;
 state.selected=id;
 if(location.hash!=="#design="+encodeURIComponent(id))history.replaceState(null,"","#design="+encodeURIComponent(id));
 renderCards();renderInspector();renderComparison();
}
function renderFilters(){
 const genres=$("#genres");genres.replaceChildren();
 const values=[["all","All concepts"],...Object.entries(genreLabels)];
 for(const [id,title] of values){
  const n=state.patterns.filter(p=>id==="all"||p.genre===id).length;
  const btn=make("button","genre-btn"+(state.genre===id?" active":""),title);
  btn.type="button";btn.setAttribute("aria-pressed",String(state.genre===id));
  btn.appendChild(make("span",null,String(n)));
  btn.addEventListener("click",()=>{state.genre=id;renderFilters();renderCards();});
  genres.appendChild(btn);
 }
}
function renderCards(){
 const entries=visiblePatterns();
 $("#visible-count").textContent=entries.length+" / "+state.patterns.length;
 const container=$("#cards");container.replaceChildren();
 if(!entries.length){container.appendChild(make("p","empty","該当するデザインはないで。条件を変えて試してな。"));return;}
 for(const p of entries){
  const card=make("article","pattern-card"+(state.selected===p.id?" active":""));
  const visual=make("div","pattern-thumb");visual.appendChild(renderPreview(p,false));
  const info=make("div","pattern-meta");
  const h=make("h3",null,p.name);
  const action=make("div","pattern-actions");
  const btn=make("button",null,"詳しく見る");btn.type="button";
  btn.setAttribute("aria-label",p.name+" を詳細表示");
  btn.addEventListener("click",()=>select(p.id));
  add(action,btn,make("small",null,label(p.visual.tone)+" · "+label(p.visual.density)));
  add(info,make("div","category",genreLabels[p.genre]),h,make("p",null,p.description),action);
  add(card,visual,info);container.appendChild(card);
 }
}
function kv(parent,key,value){
 const line=make("div");add(line,make("dt",null,key),make("dd",null,value));parent.appendChild(line);
}
function renderInspector(){
 const selected=findPattern(state.selected),box=$("#selection");box.replaceChildren();
 if(!selected){box.appendChild(make("p","empty","候補を選んで比較してな。"));return;}
 const info=make("div","inspector-copy");
 add(info,make("div","section-label",selected.id),make("h3",null,selected.name),make("p","desc",selected.description));
 const stage=make("div","inspector-preview");
 stage.appendChild(renderPreview(selected,true));
 const props=make("dl","details");
 for(const [k,v] of [["Genre",genreLabels[selected.genre]],["Tone",label(selected.visual.tone)],["Density",label(selected.visual.density)],["Motion",label(selected.visual.motion)],["Contrast intent",label(selected.visual.contrast)],["Relative effort",label(selected.estimate.integration_effort)]])kv(props,k,v);
 const pros=make("div","goodbad");
 const good=make("section");
 add(good,make("b",null,"Strengths"),make("p",null,selected.strengths.join(" / ")));
 const bad=make("section");
 add(bad,make("b",null,"Tradeoffs"),make("p",null,selected.tradeoffs.join(" / ")));
 add(pros,good,bad);
 const actions=make("div","inspect-actions");
 const compare=make("button","small-btn",state.compare.includes(selected.id)?"比較から外す":"比較に追加");
 compare.type="button";
 compare.addEventListener("click",()=>{
  if(state.compare.includes(selected.id))state.compare=state.compare.filter(x=>x!==selected.id);
  else {state.compare.push(selected.id);if(state.compare.length>2)state.compare.shift();}
  renderInspector();renderComparison();
 });
 const copy=make("button","small-btn","IDをコピー");copy.type="button";
 copy.addEventListener("click",()=>copyString(selected.id));
 add(actions,compare,copy);
 const hint=make("p","implementation-hint");
 const target=state.targets.find(t=>t.id===state.target);
 add(hint,make("strong",null,"Target: "+(target?.label||state.target)),document.createTextNode("このプレビューはブラウザ専用のオリジナル見本。"+(target?.family==="web"?"実アプリ用コンポーネントではありません。":"ネイティブ実装へのコード互換性はありません。")));
 add(box,info,stage,props,pros,actions,hint);
}
function renderComparison(){
 const box=$("#comparison");box.replaceChildren();
 if(!state.compare.length){box.appendChild(make("p","empty","候補を「比較に追加」すると、ここに2件まで横並びで表示されるで。AIによる最終決定にはCLIの判断記録も必要や。"));return;}
 for(const id of state.compare){
  const p=findPattern(id);if(!p)continue;
  const item=make("div","compare-item");
  add(item,make("h3",null,p.name),renderPreview(p,true),make("p",null,"Tone: "+p.visual.tone+" · Density: "+p.visual.density+" · Tradeoff: "+p.tradeoffs.join(" / ")));
  box.appendChild(item);
 }
}
async function copyString(text){
 try{await navigator.clipboard.writeText(text);toast("コピーしたで");}
 catch{toast("クリップボードへのアクセスが許可されていないで");}
}
function selectedPacket(){
 const p=findPattern(state.selected);
 return p?{
  prototype_id:p.id,genre:p.genre,target_for_future_implementation:state.target,
  candidate_only:true,
  origin:p.origin,
  visual:p.visual,
  strengths:p.strengths,tradeoffs:p.tradeoffs,
  reminder:"Only an original visual concept. AI must inspect target project, evaluate alternatives, and record a decision receipt."
 }:null;
}
async function init(){
 const results=await Promise.all(["/catalog/design-patterns.json","/catalog/targets.json"].map(async path=>{
  const response=await fetch(path,{cache:"no-store"});
  if(!response.ok)throw Error("Failed to load "+path);
  return response.json();
 }));
 const [index,targetIndex]=results;
 state.patterns=index.patterns;state.palettes=index.palettes;state.targets=targetIndex.targets;
 for(const t of state.targets){
  const option=make("option",null,t.label);option.value=t.id;$("#target").appendChild(option);
 }
 $("#target").value=state.target;
 $("#target").addEventListener("change",event=>{state.target=event.target.value;renderInspector();});
 $("#search").addEventListener("input",event=>{state.query=event.target.value.trim().toLowerCase();renderCards();});
 $("#pattern-count").textContent=String(state.patterns.length);
 $("#genre-count").textContent=String(Object.keys(genreLabels).length);
 const initial=decodeURIComponent(location.hash.slice(1).replace(/^design=/,""));
 state.selected=findPattern(initial)?initial:state.patterns[0]?.id;
 $("#copy-button").addEventListener("click",()=>copyString(JSON.stringify(selectedPacket(),null,2)));
 window.addEventListener("hashchange",()=>{const id=decodeURIComponent(location.hash.slice(1).replace(/^design=/,""));if(findPattern(id)&&id!==state.selected)select(id);});
 renderFilters();renderCards();renderInspector();renderComparison();
}
init().catch(e=>{
 console.error(e);
 $("#cards").replaceChildren(make("p","empty","プレビューを読み込めへんかった。ローカルサーバーを起動しているか確認してな。"));
});
