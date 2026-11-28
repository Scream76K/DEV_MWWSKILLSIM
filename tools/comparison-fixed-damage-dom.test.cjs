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
 assert.equal(out.querySelector('[data-comparison-metric="power-index"] th').textContent,'通常火力');
 assert.equal(out.querySelector('[data-comparison-metric="power-index"] td').textContent,'698.5');
 assert.equal(out.querySelector('[data-comparison-metric="max-power-index"] th').textContent,'最大火力（通常火力比）');
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
 const notes=out.querySelectorAll('details[data-comparison-notes]');
 assert.equal(notes.length,1);
 const d=notes[0];
 assert.equal(d.open,false);
 assert.equal(d.querySelector('summary').textContent,'火力計算の注釈');
 const items=[...d.querySelectorAll('[data-comparison-skill-omissions]')].map(x=>[
  x.closest('[data-comparison-note-builds]').querySelector(':scope > strong').textContent,
  x.parentElement.querySelector(':scope > strong').textContent,x.textContent]);
 assert.deepEqual(items,[['A <一>・B','（通常・最大）','未反映：ダークアーツ追加波'],['B','（最大のみ）','未反映：別の効果']]);
 assert.doesNotMatch(d.textContent,/INTERNAL_CODE|PER_HIT|\bID\b/);
 assert.equal(out.querySelectorAll('[data-ignored-skill-channel]').length,0);
 assert.match(saved,/DARK_ARTS_WAVE:PER_HIT_BUFF_INTERACTIONS_PENDING/);
 assert.equal(report(),saved);
 assert.equal(render(w,[rows[2]]).querySelector('[data-comparison-skill-omissions]'),null);
});

test('all comparison annotations share one closed panel and deduplicate conversions by build and channel',t=>{
 const w=setup(t);
 const convert=(active,effectiveElement)=>({active,baseElement:320,effectiveElement});
 const c=(base,conversion)=>({...base,diagnostics:{...base.diagnostics,attributeConversion:conversion,thunderResistanceConversion:{baseElement:100,effectiveElement:150}}});
 const rows=[row('A',c(channel(40,[]),convert(false,320)),c(channel(60,[]),convert(true,400))),row('B',c(channel(45,[]),convert(false,320)),c(channel(65,[]),convert(true,400)))];
 const out=render(w,rows),notes=out.querySelector('details[data-comparison-notes]');
 assert.ok(notes&&!notes.open);
 assert.equal(notes.querySelector('summary').textContent,'火力計算の注釈');
 assert.equal(out.querySelectorAll('.compare-results details').length,1);
 assert.equal(out.textContent.match(/耐性変換・雷100→150/g)?.length,1);
 assert.equal(out.textContent.match(/属性変換非発動・龍320→320/g)?.length,1);
 assert.equal(out.textContent.match(/属性変換発動・龍320→400/g)?.length,1);
 assert.match(notes.querySelector('[data-comparison-note-shared]').textContent,/全ビルド共通（通常のみ）.*属性変換非発動/);
 assert.match(notes.querySelector('[data-comparison-note-shared]').textContent,/（最大のみ）.*属性変換発動/);
 for(const e of out.querySelectorAll('[data-comparison-note]'))assert.ok(notes.contains(e));
});

test('policy exclusion and uncalculated extra damage for one skill share a line and one scope heading',t=>{
 const w=setup(t);
 const convert={skillId:152,skill:'属性変換',additionalDamage:{status:'unavailable',includedInPower:false}};
 const excluded={skillId:152,name:'属性変換',reason:'ユーザー指定により今回の火力計算対象外（装備・保存は保持）'};
 const ch=(withPolicy=true)=>({...channel(40,[flayer(),convert]),diagnostics:{excludedCalculationSkills:withPolicy?[excluded]:[],excludedSkillDamage:[flayer(),convert]}});
 const rows=[row('確認用 大剣 1',ch(),ch()),row('確認用 大剣 2',ch(),ch()),row('確認用 大剣 3',ch(),ch())];
 const original=JSON.stringify(rows);
 const note=render(w,rows).querySelector('details[data-comparison-notes]');
 const target=[...note.querySelectorAll('[data-comparison-note-shared] > strong')];
 assert.deepEqual(target.map(x=>x.textContent),['全ビルド共通']);
 assert.equal(target[0].parentElement.querySelector('[data-comparison-note] > strong').textContent,'（通常・最大）');
 const texts=[...target[0].parentElement.querySelectorAll('p')].map(x=>x.textContent);
 assert.deepEqual(texts.filter(x=>x.startsWith('属性変換')),['属性変換：今回の火力計算の対象外です（追加ダメージは未算出）。']);
 assert.ok(texts.some(x=>x.startsWith('鎖刃刺撃：')));
 assert.equal(JSON.stringify(rows),original);
 const split=render(w,[row('別ビルド',ch(),ch(false))]).querySelector('details[data-comparison-notes]');
 assert.match(split.textContent,/別ビルド（通常のみ）属性変換：今回の火力計算の対象外/);
 assert.match(split.textContent,/（最大のみ）.*属性変換：追加ダメージは未算出/);
 assert.equal(split.querySelectorAll(':scope > [data-comparison-note-builds] > strong').length,1);
});

test('calculation conditions and exclusions appear under shared and differing build headings',t=>{
 const w=setup(t),excluded={skillId:152,name:'属性変換',reason:'今回の火力計算対象外'};
 const caseOf=(name,level,attackAdd)=>{
  const c={...channel(40,[]),diagnostics:{excludedCalculationSkills:[excluded]}};
  return {...row(name,c,c),power:{conditionPlan:{applied:[{skill:'連撃',level:1,attackAdd:10,elementAdd:80},{skill:'逆恨み',level:1,attackAdd:0},{skill:'逆襲',level,attackAdd}],excluded:[]}}};
 };
 const notes=render(w,[caseOf('A',3,25),caseOf('B',2,15),caseOf('C',2,15)]).querySelector('details[data-comparison-notes]');
 const common=notes.querySelector('[data-comparison-note-shared]');
 assert.equal(common.querySelector(':scope > strong').textContent,'全ビルド共通');
 assert.match(common.textContent,/属性変換.*連撃 Lv1（攻撃\+10、属性\+80）/s);
 assert.equal(notes.textContent.match(/連撃 Lv1/g)?.length,1);
 assert.doesNotMatch(notes.textContent,/逆恨み|火力指数の適用条件/);
 const groups=[...notes.querySelectorAll(':scope > [data-comparison-note-builds]')];
 assert.ok(groups.some(g=>g.querySelector(':scope > strong')?.textContent==='A'&&g.textContent.includes('逆襲 Lv3（攻撃+25）')));
 assert.ok(groups.some(g=>g.querySelector(':scope > strong')?.textContent==='B・C'&&g.textContent.includes('逆襲 Lv2（攻撃+15）')));
});

test('skill composition does not display the redundant current damage block',t=>{
 const w=setup(t);
 const editor=w.document.querySelector('#skillWorkspaceRight #buildSummary');
 assert.ok(editor);
 editor.innerHTML='<div class="gs-row gs-one-hit-result">選択技の実計算</div><div class="gs-row">会心率</div>';
 assert.equal(w.getComputedStyle(editor.firstElementChild).display,'none');
 assert.notEqual(w.getComputedStyle(editor.lastElementChild).display,'none');
});
