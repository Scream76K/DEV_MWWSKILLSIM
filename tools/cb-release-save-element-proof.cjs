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


const ids=['CB_ELEMENT_DISCHARGE_1','CB_ELEMENT_DISCHARGE_2','CB_AED','CB_FOLLOWUP_AED'];
w.eval(`App.state.combo.moves=[];restoreComboRows();${ids.map(id=>`addCombo('canonical:${id}');`).join('')}comboCBPreviousAction.value='CHARGE';comboCBShield.value='1';comboCBAxe.value='1';`);
try{
 for(const [name,normal,enhanced,level] of [['A',1.5,.5,0],['B',2,0,3]]){
  w.eval(`comboCBNormalPhials.value='${normal}';comboCBEnhancedPhials.value='${enhanced}';build.decos=${level?"{w0:'46'}":"{}"};calcBuild();buildName.value='${name}';saveNamedBuild();`);out.cases.push({name,...take()});
 }
 w.document.querySelector('[data-build-load="A"]').click();out.loadedA=take();assert.deepEqual(out.loadedA.real.channels,out.cases[0].real.channels);assert.equal(w.document.getElementById('comboCBEnhancedPhials').value,'0.5');
 w.eval(`comboCBNormalPhials.value='2';comboCBEnhancedPhials.value='0';calcBuild();`);out.sharedA=take();
 w.document.querySelector('[data-build-load="B"]').click();out.loadedB=take();assert.deepEqual(out.loadedB.real.channels,out.cases[1].real.channels);
 out.before=take();w.eval(`document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(x=>x.checked=true);runBuildCompare();`);out.rows=copy(w.eval('lastBuildComparisonRows.map(x=>({name:x.name,real:x.oneHitPipeline}))'));out.after=take();assert.deepEqual(out.after,out.before);
 for(const row of out.rows){const expected=row.name==='A'?out.sharedA:out.loadedB;assert.deepEqual(row.real.channels,expected.real.channels);for(const ch of ['normal','maximum'])assert.equal(row.real.channels[ch].metrics.comboTotalDamage.status,'available');assert.equal(row.real.conditionKey,out.rows[0].real.conditionKey);}
 const pf=JSON.parse(fs.readFileSync('docs/reports/r250-stage6/evidence/cb103-conditional-ab-fixture.json'));out.powerElementSource='docs/reports/r250-stage6/evidence/cb103-conditional-ab-fixture.json';out.powerElementWeapon=pf.weapon;
 w.__powerWeapon=pf.weapon;w.eval(`DB.weapons=[window.__powerWeapon];weaponIndexByKind['charge-blade']=DB.weapons;weapon.innerHTML='<option value="103">Uth Valero II</option>';weapon.value='103';App.build.setWeapon(DB.weapons[0]);build.decos={};comboCBPhialType.value='POWER_ELEMENT';comboCBNormalPhials.value='1.5';comboCBEnhancedPhials.value='0.5';calcBuild();`);out.powerElement=take();
 for(const ch of ['normal','maximum']){const r=out.powerElement.real.channels[ch];assert.equal(r.metrics.comboTotalDamage.status,'available',JSON.stringify(out.powerElement.real));const p=r.components.filter(c=>c.id.includes(':phial:'));assert.deepEqual(p.map(x=>x.details.phialType),Array(4).fill('POWER_ELEMENT'));assert.deepEqual(p.map(x=>x.details.coefficient),[2.4,2.1,4.2,4.2]);p.forEach((x,i)=>assert.ok(Math.abs(x.value-pf.weapon.specials[0].damage.display/10*[2.4,2.1,4.2,4.2][i]*1.3*.3*[1,2,2,3][i])<1e-8));assert.equal(r.finalState.chargeBlade.normalPhials,0);}
 out.checks.push({pass:true});
}catch(e){out.checks.push({pass:false,error:e.stack});}
console.log(JSON.stringify(out,null,2));w.close();process.exitCode=out.checks.some(x=>!x.pass)?1:0;
