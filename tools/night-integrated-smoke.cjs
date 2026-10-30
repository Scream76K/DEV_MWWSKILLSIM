'use strict';
const results={};
{
'use strict';
const fs=require('fs'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const w=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://guard-proof.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
const weapon=JSON.parse(fs.readFileSync('docs/reports/r250-stage5/evidence/hope-hammer-i.mhdb.api.json'))[0];
w.eval(`clearWeaponBuckets();DB.weapons=${JSON.stringify([weapon])};weaponIndexByKind.hammer=DB.weapons;weaponKind.value='hammer';weapon.innerHTML='<option value="387">Hope Hammer I</option>';weapon.value='387';App.build.setWeapon(DB.weapons[0]);renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};`);

const take=()=>JSON.parse(w.eval('JSON.stringify(calcState.realOneHit)'));
w.eval("build.charmCustom={skills:[{name:'挑戦者',level:1}],slots:[0,0,0],weaponSlots:[]};calcBuild();");const off=take();
w.eval("build.charmCustom.skills.push({name:'攻めの守勢',level:3});calcBuild();");const on=take();
for(const ch of ['normal','maximum']){assert.equal(on.channels[ch].execution.status,'complete');assert.equal(on.channels[ch].metrics.comboTotalDamage.value,off.channels[ch].metrics.comboTotalDamage.value);}
assert.ok(on.channels.maximum.metrics.comboTotalDamage.value>on.channels.normal.metrics.comboTotalDamage.value);
results.guard={input:'Hope Hammer I387, Agitator1; Guard0/3',off,on};w.close();

}
{
const fs=require('fs'),assert=require('node:assert/strict'),cp=require('node:child_process'),crypto=require('node:crypto');
const {JSDOM,VirtualConsole}=require('jsdom');
const f=JSON.parse(fs.readFileSync('docs/reports/r255-lbg-normal-up/fixture.json'));assert.equal(f.weapon.id,793);assert.equal(f.decoration.skills[0].skill.id,6);assert.ok(f.weapon.slots[0]>=f.decoration.slot);assert.ok(f.weapon.ammo.some(a=>a.kind==='normal'&&a.level===1&&!a.rapid));
const vc=new VirtualConsole(),errors=[];vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));w.confirm=()=>true;}}),w=dom.window;
w.eval(`clearWeaponBuckets();DB.weapons=[${JSON.stringify(f.weapon)}];DB.decorations=[${JSON.stringify(f.decoration)}];DB.skills=${JSON.stringify(f.skills)};DB.armor=[];weaponIndexByKind['light-bowgun']=DB.weapons;weaponKind.value='light-bowgun';weapon.innerHTML='<option value="793">鳳仙火竜砲</option>';weapon.value='793';App.build.setWeapon(DB.weapons[0]);build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[]};renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();addCombo('canonical:LBG_NORMAL_AMMO_1');comboLBGMode.value='NORMAL';comboLBGAmmoType.value='NORMAL';comboLBGAmmoLevel.value='1';comboLBGRange.value='CRITICAL';comboLBGNormalMode.value='0';comboLBGContactPolicy.value='ALL_THREE';`);

w.eval(`DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};`);
let captured;const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){captured=a;return adapter.evaluateCurrent(a)}};

const take=()=>JSON.parse(w.eval('JSON.stringify(calcState.realOneHit)'));
w.calcBuild();const off=take();w.eval("build.charmCustom.skills=[{name:'速射強化',level:1},{name:'特殊射撃強化',level:2},{name:'貫通弾・竜の矢強化',level:1}];calcBuild();");const on=take();
for(const ch of ['normal','maximum']){assert.equal(on.channels[ch].execution.status,'complete');assert.equal(on.channels[ch].metrics.comboTotalDamage.value,off.channels[ch].metrics.comboTotalDamage.value);}
results.normalAmmo={input:'LBG793 NORMAL Lv1, three nonapplicable skills together',off,on};w.close();

}
{
const fs=require('fs'),assert=require('node:assert/strict'),cp=require('node:child_process'),crypto=require('node:crypto');
const {JSDOM,VirtualConsole}=require('jsdom');
const f=JSON.parse(fs.readFileSync('docs/reports/r257-thunder-conversion/fixture.json'));assert.equal(f.weapon.id,1081);assert.equal(f.decoration.skills[0].skill.id,156);assert.ok(f.weapon.slots[0]>=f.decoration.slot);assert.ok(f.armor.slots[0]>=f.decoration.slot);
const vc=new VirtualConsole(),errors=[];vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));w.confirm=()=>true;}}),w=dom.window;
w.eval(`clearWeaponBuckets();DB.weapons=[${JSON.stringify(f.weapon)}];DB.decorations=[${JSON.stringify(f.decoration)}];DB.skills=${JSON.stringify(f.skills)};DB.armor=[${JSON.stringify(f.armor)}];weaponIndexByKind['great-sword']=DB.weapons;weaponKind.value='great-sword';weapon.innerHTML='<option value="1081">ラギアブレイドⅠ</option>';weapon.value='1081';App.build.setWeapon(DB.weapons[0]);build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[]};renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();addCombo('canonical:GS_CHARGED_SLASH_3');`);

// Contract armor records, not a claim that these resistance totals occur on a real item.
w.eval(`DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};DB.armor=[70,150].map((v,i)=>({...DB.armor[0],id:900001+i,name:'Contract thunder '+v,resistances:{...DB.armor[0].resistances,thunder:v}}));`);
w.eval(`DB.weapons[0].skills=DB.weapons[0].skills.filter(x=>x.skill.id!==165);build.charmCustom={skills:[{name:'チャージマスター',level:3}],slots:[0,0,0],weaponSlots:[]};`);
let captured;const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){captured=a;return adapter.evaluateCurrent(a)}};

const take=()=>JSON.parse(w.eval('JSON.stringify(calcState.realOneHit)'));
w.calcBuild();const off=take();w.eval("build.armor.head=DB.armor[1];build.charmCustom.skills.push({name:'耐性変換【雷】',level:1});calcBuild();");const on=take();
for(const ch of ['normal','maximum']){const c=on.channels[ch];assert.equal(c.execution.status,'complete');assert.equal(c.diagnostics.thunderResistanceConversion.uncappedElement,1375);assert.equal(c.diagnostics.thunderResistanceConversion.effectiveElement,1150);for(const z of c.components){const b=off.channels[ch].components.find(b=>b.id===z.id);if(z.id.includes(':physical:'))assert.equal(z.value,b.value);else{assert.equal(z.details.appliedElement,1150);assert.equal(z.effectsApplied.filter(e=>e.id==='thunder-resistance-conversion-element-add').length,1);}}}
results.cmCap={input:'GS1081 CM3; contract resistance150 + ThunderConversion1; 1375 capped1150',off,on};w.close();

}
{
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto'),cp=require('node:child_process');
const {JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('./dom-test-setup.cjs');const f=JSON.parse(fs.readFileSync('docs/reports/r253-saed-loading/fixture.json'));
assert.equal(f.decoration.kind,'weapon');assert.ok(f.weapon.slots[0]>=f.decoration.slot);assert.equal(f.skill.id,109);assert.equal(f.decoration.skills[0].skill.id,109);assert.equal(f.decoration.skills[0].level,2);
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(readSimulatorHtml(),{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));w.confirm=()=>true;}}),w=dom.window;
w.eval(`clearWeaponBuckets();DB.weapons=[${JSON.stringify(f.weapon)}];DB.armor=[];DB.decorations=[${JSON.stringify(f.decoration)}];DB.skills=[${JSON.stringify(f.skill)}];weaponIndexByKind['charge-blade']=DB.weapons;weaponKind.value='charge-blade';weapon.innerHTML='<option value="103">CB103</option>';weapon.value='103';App.build.setWeapon(DB.weapons[0]);build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[]};build.decos={};renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();addCombo('canonical:CB_SAED');comboCBShield.value='1';comboCBAxe.value='0';comboCBPhialType.value='POWER_ELEMENT';comboCBEnhancedPhial.value='1';`);


w.eval(`DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};calcBuild();`);
const take=()=>JSON.parse(w.eval('JSON.stringify({result:calcState.realOneHit,snapshot:buildSnapshot(),conditions:compareStep5Snapshot()})'));

const count=w.TechniqueDBEngine.get('charge-blade','CB_SAED').hits.length;assert.equal(count,3);const flags=Array(count).fill(false);
w.eval("build.charmCustom={skills:[{name:'抜刀術【技】',level:1},{name:'抜刀術【力】',level:3},{name:'会心撃【属性】',level:3}],slots:[0,0,0],weaponSlots:[]};");
for(const p of ['Draw','Punishing'])for(const ch of ['Normal','Maximum'])w.document.getElementById('power'+p+'Hits'+ch).value=JSON.stringify({CB_SAED:flags});w.calcBuild();const off=take();
w.document.getElementById('powerDrawHitsMaximum').value=JSON.stringify({CB_SAED:[true,false,false]});w.document.getElementById('powerPunishingHitsMaximum').value=JSON.stringify({CB_SAED:[false,true,false]});w.calcBuild();const on=take();
assert.deepEqual(on.result.channels.normal,off.result.channels.normal);const c=on.result.channels.maximum,b=off.result.channels.maximum;assert.equal(c.execution.status,'complete');const x=c.components[0].details,y=b.components[0].details;assert.equal(x.components.elementalPhial,y.components.elementalPhial);assert.deepEqual(x.trace.bodyHits[2],y.trace.bodyHits[2]);assert.equal(x.trace.bodyHits[0].hitAffinityAdd,50);assert.equal(x.trace.bodyHits[0].hitAttackAdd,0);assert.equal(x.trace.bodyHits[1].hitAffinityAdd,0);assert.equal(x.trace.bodyHits[1].hitAttackAdd,7);
results.saed={input:'CB103 contract; max CriticalDraw body0 / PunishingDraw body1; normal flags off',off,on};w.close();

}
const fs=require('fs'),crypto=require('crypto');console.log(JSON.stringify({scope:'Four representative public calcBuild paths only; no full regression or new save/AB run',results,hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js','himmel-real-browser-bundle.js',__filename].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]))},null,2));
