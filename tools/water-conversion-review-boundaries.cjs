const results={};
{
'use strict';
const fs=require('fs'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const w=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://guard-proof.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
const weapon=JSON.parse(fs.readFileSync('docs/reports/r250-stage5/evidence/hope-hammer-i.mhdb.api.json'))[0];
w.eval(`clearWeaponBuckets();DB.weapons=${JSON.stringify([weapon])};weaponIndexByKind.hammer=DB.weapons;weaponKind.value='hammer';weapon.innerHTML='<option value="387">Hope Hammer I</option>';weapon.value='387';App.build.setWeapon(DB.weapons[0]);renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};`);

w.eval("DB.weapons[0].specials=[{kind:'element',element:'water',damage:{raw:50,display:500}}];App.build.setWeapon(DB.weapons[0]);build.charmCustom={skills:[{name:'耐性変換【水】',level:1}],slots:[0,0,0],weaponSlots:[]};calcBuild();");
const result=JSON.parse(w.eval('JSON.stringify(calcState.realOneHit)'));assert.equal(result.reason,'REAL_SLICE:WATER_CONVERSION_SCOPE_UNSUPPORTED');results.outside={input:'Public calcBuild: Hammer387 synthetic water500, adopted standard hammer combo, WaterConversion1',result};w.close();
}
{
const fs=require('fs'),assert=require('node:assert/strict'),cp=require('node:child_process'),crypto=require('node:crypto');
const {JSDOM,VirtualConsole}=require('jsdom');
const f=JSON.parse(fs.readFileSync('docs/reports/r257-thunder-conversion/fixture.json'));assert.equal(f.weapon.id,1081);assert.equal(f.decoration.skills[0].skill.id,156);assert.ok(f.weapon.slots[0]>=f.decoration.slot);assert.ok(f.armor.slots[0]>=f.decoration.slot);
const vc=new VirtualConsole(),errors=[];vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));w.confirm=()=>true;}}),w=dom.window;
w.eval(`clearWeaponBuckets();DB.weapons=[${JSON.stringify(f.weapon)}];DB.decorations=[${JSON.stringify(f.decoration)}];DB.skills=${JSON.stringify(f.skills)};DB.armor=[${JSON.stringify(f.armor)}];weaponIndexByKind['great-sword']=DB.weapons;weaponKind.value='great-sword';weapon.innerHTML='<option value="1081">ラギアブレイドⅠ</option>';weapon.value='1081';App.build.setWeapon(DB.weapons[0]);build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[]};renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();addCombo('canonical:GS_CHARGED_SLASH_3');`);

// Contract armor records, not a claim that these resistance totals occur on a real item.
w.eval(`DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};DB.armor=[70,150].map((v,i)=>({...DB.armor[0],id:900001+i,name:'Contract thunder '+v,resistances:{...DB.armor[0].resistances,thunder:v}}));`);

w.eval("build.armor.head=DB.armor[0];calcBuild();");const result=JSON.parse(w.eval('JSON.stringify(calcState.realOneHit)'));
for(const ch of ['normal','maximum']){const c=result.channels[ch];assert.equal(c.execution.status,'complete');assert.equal(c.diagnostics.thunderResistanceConversion.add,350);assert.equal(c.diagnostics.thunderResistanceConversion.effectiveElement,850);assert.equal(c.metrics.comboTotalDamage.value,1210.96);}
results.thunder={input:'Public calcBuild: captured GS1081 thunder500, contract armor thunder70; native ThunderConversion1; no CM',result};w.close();
}
const fs=require('fs'),crypto=require('crypto');console.log(JSON.stringify({results,hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js',__filename].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]))},null,2));
