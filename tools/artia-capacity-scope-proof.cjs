const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto'),cp=require('node:child_process');
const {JSDOM,VirtualConsole}=require('/Users/scream/Documents/Codex/2026-10-18/task/himmel-db-route-pqr4v6qt/dependencies/node_modules/jsdom');
const {readSimulatorHtml}=require(process.cwd()+'/tools/dom-test-setup.cjs');
const source=process.env.CAPACITY_SOURCE||'/tmp/artia-capacity-records.json';
const rows=JSON.parse(fs.readFileSync(source)),errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(readSimulatorHtml(),{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));w.confirm=()=>true;}}),w=dom.window;
w.eval(`clearWeaponBuckets();DB.weapons=consolidateArtiaFixedVariantRows(${JSON.stringify(rows)});DB.armor=[];DB.skills=[];DB.decorations=[];weaponIndexByKind['heavy-bowgun']=DB.weapons.filter(x=>x.kind==='heavy-bowgun');weaponKind.value='heavy-bowgun';weapon.innerHTML=DB.weapons.map(x=>'<option value="'+x.id+'">'+x.name+'</option>').join('');build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[]};build.decos={};renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';`);
const cases=[],checks=[];
try{
 for(const [id,eligible] of [[521,false],[522,true],[523,false],[1157,true]]){
  w.eval(`weapon.value='${id}';App.build.setWeapon(DB.weapons.find(x=>x.id===${id}));build.artia={production:'attack',element:'water',parts:['attack','attack','attack'],sameElementPartCount:3,restores:['none','none','none','none','none'],seriesSkill:'',groupSkill:''};renderArtia();renderComboForWeapon();`);
  const options=[...w.document.querySelector('.aR').options].map(x=>({value:x.value,label:x.textContent}));
  assert.equal(options.some(x=>x.value==='capacity:pending'),eligible);assert.ok(!options.some(x=>x.value.startsWith('sharp:')));
  for(const key of ['capacity:pending','sharp:I']){
   w.eval(`build.artia.restores[0]='${key}';renderArtia();calcBuild();`);
   const actual=JSON.parse(w.eval('JSON.stringify({restores:build.artia.restores,restore:restoreStats(selectedWeapon()),real:calcState.realOneHit,ui:artiaBox.textContent,selected:document.querySelector(".aR").value})'));
   const reason=(eligible?'ARTIA_CAPACITY_RESTORE_UNIMPLEMENTED:':'ARTIA_CAPACITY_RESTORE_NOT_APPLICABLE:')+key;
   assert.equal(actual.restore.reason,reason);assert.equal(actual.real.status,'UNAVAILABLE');assert.ok(actual.real.reason.includes(reason));assert.equal(actual.selected,key);assert.equal(actual.restores[0],key);
   assert.ok(!/装填[^／\n]*\+(30|50)/.test(actual.ui));cases.push({id,eligible,key,options,actual});
  }
 }
 assert.deepEqual(errors,[]);checks.push({pass:true});
}catch(e){checks.push({pass:false,error:e.stack});}
console.log(JSON.stringify({base:cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),indexSha256:crypto.createHash('sha256').update(fs.readFileSync('index.html')).digest('hex'),sourceSha256:crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex'),cases,checks},null,2));dom.window.close();process.exitCode=checks.some(x=>!x.pass)?1:0;
