const fs=require('fs'),assert=require('node:assert/strict'),cp=require('node:child_process'),crypto=require('node:crypto');
const {JSDOM,VirtualConsole}=require('jsdom');
const f=JSON.parse(fs.readFileSync('docs/reports/r257-thunder-conversion/fixture.json'));assert.equal(f.weapon.id,1081);assert.equal(f.decoration.skills[0].skill.id,156);assert.ok(f.weapon.slots[0]>=f.decoration.slot);assert.ok(f.armor.slots[0]>=f.decoration.slot);
const vc=new VirtualConsole(),errors=[];vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));w.confirm=()=>true;}}),w=dom.window;
w.eval(`clearWeaponBuckets();DB.weapons=[${JSON.stringify(f.weapon)}];DB.decorations=[${JSON.stringify(f.decoration)}];DB.skills=${JSON.stringify(f.skills)};DB.armor=[${JSON.stringify(f.armor)}];weaponIndexByKind['great-sword']=DB.weapons;weaponKind.value='great-sword';weapon.innerHTML='<option value="1081">ラギアブレイドⅠ</option>';weapon.value='1081';App.build.setWeapon(DB.weapons[0]);build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[]};renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();addCombo('canonical:GS_CHARGED_SLASH_3');`);

// Contract armor records, not a claim that these resistance totals occur on a real item.
w.eval(`DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};DB.armor=[70,150].map((v,i)=>({...DB.armor[0],id:900001+i,name:'Contract thunder '+v,resistances:{...DB.armor[0].resistances,thunder:v}}));`);
w.eval(`DB.weapons[0].skills=DB.weapons[0].skills.filter(x=>x.skill.id!==165);build.charmCustom={skills:[{name:'チャージマスター',level:3}],slots:[0,0,0],weaponSlots:[]};`);
let captured;const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){captured=a;return adapter.evaluateCurrent(a)}};
const mode=process.argv[2],cases=[];
const take=()=>JSON.parse(w.eval('JSON.stringify({real:calcState.realOneHit,conditions:compareStep5Snapshot(),snapshot:buildSnapshotComparable(buildSnapshot())})'));

w.eval(`const dragonContract=JSON.parse(JSON.stringify(DB.weapons[0]));dragonContract.id=999002;dragonContract.gameId=999002;dragonContract.specials[0].element='dragon';DB.weapons.push(dragonContract);DB.weapons.forEach((x,i)=>{x.skills=[{skill:DB.skills.find(s=>s.id===13),level:i?3:1},{skill:DB.skills.find(s=>s.id===95),level:i?5:1}];});weapon.innerHTML+='<option value="999002">Dragon contract</option>';`);
for(const [label,element,armor,coal,burst,conv,expected] of [
 ['thunder-low','thunder',0,1,1,'耐性変換【雷】',[975,1117.5]],
 ['thunder-cap','thunder',1,1,1,'耐性変換【雷】',[1150,1150]],
 ['dragon-cap','dragon',-1,3,5,'属性変換',[625,1150]]]){
 w.eval(`weapon.value='${element==='dragon'?999002:1081}';App.build.setWeapon(DB.weapons.find(x=>x.id===Number(weapon.value)));build.armor.head=${armor<0?'null':'DB.armor['+armor+']'};build.charmCustom.skills=${JSON.stringify([{name:'チャージマスター',level:3},{name:conv,level:element==='dragon'?3:1}])};powerAttributeConversionNormal.value='OFF';powerAttributeConversionMaximum.value='ON';calcBuild();`);
 const r=take();cases.push({label,...r});
 if(mode==='before'){assert.equal(r.real.reason,element==='dragon'?'REAL_SLICE:ATTRIBUTE_CONVERSION_CAP_INTERACTION_UNRESOLVED':'REAL_SLICE:THUNDER_CONVERSION_CAP_OR_ROUNDING_SCOPE_UNRESOLVED');continue;}
 for(const [i,ch] of ['normal','maximum'].entries()){const c=r.real.channels[ch];assert.equal(c?.execution?.status,'complete',JSON.stringify(r.real));for(const z of c.components.filter(z=>z.id.includes(':element:'))){assert.equal(z.details.appliedElement,expected[i]);assert.equal(z.effectsApplied.filter(e=>e.id.startsWith('gs-charge-master:')).length,1);}}
 w.eval(`buildName.value='${label}';saveNamedBuild();`);
}
let comparison,negative;
if(mode!=='before'){
 const before=take();w.eval("document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(x=>x.checked=true);runBuildCompare();");const rows=JSON.parse(w.eval('JSON.stringify(lastBuildComparisonRows.map(x=>({name:x.name,real:x.oneHitPipeline})))'));assert.equal(rows.length,3);for(const c of cases)assert.deepEqual(rows.find(x=>x.name===c.label).real.channels,c.real.channels);assert.deepEqual(take(),before);comparison={rows,activeUnchanged:true};
 negative=adapter.evaluateCurrent({...captured,skills:captured.skills.map(x=>x[0]==='属性変換'?[x[0],4]:x)});assert.notEqual(negative.channels?.maximum?.execution?.status,'complete');assert.ok(JSON.stringify(negative).includes('ATTRIBUTE_CONVERSION_RULE_UNRESOLVED'));assert.ok(!JSON.stringify(negative).includes('TECHNIQUE_NOT_FOUND'));
}
console.log(JSON.stringify({mode,cases,comparison,negative,scope:'Synthetic armor; adopted GS charged slash; no legal equipment/game claim',hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js','himmel-real-browser-bundle.js',__filename].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]))},null,2));w.close();
