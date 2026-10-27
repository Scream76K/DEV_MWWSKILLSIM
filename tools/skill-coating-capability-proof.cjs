'use strict';
// Normal shell resource contract using captured calcBuild input and real shell DB.
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),crypto=require('crypto');
const repo=path.resolve(__dirname,'..');const {JSDOM,VirtualConsole}=require('jsdom');
const d=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://routing.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}),w=d.window;
if(process.env.BASELINE)w.eval(require('child_process').execFileSync('git',['show','HEAD:hope-hammer-browser-adapter.js'],{cwd:repo,encoding:'utf8'}));
const weapon={id:999001,gameId:999001,sharpness:{},kind:'bow',name:'SYNTHETIC_CONTRACT',damage:{raw:90,display:108},affinity:0,slots:[],skills:[],specials:[{kind:'element',element:'fire',damage:{raw:10,display:100}}],coatings:['close-range']};
w.eval(`clearWeaponBuckets();DB.weapons=${JSON.stringify([weapon])};weaponIndexByKind['bow']=[DB.weapons[0]];weaponKind.value='bow';weapon.innerHTML='<option value="999001">Hope</option>';weapon.value='999001';renderComboForWeapon();App.state.combo.moves=[{techniqueId:'BOW_SHOT_3'}];DB.monsters=[{id:'training-room',name:'訓練場',parts:[{id:'training-front',name:'正面',multipliers:{slash:.4,blunt:.8,pierce:.5,fire:.2,water:.2,thunder:.2,ice:.2,dragon:.2}}]}];renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';`);
let args;const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){args=a;return adapter.evaluateCurrent(a)}};w.calcBuild();assert.ok(args);args={...args,trainingRoom:{...args.trainingRoom,parts:args.trainingRoom.parts.map(p=>p.id==='training-front'?{...p,multipliers:{...p.multipliers,slash:.4,blunt:.8,fire:.2}}:p)}};
w.eval(`DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};`);
const names=['爆破ビン追加','麻痺ビン追加','減気ビン追加','睡眠ビン追加','毒ビン追加'];
const input={...args,equipmentSkillsResolved:true,bowState:{chargeLevel:3,range:'CRITICAL',coating:'NONE',startShot:3},techniqueIds:['BOW_SHOT_3']};
const base=adapter.evaluateCurrent({...input,skills:[]});const unused=adapter.evaluateCurrent({...input,skills:names.map(n=>[n,1])});
const rejected=adapter.evaluateCurrent({...input,skills:names.map(n=>[n,1]),bowState:{...input.bowState,coating:'POISON'}});
if(!process.env.BASELINE){for(const ch of ['normal','maximum']){assert.equal(unused.channels[ch].execution.status,'complete');assert.deepEqual(unused.channels[ch].metrics.comboTotalDamage,base.channels[ch].metrics.comboTotalDamage);}assert.ok(rejected.status==='unavailable'||rejected.channels?.maximum?.metrics.comboTotalDamage?.status!=='available');}
console.log(JSON.stringify({base,unused,rejected,hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]))},null,2));w.close();
