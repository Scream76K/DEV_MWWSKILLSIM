const fs=require('fs'),assert=require('node:assert/strict'),crypto=require('crypto');
const {JSDOM,VirtualConsole}=require('jsdom');
const mode=process.argv[2]||'after';
const dom=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://proof.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));w.confirm=()=>true;}}),w=dom.window;
const weapon=JSON.parse(fs.readFileSync('docs/reports/r252-generic-states/evidence/mhdb-gunlance-hope.api.json'));
w.eval(`clearWeaponBuckets();DB.weapons=[${JSON.stringify(weapon)}];DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};DB.weapons[0].skills=[];weaponIndexByKind['gunlance']=DB.weapons;weaponKind.value='gunlance';weapon.innerHTML='<option value="315">Hope</option>';weapon.value='315';App.build.setWeapon(DB.weapons[0]);build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.decos={};renderComboForWeapon();comboGLType.value='NORMAL';comboGLPower.value='MEDIUM';comboGLLoaded.value='6';comboGLCharged.value='2';comboGLFireHz.value='20';App.combo.syncFromDOM();renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';`);

const adapter=w.MHWRealOneHitBrowserAdapter;let missing=true;
w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){const b={...a,trainingRoom:{...a.trainingRoom,parts:a.trainingRoom.parts.map(p=>{const q={...p,wounded:true};if(missing)delete q.originalMultipliers;else q.originalMultipliers={...p.multipliers};return q;})}};return adapter.evaluateCurrent(b);}};
const rows=[];
for(const [label,skill,omit] of [['blunt-known','鈍器使い',false],['blunt-missing','鈍器使い',true],['mind-missing','心眼',true]]){
 missing=omit;
 w.eval(`App.state.combo.moves=[{techniqueId:'canonical:GL_SLAM'}];restoreComboRows();build.charmCustom={skills:[{name:'攻撃',level:5},{name:'${skill}',level:3}],slots:[0,0,0],weaponSlots:[]};calcBuild();`);
 rows.push({label,skill,omit,result:JSON.parse(w.eval('JSON.stringify(calcState.realOneHit)'))});
}
console.log(JSON.stringify({mode,scope:'Public calcBuild with synthetic wounded target injected at adapter input; current hitzones unchanged. Not real equipment/game proof.',rows,hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js',__filename].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]))},null,2));
if(mode==='after'){
 for(const ch of ['normal','maximum']){assert.equal(rows[1].result.channels[ch].execution.status,'complete');assert.deepEqual(rows[1].result.channels[ch].metrics,rows[0].result.channels[ch].metrics);}
 assert.ok(JSON.stringify(rows[2].result).includes('ORIGINAL_HITZONE_UNRESOLVED'));
}else assert.ok(JSON.stringify(rows[1].result).includes('ORIGINAL_HITZONE_UNRESOLVED'));
w.close();
