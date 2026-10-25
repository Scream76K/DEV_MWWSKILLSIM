const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{JSDOM,VirtualConsole}=require('jsdom');
function setup(t){const d=new JSDOM(fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));}});t.after(()=>d.window.close());return d.window;}
test('fixed maximum groups two or three builds together even when the viewport container is narrower',t=>{const w=setup(t),out=w.document.getElementById('compareOut');Object.defineProperty(out,'clientWidth',{value:280});for(const n of [1,2,3,4]){const rows=Array.from({length:n},(_,i)=>({name:'Build'+i,attack:190+i,attackTrue:190+i,affinity:0,maxAffinity:0,element:0,elementType:'fire',damage:100,dps:null}));out.innerHTML=w.renderCompareTable(rows);assert.equal(out.querySelectorAll('table').length,Math.ceil(n/3));const first=out.querySelector('table');assert.equal(first.querySelectorAll('thead th').length,1+Math.min(n,3));assert.equal(first.style.width,(112+Math.min(n,3)*120)+'px');assert.equal(out.querySelectorAll('tbody tr:first-child td.compare-best')[0].textContent,String(189+n));}});
test('comparison renderer preserves unavailable dashes while keeping real zero values',t=>{
 const w=setup(t),out=w.document.getElementById('compareOut');
 out.innerHTML=w.renderCompareTable([
  {name:'Unavailable',kind:'great-sword',attack:null,attackTrue:null,affinity:null,maxAffinity:null,element:null,elementType:'',damage:null,dps:null,power:{}},
  {name:'Zero',kind:'great-sword',attack:0,attackTrue:0,affinity:0,maxAffinity:0,element:0,elementType:'fire',damage:0,dps:null,power:{}}
 ]);
 const rows=[...out.querySelectorAll('.compare-table tbody tr')];
 assert.equal(rows[0].querySelectorAll('td')[0].textContent,'—');
 assert.equal(rows[1].querySelectorAll('td')[0].textContent,'—');
 assert.equal(rows[2].querySelectorAll('td')[0].textContent,'—');
 assert.equal(rows[3].querySelectorAll('td')[0].textContent,'—');
 assert.equal(rows[0].querySelectorAll('td')[1].textContent,'0');
 assert.equal(rows[1].querySelectorAll('td')[1].textContent,'0');
 assert.equal(rows[2].querySelectorAll('td')[1].textContent,'0%');
 assert.equal(rows[3].querySelectorAll('td')[1].textContent,'0%');
});
