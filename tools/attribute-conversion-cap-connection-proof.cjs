const fs=require('fs'),assert=require('node:assert/strict'),cp=require('node:child_process'),crypto=require('node:crypto');
const {JSDOM,VirtualConsole}=require('jsdom');
const f=JSON.parse(fs.readFileSync('docs/reports/r258-attribute-conversion/fixture.json'));assert.equal(f.weapon.id,900);assert.ok(f.armor.skills.some(x=>x.skill.id===152&&x.level===1));
const vc=new VirtualConsole(),errors=[];vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));w.confirm=()=>true;}}),w=dom.window;
w.eval(`clearWeaponBuckets();DB.weapons=[${JSON.stringify(f.weapon)}];DB.decorations=[];DB.skills=${JSON.stringify(f.skills)};DB.armor=[${JSON.stringify(f.armor)}];weaponIndexByKind['long-sword']=DB.weapons;weaponKind.value='long-sword';weapon.innerHTML='<option value="900">ガルシュエンシスⅠ</option>';weapon.value='900';App.build.setWeapon(DB.weapons[0]);build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[]};renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();addCombo('canonical:LS_RED_BLADE_I');comboLSSpiritGauge.value='RED';`);

// Explicit contract weapon: existing LS record identity/technique, display dragon1000. Not an actual equipment validation.
w.eval(`DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};DB.weapons[0].specials[0].damage.display=1000;DB.weapons[0].specials[0].damage.raw=100;build.charmCustom={skills:[{name:'龍属性攻撃強化',level:3},{name:'属性変換',level:3}],slots:[0,0,0],weaponSlots:[]};powerAttributeConversionNormal.value='OFF';powerAttributeConversionMaximum.value='ON';calcBuild();`);
const before=JSON.parse(w.eval('JSON.stringify({result:calcState.realOneHit,stats:calcState.stats,snapshot:buildSnapshot(),condition:compareStep5Snapshot()})'));
if(process.argv[2]==='after'){
 for(const ch of ['normal','maximum'])assert.equal(before.result.channels[ch].execution.status,'complete');
 const n=before.result.channels.normal,m=before.result.channels.maximum;
 for(let i=0;i<n.components.length;i++){if(n.components[i].id.includes(':physical:'))assert.equal(n.components[i].value,m.components[i].value);else assert.ok(m.components[i].value>n.components[i].value);}
 w.applyBuildSnapshot(before.snapshot);w.calcBuild();assert.deepEqual(JSON.parse(w.eval('JSON.stringify(calcState.realOneHit.channels)')),before.result.channels);
}else assert.notEqual(before.result.channels?.maximum?.execution?.status,'complete');
console.log(JSON.stringify({before,hash:crypto.createHash('sha256').update(fs.readFileSync('hope-hammer-browser-adapter.js')).digest('hex')},null,2));w.close();
