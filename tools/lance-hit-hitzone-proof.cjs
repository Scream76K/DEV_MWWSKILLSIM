'use strict';
// Normal shell resource contract using captured calcBuild input and real shell DB.
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),crypto=require('crypto');
const repo=path.resolve(__dirname,'..');const {JSDOM,VirtualConsole}=require('jsdom');
const d=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://routing.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}),w=d.window;
if(process.env.BASELINE)w.eval(require('child_process').execFileSync('git',['show','HEAD:hope-hammer-browser-adapter.js'],{cwd:repo,encoding:'utf8'}));
const weapon=JSON.parse(fs.readFileSync(path.join(repo,'docs/reports/r252-generic-states/evidence/mhdb-lance-hope.api.json')));
w.eval(`clearWeaponBuckets();DB.weapons=${JSON.stringify([weapon])};weaponIndexByKind['lance']=[DB.weapons[0]];weaponKind.value='lance';weapon.innerHTML='<option value="685">Hope</option>';weapon.value='685';renderComboForWeapon();App.state.combo.moves=[{techniqueId:'LAN_MID_THRUST_I'}];DB.monsters=[{id:'training-room',name:'訓練場',parts:[{id:'training-front',name:'正面',multipliers:{slash:.4,blunt:.8,pierce:.5,fire:.2,water:.2,thunder:.2,ice:.2,dragon:.2}}]}];renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';`);
let args;const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){args=a;return adapter.evaluateCurrent(a)}};w.calcBuild();assert.ok(args);args={...args,trainingRoom:{...args.trainingRoom,parts:args.trainingRoom.parts.map(p=>p.id==='training-front'?{...p,multipliers:{...p.multipliers,slash:.4,blunt:.8}}:p)}};
const rows=[];const original=args.techniqueDb;
for(const id of ['LAN_MID_THRUST_I','LAN_MID_THRUST_II','LAN_MID_THRUST_III','LAN_TRIPLE_THRUST','unknown']){
 const record=JSON.parse(JSON.stringify(original.get('lance',id==='unknown'?'LAN_MID_THRUST_I':id)));
 if(id==='unknown')record.hits[0].damageType='unknown';
 const techniqueDb={...original,get:(kind,key)=>key===(id==='unknown'?'LAN_MID_THRUST_I':id)?record:original.get(kind,key)};
 const result=adapter.evaluateCurrent({...args,techniqueDb,techniqueIds:[id==='unknown'?'LAN_MID_THRUST_I':id]});rows.push({id,record,result});
 if(process.env.BASELINE)continue;
 if(id==='unknown'){assert.equal(result.reason,'REAL_SLICE:DAMAGE_TYPE_UNRESOLVED');continue;}
 for(const channel of ['normal','maximum']){const r=result.channels[channel];assert.equal(r.metrics.comboTotalDamage.status,'available');const ps=r.components.filter(c=>c.coefficientUnit==='MV');const sharp=w.MHWWeaponMaxSharpness.resolve({...args.weapon,maxSharpness:[...w.MHWWeaponMaxSharpness.colors].reverse().find(c=>args.weapon.sharpness[c]>0),maxSharpnessEvidenceRef:'MHDB:685:sharpness'},{rows:[{status:'ENGINE_CONTEXT_DOCUMENTED_UNVERIFIED'}]}).options.sharpnessPhysicalMultiplier;const expected=record.hits.map(h=>Math.round((args.stats.attackTrue??args.stats.attack)*h.mv/100*sharp*.4*100)/100);assert.deepEqual(Array.from(ps,c=>c.value),expected);assert.equal(r.metrics.comboTotalDamage.value,expected.reduce((a,b)=>a+b,0));}
}
console.log(JSON.stringify({scope:'CONTRACT_REAL_DB_SYNTHETIC_DIFFERENT_HITZONES',executionSha:require('child_process').execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim(),hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js','himmel-real-browser-bundle.js'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(path.join(repo,p))).digest('hex')])),rows},null,2));d.window.close();
