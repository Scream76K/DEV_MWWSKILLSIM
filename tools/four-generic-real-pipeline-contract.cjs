const fs=require('fs');
const assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const {JSDOM,VirtualConsole}=require('jsdom');
const repo='/Users/scream/Documents/Codex/2026-10-18/task/himmel-v10-real-db-element-gate';
const html=require(`${repo}/tools/dom-test-setup.cjs`).readSimulatorHtml();
const cases=[
 {label:'sword-and-shield',apiKind:'sword-shield',file:'mhdb-sword-shield-hope.api.json',techniqueId:'SNS_SIDE_SLASH',state:{}},
 {label:'lance',apiKind:'lance',file:'mhdb-lance-hope.api.json',techniqueId:'LAN_MID_THRUST_I',state:{}},
 {label:'switch-axe',apiKind:'switch-axe',file:'mhdb-switch-axe-hope.api.json',techniqueId:'SA_SWORD_VERTICAL',state:{mode:'SWORD',awakened:false}},
 {label:'insect-glaive',apiKind:'insect-glaive',file:'mhdb-insect-glaive-hope.api.json',techniqueId:'IG_DIAGONAL_SLASH',state:{extractState:'NO_EXTRACT',kinsectState:'STOWED'}}
];
const evidence=`${repo}/docs/reports/r252-generic-states/evidence`;
const results=[];
for(const cfg of cases){
 const weapon=JSON.parse(fs.readFileSync(`${evidence}/${cfg.file}`,'utf8'));
 const vc=new VirtualConsole(),errors=[];vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(html,{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}});
 const w=dom.window;
 const setup=`clearWeaponBuckets();DB.weapons=${JSON.stringify([weapon])};weaponIndexByKind[${JSON.stringify(cfg.apiKind)}]=[DB.weapons[0]];weaponKind.value=${JSON.stringify(cfg.label)};weapon.innerHTML='<option value="${weapon.id}">${weapon.name}</option>';weapon.value='${weapon.id}';DB.monsters=[{id:'training-room',name:'訓練場',parts:[{id:'training-front',name:'正面',multipliers:{slash:.5,blunt:.5,pierce:.5,fire:.2,water:.2,thunder:.2,ice:.2,dragon:.2}}]}];renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();`;
 w.eval(setup);
 if(cfg.label==='insect-glaive')w.eval(`document.getElementById('comboIGExtract').value='NO_EXTRACT';document.getElementById('comboIGKinsect').value='STOWED';`);
 if(cfg.label==='switch-axe')w.eval(`document.getElementById('comboSAMode').value='SWORD';document.getElementById('comboSAAwakened').value='0';`);
 w.eval(`App.combo.syncFromDOM();App.state.combo.moves=[{techniqueId:${JSON.stringify(cfg.techniqueId)}}];`);
 w.calcBuild();
 const real=w.eval('calcState.realOneHit');
 const row={label:cfg.label,weapon:{id:weapon.id,gameId:weapon.gameId,name:weapon.name,kind:weapon.kind,raw:weapon.damage.raw,display:weapon.damage.display,affinity:weapon.affinity,slots:weapon.slots,skills:weapon.skills},techniqueId:cfg.techniqueId,state:w.eval('App.state.combo'),status:real?.status,normal:real?.channels?.normal?.metrics?.comboTotalDamage||null,maximum:real?.channels?.maximum?.metrics?.comboTotalDamage||null,conditionKey:real?.conditionKey||null,rendered:w.document.getElementById('buildSummary')?.textContent||'',errors};
 if(real?.status==='OK'){
  for(const channel of ['normal','maximum']){const metric=real.channels[channel].metrics.comboTotalDamage;assert.equal(metric.status,'available');assert.equal(Number.isFinite(metric.value),true);assert.equal(real.channels[channel].execution.status,'complete');}
  assert.match(row.rendered,/選択技の実計算/);assert.match(row.rendered,/通常/);assert.match(row.rendered,/最大/);
 }else{
  row.blocker=real?.reason||'REAL_SLICE:UNKNOWN';
 }
 assert.deepEqual(errors,[]);
 results.push(row);dom.window.close();
}
console.log(JSON.stringify({executionSha:execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim(),harness:'tools/four-generic-real-pipeline-contract.cjs',results},null,2));
