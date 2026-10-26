'use strict';
// Normal shell resource contract using captured calcBuild input and real shell DB.
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),crypto=require('crypto');
const repo=path.resolve(__dirname,'..');const {JSDOM,VirtualConsole}=require('jsdom');
const d=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://routing.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}),w=d.window;
if(process.env.BASELINE)w.eval(require('child_process').execFileSync('git',['show','HEAD:hope-hammer-browser-adapter.js'],{cwd:repo,encoding:'utf8'}));
const weapon=JSON.parse(fs.readFileSync(path.join(repo,'docs/reports/r252-generic-states/evidence/mhdb-gunlance-hope.api.json')));
w.eval(`clearWeaponBuckets();DB.weapons=${JSON.stringify([weapon])};weaponIndexByKind['gunlance']=[DB.weapons[0]];weaponKind.value='gunlance';weapon.innerHTML='<option value="315">Hope</option>';weapon.value='315';renderComboForWeapon();comboGLType.value='NORMAL';comboGLPower.value='MEDIUM';comboGLLoaded.value='6';comboGLCharged.value='1';comboGLFireHz.value='20';App.combo.syncFromDOM();App.state.combo.moves=[{techniqueId:'reference:gl_NORMAL'}];`);
w.eval(`DB.monsters=[{id:'training-room',name:'訓練場',parts:[{id:'training-front',name:'正面',multipliers:{slash:.5,blunt:.5,pierce:.5,fire:.2,water:.2,thunder:.2,ice:.2,dragon:.2}}]}];renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';`);
let args,config;const adapter=w.MHWRealOneHitBrowserAdapter,create=w.HimmelRealOneHitPipeline;
w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){args=a;return adapter.evaluateCurrent(a)}};
w.HimmelRealOneHitPipeline=o=>{config=o;return create(o)};w.calcBuild();assert.ok(args);
const ids=['GL_SLAM','reference:gl_NORMAL','GL_SWEEP','reference:gl_CHARGED'];
const rows=[];
for(const loaded of [3,2]){
 const input={...args,gunlanceState:{...args.gunlanceState,loadedRounds:loaded,chargedRounds:2},techniqueIds:ids};
 const before=JSON.stringify(input.gunlanceState),result=adapter.evaluateCurrent(input);
 assert.equal(JSON.stringify(input.gunlanceState),before);rows.push({loaded,result});
 if(process.env.BASELINE)continue;
 for(const ch of ['normal','maximum']){
  assert.ok(result.channels,JSON.stringify(result));const r=result.channels[ch];
  if(loaded===3){assert.equal(r.metrics.comboTotalDamage.status,'available',JSON.stringify(r));assert.equal(r.finalState.gunlance.loadedRounds,0);assert.equal(JSON.stringify(r.components.map(c=>Number(c.value.toFixed(2)))),JSON.stringify([43.09,0,8.6,30.24,0,28.72]));
   const singles=ids.map(id=>adapter.evaluateCurrent({...input,techniqueIds:[id]}).channels[ch]);
   assert.ok(singles.every(c=>c.metrics.comboTotalDamage.status==='available'));
   assert.ok(Math.abs(r.metrics.comboTotalDamage.value-singles.reduce((sum,c)=>sum+c.metrics.comboTotalDamage.value,0))<1e-9);
   assert.equal(r.components.length,singles.reduce((sum,c)=>sum+c.components.length,0));
  }else{assert.equal(r.metrics.comboTotalDamage.status,'unavailable');assert.match(JSON.stringify(r),/GL_CHARGED_ROUNDS_INSUFFICIENT/);assert.equal(r.finalState.gunlance.loadedRounds,1);}
 }
}
console.log(JSON.stringify({executionSha:require('child_process').execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),adapterHash:crypto.createHash('sha256').update(fs.readFileSync('hope-hammer-browser-adapter.js')).digest('hex'),ids,rows},null,2));w.close();
