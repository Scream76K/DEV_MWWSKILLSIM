const fs=require('fs'),assert=require('node:assert/strict'),cp=require('node:child_process'),crypto=require('node:crypto');
const {JSDOM,VirtualConsole}=require('jsdom');
const f=JSON.parse(fs.readFileSync('docs/reports/r255-lbg-normal-up/fixture.json'));assert.equal(f.weapon.id,793);assert.equal(f.decoration.skills[0].skill.id,6);assert.ok(f.weapon.slots[0]>=f.decoration.slot);assert.ok(f.weapon.ammo.some(a=>a.kind==='normal'&&a.level===1&&!a.rapid));
const vc=new VirtualConsole(),errors=[];vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));w.confirm=()=>true;}}),w=dom.window;
w.eval(`clearWeaponBuckets();DB.weapons=[${JSON.stringify(f.weapon)}];DB.decorations=[${JSON.stringify(f.decoration)}];DB.skills=${JSON.stringify(f.skills)};DB.armor=[];weaponIndexByKind['light-bowgun']=DB.weapons;weaponKind.value='light-bowgun';weapon.innerHTML='<option value="793">鳳仙火竜砲</option>';weapon.value='793';App.build.setWeapon(DB.weapons[0]);build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[]};renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();addCombo('canonical:LBG_NORMAL_AMMO_1');comboLBGMode.value='NORMAL';comboLBGAmmoType.value='NORMAL';comboLBGAmmoLevel.value='1';comboLBGRange.value='CRITICAL';comboLBGNormalMode.value='0';comboLBGContactPolicy.value='ALL_THREE';`);

w.eval(`DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};`);
let captured;const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){captured=a;return adapter.evaluateCurrent(a)}};
const cases=[];
for(const skills of [[],[{name:'速射強化',level:1}],[{name:'特殊射撃強化',level:2}],[{name:'貫通弾・竜の矢強化',level:1}],[{name:'速射強化',level:2}]]){
 w.eval(`build.decos={};build.charmCustom={skills:${JSON.stringify(skills)},slots:[0,0,0],weaponSlots:[]};calcBuild();`);
 const r=JSON.parse(w.eval('JSON.stringify(calcState.realOneHit)'));
 cases.push({skills,result:r});
}
const expected=process.argv[2];
assert.equal(cases[0].result.channels.normal.execution.status,'complete');
for(const c of cases.slice(1,4)) for(const ch of ['normal','maximum']){
 if(expected==='after'){assert.equal(c.result.channels[ch].execution.status,'complete');assert.deepEqual(c.result.channels[ch].metrics.comboTotalDamage,cases[0].result.channels[ch].metrics.comboTotalDamage);}
 else assert.notEqual(c.result.channels?.[ch]?.execution?.status,'complete');
}
// calcBuild clamps the custom charm to the MHDB maximum; test malformed Lv at its captured Pipeline boundary.
const invalid=adapter.evaluateCurrent({...captured,skills:[['速射強化',2]]});
assert.notEqual(invalid.channels?.normal?.execution?.status,'complete');
let rapid;
if(expected==='after'){
 w.eval(`build.charmCustom={skills:[{name:'速射強化',level:1}],slots:[0,0,0],weaponSlots:[]};comboLBGMode.value='RAPID';App.combo.syncFromDOM();calcBuild();`);
 rapid=JSON.parse(w.eval('JSON.stringify(calcState.realOneHit)'));
 assert.notEqual(rapid.channels?.normal?.execution?.status,'complete');
}
console.log(JSON.stringify({cases,invalid,rapid,hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]))},null,2));w.close();
