'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {JSDOM,VirtualConsole}=require('jsdom');
const [product,fixtures,out]=process.argv.slice(2).map(x=>path.resolve(x));
fs.mkdirSync(out,{recursive:true});
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const packBytes=fs.readFileSync(path.join(fixtures,'mhdb-catalog-source/raw-pack.json')),fixtureBytes=fs.readFileSync(path.join(fixtures,'ui-public-14-strict.json'));
const pack=JSON.parse(packBytes),source=JSON.parse(fixtureBytes),html=require(path.join(product,'tools/dom-test-setup.cjs')).readSimulatorHtml();
const manifest={startedAt:new Date().toISOString(),product,scope:'ALL_MHDB_VALID_RANKS_X_ALL_14_REPRESENTATIVE_WEAPONS_PUBLIC_CALCULATE_BUTTON',notCovered:['independent game accuracy','all effect activation permutations','all legal equipment combinations','all weapon records'],hashes:{index:hash(fs.readFileSync(path.join(product,'index.html'))),adapter:hash(fs.readFileSync(path.join(product,'hope-hammer-browser-adapter.js'))),database:hash(packBytes),fixtures:hash(fixtureBytes),test:hash(fs.readFileSync(__filename)),continuation:hash(fs.readFileSync(path.join(product,'skill-effect-continuation.js'))),policy:hash(fs.readFileSync(path.join(product,'skill-calculation-policy.js')))},skillCount:pack.data.skills.length,rankCount:pack.data.skills.reduce((n,s)=>n+s.ranks.length,0),counts:{},reasonGroups:{},completedWeapons:[],jsdomErrors:[]};
fs.writeFileSync(path.join(out,'cases.jsonl'),'');
function save(){fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2));}
function reasons(x,p='',a=[]){if(!x||typeof x!=='object')return a;for(const[k,v]of Object.entries(x)){if(['reason','normalReason','maximumReason'].includes(k)&&typeof v==='string'&&v)a.push({path:p+'.'+k,reason:v});else if(v&&typeof v==='object')reasons(v,p+'.'+k,a);}return a;}
const armorFor=new Map();for(const s of pack.data.skills.filter(s=>['set','group'].includes(s.kind))){const a={};for(const x of pack.data.armor)if((x.skills||[]).some(e=>e.skill?.id===s.id)&&!a[x.kind])a[x.kind]=x.id;armorFor.set(s.id,a);}
let count=0;save();
for(const c of source.cases.filter((c,i)=>!process.env.HALF||(process.env.HALF==='first'?i<7:i>=7))){
 const vc=new VirtualConsole();vc.on('jsdomError',e=>manifest.jsdomErrors.push({kind:c.kind,error:e.message}));
 const w=new JSDOM(html,{url:'https://full-skill-scan.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE_TEST'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 const read=s=>JSON.parse(w.eval('JSON.stringify('+s+')'));
 try{
 w.__data=pack.data;w.eval('DB=normalizeDB({...__data,weapons:consolidateArtiaFixedVariantRows(__data.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 const base={...c.inputSnapshots[0],armor:{},decos:{},charmCustom:{skills:[],slots:[0,0,0],weaponSlots:[]}};
 w.__snapshot=base;w.eval('applyBuildSnapshot(__snapshot)');w.document.getElementById('calcBuild').click();
 const baseline=read("({normal:consumerDamageMetric({oneHitPipeline:calcState.realOneHit},'normal'),maximum:consumerDamageMetric({oneHitPipeline:calcState.realOneHit},'maximum')})");
 for(const skill of pack.data.skills)for(const rank of skill.ranks){
 const row={key:skill.id+':'+rank.level+':'+c.kind,skillId:skill.id,skillName:skill.name,skillKind:skill.kind,rankId:rank.id,level:rank.level,kind:c.kind,baseline,weaponId:base.weaponId};
 try{
 const set=['set','group'].includes(skill.kind);
 const pieces=set?Object.entries(armorFor.get(skill.id)||{}).slice(0,rank.setPiecesRequired):[];
 if(set&&(!Number.isInteger(rank.setPiecesRequired)||pieces.length<rank.setPiecesRequired)){
  row.status='NO_VALID_EQUIPMENT_FIXTURE';row.reason='INSUFFICIENT_DISTINCT_ARMOR_SLOTS_FOR_THRESHOLD';
 }else{
 const snapshot={...base,armor:set?Object.fromEntries(pieces):{},charmCustom:{skills:set?[]:[{name:skill.name,level:rank.level,type:skill.kind==='weapon'?'weapon':'armor'}],slots:[0,0,0],weaponSlots:[]}};
 w.__snapshot=snapshot;w.eval('applyBuildSnapshot(__snapshot)');w.document.getElementById('calcBuild').click();
 const r=read("({levels:calcState.total,bonuses:calcState.stats.activeBonusEffects,real:calcState.realOneHit,channels:{normal:consumerDamageMetric({oneHitPipeline:calcState.realOneHit},'normal'),maximum:consumerDamageMetric({oneHitPipeline:calcState.realOneHit},'maximum')}})");
 row.channels=r.channels;row.dispositions=Object.fromEntries(['normal','maximum'].map(ch=>[ch,{ignored:r.real.channels?.[ch]?.diagnostics?.ignoredSkillEffects||[],ownerExcluded:r.real.channels?.[ch]?.diagnostics?.excludedCalculationSkills||[],partialBody:r.real.channels?.[ch]?.diagnostics?.componentSkillContinuation?.scope||null}]));row.appliedLevel=r.levels[skill.name]||0;row.activeBonuses=r.bonuses;row.equipment=set?{armor:Object.fromEntries(pieces),requiredPieces:rank.setPiecesRequired}:null;
 row.rankApplied=set?r.bonuses.some(b=>Number(b.bonusSkillId)===skill.id&&b.rankLevel===rank.level):row.appliedLevel===rank.level;
 const usable=Object.values(r.channels).every(x=>Number.isFinite(x.value)&&x.value>=0);
 row.status=!row.rankApplied?'RANK_NOT_APPLIED':usable?'CALCULATED':'UNAVAILABLE';
 row.effectObservation=JSON.stringify(row.channels)===JSON.stringify(baseline)?'UNCHANGED_NOT_PROOF_OF_CORRECTNESS':'CHANGED_NOT_PROOF_OF_CORRECTNESS';
 if(!usable){row.reasons=reasons(r.real);row.activeSkills=r.levels;for(const reason of new Set(row.reasons.map(x=>x.reason))){const g=manifest.reasonGroups[reason]||(manifest.reasonGroups[reason]={count:0,skills:{},kinds:{},examples:[]});g.count++;g.skills[skill.id]=skill.name;g.kinds[c.kind]=(g.kinds[c.kind]||0)+1;if(g.examples.length<5)g.examples.push(row.key);}}
 }
 }catch(e){row.status='EXECUTION_FAILURE';row.error=e.stack;}
 manifest.counts[row.status]=(manifest.counts[row.status]||0)+1;count++;fs.appendFileSync(path.join(out,'cases.jsonl'),JSON.stringify(row)+'\n');
 if(count%100===0){save();console.log(JSON.stringify({done:count,kind:c.kind,counts:manifest.counts,topReasons:Object.entries(manifest.reasonGroups).sort((a,b)=>b[1].count-a[1].count).slice(0,8).map(([reason,x])=>({reason,count:x.count,skills:x.skills}))}));}
 }
 manifest.completedWeapons.push(c.kind);save();console.log(JSON.stringify({completed:c.kind,done:count,counts:manifest.counts}));
 }finally{w.close();}
}
manifest.finishedAt=new Date().toISOString();manifest.modulesUnchanged=hash(fs.readFileSync(path.join(product,'skill-effect-continuation.js')))===manifest.hashes.continuation&&hash(fs.readFileSync(path.join(product,'skill-calculation-policy.js')))===manifest.hashes.policy;manifest.codeUnchanged=hash(fs.readFileSync(path.join(product,'index.html')))===manifest.hashes.index&&hash(fs.readFileSync(path.join(product,'hope-hammer-browser-adapter.js')))===manifest.hashes.adapter;save();
console.log(JSON.stringify({finished:true,count,counts:manifest.counts,manifest:path.join(out,'manifest.json'),jsdomErrors:manifest.jsdomErrors.length}));
