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
w.eval(`DB.weapons[0].skills=[];const baseArmor=DB.armor[0];DB.armor=[];for(const [g,value] of [10,10].entries())for(const [i,kind] of ['head','chest','arms','waist'].entries()){DB.armor.push({...baseArmor,id:980000+g*10+i,kind,skills:[172].map(id=>{const skill=DB.skills.find(x=>x.id===id);return {...skill.ranks[0],skill};}),resistances:{fire:0,water:0,thunder:i===0?value:0,ice:0,dragon:0}});}const dragon=JSON.parse(JSON.stringify(DB.weapons[0]));dragon.id=999002;dragon.gameId=999002;dragon.specials[0].element='dragon';DB.weapons.push(dragon);weapon.innerHTML+='<option value="999002">Dragon contract</option>';`);
const take=()=>JSON.parse(w.eval('JSON.stringify({real:calcState.realOneHit,stats:calcState.stats,snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot()})'));



for(const [label,dragon,peak,heroics] of [['thunder',false,0,0],['peak',false,5,0],['dragon-health',true,5,5]]){
 w.eval(`weapon.value='${dragon?999002:1081}';App.build.setWeapon(DB.weapons.find(x=>x.id===Number(weapon.value)));build.armor={head:DB.armor[0],chest:DB.armor[1],arms:null,waist:null,legs:null};build.charmCustom.skills=[{name:'${dragon?'属性変換':'耐性変換【雷】'}',level:${dragon?3:1}},${peak?"{name:'フルチャージ',level:5},":''}${heroics?"{name:'火事場力',level:5},":''}];powerAttributeConversionNormal.value='OFF';powerAttributeConversionMaximum.value='ON';calcBuild();`);
 const r=take();cases.push({label,...r});
 if(mode==='before'){assert.equal(r.real.reason,dragon?'REAL_SLICE:ATTRIBUTE_CONVERSION_CAP_INTERACTION_UNRESOLVED':'REAL_SLICE:THUNDER_CONVERSION_CAP_OR_ROUNDING_SCOPE_UNRESOLVED');continue;}
 for(const ch of ['normal','maximum'])assert.equal(r.real.channels[ch].execution.status,'complete',JSON.stringify(r.real));
 const n=r.real.channels.normal,m=r.real.channels.maximum;
 for(const c of n.components.filter(c=>c.id.includes(':element:')))assert.equal(c.details.appliedElement,dragon?500:550);
 if(!peak){for(const c of m.components.filter(c=>c.id.includes(':element:')))assert.equal(c.details.appliedElement,650);assert.equal(m.effectPlan.effects.filter(e=>e.id==='dark-arts-body-element-multiplier').length,1);}
 else {const b=m.diagnostics.healthBranchComparison;assert.equal(b.status,'RESOLVED');assert.equal(m.metrics.comboTotalDamage.value,Math.max(...b.branches.map(x=>x.value)));for(const x of b.branches){assert.equal(x.execution.status,'complete');assert.equal(x.effectPlan.effects.filter(e=>e.id==='dark-arts-body-element-multiplier').length,x.state==='FULL_HEALTH'?0:1);assert.equal(x.effectPlan.effects.filter(e=>e.id===(dragon?'attribute-conversion-element-add':'thunder-resistance-conversion-element-add')).length,1);}}
 if(!dragon){w.eval(`buildName.value='${label}';saveNamedBuild();`);}
}
let comparison,negative;
if(mode!=='before'){
 w.applyBuildSnapshot(cases[1].snapshot);w.calcBuild();assert.deepEqual(take().real.channels,cases[1].real.channels);const current=take();
 w.eval("document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(x=>x.checked=true);runBuildCompare();");const rows=JSON.parse(w.eval('JSON.stringify(lastBuildComparisonRows.map(x=>({name:x.name,real:x.oneHitPipeline})))'));assert.equal(rows.length,2);for(const row of rows)assert.deepEqual(row.real.channels,cases.find(x=>x.label===row.name).real.channels);assert.deepEqual(take(),current);comparison={rows,normalLoadMatches:true,activeUnchanged:true};
 const stats={...captured.stats,activeBonusEffects:captured.stats.activeBonusEffects.map(e=>({...e,rankLevel:2}))};stats.conditionalConditionPlan=w.MHWStandardPowerConditionPlan(stats,Object.fromEntries(captured.skills),'great-sword',captured.conditions);negative=adapter.evaluateCurrent({...captured,stats});assert.notEqual(negative.status,'complete');assert.ok(JSON.stringify(negative).includes('UNRESOLVED'));
}
console.log(JSON.stringify({mode,cases,comparison,negative,scope:'Synthetic GS two-piece172 rankI, not legal equipment/game proof; 168 excluded',hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js',__filename].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]))},null,2));w.close();
