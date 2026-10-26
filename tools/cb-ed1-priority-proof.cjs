const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto'),cp=require('node:child_process');
const {JSDOM,VirtualConsole}=require('/Users/scream/Documents/Codex/2026-10-18/task/himmel-db-route-pqr4v6qt/dependencies/node_modules/jsdom');
let html=require(process.cwd()+'/tools/dom-test-setup.cjs').readSimulatorHtml();
const adapterPath='hope-hammer-browser-adapter.js',adapter=process.env.BEFORE_ADAPTER_SHA?cp.execFileSync('git',['show',process.env.BEFORE_ADAPTER_SHA+':'+adapterPath],{encoding:'utf8'}):fs.readFileSync(adapterPath,'utf8');
if(process.env.BEFORE_ADAPTER_SHA)html=html.replace(fs.readFileSync(adapterPath,'utf8'),adapter);
const f=JSON.parse(fs.readFileSync(process.env.CB_MORPH_FIXTURE||'docs/reports/r254-cb-rapid-morph/fixture.json'));assert.equal(f.decoration.skills[0].skill.id,7);assert.equal(f.decoration.skills[0].level,3);assert.ok(f.weapon.slots[0]>=f.decoration.slot);
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(html,{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));w.confirm=()=>true;}}),w=dom.window,copy=x=>JSON.parse(JSON.stringify(x));
w.eval(`clearWeaponBuckets();DB.weapons=[${JSON.stringify(f.weapon)}];DB.decorations=[${JSON.stringify(f.decoration)}];DB.skills=[${JSON.stringify(f.skill)}];DB.armor=[];weaponIndexByKind['charge-blade']=DB.weapons;weaponKind.value='charge-blade';weapon.innerHTML='<option value="147">Tempus Gear</option>';weapon.value='147';App.build.setWeapon(DB.weapons[0]);build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[]};build.artia={production:'attack',element:'water',parts:['attack','attack','attack'],sameElementPartCount:3,restores:['none','none','none','none','none'],seriesSkill:'',groupSkill:''};renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();comboCBShield.value='1';comboCBAxe.value='0';comboCBPhialType.value='IMPACT';comboCBEnhancedPhial.value='1';`);

const out={codeSHA:cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js','himmel-real-browser-bundle.js'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')])),cases:[],checks:[]};
const take=()=>copy(w.eval('({real:calcState.realOneHit,summary:buildSummary.textContent,snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot()})'));
w.eval(`App.state.combo.moves=[];restoreComboRows();addCombo('canonical:CB_ELEMENT_DISCHARGE_1');comboCBEnhancedPhial.value='0';`);


for(const [name,axe,normal,enhanced] of [['ENHANCED',true,1,.5],['NORMAL',true,1,0],['CROSS',false,1,.5]]){
 w.eval(`comboCBPreviousAction.value='CHARGE';comboCBAxe.value='${axe?'1':'0'}';comboCBNormalPhials.value='${normal}';comboCBEnhancedPhials.value='${enhanced}';build.decos={};calcBuild();`);out.cases.push({name,...take()});
}
try{
 for(const ch of ['normal','maximum']){
  const e=out.cases[0].real.channels[ch],n=out.cases[1].real.channels[ch];
  for(const r of [e,n]){assert.equal(r.metrics.comboTotalDamage.status,'available');assert.equal(r.finalState.chargeBlade.enhancedPhials,0);assert.equal(r.finalState.chargeBlade.previousAction,'CB_ELEMENT_DISCHARGE_1');assert.equal(r.components.length,11);}
  assert.equal(e.finalState.chargeBlade.normalPhials,1);assert.equal(n.finalState.chargeBlade.normalPhials,.5);
  const ep=e.components.find(c=>c.id.includes(':phial:')),np=n.components.find(c=>c.id.includes(':phial:'));
  assert.equal(ep.details.consumption.kind,'ENHANCED');assert.equal(np.details.consumption.kind,'NORMAL');assert.equal(ep.details.consumption.amount,.5);assert.equal(ep.details.explosionHitCount,1);assert.ok(ep.details.coefficient>np.details.coefficient);
  const body=r=>r.components.filter(c=>!c.id.includes(':phial:')).map(c=>c.value);assert.equal(JSON.stringify(body(e)),JSON.stringify(body(n)));
 }
 assert.equal(out.cases[2].real.reason,'REAL_SLICE:CB_ED1_CROSS_TYPE_DAMAGE_ALLOCATION_UNRESOLVED');out.checks.push({pass:true});
}catch(e){out.checks.push({pass:false,error:e.stack});}
console.log(JSON.stringify(out,null,2));w.close();process.exitCode=out.checks.some(x=>!x.pass)?1:0;
