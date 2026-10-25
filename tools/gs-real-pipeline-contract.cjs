const fs=require('fs');
const assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const repo='/Users/scream/Documents/Codex/2026-10-18/task/himmel-v10-real-db-element-gate';
const html=require(`${repo}/tools/dom-test-setup.cjs`).readSimulatorHtml();
const weapon=JSON.parse(fs.readFileSync(`${repo}/docs/reports/r252-generic-states/evidence/mhdb-great-sword-hope-blade-i.api.json`,'utf8'));
const ids=['GS_CHARGED_SLASH_3','GS_STRONG_CHARGED_SLASH_3','GS_STRONG_WIDE_SLASH_3'];
const vc=new VirtualConsole();
const errors=[];
vc.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(html,{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}});
const w=dom.window;
w.eval(`clearWeaponBuckets();DB.weapons=${JSON.stringify([weapon])};weaponIndexByKind['great-sword']=[DB.weapons[0]];weaponKind.value='great-sword';weapon.innerHTML='<option value="${weapon.id}">${weapon.name}</option>';weapon.value='${weapon.id}';DB.monsters=[{id:'training-room',name:'訓練場',parts:[{id:'training-front',name:'正面',multipliers:{slash:.5,blunt:.5,pierce:.5,fire:.2,water:.2,thunder:.2,ice:.2,dragon:.2}}]}];renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';calcBuild();renderComboForWeapon();`);
w.eval(`App.state.combo.moves=${JSON.stringify(ids.map(techniqueId=>({techniqueId})))};`);
w.calcBuild();
const real=w.eval('calcState.realOneHit');
assert.equal(real?.status,'OK');
for(const channel of ['normal','maximum']){
  const metric=real.channels[channel].metrics.comboTotalDamage;
  assert.equal(metric.status,'available');
  assert.equal(Number.isFinite(metric.value),true);
  assert.equal(real.channels[channel].execution.status,'complete');
}
assert.deepEqual(errors,[]);
console.log(JSON.stringify({status:real.status,weapon:{id:weapon.id,gameId:weapon.gameId,name:weapon.name,raw:weapon.damage.raw,affinity:weapon.affinity,sharpness:weapon.sharpness,slots:weapon.slots,skills:weapon.skills},techniqueIds:ids,normal:real.channels.normal.metrics.comboTotalDamage,maximum:real.channels.maximum.metrics.comboTotalDamage,errors},null,2));
dom.window.close();
