'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {JSDOM,VirtualConsole}=require('jsdom');
const assert=require('node:assert/strict');
const {collectDispositions,classifyChannel,planOrdinaryRank,selectSkills,selectProfiles,prepareSnapshot}=require('./skill-audit-dispositions.cjs');
const [product,fixtures,out]=process.argv.slice(2).map(x=>path.resolve(x));
fs.mkdirSync(out,{recursive:true});
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const packBytes=fs.readFileSync(path.join(fixtures,'mhdb-catalog-source/raw-pack.json')),fixtureBytes=fs.readFileSync(path.join(fixtures,'ui-public-14-strict.json'));
const pack=JSON.parse(packBytes),source=JSON.parse(fixtureBytes),html=require(path.join(product,'tools/dom-test-setup.cjs')).readSimulatorHtml();
const currentStandard=process.env.AUDIT_MODE==='current-standard';
const profiles=selectProfiles(source.cases,process.env),selectedSkills=selectSkills(pack.data.skills,process.env.SKILL_IDS);
const manifest={startedAt:new Date().toISOString(),product,scope:'ALL_MHDB_VALID_RANKS_X_ALL_14_REPRESENTATIVE_WEAPONS_PUBLIC_CALCULATE_BUTTON',notCovered:['independent game accuracy','all effect activation permutations','all legal equipment combinations','all weapon records'],hashes:{index:hash(fs.readFileSync(path.join(product,'index.html'))),adapter:hash(fs.readFileSync(path.join(product,'hope-hammer-browser-adapter.js'))),database:hash(packBytes),fixtures:hash(fixtureBytes),test:hash(fs.readFileSync(__filename)),continuation:hash(fs.readFileSync(path.join(product,'skill-effect-continuation.js'))),policy:hash(fs.readFileSync(path.join(product,'skill-calculation-policy.js')))},skillCount:pack.data.skills.length,rankCount:pack.data.skills.reduce((n,s)=>n+s.ranks.length,0),counts:{},reasonGroups:{},completedWeapons:[],jsdomErrors:[]};
Object.assign(manifest,{auditMode:currentStandard?'CURRENT_STANDARD_NON_CB':'LEGACY_FIXTURE_ROUTE',sourceMetadata:pack.metadata||pack.meta||null,selectedSkillIds:selectedSkills.map(s=>s.id),selectedRankCount:selectedSkills.reduce((n,s)=>n+s.ranks.length,0),profiles:profiles.map(c=>({id:c.auditProfileId,kind:c.kind,weaponId:c.auditWeaponId||c.inputSnapshots[0].weaponId,expectedAmmo:c.expectedAmmo||null,originalSnapshotHash:hash(JSON.stringify(c.inputSnapshots[0]))})),probeMeaning:'CUSTOM_CHARM_RANK_MAPPING_AND_REAL_SET_PIECES_NOT_ALL_LEGAL_BUILDS;EMPTY_OMISSIONS_NOT_PROOF_OF_COMPLETE_IMPLEMENTATION',staticCoverage:currentStandard?[{kind:'charge-blade',status:'STATIC_ONLY_NOT_EXECUTED',reason:'CB_RUNTIME_AUDIT_OUT_OF_SCOPE;NO_GETTER_OR_PROTOTYPE_MANIPULATION'}]:[],completedProfiles:[]});
if(currentStandard)manifest.scope='SOURCE_VALID_RANKS_X_SELECTED_CURRENT_STANDARD_PROFILES_NON_CB';
manifest.hashes.collector=hash(fs.readFileSync(require.resolve('./skill-audit-dispositions.cjs')));
manifest.sourceMetadata=Object.fromEntries(['apiDataVersion','retrievedAt','referenceGameVersion','rawApi','receipts'].map(k=>[k,pack[k]??null]));
const localScripts=[...fs.readFileSync(path.join(product,'index.html'),'utf8').matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)].map(m=>m[1]).filter(src=>! /^(?:[a-z]+:)?\/\//i.test(src));
manifest.localScriptHashes=Object.fromEntries(localScripts.map(src=>{const file=path.resolve(product,src);if(!file.startsWith(product+path.sep))throw Error('Script outside product: '+src);return[src,hash(fs.readFileSync(file))];}));
fs.writeFileSync(path.join(out,'cases.jsonl'),'');
function save(){fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2));}
function reasons(x,p='',a=[]){if(!x||typeof x!=='object')return a;for(const[k,v]of Object.entries(x)){if(['reason','normalReason','maximumReason'].includes(k)&&typeof v==='string'&&v)a.push({path:p+'.'+k,reason:v});else if(v&&typeof v==='object')reasons(v,p+'.'+k,a);}return a;}
const armorFor=new Map();for(const s of pack.data.skills.filter(s=>['set','group'].includes(s.kind))){const a={};for(const x of pack.data.armor)if((x.skills||[]).some(e=>e.skill?.id===s.id)&&!a[x.kind])a[x.kind]=x.id;armorFor.set(s.id,a);}
let count=0;save();
for(const c of profiles){
 const vc=new VirtualConsole();vc.on('jsdomError',e=>manifest.jsdomErrors.push({kind:c.kind,error:e.message}));
 const w=new JSDOM(html,{url:'https://full-skill-scan.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE_TEST'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 const read=s=>JSON.parse(w.eval('JSON.stringify('+s+')'));
 try{
 w.__data=pack.data;w.eval('DB=normalizeDB({...__data,weapons:consolidateArtiaFixedVariantRows(__data.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 const base=prepareSnapshot(c,currentStandard);
 const auditPlan=()=>read("consumerEvaluationPlan(canonicalWeaponKind(selectedWeapon()),App.state.combo.moves,compareStep5Snapshot(),{monster:buildSnapshot().target.monsterId,part:buildSnapshot().target.partId})");
 const validatePlan=plan=>{if(currentStandard){assert.equal(plan.selection,'STANDARD');assert.equal(plan.conditions.standardEvaluation,true);for(const[k,v]of Object.entries(c.expectedAmmo||{}))assert.equal(plan.standardAmmo?.[k],v,'standardAmmo.'+k);}};
 w.__snapshot=base;w.eval('applyBuildSnapshot(__snapshot)');w.document.getElementById('calcBuild').click();
 const baseline=read("({normal:consumerDamageMetric({oneHitPipeline:calcState.realOneHit},'normal'),maximum:consumerDamageMetric({oneHitPipeline:calcState.realOneHit},'maximum')})");
 const baselinePlan=auditPlan();validatePlan(baselinePlan);
 const baselineLevels=read('calcState.total');assert.ok(baselineLevels&&typeof baselineLevels==='object'&&!Array.isArray(baselineLevels),'baseline skill totals missing');
 const baselineReal=read('calcState.realOneHit');
 Object.assign(manifest.profiles.find(p=>p.id===c.auditProfileId),{baseline:{channels:baseline,activeSkills:baselineLevels,evaluationPlan:baselinePlan,dispositions:collectDispositions(baselineReal),channelStates:Object.fromEntries(['normal','maximum'].map(ch=>[ch,classifyChannel(baselineReal?.channels?.[ch])]))},baselineInterpretation:'INTRINSIC_WEAPON_SKILLS_RETAINED;PROBE_DIFFERENCES_ARE_COMBINATION_OBSERVATIONS_NOT_CAUSAL_PROOF'});save();
 for(const skill of selectedSkills)for(const rank of skill.ranks){
 const row={key:skill.id+':'+rank.level+':'+c.auditProfileId,profileId:c.auditProfileId,skillId:skill.id,skillName:skill.name,skillKind:skill.kind,rankId:rank.id,level:rank.level,kind:c.kind,baseline,weaponId:base.weaponId,originalSnapshotHash:hash(JSON.stringify(c.inputSnapshots[0])),probeSnapshotHash:hash(JSON.stringify(base))};
 try{
 const set=['set','group'].includes(skill.kind);
 const baselineLevel=Object.hasOwn(baselineLevels,skill.name)?baselineLevels[skill.name]:0;
 const rankPlan=set?null:planOrdinaryRank(baselineLevel,rank.level);
 row.rankMapping=set?null:{baselineLevel,requestedLevel:rank.level,...rankPlan};
 const pieces=set?Object.entries(armorFor.get(skill.id)||{}).slice(0,rank.setPiecesRequired):[];
 if(rankPlan?.status==='INTRINSIC_RANK_UNREACHABLE'){
  row.status='INTRINSIC_RANK_UNREACHABLE';row.reason='WEAPON_BASELINE_EXCEEDS_REQUESTED_RANK';row.rankApplied=false;
 }else if(set&&(!Number.isInteger(rank.setPiecesRequired)||pieces.length<rank.setPiecesRequired)){
  row.status='NO_VALID_EQUIPMENT_FIXTURE';row.reason='INSUFFICIENT_DISTINCT_ARMOR_SLOTS_FOR_THRESHOLD';
 }else{
 const snapshot={...base,armor:set?Object.fromEntries(pieces):{},charmCustom:{skills:set||rankPlan.charmLevel===0?[]:[{name:skill.name,level:rankPlan.charmLevel,type:skill.kind==='weapon'?'weapon':'armor'}],slots:[0,0,0],weaponSlots:[]}};
 row.trialSnapshotHash=hash(JSON.stringify(snapshot));
 w.__snapshot=snapshot;w.eval('applyBuildSnapshot(__snapshot)');w.document.getElementById('calcBuild').click();
 const r=read("({levels:calcState.total,bonuses:calcState.stats.activeBonusEffects,real:calcState.realOneHit,channels:{normal:consumerDamageMetric({oneHitPipeline:calcState.realOneHit},'normal'),maximum:consumerDamageMetric({oneHitPipeline:calcState.realOneHit},'maximum')}})");
 row.evaluationPlan=auditPlan();validatePlan(row.evaluationPlan);row.actualEvaluationPlan=r.real?.evaluationPlan||null;
 if(currentStandard)assert.equal(row.actualEvaluationPlan?.selection,'STANDARD');
 row.channels=r.channels;row.dispositions=collectDispositions(r.real);row.appliedLevel=r.levels[skill.name]||0;row.activeBonuses=r.bonuses;row.activeSkills=r.levels;row.equipment=set?{armor:Object.fromEntries(pieces),requiredPieces:rank.setPiecesRequired}:null;
 row.channelStates=Object.fromEntries(['normal','maximum'].map(ch=>[ch,classifyChannel(r.real?.channels?.[ch])]));
 row.rankApplied=set?r.bonuses.some(b=>Number(b.bonusSkillId)===skill.id&&b.rankLevel===rank.level):row.appliedLevel===rank.level;
 const usable=['normal','maximum'].every(ch=>row.channelStates[ch].startsWith('AVAILABLE_')&&Number.isFinite(r.channels?.[ch]?.value)&&r.channels[ch].value>=0);
 row.status=!row.rankApplied?'RANK_NOT_APPLIED':usable?'CALCULATED':'UNAVAILABLE';
 row.effectObservation=JSON.stringify(row.channels)===JSON.stringify(baseline)?'UNCHANGED_NOT_PROOF_OF_CORRECTNESS':'CHANGED_NOT_PROOF_OF_CORRECTNESS';
 row.reasons=reasons(r.real);for(const reason of new Set(row.reasons.map(x=>x.reason))){const g=manifest.reasonGroups[reason]||(manifest.reasonGroups[reason]={count:0,skills:{},kinds:{},examples:[]});g.count++;g.skills[skill.id]=skill.name;g.kinds[c.kind]=(g.kinds[c.kind]||0)+1;if(g.examples.length<5)g.examples.push(row.key);}
 }
 }catch(e){row.status='EXECUTION_FAILURE';row.error=e.stack;}
 manifest.counts[row.status]=(manifest.counts[row.status]||0)+1;count++;fs.appendFileSync(path.join(out,'cases.jsonl'),JSON.stringify(row)+'\n');
 if(count%100===0){save();console.log(JSON.stringify({done:count,kind:c.kind,counts:manifest.counts,topReasons:Object.entries(manifest.reasonGroups).sort((a,b)=>b[1].count-a[1].count).slice(0,8).map(([reason,x])=>({reason,count:x.count,skills:x.skills}))}));}
 }
 manifest.completedWeapons=[...new Set([...manifest.completedWeapons,c.kind])];manifest.completedProfiles.push(c.auditProfileId);save();console.log(JSON.stringify({completed:c.auditProfileId,done:count,counts:manifest.counts}));
 }finally{w.close();}
}
manifest.finishedAt=new Date().toISOString();manifest.localScriptsUnchanged=Object.entries(manifest.localScriptHashes).every(([src,expected])=>hash(fs.readFileSync(path.resolve(product,src)))===expected);manifest.modulesUnchanged=hash(fs.readFileSync(path.join(product,'skill-effect-continuation.js')))===manifest.hashes.continuation&&hash(fs.readFileSync(path.join(product,'skill-calculation-policy.js')))===manifest.hashes.policy;manifest.codeUnchanged=hash(fs.readFileSync(path.join(product,'index.html')))===manifest.hashes.index&&hash(fs.readFileSync(path.join(product,'hope-hammer-browser-adapter.js')))===manifest.hashes.adapter;save();
console.log(JSON.stringify({finished:true,count,counts:manifest.counts,manifest:path.join(out,'manifest.json'),jsdomErrors:manifest.jsdomErrors.length}));
