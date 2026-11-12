'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(process.env.PRODUCT_ROOT||path.join(__dirname,'..')),{JSDOM,VirtualConsole}=require('jsdom');
const f=JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/offset-maximum-inputs.json')));
test('62/70 maximum activation assumptions, public scope and HBG clash route',()=>{
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(require(path.join(root,'tools/dom-test-setup.cjs')).readSimulatorHtml(),{url:'https://offset.test',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 try{w.__pack=f.data;w.eval('DB=normalizeDB({...__pack,weapons:consolidateArtiaFixedVariantRows(__pack.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 const kinds62=['great-sword','sword-and-shield','lance','gunlance','charge-blade','heavy-bowgun'];const kinds70=[...kinds62,'hammer','hunting-horn','switch-axe','insect-glaive'];
 for(const c of f.cases){assert.equal(crypto.createHash('sha256').update(JSON.stringify(c.input)).digest('hex'),c.inputHash);const immutable=JSON.stringify(c.input);w.__snapshot=structuredClone(c.input);w.applyBuildSnapshot(w.__snapshot);w.document.getElementById('calcBuild').click();assert.equal(JSON.stringify(c.input),immutable);const r=JSON.parse(w.eval('JSON.stringify(calcState.realOneHit)'));
  assert.ok(r.channels,c.label+' '+JSON.stringify(r));
  for(const ch of ['normal','maximum']){const channel=r.channels[ch];assert.equal(channel.metrics.comboTotalDamage.status,'available',c.label+ch);assert.ok(Math.abs(channel.metrics.comboTotalDamage.value-c.expected[ch])<1e-8,c.label+ch+' '+channel.metrics.comboTotalDamage.value+' != '+c.expected[ch]);}
  if(c.input.weaponKind==='heavy-bowgun'){const stored=JSON.parse(w.eval('JSON.stringify(buildSnapshot())'));w.__snapshot=stored;w.applyBuildSnapshot(w.__snapshot);w.document.getElementById('calcBuild').click();assert.deepEqual(JSON.parse(w.eval('JSON.stringify(calcState.realOneHit)')),r);}
  const kind=c.input.weaponKind==='sword-shield'?'sword-and-shield':c.input.weaponKind,target=(c.id===62?kinds62:kinds70).includes(kind),n=r.channels.normal.diagnostics,m=r.channels.maximum.diagnostics;
  assert.equal(n.maximumActivationAssumptions,undefined);const note=(m.maximumActivationAssumptions||[]).find(x=>x.skillId===c.id);assert.equal(!!note,target,c.label);
  if(note){assert.equal(note.status,'CALCULATION_ASSUMPTION');assert.equal(note.equipmentCustomVerified,false);assert.equal(note.liveActivationVerified,false);assert.ok(note.description.includes(c.id===62?'鍔迫り合い後（または拘束等の解除）':'相殺成功または鍔迫り合い成功後'));assert.ok(w.document.getElementById('buildSummary').textContent.includes(note.description),c.label+' visible');if(kind==='heavy-bowgun'){assert.ok(note.description.includes('鍔迫り合いはカスタム不要'));if(c.id===70)assert.ok(note.description.includes('相殺経路は相殺可能カスタムが必要'));}}
 }
 // Contract-level negatives, separate from legal public equipment evidence.
 for(const id of [62,70])for(const rank of [1,2]){
 const e={bonusSkillId:id,bonusName:id===62?'凍峰竜の反逆':'闢獣の力',name:(id===62?'束縛反攻':'力自慢')+(rank===1?'Ⅰ':'Ⅱ'),source:'series',rankLevel:rank,required:rank===1?2:4,count:rank===1?2:4,level:1};
 for(const kind of [...new Set(f.cases.map(c=>c.input.weaponKind==='sword-shield'?'sword-and-shield':c.input.weaponKind))]){const matching=f.cases.find(c=>(c.input.weaponKind==='sword-shield'?'sword-and-shield':c.input.weaponKind)===kind);const weapon=f.data.weapons.find(x=>String(x.id)===String(matching.input.weaponId));const p=w.standardGroupPowerPlan({weaponId:weapon?.id,activeBonusEffects:[e]},'BEFORE',{},kind,{standardEvaluation:true});const a=p.applied.find(x=>x.skillId===id);assert.equal(a.appliesToNormal,false);assert.equal(a.attackAdd,(id===62?kinds62:kinds70).includes(kind)?(id===62?[0,25,50]:[0,10,25])[rank]:0);}
 for(const change of [{source:'group'},{count:0},{name:'unknown'},{rankLevel:9}])assert.ok(w.standardGroupPowerPlan({activeBonusEffects:[{...e,...change}]},'BEFORE',{},'heavy-bowgun',{standardEvaluation:true}).unresolvedEffects.length);
 if(id===70){const no=f.noOffsetHornId;const p=w.standardGroupPowerPlan({weaponId:no,activeBonusEffects:[e]},'BEFORE',{},'hunting-horn',{standardEvaluation:true});assert.equal(p.applied[0].attackAdd,0);assert.equal(p.applied[0].scope,'HH_NO_OFFSET_MELODY');const missing=w.standardGroupPowerPlan({weaponId:-1,activeBonusEffects:[e]},'BEFORE',{},'hunting-horn',{standardEvaluation:true});assert.equal(missing.applied[0].maximumUnresolvedReason,'OFFSET_MELODY_DATA_UNCONFIRMED');}
 }
 assert.deepEqual(errors,[]);
 }finally{w.close();}
});
