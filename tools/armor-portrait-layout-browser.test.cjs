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
    return {media:{w:innerWidth,touch:matchMedia('(pointer:coarse)').matches},doc:document.documentElement.scrollWidth,left:g(left),right:g(right),inner:g(inner),support:g(support),build:g(build),full,armor:armor&&g(armor),armorSelected:armor?.value,open:toggle.parentElement.open,
      fonts:Array.from(document.fonts).filter(f=>f.family.replaceAll('"','')==='M PLUS Rounded 1c'&&f.status==='loaded').map(f=>f.weight).sort(),
      spill:[left,right,$('skillOutput')].map(e=>e.scrollWidth-e.clientWidth)};
   });
   t.diagnostic(JSON.stringify({width,height,x}));
   assert.equal(x.media.touch,touch);
   assert.deepEqual(x.fonts,['400','700'],'production bundled fonts are loaded before geometry measurement');
   assert.ok(Math.abs(x.left.y-x.right.y)<=1&&x.left.right<x.right.x,'armor and skills must share one row');
   assert.ok(Math.abs(x.left.w/(x.left.w+x.right.w)-.6)<.012,'left track must take 60% of available track widths');
   assert.ok(x.doc<=width+1&&x.media.w<=width+1,'page must not scroll horizontally');
   assert.ok(x.spill.every(n=>n<=1),'neither track nor skill details can clip overflowing content');
   assert.ok(x.armor&&x.armorSelected==='99002'&&x.armor.right<=x.left.right+1,'main armor picker stays inside its column');
   if(width<=760)assert.ok(x.armor.h>=43.5,'narrow main picker stays tappable');
   assert.ok(x.open,'production skill details remain usable');
   assert.ok(x.support.y>=x.build.bottom&&x.support.w===x.build.w,'outside Build/Support keeps existing full-width stack');
   assert.ok(x.full.every(r=>Math.abs(r.w-x.inner.w)<=1),'adjacent build fields stay full width');
  }finally{await p.close();}
 }
});
