const {installLocalModules}=require('./browser-test-setup.cjs');
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
test('reference panel follows title and comparison wraps locally at phone tablet and desktop widths',async t=>{
 const launch={headless:true};if(process.env.CHROMIUM_EXECUTABLE){launch.executablePath=process.env.CHROMIUM_EXECUTABLE;launch.args=JSON.parse(process.env.CHROMIUM_ARGS||'["--no-sandbox"]');}
 const browser=await chromium.launch(launch);t.after(()=>browser.close());
 for(const width of [320,390,430,768,1280]){
  const p=await browser.newPage({viewport:{width,height:844},isMobile:width<768,hasTouch:width<768});const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.route('**/*',r=>r.request().url()==='https://simulator.test/'?r.fulfill({contentType:'text/html',body:html}):r.abort());await installLocalModules(p);await p.goto('https://simulator.test/');
  const placement=await p.evaluate(()=>!!(document.querySelector('header').compareDocumentPosition(document.getElementById('hhReferencePanel'))&Node.DOCUMENT_POSITION_FOLLOWING));assert.equal(placement,true,'reference form must follow title');
  // Explicit synthetic weapon fixture exercises save/compare/render without remote data.
  await p.evaluate(()=>{clearWeaponBuckets();build.armor={};const f={id:987,name:'Layout fixture',kind:'great-sword',damage:{raw:200,display:200},slots:[],skills:[]};DB.weapons=[f];weaponIndexByKind['great-sword']=[f];weaponKind.value='great-sword';weapon.innerHTML='<option value="987">Layout fixture</option>';weapon.value='987';calcBuild();for(const name of ['layout-a','layout-b','layout-c']){document.getElementById('buildName').value=name;document.getElementById('saveBuild').click();}document.getElementById('selectAllCompare').click();document.getElementById('runCompare').click();});
  const x=await p.evaluate(()=>{const e=document.querySelector('#compareOut .compare-table');return {inner:innerWidth,doc:document.documentElement.scrollWidth,wrapperWidth:e?.clientWidth,tableWidth:e?.querySelector('table').getBoundingClientRect().width,scroll:e?.scrollWidth,rows:e?.querySelectorAll('tbody tr').length};});
  assert.ok(x.doc<=width+1,`${width}px document widened to ${x.doc}px`);assert.ok(x.inner<=width+1,`${width}px layout viewport widened`);assert.equal(x.rows,15);assert.ok(x.wrapperWidth<=width+1,'comparison wrapper stays inside viewport');assert.equal(x.tableWidth,472);assert.ok(x.scroll>=x.tableWidth,'wide fixed table scrolls locally');assert.deepEqual(errors,[]);
  if(process.env.LAYOUT_SCREENSHOT_DIR&&width===390){fs.mkdirSync(process.env.LAYOUT_SCREENSHOT_DIR,{recursive:true});await p.screenshot({path:path.join(process.env.LAYOUT_SCREENSHOT_DIR,'r64-mobile-after-compare.png'),fullPage:true});}
  console.log(JSON.stringify({width,...x}));await p.close();
 }
});
