const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('../tools/dom-test-setup.cjs');
const app=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
function comparison(t){
 const {window:w}=new JSDOM(readSimulatorHtml(),{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));}});
 t.after(()=>w.close());
 w.eval(`lastBuildComparisonRows=[
 {name:'Unavailable',kind:'great-sword',power:{normal:null,maximum:null,maximumReason:standardPowerForStats('great-sword',{attackTrue:200,element:0,affinity:0,maxAffinity:100},{hz:100,ehz:30,sharp:1,esharp:1,cb:0,eCrit:0},{'チャージマスター':3}).maximumReason}},
 {name:'Available',kind:'great-sword',power:{normal:{comparisonPower:123.4},maximum:{comparisonPower:145.6}}}
 ];lastBuildComparisonContext={conditions:{}};compareOut.innerHTML=renderCompareTable(lastBuildComparisonRows,'Unavailable');`);
 return w;
}
function cells(w,key){return [...w.document.querySelectorAll('[data-comparison-metric="'+key+'"] td')].map(el=>el.textContent);}
test('missing raw damage is withheld and available raw damage stays visible',t=>{
 const w=comparison(t);assert.deepEqual(cells(w,'power-index'),['—','123.4']);
 assert.deepEqual(cells(w,'max-power-index'),['—','145.6']);
});
test('a missing baseline withholds relative comparison, not raw damage',t=>{
 const w=comparison(t);
 assert.deepEqual(cells(w,'relative-power-100'),['—','—']);
 assert.equal(cells(w,'power-index')[1],'123.4');
});
test('unverified maximum reasons are presented in human-readable form',t=>{
 const w=comparison(t);assert.match(w.document.querySelector('#compareOut details[data-comparison-notes]').textContent,/最大.*チャージマスター/);
});
test('comparison report revision tracks current release',()=>assert.match(app,/release:'r140'/));
