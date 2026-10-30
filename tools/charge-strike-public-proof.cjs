'use strict';
const fs=require('fs'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const w=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://guard-proof.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
const weapon=JSON.parse(fs.readFileSync('docs/reports/r250-stage5/evidence/hope-hammer-i.mhdb.api.json'))[0];
w.eval(`clearWeaponBuckets();DB.weapons=${JSON.stringify([weapon])};weaponIndexByKind.hammer=DB.weapons;weaponKind.value='hammer';weapon.innerHTML='<option value="387">Hope Hammer I</option>';weapon.value='387';App.build.setWeapon(DB.weapons[0]);renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};`);

w.eval(`DB.weapons[0].specials=[{element:'thunder',kind:'element',damage:{raw:50,display:500},hidden:false}];App.build.setWeapon(DB.weapons[0]);`);
let captured;const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){captured=a;return adapter.evaluateCurrent(a);}};
const take=()=>JSON.parse(w.eval('JSON.stringify(calcState.realOneHit)'));
w.eval("build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[]};calcBuild();");const off=take();
w.eval("build.charmCustom.skills=[{name:'溜打強化',level:1}];calcBuild();");const on=take();
for(const ch of ['normal','maximum']){assert.equal(on.channels[ch].execution.status,'complete',JSON.stringify(on));let positive=0,element=0;for(const x of on.channels[ch].components){const b=off.channels[ch].components.find(y=>y.id===x.id);assert.ok(b);if(x.id==='HAM_MIGHTY_CHARGE_UPPERCUT:physical:0'){assert.ok(Math.abs(x.value-b.value*1.03)<=0.011,JSON.stringify({before:b.value,after:x.value}));assert.equal(x.effectsApplied.filter(e=>e.id.startsWith('charge-strike:')).length,1);positive++;}else assert.equal(x.value,b.value);if(x.id.includes(':element:')&&x.value>0)element++;}assert.equal(positive,1);assert.ok(element>0);}
const invalidLevel=adapter.evaluateCurrent({...captured,skills:[['溜打強化',2]]}),unknown=adapter.evaluateCurrent({...captured,techniqueIds:['UNKNOWN_HAMMER_TECHNIQUE'],techniqueId:'UNKNOWN_HAMMER_TECHNIQUE'});
assert.notEqual(invalidLevel.channels?.normal?.execution?.status,'complete');assert.notEqual(unknown.channels?.normal?.execution?.status,'complete');
const snapshot=w.buildSnapshot();w.applyBuildSnapshot(snapshot);w.calcBuild();const restored=take();assert.deepEqual(restored.channels,on.channels);
const crypto=require('crypto');console.log(JSON.stringify({input:'Contract Hope Hammer387 plus synthetic thunder500, adopted four-technique combo; not legal equipment/game verification',off,on,invalidLevel,unknown,restored,hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js',__filename].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]))},null,2));w.close();
