const fs=require('fs'),assert=require('node:assert/strict'),cp=require('node:child_process'),crypto=require('node:crypto');
const {JSDOM,VirtualConsole}=require('jsdom');
const f=JSON.parse(fs.readFileSync('docs/reports/r257-thunder-conversion/fixture.json'));assert.equal(f.weapon.id,1081);assert.equal(f.decoration.skills[0].skill.id,156);assert.ok(f.weapon.slots[0]>=f.decoration.slot);assert.ok(f.armor.slots[0]>=f.decoration.slot);
const vc=new VirtualConsole(),errors=[];vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(process.argv[2]==='before-fixed'?fs.readFileSync('/tmp/dark168-before/index.html','utf8').replace(/<script\b([^>]*?)\bsrc=["']([^"']+)["']([^>]*)>\s*<\/script>/gi,(tag,a,src,b)=>/^(?:[a-z]+:)?\/\//i.test(src)?tag:`<script${a}${b}>${fs.readFileSync(src==='hope-hammer-browser-adapter.js'?'/tmp/dark168-before/'+src:src,'utf8').replace(/<\/script/gi,'<\\/script')}</script>`):require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));w.confirm=()=>true;}}),w=dom.window;
w.eval(`clearWeaponBuckets();DB.weapons=[${JSON.stringify(f.weapon)}];DB.decorations=[${JSON.stringify(f.decoration)}];DB.skills=${JSON.stringify(f.skills)};DB.armor=[${JSON.stringify(f.armor)}];weaponIndexByKind['great-sword']=DB.weapons;weaponKind.value='great-sword';weapon.innerHTML='<option value="1081">ラギアブレイドⅠ</option>';weapon.value='1081';App.build.setWeapon(DB.weapons[0]);build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[]};renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();addCombo('canonical:GS_CHARGED_SLASH_3');`);

// Contract armor records, not a claim that these resistance totals occur on a real item.
w.eval(`DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};DB.armor=[70,150].map((v,i)=>({...DB.armor[0],id:900001+i,name:'Contract thunder '+v,resistances:{...DB.armor[0].resistances,thunder:v}}));`);
w.eval(`DB.weapons[0].skills=DB.weapons[0].skills.filter(x=>x.skill.id!==165);build.charmCustom={skills:[{name:'チャージマスター',level:3}],slots:[0,0,0],weaponSlots:[]};`);
let captured;const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){captured=a;return adapter.evaluateCurrent(a)}};


const mode=process.argv[2].startsWith('before')?'before':'after',cases=[];
w.eval(`DB.weapons[0].skills=[];DB.weapons[0].damage.raw=300;build.charmCustom.skills=[];App.state.combo.moves=[];restoreComboRows();`);
const take=()=>JSON.parse(w.eval('JSON.stringify({real:calcState.realOneHit,snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot()})'));
for(const [label,dark,peak] of [['none',0,0],['dark',1,0],['dark-peak',1,5]]){
 w.eval(`build.charmCustom.skills=[${dark?"{name:'暗黒',level:1},":''}${peak?"{name:'フルチャージ',level:5}":''}];calcBuild();`);const r=take();cases.push({label,...r});
 if(mode!=='before')for(const ch of ['normal','maximum'])assert.equal(r.real.channels[ch].metrics.comboTotalDamage.status,'available',JSON.stringify(r.real));
 if(mode!=='before'&&label!=='none')w.eval(`buildName.value='${label}';saveNamedBuild();`);
}
let comparison,negative;
if(mode!=='before'){
 for(const ch of ['normal','maximum'])assert.deepEqual(cases[2].real.channels[ch].components,cases[1].real.channels[ch].components);
 assert.equal(captured.stats.conditionalConditionPlan.maximum.attackTrue,330);assert.equal(captured.stats.conditionalConditionPlan.normal.attackTrue,300);
 w.applyBuildSnapshot(cases[2].snapshot);w.calcBuild();const current=take();assert.deepEqual(current.real.channels,cases[2].real.channels);
 const saved=w.localStorage.getItem('mhws_saved_builds');w.eval("document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(x=>x.checked=true);runBuildCompare();");
 const rows=JSON.parse(w.eval('JSON.stringify(lastBuildComparisonRows.map(x=>({name:x.name,real:x.oneHitPipeline})))'));assert.equal(rows.length,2);for(const row of rows)assert.deepEqual(row.real.channels,cases.find(x=>x.label===row.name).real.channels);assert.deepEqual(take(),current);assert.equal(w.localStorage.getItem('mhws_saved_builds'),saved);comparison={rows,normalLoadMatches:true,activeUnchanged:true};
 w.eval(`App.state.combo.moves=['GS_STRONG_CHARGED_SLASH_3','GS_CHARGED_SLASH_3','GS_STRONG_WIDE_SLASH_3'].map(techniqueId=>({techniqueId}));restoreComboRows();calcBuild();`);negative=take();assert.equal(negative.real.channels.normal.metrics.comboTotalDamage.status,'available');assert.equal(negative.real.channels.maximum.metrics.comboTotalDamage.status,'unavailable');assert.ok(JSON.stringify(negative.real).includes('DARK_STANDARD_SEQUENCE_REQUIRED'));
}
console.log(JSON.stringify({mode,cases,comparison,negative,scope:'Synthetic GS raw300; public calcBuild JSDOM. No real equipment/game verification.',hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js',__filename].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(process.argv[2]==='before-fixed'&&['index.html','hope-hammer-browser-adapter.js'].includes(p)?'/tmp/dark168-before/'+p:p)).digest('hex')]))},null,2));w.close();
