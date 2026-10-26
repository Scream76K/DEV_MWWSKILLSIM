const fs=require('fs'),cp=require('child_process'),crypto=require('crypto');
const deps='/Users/scream/Documents/Codex/2026-10-18/task/himmel-db-route-pqr4v6qt/dependencies/node_modules/';
const {JSDOM,VirtualConsole}=require(deps+'jsdom');
const {chromium}=require(deps+'playwright');
const root=process.cwd(),html=fs.readFileSync('index.html','utf8');
const dom=new JSDOM(require(root+'/tools/dom-test-setup.cjs').readSimulatorHtml(),{url:'https://offline.test',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}});
(async()=>{const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1184,height:1000}});const results=[];
for(const state of [{element:372,elementType:'dragon',elementKnown:true,typeKnown:true,elementStatus:'KNOWN'},{element:0,elementType:'',elementKnown:true,typeKnown:true,elementStatus:'CONFIRMED_NONE'},{element:null,elementType:'',elementKnown:false,typeKnown:false,elementStatus:'UNKNOWN'}]){
dom.window.eval(`calcState={total:{},rawTotal:{},bonusDisplay:{series:[],group:[]},stats:{attack:247,attackTrue:247,affinity:22,maxAffinity:79,defense:459,...${JSON.stringify(state)}},realOneHit:{status:'UNAVAILABLE',reason:'REAL_SLICE:TECHNIQUE_NOT_FOUND:bow_shot'}};renderSummary();`);
const rendered=dom.window.document.getElementById('buildSummary').outerHTML;
const styles=[...html.matchAll(/<style\b[^>]*>[\s\S]*?<\/style>/gi)].map(m=>m[0]).join('');
await page.setContent(styles+'<div style="width:272px">'+rendered+'</div>');
results.push(await page.evaluate(()=>{const box=document.querySelector('.game-status').getBoundingClientRect();return [...document.querySelectorAll('.gs-row')].map(r=>{const v=r.querySelector('.gs-value'),b=v.getBoundingClientRect();return {label:r.querySelector('.gs-label').textContent,value:v.textContent,within:b.left>=box.left&&b.right<=box.right+1};});}));
}
await browser.close();dom.window.close();const pass=results.every(rows=>rows.every(r=>r.within))&&results[0][3].value.includes('龍')&&results[1][3].value.includes('無属性')&&results[1][3].value.includes('0')&&results[2][3].value.includes('未算出');console.log(JSON.stringify({head:cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),indexSha256:crypto.createHash('sha256').update(html).digest('hex'),scope:'Synthetic renderer fixtures, production renderSummary and CSS; isolated headless Chromium, no equipment/formula validation or user-browser state access',results,pass},null,2));process.exitCode=pass?0:1;})().catch(e=>{console.error(e);dom.window.close();process.exitCode=1;});
