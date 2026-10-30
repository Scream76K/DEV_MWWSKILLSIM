const fs=require('fs'),assert=require('node:assert/strict'),crypto=require('crypto');
const {JSDOM,VirtualConsole}=require('jsdom');
const fixture=JSON.parse(fs.readFileSync('docs/reports/r258-attribute-conversion/fixture.json')),skills=JSON.parse(fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json'));const results={};
for(const kind of ['bow']){
 const w=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://water.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));w.confirm=()=>true;}}).window;
 const weapon=kind==='long-sword'?JSON.parse(JSON.stringify(fixture.weapon)):{id:999001,gameId:999001,sharpness:{},kind:'bow',name:'SYNTHETIC_CONTRACT',damage:{raw:90,display:108},affinity:0,slots:[],skills:[],coatings:['close-range']};weapon.skills=[];weapon.specials=[{kind:'element',element:'water',damage:{raw:50,display:500}}];
 const armors=[10,200,-30].map((v,i)=>({...fixture.armor,id:990001+i,kind:'head',skills:[],resistances:{fire:0,water:v,thunder:0,ice:0,dragon:0}}));
 w.eval(`clearWeaponBuckets();DB.weapons=${JSON.stringify([weapon])};DB.skills=${JSON.stringify(skills)};DB.armor=${JSON.stringify(armors)};DB.decorations=[];weaponIndexByKind[${JSON.stringify(kind)}]=DB.weapons;weaponKind.value=${JSON.stringify(kind)};weapon.innerHTML='<option value="${weapon.id}">Contract</option>';weapon.value='${weapon.id}';App.build.setWeapon(DB.weapons[0]);build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.decos={};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[]};renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();addCombo('canonical:${kind==='bow'?'BOW_SHOT_3':'LS_RED_BLADE_I'}');`);
 if(kind==='bow')w.eval("powerBowCoating.value='NONE';powerBowRange.value='CRITICAL';powerBowStartShot.value='1';");else w.eval("comboLSSpiritGauge.value='RED';");
 let captured;const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){captured=a;return adapter.evaluateCurrent(a)}};
 const take=()=>JSON.parse(w.eval('JSON.stringify({result:calcState.realOneHit,snapshot:buildSnapshot(),conditions:compareStep5Snapshot()})'));

 const cases=[];
 const cm= w.TechniqueDBEngine.get('bow','BOW_STATE_MODIFIERS').specialSourceValues.skillRules.chargeMaster.multipliers[3];
 for(const [label,armor,extra] of [['water-only',0,[]],['boost',0,[{name:'水属性攻撃強化',level:3}]],['combined',0,[{name:'水属性攻撃強化',level:3},{name:'チャージマスター',level:3}]],['capped',1,[{name:'水属性攻撃強化',level:3},{name:'チャージマスター',level:3}]]]){
  w.eval(`build.armor.head=DB.armor[${armor}];build.charmCustom.skills=${JSON.stringify([{name:'耐性変換【水】',level:1},...extra])};calcBuild();`);
  const r=take();cases.push({label,...r});
  for(const ch of ['normal','maximum']){const c=r.result.channels[ch];assert.equal(c?.execution?.status,'complete',JSON.stringify(r.result));const d=c.components[0].details,b=d.elementBasis;assert.equal(b.weaponBase,500);const expected=Math.min(500*b.normalMultiplier*(extra.some(x=>x.name==='チャージマスター')?cm:1)+b.normalFlat+b.conditionalFlat,1150);assert.equal(d.effectiveDisplayedElement,expected);assert.equal(c.diagnostics.waterResistanceConversion.effectiveElement,expected);assert.equal(c.diagnostics.waterResistanceConversion.add,armor===0?40:800);assert.equal(d.physical,cases[0].result.channels[ch].components[0].details.physical);}
 }
 assert.ok(cases[2].result.channels.normal.components[0].details.effectiveDisplayedElement<1150);
 assert.equal(cases[3].result.channels.normal.components[0].details.effectiveDisplayedElement,1150);
 w.applyBuildSnapshot(cases[2].snapshot);w.calcBuild();assert.deepEqual(take().result.channels,cases[2].result.channels);
 results[kind]={cm,cases,combinedSnapshotRestored:true};w.close();
}
console.log(JSON.stringify({scope:'Synthetic water500 Bow; existing public calcBuild; adopted Water Attack/CM/water resistance conversion combination, not legal equipment or game validation',results,hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js','himmel-real-browser-bundle.js',__filename].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]))},null,2));
