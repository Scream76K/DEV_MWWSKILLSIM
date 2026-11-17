'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),crypto=require('crypto'),path=require('path'),{JSDOM,VirtualConsole}=require('jsdom');
const fixture=require('./fixtures/gl-slam-owner-before.json'),{data}=require('./fixtures/dark172-gl-standard.json'),root=process.env.PRODUCT_ROOT||path.resolve(__dirname,'..'),clone=x=>JSON.parse(JSON.stringify(x)),hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
test('owner GL_SLAM element1 changes only its native element across public standard, melee and mixed routes',()=>{
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const w=new JSDOM(require(path.join(root,'tools/dom-test-setup.cjs')).readSimulatorHtml(),{url:'https://slam-owner.test',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 const near=(a,b,label)=>assert.ok(Math.abs(a-b)<1e-8,`${label}: ${a} != ${b}`);
 try{
  const raw=clone(w.TechniqueDBEngine.get('gunlance','GL_SLAM'));assert.equal(raw.hits[0].elementModifier,1,'owner chose1; provisional source2 is not approval');assert.equal(raw.hits[0].mv,57);assert.equal(raw.revision,3);assert.equal(raw.replacedRecord.revision,2);assert.equal(raw.replacedRecord.hits[0].elementModifier,2);assert.equal(raw.replacedRecord.replacedRecord.hits[0].elementModifier,1);assert.match(raw.sourceComparisonNote,/Sentinel_2f73209af1408191b3023b8bbf7541f8/);assert.equal(raw.verificationStatus,'PARTIALLY_VERIFIED');
  w.__data=data;w.eval('DB=normalizeDB({...__data,weapons:consolidateArtiaFixedVariantRows(__data.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
  const captured=[];for(const row of fixture.rows){w.applyBuildSnapshot(clone(row.input));w.document.getElementById('calcBuild').click();const result=JSON.parse(w.eval('JSON.stringify(currentConsumerCalculation())'));captured.push({name:row.name,result});
   for(const ch of ['normal','maximum']){const a=row.before[ch],b=result.channels[ch],label=row.name+':'+ch;assert.deepEqual(b.execution,a.execution,label);assert.deepEqual(b.finalState,a.finalState,label);assert.deepEqual(b.components.map(c=>c.id),a.ids,label);assert.equal(hash(b.components.filter(c=>c.techniqueId!=='GL_SLAM')),a.otherSha256,label+' non-SLAM components');assert.deepEqual(b.diagnostics?.ignoredSkillEffects||[],a.warnings,label+' pending warnings');
    for(const c of b.components.filter(c=>c.techniqueId==='GL_SLAM')){const old=a.slam.find(x=>x.id===c.id),expected=clone(old);expected.revision='3';if(c.id.includes(':element:')){expected.value/=2;near(c.value,c.details.appliedElement/10*.3*1.15*c.details.elementCriticalMultiplier,label+' independent element1 oracle');}assert.deepEqual(c,expected,label+' only native element and revision');}
    near(b.metrics.comboTotalDamage.value,a.total.value-a.slam.find(c=>c.id==='GL_SLAM:element:0').value/2,label+' sum before rounding');
   }
  }
  if(process.env.CAPTURE)fs.writeFileSync(process.env.CAPTURE,JSON.stringify(captured,null,2));assert.deepEqual(errors,[]);
 }finally{w.close();}
});
