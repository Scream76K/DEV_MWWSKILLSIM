'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
const root=path.resolve(__dirname,'..');
function setup(t){
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const dom=new JSDOM(html,{url:'https://restore.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));}});
 t.after(()=>dom.window.close());const w=dom.window;
 for(const m of html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g))if(!/^https?:/.test(m[1]))w.eval(fs.readFileSync(path.join(root,m[1]),'utf8'));
 w.eval(`clearWeaponBuckets();DB.weapons=[200,220].map((raw,i)=>({id:700+i,kind:'great-sword',name:'Restore '+i,damage:{raw,display:raw},affinity:10,slots:[1],skills:[],specials:[]}));weaponIndexByKind['great-sword']=DB.weapons;weaponKind.value='great-sword';weapon.innerHTML=DB.weapons.map(w=>'<option value="'+w.id+'">'+w.name+'</option>').join('');build.armor={head:null,chest:null,arms:null,waist:null,legs:null};normalizeCharm();for(const w of DB.weapons){weapon.value=String(w.id);App.build.setWeapon(w);calcBuild();buildName.value=w.name;saveNamedBuild();}selectAllCompare.click();calcBuild();`);
 return w;
}
test('loading a legacy snapshot never mutates the caller-owned snapshot',t=>{
 const w=setup(t);w.eval(`window.input=buildSnapshot();input.charmCustom.slots=[0,0];input.artia={};input.decos={};window.before=JSON.stringify(input);applyBuildSnapshot(input,{preserveCombo:true});`);
 assert.equal(w.JSON.stringify(w.input),w.before);
 w.eval(`build.charmCustom.skills[0].name='変更';build.artia.production='attack';build.decos.w0='changed';`);
 assert.equal(w.JSON.stringify(w.input),w.before);
});
test('saved comparison restores legacy charm, equipment, combo and calculation conditions exactly',t=>{
 const w=setup(t);w.eval(`build.charm={id:91};build.charmCustom.slots=[0,0];build.charmCustom.skills=[{name:'見切り',level:1,type:'armor'}];build.decos={w0:null};calcBuild();window.before=JSON.stringify({snapshot:buildSnapshotComparable(buildSnapshot()),charmId:build.charm.id,conditions:compareStep5Snapshot(),stats:calcState.stats,total:calcState.total});runBuildCompare();window.after=JSON.stringify({snapshot:buildSnapshotComparable(buildSnapshot()),charmId:build.charm.id,conditions:compareStep5Snapshot(),stats:calcState.stats,total:calcState.total});`);
 assert.equal(w.after,w.before);assert.ok(w.createBuildComparisonReport());
});

for(const adapter of ['bowStandardComparisonAdapter','hbgNormalComparisonAdapter'])test(adapter+' restores legacy state even when comparison is blocked',t=>{
 const w=setup(t);w.eval(`build.charmCustom.slots=[0,0];build.armor={};calcBuild();window.before=JSON.stringify({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot()});window.candidate=buildSnapshot();candidate.combo.moves=[{techniqueId:'GS_DRAW_VERTICAL_SLASH',repeat:1}];try{${adapter}(candidate,null,{})}catch(e){window.blocked=e.message}window.after=JSON.stringify({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot()});`);
 assert.match(w.blocked,/BUILD_COMPARE_FAIL_CLOSED/);assert.equal(w.after,w.before);
});
