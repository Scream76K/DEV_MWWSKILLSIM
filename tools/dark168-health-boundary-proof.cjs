const fs=require('fs'),assert=require('node:assert/strict'),cp=require('node:child_process'),crypto=require('node:crypto');
const {JSDOM,VirtualConsole}=require('jsdom');
const f=JSON.parse(fs.readFileSync('docs/reports/r257-thunder-conversion/fixture.json'));assert.equal(f.weapon.id,1081);assert.equal(f.decoration.skills[0].skill.id,156);assert.ok(f.weapon.slots[0]>=f.decoration.slot);assert.ok(f.armor.slots[0]>=f.decoration.slot);
const vc=new VirtualConsole(),errors=[];vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(process.argv[2]==='before-fixed'?fs.readFileSync('/tmp/dark168-before/index.html','utf8').replace(/<script\b([^>]*?)\bsrc=["']([^"']+)["']([^>]*)>\s*<\/script>/gi,(tag,a,src,b)=>/^(?:[a-z]+:)?\/\//i.test(src)?tag:`<script${a}${b}>${fs.readFileSync(src==='hope-hammer-browser-adapter.js'?'/tmp/dark168-before/'+src:src,'utf8').replace(/<\/script/gi,'<\\/script')}</script>`):require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));w.confirm=()=>true;}}),w=dom.window;
w.eval(`clearWeaponBuckets();DB.weapons=[${JSON.stringify(f.weapon)}];DB.decorations=[${JSON.stringify(f.decoration)}];DB.skills=${JSON.stringify(f.skills)};DB.armor=[${JSON.stringify(f.armor)}];weaponIndexByKind['great-sword']=DB.weapons;weaponKind.value='great-sword';weapon.innerHTML='<option value="1081">ラギアブレイドⅠ</option>';weapon.value='1081';App.build.setWeapon(DB.weapons[0]);build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[]};renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();addCombo('canonical:GS_CHARGED_SLASH_3');`);

// Contract armor records, not a claim that these resistance totals occur on a real item.
w.eval(`DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};DB.armor=[70,150].map((v,i)=>({...DB.armor[0],id:900001+i,name:'Contract thunder '+v,resistances:{...DB.armor[0].resistances,thunder:v}}));`);
w.eval(`DB.weapons[0].skills=DB.weapons[0].skills.filter(x=>x.skill.id!==165);build.charmCustom={skills:[{name:'チャージマスター',level:3}],slots:[0,0,0],weaponSlots:[]};`);
let captured;const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){captured=a;return adapter.evaluateCurrent(a)}};


const mode=process.argv[2].startsWith('before')?'before':'after',cases=[];
w.eval(`DB.weapons[0].skills=[];DB.weapons[0].damage.raw=300;build.charmCustom.skills=[];App.state.combo.moves=[];restoreComboRows();`);
const take=()=>JSON.parse(w.eval('JSON.stringify({real:calcState.realOneHit,snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot()})'));

const baseArmor=JSON.parse(w.eval('JSON.stringify(DB.armor[0])'));
w.eval(`DB.armor=['head','chest'].map((kind,i)=>({...${JSON.stringify(baseArmor)},id:981000+i,kind,skills:[(()=>{const skill=DB.skills.find(x=>x.id===172);return {...skill.ranks[0],skill};})()]}));`);
for(const [label,arts,heroics] of [['basic',false,0],['with-172',true,0],['with-heroics',false,5]]){
 w.eval(`build.armor={head:${arts?'DB.armor[0]':'null'},chest:${arts?'DB.armor[1]':'null'},arms:null,waist:null,legs:null};build.charmCustom.skills=[{name:'暗黒',level:1},{name:'フルチャージ',level:5}${heroics?",{name:'火事場力',level:5}":''}];calcBuild();`);
 const r=take();cases.push({label,...r});
 assert.equal(r.real.channels.normal.metrics.comboTotalDamage.status,'available');
 if(mode==='after'){
  assert.equal(r.real.channels.maximum.metrics.comboTotalDamage.status,label==='basic'?'available':'unavailable');
  if(label==='basic')assert.equal(r.real.channels.maximum.metrics.comboTotalDamage.value,1826.8200000000002);
  else {assert.ok(JSON.stringify(r.real.channels.maximum).includes('DARK_STANDARD_SEQUENCE_REQUIRED'));assert.equal(r.real.channels.maximum.diagnostics.healthBranchComparison.reason,'DARK168_HEALTH_COMBINATION_NOT_ADOPTED');}
 }
}
console.log(JSON.stringify({mode,cases,hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js',__filename].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')])),scope:'Synthetic GS raw300; JSDOM public calcBuild. No new health scenario adoption; not live game.'},null,2));w.close();
