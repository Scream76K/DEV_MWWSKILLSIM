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
for(const i of [-1,0,1]){
 w.eval(`build.armor.head=${i<0?'null':'DB.armor['+i+']'};build.charmCustom.skills=[{name:'チャージマスター',level:3},...${i<0?'[]':"[{name:'耐性変換【雷】',level:1}]"}];calcBuild();`);
 const r=take();cases.push(r);
 if(i>=0)w.eval(`buildName.value='${i===0?'below':'capped'}';saveNamedBuild();`);
}
const checks={};
for(const [i,r] of cases.entries())for(const ch of ['normal','maximum']){
 if(mode==='before'&&i>0){assert.notEqual(r.real.channels?.[ch]?.execution?.status,'complete');continue;}
 assert.ok(r.real.channels,r.real.reason);const c=r.real.channels[ch];assert.equal(c.execution.status,'complete');
 if(i===0)continue;
 const d=c.diagnostics.thunderResistanceConversion;assert.equal(d.effectiveElement,[625,975,1150][i]);assert.equal(d.uncappedElement,[625,975,1375][i]);assert.equal(d.capLimit,1150);
 for(let j=0;j<c.components.length;j++){const z=c.components[j],baseline=cases[0].real.channels[ch].components[j];if(z.id.includes(':physical:'))assert.equal(z.value,baseline.value);else {assert.equal(z.effectsApplied.filter(e=>e.id==='thunder-resistance-conversion-element-add').length,1);assert.ok(Math.abs(z.value/baseline.value-[1,975/625,1150/625][i])<.001);}}
}
let comparison;
if(mode==='after'){
 const before=take();w.eval(`document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(x=>x.checked=true);runBuildCompare();`);
 const rows=JSON.parse(w.eval('JSON.stringify(lastBuildComparisonRows.map(x=>({name:x.name,real:x.oneHitPipeline})))')),after=take();
 assert.equal(rows.length,2);for(const [i,name] of ['below','capped'].entries())assert.deepEqual(rows.find(x=>x.name===name).real.channels,cases[i+1].real.channels);assert.deepEqual(after,before);
 comparison={before,rows,after,conditionsUnchanged:true,snapshotUnchanged:true};checks.channelsPhysicalUnchangedAndOneFlat=true;
}
w.eval(`DB.weapons[0].specials[0].element='dragon';build.armor.head=null;build.charmCustom={skills:[{name:'チャージマスター',level:3},{name:'属性変換',level:3}],slots:[0,0,0],weaponSlots:[]};powerAttributeConversionNormal.value='OFF';powerAttributeConversionMaximum.value='ON';calcBuild();`);
const dragon=take();
if(mode==='after')for(const [ch,value] of [['normal',625],['maximum',805]]){const c=dragon.real.channels[ch];assert.equal(c.execution.status,'complete');assert.equal(c.diagnostics.attributeConversion.effectiveElement,value);for(const z of c.components.filter(z=>z.id.includes(':element:'))){assert.equal(z.details.appliedElement,value);assert.equal(z.effectsApplied.filter(e=>e.id.startsWith('gs-charge-master:')).length,1);assert.equal(z.effectsApplied.filter(e=>e.id==='attribute-conversion-element-add').length,ch==='maximum'?1:0);}}
else assert.equal(dragon.real.reason,'REAL_SLICE:ATTRIBUTE_CONVERSION_CAP_INTERACTION_UNRESOLVED');
let unsupported;
if(mode==='after'){unsupported=adapter.evaluateCurrent({...captured,techniqueIds:['GS_DARK_ARTS_WAVE'],techniqueId:'GS_DARK_ARTS_WAVE'});assert.equal(unsupported.reason,'REAL_SLICE:GS_CHARGE_MASTER_TECHNIQUE_NOT_ADOPTED');}
console.log(JSON.stringify({mode,dragon,unsupported,inputScope:'Contract armor resistances70/150; real captured GS1081 base thunder500; no live equipment legality claim',cases,comparison,checks,hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js','himmel-real-browser-bundle.js',__filename].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]))},null,2));w.close();
