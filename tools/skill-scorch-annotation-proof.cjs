const fs=require('fs'),assert=require('assert/strict'),crypto=require('crypto'),cp=require('child_process');
const {JSDOM,VirtualConsole}=require('/Users/scream/Documents/Codex/2026-10-18/task/himmel-db-route-pqr4v6qt/dependencies/node_modules/jsdom');
const w=new JSDOM(require(process.cwd()+'/tools/dom-test-setup.cjs').readSimulatorHtml(),{url:'https://stage3.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
const known={name:'根性【果敢】',bonusName:'ヌシの魂',source:'group',required:3,count:3,rankLevel:1,bonusSkillId:131};
const unknown={name:'黒蝕一体Ⅱ',bonusName:'黒蝕竜の力',source:'series',required:4,count:4,rankLevel:2,bonusSkillId:106};
const st={attackTrue:100,attackComponents:{weaponBase:100,normalMultiplier:1,normalFlat:0},element:0,elementType:null,elementKnown:true,typeKnown:true,affinity:0,maxAffinity:0,activeBonusEffects:[known,unknown]};w.__st=st;
const out={base:cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),indexHash:crypto.createHash('sha256').update(fs.readFileSync('index.html')).digest('hex')};
try{out.plan=JSON.parse(w.eval('JSON.stringify(standardPowerConditionPlan(window.__st,{},"great-sword",{gutsState:"BEFORE"}))'));assert.equal(out.plan.normal.attackTrue,105);assert.ok(out.plan.pending.some(x=>x.includes('黒蝕一体Ⅱ')));assert.ok(out.plan.normal.activeBonusEffects.some(x=>x.name==='黒蝕一体Ⅱ'));assert.ok(!out.plan.normal.activeBonusEffects.some(x=>x.name==='根性【果敢】'));assert.deepEqual(st.activeBonusEffects,[known,unknown]);out.pass=true;}catch(e){out.pass=false;out.error=e.stack;}
const weapon=JSON.parse(fs.readFileSync('docs/reports/r252-generic-states/evidence/mhdb-great-sword-hope-blade-i.api.json'));
w.eval(`clearWeaponBuckets();DB.weapons=${JSON.stringify([weapon])};weaponIndexByKind['great-sword']=DB.weapons;weaponKind.value='great-sword';weapon.innerHTML='<option value="236">Hope</option>';weapon.value='236';App.build.setWeapon(DB.weapons[0]);renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();`);
let args;const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){args=a;return adapter.evaluateCurrent(a)}};w.calcBuild();assert.ok(args);
w.eval(`DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};`);

const rows=[];
for(const [rank,missingFire] of [[0,false],[1,false],[2,false],[1,true]]){
 const bonus={name:rank===1?'灼熱化Ⅰ':'灼熱化Ⅱ',bonusName:'火竜の力',source:'series',required:rank===1?2:4,count:rank===1?2:4,rankLevel:rank,bonusSkillId:71};
 const stats={...args.stats,activeBonusEffects:rank?[bonus]:[]};
 stats.conditionalConditionPlan=w.MHWStandardPowerConditionPlan(stats,{},'great-sword',{});
 const trainingRoom=missingFire?{...args.trainingRoom,parts:args.trainingRoom.parts.map(p=>({...p,multipliers:{...p.multipliers,fire:undefined}}))}:args.trainingRoom;
 const result=adapter.evaluateCurrent({...args,trainingRoom,stats,skills:rank?[[bonus.name,1]]:[],equipmentSkillsResolved:true});
 for(const ch of ['normal','maximum']){
  assert.equal(result.channels[ch].metrics.comboTotalDamage.status,'available');
  assert.equal(result.channels[ch].metrics.comboTotalDamage.value,375.73);
  if(rank){const annotation=result.channels[ch].diagnostics.excludedSkillDamage[0];assert.equal(annotation.fixedReference,rank===1?20:40);assert.deepEqual(Array.from(annotation.excludedComponents),['FIXED','FIRE']);if(missingFire)assert.equal(annotation.additionalDamage.status,'unavailable');else assert.equal(annotation.additionalDamage.total,rank===1?38:76);}
 }
 w.__result=result;w.eval('calcState.realOneHit=window.__result;renderSummary()');
 const text=w.document.getElementById('buildSummary').textContent;
 if(rank)assert.match(text,/追加ダメージは基準／最大火力に含めず注釈のみ/);
 if(missingFire)assert.match(text,/追加ダメージ不明/);
 rows.push({rank,missingFire,result,summary:text});
}
console.log(JSON.stringify({scope:'SYNTHETIC_ACTIVATION_CONTRACT_NOT_REAL_BUILD',base:out.base,hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js','himmel-real-browser-bundle.js'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')])),rows},null,2));w.close();
