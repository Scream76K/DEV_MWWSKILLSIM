// ACCEPTED spec/COMBAT_METRICS_DISPLAY.md: reference timing is not verified DPS.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');const {JSDOM,VirtualConsole}=require('jsdom');
function setup(t,kind='dual-blades'){
 const dom=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));}});t.after(()=>dom.window.close());const w=dom.window;
 w.eval(`clearWeaponBuckets();const fixture={id:987,kind:${JSON.stringify(kind)},name:'Fixture',affinity:0,damage:{raw:200,display:200},specials:[],slots:[],skills:[]};DB.weapons=[fixture];weaponIndexByKind[${JSON.stringify(kind)}]=[fixture];weaponKind.value=${JSON.stringify(kind)};weapon.innerHTML='<option value="987">Fixture</option>';weapon.value='987';calcBuild();comboCBShield.value='1';comboCBAxe.value='1';renderComboForWeapon();`);return w;
}
test('common evaluation retains damage but never invents time for adopted dance',t=>{
 const w=setup(t);['I','II','III'].forEach(x=>w.addCombo('canonical:DB_DEMON_DANCE_'+x));
 const e=w.eval('evaluateComboRoute(App.state.combo.moves,comboDamageContext())');assert.equal(e.status,'TIMING_PENDING');assert.ok(e.damage>0);assert.equal(e.time,null);assert.equal(e.practicalDps,null);assert.equal(e.stages.reduce((n,s)=>n+s.result.hits.length,0),27);
 assert.equal(e.damage,w.calcDps().damage);assert.equal(e.damage,w.createComboVerificationReport().summary.damage);
});
test('common evaluation collects all blockers and withholds every route total',t=>{
 const w=setup(t,'charge-blade');['CB_SWORD_TO_AXE_MORPH','CB_AED','CB_SHIELD_THRUST'].forEach(x=>w.addCombo('canonical:'+x));
 const e=w.eval('evaluateComboRoute(App.state.combo.moves,comboDamageContext())');assert.equal(e.status,'BLOCKED');assert.equal(e.blocked.length,2);for(const k of ['damage','time','theoreticalDps','practicalDps','oneMinute'])assert.equal(e[k],null);
 assert.equal(w.calcDps(),null);const r=w.createComboVerificationReport();assert.equal(r.summary.status,e.status);assert.deepEqual(JSON.parse(JSON.stringify(r.stages.filter(s=>s.reason).map(s=>s.reason))),JSON.parse(JSON.stringify(e.blocked.map(s=>s.reason))));
});
test('common evaluation uses supplied stats for comparison and never mutates route input',t=>{
 const w=setup(t,'great-sword');w.addCombo('canonical:GS_STRONG_WIDE_SLASH_3');const before=w.eval('JSON.stringify(App.state.combo.moves)');
 const e=w.eval(`evaluateComboRoute(App.state.combo.moves,comboDamageContext(),{stats:calcState.stats,uptime:50,uptimeMode:'1'})`);assert.equal(e.status,'TIMING_PENDING');assert.equal(w.eval('JSON.stringify(App.state.combo.moves)'),before);
 w.eval(`TECHNIQUES.add('great-sword',{name:'Timed fixture',mvs:[20],time:2,source:'community'});combo.innerHTML='';App.combo.reset();addCombo(comboData().moves.find(x=>x.custom).id);`);
 const r=w.eval(`evaluateComboRoute(App.state.combo.moves,comboDamageContext(),{uptime:50,uptimeMode:'1'})`);assert.equal(r.status,'REFERENCE_ONLY');assert.equal(r.time,2);assert.equal(r.practicalDps,null);assert.equal(r.theoreticalDps,null);assert.ok(r.damage>0);assert.equal(r.dpsStatus,'UNVERIFIED');assert.equal(r.dpsReason,'COMBO_DPS_UNVERIFIED');
 const c=w.eval(`({hz:monsterHZ().hz??45,ehz:monsterHZ().ehz??20,sharp:Number(dSharp.value),esharp:Number(dESharp.value),cb:Number(dCB.value),eCrit:Number(dECrit.value),uptime:50,uptimeMode:'1'})`);
 assert.equal(w.dpsForStats(w.eval('calcState.stats'),c),r.practicalDps);
});
