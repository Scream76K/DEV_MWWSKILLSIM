// Opt-in network/real Tesseract QA; does not mock recognition or modify repository files.
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const outputDir=process.env.MHW_OCR_OUTPUT_DIR||require('os').tmpdir();
const {chromium}=require(root+'/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});const page=await browser.newPage();const errors=[],requests=[];
 page.on('pageerror',e=>{errors.push(e.message);console.log('PAGEERROR',e.message)});
 page.on('requestfailed',r=>console.log('REQUESTFAILED',r.url(),r.failure()));
 await page.route('**/*',async route=>{const u=new URL(route.request().url());requests.push(u.href);
  if(u.origin!=='https://integration.test')return route.continue();
  const rel=u.pathname==='/'?'index.html':decodeURIComponent(u.pathname.slice(1)),p=path.resolve(root,rel);
  if(!p.startsWith(root+'/')||!fs.existsSync(p))return route.fulfill({status:404,body:'missing'});
  return route.fulfill({body:fs.readFileSync(p),contentType:rel.endsWith('.js')?'text/javascript':rel.endsWith('.html')?'text/html':'application/octet-stream'});
 });
 try{
 await page.goto('https://integration.test/');await page.waitForFunction(()=>window.__OCR_EMBED_READY);
 await page.evaluate(()=>window.__startDataLoad());
 await page.waitForFunction(()=>DB.armor.length>0&&DB.weapons.length>0&&DB.charms.length>0,{},{timeout:120000});
 console.log('DB',await page.evaluate(()=>Object.fromEntries(Object.entries(DB).filter(([k,v])=>Array.isArray(v)).map(([k,v])=>[k,v.length]))));
 await page.evaluate(()=>{document.querySelector('#ocrEmbeddedHost').closest('details').open=true});
 console.log('SYNC',await page.evaluate(()=>window.__syncEmbeddedOCRDB()));
 const host=page.locator('#ocrEmbeddedHost');const runs=[];
 for(const image of ['sample_game.png','examples/equipment_example.jpg']){
 await host.locator('#file').setInputFiles(root+'/'+image);
 await page.waitForFunction(()=>document.querySelector('#ocrEmbeddedHost').shadowRoot.querySelector('#img').naturalWidth>0);
 await host.locator('#workflowEquipmentOCR').click();
 await page.waitForFunction(()=>!document.querySelector('#ocrEmbeddedHost').shadowRoot.querySelector('#workflowEquipmentOCR').disabled,{},{timeout:240000});
 const out=await page.evaluate(()=>({rows:window.lastEquipmentOCR,roi:window.equipmentROIResult,status:document.querySelector('#ocrEmbeddedHost').shadowRoot.querySelector('#equipmentOCRStatus')?.textContent}));
 const before=await page.evaluate(()=>JSON.stringify(buildSnapshotComparable(buildSnapshot())));
 await host.locator('#workflowReflectBuild').click();
 const refused=await page.evaluate(before=>({unchanged:before===JSON.stringify(buildSnapshotComparable(buildSnapshot())),status:document.querySelector('#ocrEmbeddedHost').shadowRoot.querySelector('#buildReflectionStatus')?.textContent}),before);
 console.log('RESULT',image,out.status,JSON.stringify(refused));
 if(out.rows.some(r=>r.best?.decision?.level!=='auto')&&!refused.unchanged)throw Error('pending changed build');
 let manual=null;
 if(image.includes('equipment_example')){
  manual=await page.evaluate(()=>{
   const expected={head:700,chest:706,arms:68,waist:685,legs:679};
   for(const row of window.lastEquipmentOCR){if(expected[row.key])window.selectEquipmentManual(row.key,String(expected[row.key]));else window.deferEquipmentSelection(row.key);}
   return {expected,context:window.equipmentContext};
  });
  await host.locator('#workflowReflectBuild').click();
  manual.result=await page.evaluate(()=>({armor:Object.fromEntries(Object.entries(build.armor).map(([k,v])=>[k,{id:v?.id,name:v?.name,slots:v?.slots}])),status:document.querySelector('#ocrEmbeddedHost').shadowRoot.querySelector('#buildReflectionStatus')?.textContent,confirmation:document.querySelector('#ocrEmbeddedHost').shadowRoot.querySelector('#workflowEquipmentOut')?.textContent,rows:window.lastEquipmentOCR.map(r=>({key:r.key,resolutionStatus:r.resolutionStatus,bestId:r.best?.id}))}));
  for(const [k,id] of Object.entries(manual.expected))if(manual.result.armor[k].id!==id)throw Error('manual armor did not reflect '+k);
  console.log('MANUAL',JSON.stringify(manual.result));
 }
 runs.push({image,out,refused,manual});
 }
 fs.writeFileSync(path.join(outputDir,'mhwilds-real-ocr-result.json'),JSON.stringify({runs,errors,requests},null,2));
 }finally{fs.writeFileSync(path.join(outputDir,'mhwilds-real-ocr-network.json'),JSON.stringify({errors,requests},null,2));await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
