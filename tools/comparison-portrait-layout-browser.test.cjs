'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {installLocalModules}=require('./browser-test-setup.cjs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const cases=[{width:320,height:693},{width:375,height:812},{width:390,height:844},{width:430,height:932},{width:1440,height:900}];

test('primary comparison keeps every result column and its rendered text inside the portrait table',async t=>{
 const launch={headless:true};
 if(process.env.CHROMIUM_EXECUTABLE){launch.executablePath=process.env.CHROMIUM_EXECUTABLE;launch.args=JSON.parse(process.env.CHROMIUM_ARGS||'["--no-sandbox"]');}
 const browser=await chromium.launch(launch);t.after(()=>browser.close());
 const audit=[];
 for(const {width,height} of cases){
  const mobile=width<=430;
  const page=await browser.newPage({viewport:{width,height},isMobile:mobile,hasTouch:mobile});
  try{
   await page.route('**/*',r=>r.request().url()==='https://simulator.test/'?r.fulfill({contentType:'text/html',body:html}):r.abort());
   await installLocalModules(page);
   await page.route(/^https:\/\/simulator\.test\/assets\/fonts\/mplus-rounded-ui-(?:regular|bold)\.woff2$/,r=>r.fulfill({
    contentType:'font/woff2',path:path.join(__dirname,'..',new URL(r.request().url()).pathname),
   }));
   await page.goto('https://simulator.test/');
   for(let count=1;count<=3;count++){
    const result=await page.evaluate(async count=>{
     const out=document.getElementById('compareOut');
     const names=['QA 1 こたつ・三連射','QA 2 SALADA・3技','追加検証・超長い日本語のビルド名とUnbrokenLongEnglishMix095A'];
     const state=(physical,element,fixedDamage)=>({execution:{status:'complete'},metrics:{comboTotalDamage:{status:'available',value:physical+element}},
      components:[{id:'body',status:'available',value:physical+element,details:{physical,element,fixed:0}}],
      diagnostics:{excludedSkillDamage:[{skill:'灼熱化Ⅰ',additionalDamage:{includedInPower:false,status:'available',fixed:fixedDamage}},
       {skill:'追加固定・非常に長い名前',additionalDamage:{includedInPower:false,status:'available',fixed:160}}]}});
     const rows=names.slice(0,count).map((name,i)=>({name,kind:'bow',elementType:'dragon',power:{},oneHitPipeline:{channels:{
      normal:state(i===0?836.9:836.8,145.08,20),maximum:state(i===0?1068.0:1060.04,160.68,20),
     }}}));
     lastBuildComparisonRows=rows;lastBuildComparisonBaselineIndex=0;renderCachedBuildComparison();
     for(let el=out;el;el=el.parentElement)if(el.localName==='details')el.open=true;
     await Promise.all([400,700].map(weight=>document.fonts.load(weight+' 12px "M PLUS Rounded 1c"')));
     await document.fonts.ready;
     const frame=out.querySelector('.compare-results > .compare-table'),table=frame.querySelector('table'),bounds=frame.getBoundingClientRect();
     const tableBox=table.getBoundingClientRect(),bad=[],cells=[...table.querySelectorAll('th,td')];
     for(const cell of cells){
      const r=cell.getBoundingClientRect();if(r.width===0||r.height===0)continue;
      if(r.left<bounds.left-1||r.right>bounds.right+1)bad.push('CELL '+cell.textContent.trim().slice(0,60));
      const walker=document.createTreeWalker(cell,NodeFilter.SHOW_TEXT);
      for(let node;node=walker.nextNode();){
       if(!node.textContent.trim())continue;
       const range=document.createRange();range.selectNodeContents(node);
       for(const line of range.getClientRects())if(line.width>0&&(line.left<r.left-1||line.right>r.right+1||line.left<bounds.left-1||line.right>bounds.right+1))
        bad.push('TEXT '+node.textContent.trim().slice(0,60));
      }
     }
     const vals=key=>[...table.querySelectorAll('[data-comparison-metric="'+key+'"] td')].map(e=>e.textContent.trim());
     const strong=table.querySelector('[data-comparison-metric="max-power-index"] td .compare-damage-value');
     const delta=strong.parentElement.querySelector('.compare-damage-delta');
     const stacked=!!delta&&delta.getBoundingClientRect().top>=strong.getBoundingClientRect().bottom-1&&getComputedStyle(delta).display==='block';
     const plain=table.querySelector('[data-comparison-metric="max-power-index"] td');
     return {stacked,heads:[...table.querySelectorAll('thead th')].slice(1).map(e=>e.textContent.trim()),names:names.slice(0,count),
      element:vals('consumer-maximum-element'),fixed:vals('consumer-fixed'),normal:vals('power-index'),max:vals('max-power-index'),
      emphasis:Number.parseFloat(getComputedStyle(strong).fontSize)>Number.parseFloat(getComputedStyle(plain).fontSize),
      minWidth:getComputedStyle(table).minWidth,frameLeft:bounds.left,frameRight:bounds.right,frameClient:frame.clientWidth,frameScroll:frame.scrollWidth,
      tableWidth:tableBox.width,bad:[...new Set(bad)].slice(0,12)};
    },count);
    assert.deepEqual(result.heads,result.names);
    assert.deepEqual(result.element,Array(count).fill('160.7\n+10.8%'));
    assert.ok(result.fixed.every(x=>x.includes('長い名前；160.0')));
    assert.deepEqual(result.normal,['982.0','981.9','981.9'].slice(0,count));
    assert.equal(result.max.length,count);assert.ok(result.emphasis);assert.ok(result.stacked);
    if(!mobile)assert.equal(result.minWidth,(112+120*count)+'px','desktop keeps its original table sizing');
    audit.push({width,count,scroll:result.frameScroll-result.frameClient,frame:[result.frameLeft,result.frameRight],tableWidth:result.tableWidth,bad:result.bad});
   }
  }finally{await page.close();}
 }
 t.diagnostic(JSON.stringify(audit));
 assert.deepEqual(audit.filter(x=>x.scroll>1||x.frame[0]<-1||x.frame[1]>x.width+1||x.bad.length),[],'all columns and text must fit without horizontal scrolling');
});
