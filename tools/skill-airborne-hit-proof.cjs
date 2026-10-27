const fs=require('fs'),assert=require('assert/strict'),crypto=require('crypto'),cp=require('child_process');
const {JSDOM,VirtualConsole}=require('/Users/scream/Documents/Codex/2026-10-18/task/himmel-db-route-pqr4v6qt/dependencies/node_modules/jsdom');
const w=new JSDOM(require(process.cwd()+'/tools/dom-test-setup.cjs').readSimulatorHtml(),{url:'https://stage3.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
const weapon=JSON.parse(fs.readFileSync('docs/reports/r252-dual-blades/evidence/mhdb-dual-blades-hope-dagger.api.json'));
w.eval(`clearWeaponBuckets();DB.weapons=${JSON.stringify([weapon])};weaponIndexByKind['dual-blades']=DB.weapons;weaponKind.value='dual-blades';weapon.innerHTML='<option value="155">Hope</option>';weapon.value='155';App.build.setWeapon(DB.weapons[0]);renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();`);
let args;const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){args=a;return adapter.evaluateCurrent(a)}};w.calcBuild();assert.ok(args);
w.eval(`DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};`);


const rows=[];
for(const active of [false,true]){
 const input={...args,weapon:{...args.weapon,kind:'dual-blades'},skills:active?[['飛燕',1]]:[],equipmentSkillsResolved:true,techniqueIds:['DB_DEMON_DANCE_I','DB_DEMON_DANCE_II','DB_DEMON_DANCE_III'],dualBladesState:{demonMode:true,requiresDemonGauge:true}};
 const result=adapter.evaluateCurrent(input);rows.push({active,result});
 if(!process.env.CAPTURE_BEFORE){assert.equal(result.status,'OK',JSON.stringify(result));for(const ch of ['normal','maximum']){assert.equal(result.channels[ch].execution.status,'complete');assert.equal(result.channels[ch].metrics.comboTotalDamage.status,'available');const cs=result.channels[ch].components.filter(c=>c.coefficientUnit==='MV');for(const c of cs){const index=Number(c.componentId?.split(':').pop()??c.id?.split(':').pop());const expected=active&&({DB_DEMON_DANCE_I:[],DB_DEMON_DANCE_II:[1,2],DB_DEMON_DANCE_III:[2,3,6,7,8,9]}[c.techniqueId]||[]).includes(index);assert.equal((c.effectsApplied||[]).filter(e=>e.id.startsWith('airborne:')).length,expected?1:0);}}}
}
if(!process.env.CAPTURE_BEFORE)for(const ch of ['normal','maximum']){
 const a=rows[0].result.channels[ch].components,b=rows[1].result.channels[ch].components;
 let affected=0;for(let i=0;i<a.length;i++){const active=(b[i].effectsApplied||[]).some(e=>e.id.startsWith('airborne:'));if(active){affected++;assert.ok(Math.abs(b[i].value-a[i].value*1.1)<.02);}else assert.equal(b[i].value,a[i].value);}assert.equal(affected,8);
}
console.log(JSON.stringify({rows},null,2));w.close();
