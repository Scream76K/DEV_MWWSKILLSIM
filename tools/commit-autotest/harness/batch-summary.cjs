'use strict';
const stageDefinitions=[
 ['gs-smoke.cjs','gs-smoke.json','大剣の期待値・保存/A-B'],
 ['representative-14.cjs','representative-14.json','14武器の代表ケース'],
 ['skill-scan.cjs','skill-scan.json','全対象スキルLv・対照比較'],
 ['uncalculated-diagnostics.cjs','uncalculated-diagnostics.json','未算出原因の分類'],
 ['resistance-conditions.cjs','resistance-conditions.json','耐性変換の条件'],
 ['gl-affinity.cjs','gl-affinity.json','GLの斬撃・砲撃'],
 ['skill-technique.cjs','skill-technique.json','破壊王・飛燕の技条件'],
 ['charge-master.cjs','charge-master.json','チャージマスターと大剣資料式']
];
const names={'great-sword':'大剣','long-sword':'太刀','sword-shield':'片手剣','sword-and-shield':'片手剣','dual-blades':'双剣','hammer':'ハンマー','hunting-horn':'狩猟笛','lance':'ランス','gunlance':'ガンランス','switch-axe':'スラッシュアックス','charge-blade':'チャージアックス','insect-glaive':'操虫棍','light-bowgun':'ライトボウガン','heavy-bowgun':'ヘビィボウガン','bow':'弓'};
const knownTests=new Set(['EFFECTIVE_SHARPNESS_KEY_MISMATCH','IMMEDIATE_FULL_RESULT_RESTORE']);
function gsComparisons(gs){
 const cases=gs?.independentExpectedDamage?.cases;if(!Array.isArray(cases))return null;
 const items=cases.flatMap(c=>Object.values(c.channels||{}).flatMap(ch=>[...(ch.components||[]),ch]));
 return {compared:items.length,matched:items.filter(c=>c.match===true).length,mismatches:items.filter(c=>c.match!==true).length,status:gs.independentExpectedDamage.status,absoluteTolerance:gs.independentExpectedDamage.absoluteTolerance};
}
function summarize({runId,startedAt,finishedAt,runs,reports,inputIntegrity,environment}){
 const get=file=>reports[file]||null,gs=get('gs-smoke.json'),rep=get('representative-14.json'),scan=get('skill-scan.json'),condition=get('skill-conditions.json'),uc=get('uncalculated-diagnostics.json');
 const diagnostics=stageDefinitions.slice(4).map(([script,file,label])=>({file,label,counts:get(file)?.counts||null,status:get(file)?.status||null}));
 const expectedGs=gsComparisons(gs),expectedCondition=condition?.independentExpectedComparison||null;
 const allFailures=gs?.knownFailures||[],knownFailures=allFailures.filter(x=>knownTests.has(x.test)),otherGsFailures=allFailures.filter(x=>!knownTests.has(x.test));
 const missing=stageDefinitions.filter(([script,file])=>!runs.some(r=>r.file===script)||!get(file)).map(x=>x[1]);if(!condition)missing.push('skill-conditions.json');
 const harnessFailures=(rep?.counts?.harnessFailures||0)+(scan?.counts?.harnessFailures||0)+(condition?.counts?.harnessFailures||0)+diagnostics.reduce((n,x)=>n+(x.counts?.harnessFailures||0),0)+(gs?.failure?1:0);
 const unexpectedProcesses=runs.filter(r=>r.error||r.skipped||![0,2].includes(r.exitCode));
 const reviewRequired=(condition?.counts?.reviewRequired||0)+diagnostics.reduce((n,x)=>n+(x.counts?.reviewRequired||0),0)+(uc?.unmatchedEvidenceCount||0);
 const requiredChangeMissing=(scan?.cases||[]).filter(c=>c.comparison?.decision==='REVIEW_REQUIRED_EXPECTED_CHANGE_MISSING');
 const unexpectedChange=(scan?.cases||[]).filter(c=>c.comparison?.decision==='REVIEW_REQUIRED_UNEXPECTED_CHANGE');
 const comparisonCounts=scan?.comparisonCounts||null;
 const conditionUnresolved=(scan?.cases||[]).filter(c=>c.comparison?.decision==='REVIEW_CONDITIONS_UNRESOLVED');
 const noChangeUnresolved=conditionUnresolved.filter(c=>Object.values(c.comparison.channels||{}).every(ch=>ch.changed===false));
 const incomplete=missing.length>0||unexpectedProcesses.length>0||harnessFailures>0||!inputIntegrity?.unchanged||!expectedGs||!expectedCondition||scan?.smoke===true||condition?.smoke===true||diagnostics.some(x=>get(x.file)?.smoke===true);
 const findings=(scan?.counts?.uncalculated||0)+(rep?.counts?.blocked||0)+knownFailures.length+otherGsFailures.length+reviewRequired+requiredChangeMissing.length+unexpectedChange.length+(expectedGs?.mismatches||0)+(expectedCondition?.mismatches||0)+conditionUnresolved.length;
 const exitCode=incomplete?3:findings||runs.some(r=>r.exitCode!==0)?2:0;
 return {schemaVersion:1,runId,startedAt,finishedAt:finishedAt||null,status:incomplete?'EXECUTION_INCOMPLETE':exitCode===2?'COMPLETED_WITH_FINDINGS':'COMPLETED_NO_DETECTED_FINDINGS_WITHIN_SCOPE',exitCode,sourceCommit:gs?.sourceCommit||scan?.sourceCommit||null,environment,previousCloudResultsReusedAsCurrent:false,runs,missingCurrentReports:missing,unexpectedProcesses,harnessFailures,inputIntegrity,numericAcquisition:{representative:rep?.counts||null,skillScan:scan?.counts||null,independentNumericAccuracyOfWholeScan:false},expectedValueComparisons:{greatSword:expectedGs,adoptedGreatSwordSkills:expectedCondition?{compared:expectedCondition.scalarComparisons,matched:expectedCondition.scalarComparisons-expectedCondition.mismatches,mismatches:expectedCondition.mismatches,status:expectedCondition.status,absoluteTolerance:expectedCondition.absoluteTolerance}:null,gameAccuracyVerified:false},knownFailures,otherGsFailures,reviewRequired,skillEffectComparison:{counts:comparisonCounts,requiredChangeMissing:requiredChangeMissing.length,unexpectedChange:unexpectedChange.length,conditionsUnresolved:conditionUnresolved.length,noChangeWithUnresolvedConditions:noChangeUnresolved.length},routes:scan?.routeCounts||null,uncalculatedCauses:uc?{count:uc.uniqueCaseCount,primaryCauseCounts:uc.primaryCauseCounts,attributionCounts:uc.attributionCounts,unmatchedEvidence:uc.unmatchedEvidenceCount}:null,diagnostics,tenShotGunnerCoverage:rep?.tenShotGunnerCoverage||'NOT_IMPLEMENTED_NOT_TESTED',limitations:['数値取得・条件再現と数値正当性は別。独立期待値の範囲は大剣の資料式だけ。','チャージマスター大剣限定の採用を他武器へ拡大しない。','追加診断は元130未算出や既知4失敗を解決済みにしない。','通常弾10射は未実装・未検証。','実ゲーム版・丸め・HP減少・実ブラウザ・Macホスト・Linux ARM64 VM実機は未検証。','合成護石の入手可能性・全装備の合法性・全スキル組合せは未検証。','一部初期化はcalcBuildを2回呼ぶ。実際の保存読込は別枠で検査。']};
}
function japanese(s){
 const n=x=>x===null||x===undefined?'未実行/未取得':String(x),a=s.numericAcquisition,expected=s.expectedValueComparisons;
 const result=s.exitCode===3?'実行未完了 / 実行異常あり':s.exitCode===2?'一括実行完了 / 未算出・要確認・既知失敗あり':'今回の検査範囲で検出事項なし（全数値の正当性保証ではない）';
 const lines=['MH Wilds 自動テスト 日本語サマリー','',result,`終了コード: ${s.exitCode}`,`実行ID: ${s.runId}`,`開始: ${s.startedAt}`,`終了: ${s.finishedAt||'実行中'}`,`環境: Linux ${s.environment?.architecture||'不明'} / Node ${s.environment?.nodeVersion||'不明'}。Macホスト検証とは別。`,`検査対象SHA: ${s.sourceCommit||'未取得'}`,'','【数値取得】',`14武器代表: ${n(a.representative?.numericAvailable)} / ${n(a.representative?.attempted)} 件。全武器の正しい値を保証する判定ではありません。`,`スキルLv: 計画 ${n(a.skillScan?.planned)} 組 / 数値取得 ${n(a.skillScan?.calculated)} / 未算出 ${n(a.skillScan?.uncalculated)} / 明示武器条件による対象外 ${n(a.skillScan?.nonTargetWeapon)}。`,`その他原本rank: 今回の候補選択外 ${n(a.skillScan?.notSelectedRawRanks)}（分類未確定 ${n(a.skillScan?.unresolvedClassificationRanks)} を含む）。`,'','【期待値一致】'];
 for(const [label,e] of [['大剣2件の独立資料式',expected.greatSword],['大剣条件8件の既採用係数による資料式',expected.adoptedGreatSwordSkills]])lines.push(e?`${label}: ${e.matched}/${e.compared} 比較一致、不一致 ${e.mismatches}。許容差 ${e.absoluteTolerance}。\n  ${e.status}`:`${label}: 未実行/結果欠落。`);
 lines.push('上記は未丸め資料式の照合です。実ゲーム・版・表示丸め・実HPの正当性検証ではありません。','','【未算出・既知失敗・要確認】',`未算出 ${n(a.skillScan?.uncalculated)} 組を保持。不具合件数とは断定しません。`,`既知GS失敗: ${s.knownFailures.length} 件。`);
 for(const f of s.knownFailures)lines.push(`- ${f.name}: ${f.test==='EFFECTIVE_SHARPNESS_KEY_MISMATCH'?'実効斬れ味とconditionKeyが不一致':'個別読込直後のmetadataに前武器の表示入力が残る'}`);
 lines.push(`追加診断の要確認: ${s.reviewRequired} / ハーネス異常: ${s.harnessFailures} / 未分類GS失敗: ${s.otherGsFailures.length}。`,`同条件対照: 条件未確定 ${s.skillEffectComparison.conditionsUnresolved} 組。そのうち通常・最大とも無変化 ${s.skillEffectComparison.noChangeWithUnresolvedConditions} 組。`,`必要な変化なし候補: ${s.skillEffectComparison.requiredChangeMissing} 組 / 非適用想定なのに変化した候補 ${s.skillEffectComparison.unexpectedChange} 組。未発動/無属性などは不具合と断定しません。`);
 if(s.routes)lines.push(`実到達: Pipeline ${n(s.routes.PIPELINE_EVALUATE_REACHED)} / adapter止まり ${n(s.routes.ADAPTER_ONLY_PRE_PIPELINE_RETURN)} / 非実行 ${n(s.routes.NOT_EVALUATED)}。`);
 lines.push('','【追加診断】');for(const d of s.diagnostics)lines.push(`${d.label}: ${d.counts?d.counts.attempted+' ケース、要確認 '+d.counts.reviewRequired+'、ハーネス異常 '+d.counts.harnessFailures:'未実行/結果欠落'}。`);
 lines.push('診断成功は元の未算出が解消した意味ではなく、他武器の係数採用や火力検証成功でもありません。','','【実行・保護】',`入力ファイル不変: ${s.inputIntegrity?.unchanged?'確認済み '+s.inputIntegrity.checked+' 件':'未確認/不一致'}`,`今回の欠落レポート: ${s.missingCurrentReports.length?s.missingCurrentReports.join(', '):'なし'}`,'過去クラウド結果を今回の成功結果に流用していません。今回の結果はこのディレクトリ内だけにあります。');
 for(const r of s.runs)lines.push(`- ${r.label}: 終了 ${n(r.exitCode)}${r.skipped?' / 未実行':''}${r.error?' / '+r.error:''}。ログ ${r.file}.process.log`);
 lines.push('','【未実装・未検証】',...s.limitations.map(x=>'- '+x),'','【結果ファイル】','all-cases.json: 一括判定 / skill-results.tsv: 全スキルLvの状態・値・理由','skill-scan.json: 詳細条件・比較 / uncalculated-diagnostics.json: 未算出理由','gs-smoke.json: 保存復元・A/B・既知失敗 / skill-conditions.json: 資料式照合','各追加診断JSON: 条件と観測 / *.process.log と runner.log: 実行ログ');
 return lines.join('\n')+'\n';
}
module.exports={stageDefinitions,summarize,japanese,names};
