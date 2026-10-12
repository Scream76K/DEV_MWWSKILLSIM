const {installLocalModules}=require('./browser-test-setup.cjs');
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
test('mobile source panel loads the external calculator and keeps required-input gates',async t=>{
 const b=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE,args:JSON.parse(process.env.CHROMIUM_ARGS||'["--no-sandbox"]')});t.after(()=>b.close());const p=await b.newPage({viewport:{width:390,height:844},isMobile:true});
 await p.route('**/*',r=>{const u=r.request().url();if(u==='https://simulator.test/')return r.fulfill({contentType:'text/html',body:fs.readFileSync(path.join(__dirname,'../index.html'),'utf8')});if(u==='https://simulator.test/dark-arts-reference.js')return r.fulfill({contentType:'application/javascript',body:fs.readFileSync(path.join(__dirname,'../dark-arts-reference.js'),'utf8')});return r.abort();});await installLocalModules(p);await p.goto('https://simulator.test/');
 await p.locator('#darkArtsReferencePanel summary').click();await p.locator('#daCalculate').click();assert.match(await p.locator('#daOut').innerText(),/未入力/);
 const values={daAttack:200,daAffinity:0,daCrit:1.25,daSharp:1.32,daESharp:1.15,daHz:80,daDragonHz:30,daCount:2};for(const [id,v] of Object.entries(values))await p.locator('#'+id).fill(String(v));await p.locator('#daCalculate').click();assert.match(await p.locator('#daOut').innerText(),/168.12/);
 await p.locator('#daDragonHz').fill('0');assert.match(await p.locator('#daOut').innerText(),/再計算/);await p.locator('#daCalculate').click();assert.match(await p.locator('#daOut').innerText(),/龍肉質0/);
 for(const width of [320,390,768]){await p.setViewportSize({width,height:844});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
});
