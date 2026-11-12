const fs=require('fs'),crypto=require('crypto'),assert=require('assert/strict'),test=require('node:test'),path=require('node:path');
test('bow94 CLOSE_RANGE public add/remove keeps damage and classifies nonapplication',()=>{
const P=path.resolve(process.env.PRODUCT_ROOT||path.join(__dirname,'..'));
const {JSDOM,VirtualConsole}=require('jsdom');
const base=JSON.parse(fs.readFileSync(P+'/tests/fixtures/selected-hp-inputs.json')).profiles.find(x=>x.kind==='bow').input;
const rows=[];
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const w=new JSDOM(require(P+'/tools/dom-test-setup.cjs').readSimulatorHtml(),{url:'https://bow94.invalid',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
try{w.__pack=JSON.parse(fs.readFileSync(P+'/tests/fixtures/offset-maximum-inputs.json')).data;w.eval('DB=normalizeDB({...__pack,weapons:consolidateArtiaFixedVariantRows(__pack.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
for(const lv of [0,1,0]){const input={...structuredClone(base),armor:{},charmCustom:{skills:lv?[{name:'貫通弾・竜の矢強化',level:lv,type:'weapon'}]:[],slots:[0,0,0],weaponSlots:[]}};const inputHash=crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex');w.applyBuildSnapshot(input);w.document.getElementById('calcBuild').click();const result=JSON.parse(w.eval('JSON.stringify(calcState.realOneHit)'));rows.push(result);for(const ch of ['normal','maximum']){const r=result.channels[ch];assert.equal(r.metrics.comboTotalDamage.value,570.05988);assert.ok(!JSON.stringify(r).includes('IGNORED_UNSUPPORTED_EFFECT'));}assert.ok(!JSON.stringify(result).includes('PARTIAL_SKILL_EFFECTS'));if(lv)assert.ok(w.eval('JSON.stringify(buildSnapshot())').includes('貫通弾・竜の矢強化'));}assert.deepEqual(rows[0],rows[2]);assert.deepEqual(errors,[]);
}finally{w.close()}

});
