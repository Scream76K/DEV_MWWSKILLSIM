'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const {installLocalModules}=require('./browser-test-setup.cjs');
const savedFixture=require('../tests/fixtures/comparison-session-inputs.json').cases.find(x=>x.kind==='great-sword');
const data=require('../docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json').data;
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const names=['A <装備>', 'B ロングビルド名'.repeat(6),'C'];

test('saved skill comparison shares the editor UI, remains isolated, and fits all three columns at phone widths',async t=>{
 const browser=await chromium.launch({headless:true});
 t.after(()=>browser.close());
 for(const [width,height] of [[320,693],[390,844],[852,393],[1024,768],[1440,900]]){
  const p=await browser.newPage({viewport:{width,height},isMobile:width<1025,hasTouch:width<1025});
  try{
   await p.route('**/*',r=>r.request().url()==='https://simulator.test/'?r.fulfill({contentType:'text/html',body:html}):r.abort());
   await installLocalModules(p);
   await p.route(/^https:\/\/simulator\.test\/assets\/fonts\/mplus-rounded-ui-(?:regular|bold)\.woff2$/,r=>
    r.fulfill({contentType:'font/woff2',path:path.join(__dirname,'..',new URL(r.request().url()).pathname)}));
   await p.goto('https://simulator.test/');
   await p.evaluate(()=>Promise.all([400,700].map(weight=>document.fonts.load(weight+' 14px "M PLUS Rounded 1c"'))));
   const before=await p.evaluate(({data,snapshots,names})=>{
    DB=normalizeDB(data);weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);
    App.data.set(DB,emptyDataState());renderAll();renderMonsters();
    const C=structuredClone(snapshots[1]); C.charmCustom.skills=[];
    const expected=[...snapshots,C].map((s,i)=>{
     applyBuildSnapshot(s);$('buildName').value=names[i];$('saveBuild').click();
     if(!savedBuildMap()[names[i]])throw new Error($('buildSaveStatus').textContent);
     return $('skillOutput').innerHTML;
    });
    applyBuildSnapshot(snapshots[0]); const live=structuredClone(snapshots[0]); live.armor.legs='';
    live.charmCustom.skills=[];applyBuildSnapshot(live);
    const payload=localStorage.getItem('mh-wilds-builds-v625');
    return {build:buildSnapshotComparable(buildSnapshot()),payload,expected,live:$('skillOutput').innerHTML};
   },{data,snapshots:savedFixture.inputSnapshots,names});
   assert.equal(new Set(before.expected).size,3,'distinct saved skill lists');
   assert.ok(before.expected.every(x=>x!==before.live),'editor uses a fourth skill configuration');
   const docBefore=await p.evaluate(()=>document.documentElement.scrollWidth);
   const options=await p.locator('#compareBuilds [data-compare-name]').all();
   for(const option of options)await option.check();
   await p.locator('#runCompare').click();
   const columns=p.locator('#compareOut [data-saved-skill-column]');
   assert.equal(await columns.count(),3,'one column per compared save');
   assert.deepEqual(await columns.locator('h4').allTextContents(),names);
   assert.deepEqual(await columns.locator('.compare-skill-panel').evaluateAll(nodes=>nodes.map(n=>n.innerHTML)),before.expected);

   const assertSectionAlignment=async()=>{
    for(const label of ['シリーズスキル','グループスキル']){
     const tops=await columns.locator('.skill-bucket-title').filter({hasText:label}).evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().top));
     assert.equal(tops.length,3,label);
     assert.ok(tops.every(top=>Math.abs(top-tops[0])<1),JSON.stringify({width,label,tops}));
    }
   };
   await assertSectionAlignment();

   assert.deepEqual(await p.evaluate(()=>({build:buildSnapshotComparable(buildSnapshot()),payload:localStorage.getItem('mh-wilds-builds-v625'),live:$('skillOutput').innerHTML})),{build:before.build,payload:before.payload,live:before.live});
   const summary=columns.first().locator('.skill-info > summary').filter({hasText:'攻撃'}).first();
   await summary.click();
   const card=summary.locator('..');
   assert.match(await card.locator('.skill-info-body').innerText(),/Lv\dの効果/);
   await card.locator('.skill-ranks > summary').click();
   assert.equal(await card.locator('.skill-ranks[open] .skill-rank-current').count(),1);
   assert.equal(await columns.nth(1).locator('.skill-info[open]').count(),0,'opening one card never opens another build');
   await assertSectionAlignment();
   const g=await p.locator('.compare-skill-scroll').evaluate((e,nominal)=>({
    visible:e.clientWidth,content:e.scrollWidth,doc:document.documentElement.scrollWidth,
    offenders:[...document.querySelectorAll('main *')].filter(n=>!n.closest('.compare-skill-scroll')&&n.getBoundingClientRect().right>nominal+1).slice(0,20).map(n=>[n.nodeName,n.id,n.className,n.getBoundingClientRect().right]),
    spilling:[...document.querySelectorAll('#compareOut *')].filter(n=>!n.closest('.compare-skill-scroll')&&n.scrollWidth>n.clientWidth+8&&n.getBoundingClientRect().height>0).slice(0,20).map(n=>[n.nodeName,n.id,n.className,n.clientWidth,n.scrollWidth,n.textContent.slice(0,36)]),
    cardSpill:[...e.querySelectorAll('.skill-game,.skill-info-toggle,.skill-bucket-title,.skill-info-body')].filter(n=>n.scrollWidth>n.clientWidth+1).map(n=>[n.className,n.clientWidth,n.scrollWidth]),
    row:[...e.querySelectorAll('[data-saved-skill-column]')].map(x=>{const r=x.getBoundingClientRect();return [r.left,r.top,r.right];}),
   }),width);
   assert.ok(g.doc<=width+1,JSON.stringify({width,docBefore,g}));
   assert.ok(g.row.every((r,i)=>r[1]===g.row[0][1]&&(!i||r[0]>=g.row[i-1][2])));
   assert.ok(g.content<=g.visible+1,JSON.stringify({width,docBefore,g}));
   assert.deepEqual(g.cardSpill,[],JSON.stringify({width,cardSpill:g.cardSpill}));
   assert.deepEqual(await p.locator('#compareOut .compare-table thead th:not(:first-child)').allTextContents(),names);
   assert.doesNotMatch(await p.evaluate(()=>JSON.stringify(createBuildComparisonReport())),/compare-skill-panel|skill-info-toggle/,'display markup does not enter the report');
   await options[2].uncheck();
   await p.locator('#runCompare').click();
   assert.deepEqual(await columns.locator('h4').allTextContents(),names.slice(0,2));
   await options[1].uncheck();
   await p.locator('#runCompare').click();
   assert.deepEqual(await columns.locator('h4').allTextContents(),[names[0]]);
   if(width===390){
    await p.evaluate(name=>{
     const map=savedBuildMap();delete map[name].charmCustom;
     localStorage.setItem('mh-wilds-builds-v625',JSON.stringify(map));
    },names[1]);
    await options[1].check();
    await p.locator('#runCompare').click();
    assert.equal(await columns.first().locator('.compare-skill-panel').innerHTML(),before.expected[0]);
    assert.match(await columns.nth(1).locator('.compare-skill-panel').innerText(),/スキル構成を確認できません/);
    assert.equal(await columns.nth(1).locator('.skill-game').count(),0);
   }
  }finally{await p.close();}
 }
});
