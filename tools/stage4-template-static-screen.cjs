const fs=require('fs'),crypto=require('crypto'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('/Users/scream/Documents/Codex/2026-10-18/task/himmel-db-route-pqr4v6qt/dependencies/node_modules/jsdom');
const input='docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json',pack=JSON.parse(fs.readFileSync(input));
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
assert.equal(hash(input),'9491bfc1cf357aed4967418949d78c0ddd73407c6461443a7b594a2b2710c810');
for(const [k,n] of Object.entries(pack.counts))assert.equal(pack.data[k].length,n);
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml().replace('function templateFindWeapon(', 'window.__staticScreenHelpers={templateFindWeapon,templateFindArmor,templateFindDecoration,templateExpandDecorationEntries,templateSourceRuleAudit};function templateFindWeapon('),{url:'https://stage4.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('NETWORK_DISABLED'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}),w=dom.window;
const read=s=>JSON.parse(w.eval('JSON.stringify('+s+')'));
const out={environment:'JSDOM, actual exported application MHDB; no synthetic equipment; DOM template load button; not Safari or game',source:{...pack,data:undefined},hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js',input,__filename].map(p=>[p,hash(p)])),cases:[],errors};
try{
 w.__stage4DB=pack.data;w.eval('Object.assign(window,window.__staticScreenHelpers);DB=normalizeDB(window.__stage4DB);weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());');
 out.scope='Static record resolution only; no template application/calcBuild/combat execution/save';
 out.templates=read(`window.__buildTemplateDB.templates.flatMap(group=>group.builds.map(t=>{
 const weapon=templateFindWeapon(t),issues=templateSourceRuleAudit(t),owners=[];
 const add=(owner,entries,slots,kind)=>{const expanded=templateExpandDecorationEntries(entries||[]).filter(e=>!e.free_slot);owners.push({owner,slots,decorations:expanded.map((e,i)=>{const d=templateFindDecoration(e.name,e.slot,kind);return {name:e.name,id:d?.id??null,required:d?.slot??null,available:slots[i]??null,kind:d?.kind??null,match:!!d&&d.slot<=(slots[i]||0)&&d.kind===kind};})});};
 add('weapon',t.weapon?.decorations,weapon?.slots||[],'weapon');
 const armor=Object.fromEntries(Object.entries(t.armor||{}).map(([part,a])=>{const record=templateFindArmor(a.name,part);const slots=record?slotLevels(maxBreakSlots(record)).filter(Number):[];add(part,a.decorations,slots,'armor');return [part,{name:a.name,id:record?.id??null,slots}]}));
 const c=t.charm||{},skills=c.skills||[],pattern=c.slot_pattern||null;
 const preset=CANONICAL_COMBO_PRESETS[group.weapon_type_id];
 const techniques=(preset?.moves||[]).map(ui=>{const id=ui.startsWith('canonical:')?ui.slice(10):legacyCanonicalMapping(group.weapon_type_id,ui)?.canonicalTechniqueId;const r=TechniqueDBEngine.get(group.weapon_type_id,id);return {ui,id,exists:!!r,calculationStatus:r?.calculationStatus||null,verificationStatus:r?.verificationStatus||null,hits:r?.hits?.length??null,unresolved:r?.unresolvedReasons||[],special:r?.specialComponents||[]};});
 return {id:t.id,kind:group.weapon_type_id,weapon:{name:t.weapon?.name,id:weapon?.id??null},armor,sourceRuleIssues:issues,owners,charm:{skills,pattern,decorations:(()=>{const slots=[...(c.weapon_slot_levels||[]).map(level=>({level,kind:'weapon'})),...(c.armor_slot_levels||[]).map(level=>({level,kind:'armor'}))];return (c.decorations||[]).map(e=>{let found=null;for(let i=0;i<slots.length;i++){const d=templateFindDecoration(e.name,e.slot,slots[i].kind);if(d&&d.kind===slots[i].kind&&d.slot<=slots[i].level){found={name:e.name,id:d.id,required:d.slot,slot:slots[i].level,kind:d.kind,match:true};slots.splice(i,1);break;}}return found||{name:e.name,match:false};});})(),matches:charmRuleCandidates(skills,pattern),skillOnlyMatches:charmRuleCandidates(skills,'')},profile:preset?.id,techniques,artia:t.artia||null};
 }))`);
 out.count=out.templates.length;
}catch(e){out.failure=e.stack;process.exitCode=1;}finally{console.log(JSON.stringify(out,null,2));dom.window.close();}
