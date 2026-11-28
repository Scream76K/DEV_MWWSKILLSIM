const {test}=require('node:test');
const assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('./dom-test-setup.cjs');
function setup(t){
 const dom=new JSDOM(readSimulatorHtml(),{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));}});
 t.after(()=>dom.window.close());return dom.window;
}
const scorch=(fixed=20)=>({skill:'灼熱化Ⅰ',additionalDamage:{status:'available',fixed,element:18,total:fixed+18,includedInPower:false}});
const flayer=(level=3)=>({skillId:38,skill:'鎖刃刺撃',level,additionalDamage:{status:'unavailable',includedInPower:false}});
const channel=(value,notes)=>({execution:{status:'complete'},metrics:{comboTotalDamage:{status:'available',value}},diagnostics:{excludedSkillDamage:notes}});
const row=(name,n,m)=>({name,kind:'light-bowgun',power:{},oneHitPipeline:{channels:{normal:n,maximum:m}}});
function render(w,rows){
 const out=w.document.getElementById('compareOut');out.innerHTML=w.renderCompareTable(rows);return out;
}
const fixed=out=>out.querySelector('[data-comparison-metric="consumer-fixed"]');
test('fixed skill reference is a single terminal row with shared values only once and no change to main totals or report',t=>{
 const w=setup(t),notes=[scorch(),flayer(),{skill:'無関係',additionalDamage:{status:'unavailable',includedInPower:false}}];
 const rows=[row('参考あり',channel(698.5,notes),channel(866.1,notes)),row('参考なし',channel(698.5,[]),channel(698.5,[]))];
 w.qa=rows;w.eval('lastBuildComparisonRows=qa;lastBuildComparisonContext={}');
 const before=w.eval('JSON.stringify(lastBuildComparisonRows)');
 const report=()=>w.eval('JSON.stringify(createBuildComparisonReport(), (key,value) => key === "createdAt" ? undefined : value)');
 const saved=report(),out=render(w,rows),r=fixed(out);
 assert.ok(r,'fixed row is present'); assert.equal(r.nextElementSibling,null);
 assert.match(r.querySelector('th').textContent,/固定ダメージ.*発動1回.*合計に含めない/);
 assert.equal(r.cells[1].textContent,'①灼熱化Ⅰ；20.0②鎖刃刺撃 Lv3；下位160.0／上位220.0');
 assert.equal(r.cells[2].textContent,'—');
 assert.equal(out.querySelector('[data-comparison-metric="power-index"] td').textContent,'698.5');
 assert.equal(out.querySelector('[data-comparison-metric="max-power-index"] td').textContent,'866.1（+24.0%）');
 assert.equal(report(),saved);assert.equal(w.eval('JSON.stringify(lastBuildComparisonRows)'),before);
});
test('fixed row labels differing channels separately, keeps unknowns, and never takes count or total from a skill',t=>{
 const w=setup(t),out=render(w,[row('参考',channel(40,[scorch(),flayer(2)]),channel(50,[
  {skill:'灼熱化Ⅰ',additionalDamage:{status:'unavailable',fixed:20,includedInPower:false}},
  flayer(6),{skill:'&<unsupported>',additionalDamage:{status:'available',fixed:12,includedInPower:true}},
 ]))]);
 const s=fixed(out).cells[1].textContent;
 assert.match(s,/通常①灼熱化Ⅰ；20.0②鎖刃刺撃 Lv2；下位120.0／上位160.0/);
 assert.match(s,/最大①灼熱化Ⅰ；未算出②鎖刃刺撃 Lv6；未算出/);
 assert.doesNotMatch(s,/&<unsupported>|38\.0/);
});
test('combo panel is directly above the first comparison table after explanatory notes',t=>{
 const w=setup(t),r=row('テスト',channel(40,[]),channel(50,[]));
 const out=render(w,[r]),p=out.querySelector('[data-used-combo]');
 assert.ok(p);assert.equal(p.nextElementSibling,out.querySelector('.compare-table'));
});

test('comparison collapses repeating skill omissions without hiding which results are partial',t=>{
 const w=setup(t);
 const dark={name:'ダークアーツ追加波',level:1,skillId:172,reason:'DARK_ARTS_WAVE:PER_HIT_BUFF_INTERACTIONS_PENDING'};
 const other={name:'別の効果',level:1,skillId:999,reason:'INTERNAL_CODE'};
 const make=(effects,unappliedEffects=[])=>({...channel(40,[]),diagnostics:{ignoredSkillEffects:effects,unappliedEffects}});
 const rows=[row('A <一>',make([dark]),make([dark])),row('B',make([dark,dark]),make([dark],[other])),row('C',make([]),make([]))];
 w.qa=rows;w.eval('lastBuildComparisonRows=qa;lastBuildComparisonContext={}');
 const report=()=>w.eval('JSON.stringify(createBuildComparisonReport(), (key,value) => key === "createdAt" ? undefined : value)');
 const saved=report(),out=render(w,rows);
 const notes=out.querySelectorAll('details[data-comparison-skill-omissions]');
 assert.equal(notes.length,1);
 const d=notes[0];
 assert.equal(d.open,false);
 assert.equal(d.querySelector('summary').textContent,'火力に未反映の効果：ダークアーツ追加波、別の効果');
 const items=[...d.querySelectorAll('li')].map(x=>x.textContent);
 assert.deepEqual(items,['ダークアーツ追加波：A <一>・B（通常・最大）','別の効果：B（最大のみ）']);
 assert.doesNotMatch(d.textContent,/INTERNAL_CODE|PER_HIT|\bID\b/);
 assert.equal(out.querySelectorAll('[data-ignored-skill-channel]').length,0);
 assert.match(saved,/DARK_ARTS_WAVE:PER_HIT_BUFF_INTERACTIONS_PENDING/);
 assert.equal(report(),saved);
 assert.equal(render(w,[rows[2]]).querySelector('[data-comparison-skill-omissions]'),null);
});
