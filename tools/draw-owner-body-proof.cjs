const fs=require('fs'),assert=require('node:assert/strict'),crypto=require('crypto');
const {JSDOM,VirtualConsole}=require('jsdom');
const mode=process.argv[2]||'after';
const html=require('./dom-test-setup.cjs').readSimulatorHtml();
const dom=new JSDOM(html,{url:'https://proof.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));w.confirm=()=>true;}}),w=dom.window;
const weapon=JSON.parse(fs.readFileSync('docs/reports/r252-generic-states/evidence/mhdb-gunlance-hope.api.json'));
w.eval(`clearWeaponBuckets();DB.weapons=[${JSON.stringify(weapon)}];DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};DB.weapons[0].skills=[];weaponIndexByKind['gunlance']=DB.weapons;weaponKind.value='gunlance';weapon.innerHTML='<option value="315">Hope</option>';weapon.value='315';App.build.setWeapon(DB.weapons[0]);build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.decos={};renderComboForWeapon();comboGLType.value='NORMAL';comboGLPower.value='MEDIUM';comboGLLoaded.value='2';comboGLCharged.value='1';comboGLFireHz.value='20';App.combo.syncFromDOM();renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';`);
let calls=[];const shell=w.GunlanceShellReference;
w.GunlanceShellReference={...shell,calculate(o,...rest){try{const r=shell.calculate(o,...rest);calls.push({input:JSON.parse(JSON.stringify(o)),result:JSON.parse(JSON.stringify(r))});return r;}catch(e){calls.push({input:JSON.parse(JSON.stringify(o)),error:String(e)});throw e;}}};
const take=()=>JSON.parse(w.eval('JSON.stringify({result:calcState.realOneHit,snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot()})'));



const rows=[];
for(const on of [false,true]){w.eval(`App.state.combo.moves=[{techniqueId:'GL_SLAM'}];restoreComboRows();build.charmCustom={skills:[{name:'Attack Boost',level:5},...(${on}?[{name:'抜刀術【力】',level:3},{name:'抜刀術【技】',level:3}]:[])],slots:[0,0,0],weaponSlots:[]};`);for(const p of ['Draw','Punishing'])for(const ch of ['Normal','Maximum'])w.document.getElementById('power'+p+'Hits'+ch).value=JSON.stringify({GL_SLAM:[true]});w.calcBuild();rows.push(take());}
for(const ch of ['normal','maximum']){assert.equal(rows[1].result.channels[ch].metrics.comboTotalDamage.status,'available');assert.deepEqual(rows[0].result.channels[ch].components,rows[1].result.channels[ch].components);assert.deepEqual(rows[0].result.channels[ch].metrics,rows[1].result.channels[ch].metrics);}
console.log(JSON.stringify({rows,scope:'Public ordinary GL_SLAM with active explicit draw selection; synthetic skills, not equipment legality',hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]))},null,2));w.close();
