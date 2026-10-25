const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto'),cp=require('node:child_process');
const {JSDOM,VirtualConsole}=require('/Users/scream/Documents/Codex/2026-10-18/task/himmel-db-route-pqr4v6qt/dependencies/node_modules/jsdom');
const {readSimulatorHtml}=require(process.cwd()+'/tools/dom-test-setup.cjs');
const rows=[...JSON.parse(fs.readFileSync('docs/reports/r254-artia-capacity-scope/records.json')),...JSON.parse(fs.readFileSync('docs/reports/r254-artia-rare8/mhdb-normal-rare8.json')).filter(x=>[305,828].includes(x.id))];
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(readSimulatorHtml(),{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));w.confirm=()=>true;}}),w=dom.window;
w.eval(`clearWeaponBuckets();DB.weapons=consolidateArtiaFixedVariantRows(${JSON.stringify(rows)});DB.armor=[];DB.skills=[];DB.decorations=[];build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[]};build.decos={};renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';`);
const results=[],boundaries=[],checks=[];const copy=x=>JSON.parse(JSON.stringify(x));
function select(id){w.eval(`{const chosen=DB.weapons.find(x=>x.id===${id});weaponIndexByKind[chosen.kind]=DB.weapons.filter(x=>x.kind===chosen.kind);weaponKind.value=chosen.kind;weapon.innerHTML='<option value="${id}">selected</option>';weapon.value='${id}';App.build.setWeapon(chosen);build.artia={production:'attack',element:'water',parts:['attack','attack','attack'],sameElementPartCount:3,restores:['none','none','none','none','none'],seriesSkill:'',groupSkill:''};renderArtia();renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();}`);}
try{
 for(const id of [523,1157]){select(id);w.eval(`addCombo('canonical:HBG_NORMAL_AMMO_2');powerHbgAmmoLevel.value='2';powerHbgRange.value='CRITICAL';powerHbgNormalMode.value='0';powerHbgCapacity.value='2';powerHbgFullMagazine.value='YES';powerHbgShotOrdinal.value='1';`);
  for(const bonus of [1,2]){
   const keys=id===523?Array(bonus).fill('capacity:I'):[bonus===1?'capacity:I':'capacity:EX'];
   w.eval(`build.artia.restores=${JSON.stringify(keys)};calcBuild();renderArtia();`);
   const r=copy(w.eval('({raw:selectedWeapon(),projection:realPipelineWeapon(selectedWeapon()),real:calcState.realOneHit,restores:build.artia.restores})'));results.push({id,bonus,...r});
   const raw=r.raw.ammo.find(x=>x.kind==='normal'&&x.level===2),projected=r.projection.ammo.find(x=>x.id===raw.id);assert.equal(projected.capacity,raw.capacity+bonus);
   assert.deepEqual(r.projection.ammo.filter(x=>x.kind!=='normal'),r.raw.ammo.filter(x=>x.kind!=='normal'));
   for(const ch of ['normal','maximum']){const c=r.real.channels[ch];assert.equal(c.execution.status,'complete');assert.equal(c.metrics.comboTotalDamage.status,'available');assert.ok(Number.isFinite(c.metrics.comboTotalDamage.value));const comp=c.components.find(x=>x.details?.state);assert.ok(comp,'Formula state evidence');assert.equal(comp.details.state.magazineCapacity,raw.capacity+bonus);assert.equal(comp.details.state.capacityEvidence.bonus,bonus);}
  }
 }
 for(const [id,key,max,field,per] of [[305,'atk:I',5,'attack',5],[305,'aff:I',3,'affinity',5],[305,'sharp:I',2,'sharp',30],[305,'elem:I',4,'element',80],[523,'capacity:I',2,'capacity',1]]){
  select(id);for(const count of [max,max+1]){w.eval(`build.artia.restores=${JSON.stringify(Array(count).fill(key))}`);const r=copy(w.eval('restoreStats(selectedWeapon())'));boundaries.push({id,key,count,result:r});if(count===max){assert.equal(r.reason,undefined);assert.equal(r[field],count*per);}else assert.ok(r.reason?.includes(count>5?'LIST_INVALID':'RESTORE_LIMIT'));}
 }
 for(const id of [521,522]){select(id);assert.equal(w.eval('artiaCapacityRestoreEligible(selectedWeapon())'),false);w.eval(`build.artia.restores=['capacity:I'];calcBuild();`);assert.ok(w.eval('calcState.realOneHit.reason').includes('NOT_APPLICABLE'));}
 select(1157);w.eval(`build.artia.restores=['capacity:III'];calcBuild();`);assert.ok(w.eval('calcState.realOneHit.reason').includes('STAGE_UNSUPPORTED'));
 assert.deepEqual(errors,[]);checks.push({pass:true});
}catch(e){checks.push({pass:false,error:e.stack});}
console.log(JSON.stringify({base:cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')])),results,boundaries,checks},null,2));dom.window.close();process.exitCode=checks.some(x=>!x.pass)?1:0;
