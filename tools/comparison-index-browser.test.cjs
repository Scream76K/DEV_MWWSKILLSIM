// ACCEPTED spec: explicit synthetic VERIFIED metadata for formatting only; no real record is promoted.
const {installLocalModules}=require('./browser-test-setup.cjs');
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
test('relative DPS keeps a single baseline after mobile wrapping and resizing',async t=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox']});t.after(()=>browser.close());const p=await browser.newPage({viewport:{width:390,height:844}});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('**/*',r=>r.request().url()==='https://simulator.test/'?r.fulfill({contentType:'text/html',body:fs.readFileSync(path.join(__dirname,'../index.html'),'utf8')}):r.abort());await installLocalModules(p);await p.goto('https://simulator.test/');
 await p.evaluate(()=>{const row=(name,dps)=>({name,kind:'great-sword',power:{profileId:'fixture-standard'},dpsStatus:'VERIFIED',dps,attack:100,attackTrue:100,affinity:0,maxAffinity:0,element:0,elementType:'—',damage:10});lastBuildComparisonRows=[row('Baseline',80),row('Better',100),row('Lower',60)];document.getElementById('compareOut').innerHTML=renderCompareTable(lastBuildComparisonRows);});
 for(const width of [320,390,430,768,1280]){
  await p.setViewportSize({width,height:844});
  await p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const handle=await p.waitForFunction(w=>{
   const cols=[...document.querySelectorAll('#compareOut thead th:first-child')].map(e=>e.getBoundingClientRect().width);
   if(document.documentElement.scrollWidth!==w||!cols.length||!cols.every(x=>Math.abs(x-112)<1))return false;
   return {cols,doc:document.documentElement.scrollWidth,indices:[...document.querySelectorAll('[data-comparison-metric="dps-index"] td')].map(e=>e.textContent)};
  },width);
  const x=await handle.jsonValue();assert.deepEqual(x.indices,['100.0','125.0','75.0']);assert.equal(x.doc,width);assert.ok(x.cols.every(v=>Math.abs(v-112)<1));await handle.dispose();
 }
 assert.deepEqual(errors,[]);
});
