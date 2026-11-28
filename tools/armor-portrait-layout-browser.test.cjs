'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {installLocalModules}=require('./browser-test-setup.cjs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const cases=[
 {width:320,height:693,touch:true},
 {width:375,height:812,touch:true},
 {width:390,height:844,touch:true},
 {width:852,height:393,touch:true},
 {width:820,height:1180,touch:true},
 {width:1024,height:768,touch:true},
 {width:1440,height:900,touch:false},
];
test('only the armor/skill panels are 6:4 on phones, tablets, and desktop without overflow',async t=>{
 const launch={headless:true};
 if(process.env.CHROMIUM_EXECUTABLE){launch.executablePath=process.env.CHROMIUM_EXECUTABLE;launch.args=JSON.parse(process.env.CHROMIUM_ARGS||'["--no-sandbox"]');}
 const browser=await chromium.launch(launch);t.after(()=>browser.close());
 for(const {width,height,touch} of cases){
  const p=await browser.newPage({viewport:{width,height},isMobile:touch,hasTouch:touch});
  try{
   await p.route('**/*',r=>r.request().url()==='https://simulator.test/'?r.fulfill({contentType:'text/html',body:html}):r.abort());
   await installLocalModules(p);
   await p.route(/^https:\/\/simulator\.test\/assets\/(?:fonts\/mplus-rounded-ui-(?:regular|bold)\.woff2|equipment-icons\/(?:head|chest|arms|waist|legs)\.png)$/,r=>{
    const name=new URL(r.request().url()).pathname;
    return r.fulfill({contentType:name.endsWith('.woff2')?'font/woff2':'image/png',path:path.join(__dirname,'..',name)});
   });
   await p.goto('https://simulator.test/');
   await p.evaluate(()=>{
    document.querySelector('#armorWorkspaceLeft details').open=true;
    const item={id:99002,kind:'head',rank:'high',name:'長い防具名・歴戦王シリーズの装備名が続きます・頭防具γ',rarity:8,slots:[3,2,1],skills:[]};
    DB.armor=[item];renderArmor();
   });
   const picker=p.locator('#armorSelectors select[data-armor="head"]');
   await picker.selectOption('99002');
   assert.equal(await p.evaluate(()=>build.armor.head?.id),99002,'picker changes the actual build');
   await p.evaluate(async()=>{
    await Promise.all([400,700].map(weight=>document.fonts.load(weight+' 14px "M PLUS Rounded 1c"')));
    await document.fonts.ready;
   });
   const x=await p.evaluate(()=>{
    const $=id=>document.getElementById(id),left=$('armorWorkspaceLeft'),right=$('skillWorkspaceRight'),inner=$('armorBuildWorkspace'),support=$('betaSupportPanel'),build=$('betaBuildPanel');
    const a=left.querySelector('details'),b=right.querySelector('details');a.open=b.open=true;
    // Real production renderers; deliberately long Japanese strings stress wrapping.
    const armor=$('armorSelectors').querySelector('select[data-armor="head"]');
    DB.skills=[{id:99001,kind:'armor',name:'装備条件に応じた非常に長い日本語のスキル名',description:'効果が大きく変化する長い補足説明'.repeat(5),ranks:[{level:1,description:'通常条件の詳細'.repeat(5)},{level:2,description:'追加効果の詳細'}]}];
    $('skillOutput').innerHTML=renderSkillGameBlock(DB.skills[0].name,1);
    const toggle=$('skillOutput').querySelector('.skill-info-toggle');toggle.click();toggle.parentElement.querySelector('.skill-ranks-toggle')?.click();
    const g=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,w:r.width,h:r.height};};
    const full=[inner.previousElementSibling,inner.nextElementSibling].map(g);
    const outside=pane=>{
     const bounds=pane.getBoundingClientRect();
     const crosses=r=>r.width>0&&r.height>0&&(r.left<bounds.left-1||r.right>bounds.right+1);
     const bad=[];
     for(const el of pane.querySelectorAll('*')){
      if(!el.getClientRects().length||getComputedStyle(el).visibility!=='visible')continue;
      if(Array.from(el.getClientRects()).some(crosses))bad.push({tag:el.tagName,id:el.id,classes:el.getAttribute('class'),kind:'visible box'});
      // A native picker lays out its own option text; measure its visible control box above.
      if(el.closest('select,textarea'))continue;
      for(const node of el.childNodes){
       if(node.nodeType!==Node.TEXT_NODE||!node.textContent.trim())continue;
       const range=document.createRange();range.selectNodeContents(node);
       if(Array.from(range.getClientRects()).some(crosses))bad.push({tag:el.tagName,id:el.id,text:node.textContent.trim(),kind:'rendered text'});
      }
     }
     return bad;
    };
    return {media:{w:innerWidth,touch:matchMedia('(pointer:coarse)').matches},doc:document.documentElement.scrollWidth,left:g(left),right:g(right),inner:g(inner),support:g(support),build:g(build),full,armor:armor&&g(armor),armorSelected:armor?.value,open:toggle.parentElement.open,
      fonts:Array.from(document.fonts).filter(f=>f.family.replaceAll('"','')==='M PLUS Rounded 1c'&&f.status==='loaded').map(f=>f.weight).sort(),
      outside:[outside(left),outside(right)],
      skillOutputSpill:$('skillOutput').scrollWidth-$('skillOutput').clientWidth};
   });
   t.diagnostic(JSON.stringify({width,height,x}));
   assert.equal(x.media.touch,touch);
   assert.deepEqual(x.fonts,['400','700'],'production bundled fonts are loaded before geometry measurement');
   assert.ok(Math.abs(x.left.y-x.right.y)<=1&&x.left.right<x.right.x,'armor and skills must share one row');
   assert.ok(Math.abs(x.left.w/(x.left.w+x.right.w)-.6)<.012,'left track must take 60% of available track widths');
   assert.ok(x.doc<=width+1&&x.media.w<=width+1,'page must not scroll horizontally');
   // Pane scrollWidth includes the decorative card ::before rule, not just controls/text.
   assert.deepEqual(x.outside,[[],[]],'rendered controls and text must stay in their own columns');
   assert.ok(x.skillOutputSpill<=1,'skill detail content must not overflow its own box');
   assert.ok(x.armor&&x.armorSelected==='99002'&&x.armor.right<=x.left.right+1,'main armor picker stays inside its column');
   if(width<=760)assert.ok(x.armor.h>=43.5,'narrow main picker stays tappable');
   assert.ok(x.open,'production skill details remain usable');
   assert.ok(x.support.y>=x.build.bottom&&x.support.w===x.build.w,'outside Build/Support keeps existing full-width stack');
   assert.ok(x.full.every(r=>Math.abs(r.w-x.inner.w)<=1),'adjacent build fields stay full width');
  }finally{await p.close();}
 }
});

test('navy picker colors stay in Hunter’s Support and Hunter’s Note keeps its light options',async t=>{
 const browser=await chromium.launch({headless:true});t.after(()=>browser.close());
 const p=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,colorScheme:'light'});
 t.after(()=>p.close());
 await p.route('**/*',r=>r.request().url()==='https://simulator.test/'?r.fulfill({contentType:'text/html',body:html}):r.abort());
 await installLocalModules(p);
 await p.goto('https://simulator.test/');
 const result=await p.evaluate(()=>['monster','monsterPart','comboMovePicker','weapon','weaponKind'].map(id=>{
  const control=document.getElementById(id);if(!(control instanceof HTMLSelectElement))throw Error('Missing select: '+id);
  if(!control.options.length)control.add(new Option('確認用'));
  const first=control.options[0];
  const c=getComputedStyle(control),o=getComputedStyle(first);
  const popup=CSS.supports('appearance','base-select')&&CSS.supports('selector(::picker(select))')?getComputedStyle(control,'::picker(select)'):null;
  return {id,support:!!control.closest('#betaSupportPanel'),appearance:c.appearance,scheme:c.colorScheme,ink:c.color,field:c.backgroundColor,optionInk:o.color,optionBackground:o.backgroundColor,popup:popup?.backgroundColor};
 }));
 assert.deepEqual(result.map(x=>[x.id,x.support]),[['monster',true],['monsterPart',true],['comboMovePicker',true],['weapon',false],['weaponKind',false]]);
 for(const x of result){
  if(!x.support){
   assert.equal(x.scheme,'light',x.id);
   assert.equal(x.ink,'rgb(32, 43, 57)',x.id);
   assert.equal(x.optionInk,'rgb(32, 43, 57)',x.id);
   assert.equal(x.optionBackground,'rgb(255, 255, 255)',x.id);
   assert.notEqual(x.field,'rgb(23, 38, 56)',x.id);
   assert.notEqual(x.appearance,'base-select',x.id);
   continue;
  }
  assert.equal(x.scheme,'dark',x.id);
  assert.equal(x.ink,'rgb(245, 248, 252)',x.id);
  assert.equal(x.optionInk,'rgb(245, 248, 252)',x.id);
  assert.equal(x.field,'rgb(23, 38, 56)',x.id);
  assert.equal(x.optionBackground,'rgb(23, 38, 56)',x.id);
  if(x.popup!==undefined)assert.equal(x.popup,'rgb(23, 38, 56)',x.id);
 }
});
