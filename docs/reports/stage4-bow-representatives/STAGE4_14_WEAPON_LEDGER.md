# Stage IV: 14 weapon ledger

最新CB現況：独立R/H各1回の時間なし単純合算は限定受入済み（01a19561-14f0-77f8-b067-4f65cc6bdaf8）。最新実行p2-final.json。下の経過記録にある時間待ち/合算未完了は当時の履歴であり現行残件ではない。実機・Safari・全回帰・異装備A/Bは未実施。

Equipment/reference axis: nine weapon kinds / ten templates have prior limited accepted checks (GS, DB, SA, Bow2, HBG, LBG, LAN, LS, HAM). HH also has independently accepted limited public evidence (rank I adopted model). IG HP route passes but equipment remains unconfirmed; SNS equipment remains blocked. GL normal/charged and CB impact AED now have accepted mixed152 limited evidence; no weapon kind remains wholly unattempted. These are reference-path checks, not source-main-purpose or beta completion; each prior result retains its own execution hash.

|Weapon|Status|Evidence / blocker|Saved comparison|
|---|---|---|---|
|great-sword|VERIFIED_LIMITED|standard 3 / gs-common-formula-manifest.json|identical copies|
|long-sword|VERIFIED_LIMITED_RED_BLADE_REFERENCE|LS_REFERENCE_REPORT.md; red3/7Hits; iai and repeated loops unverified|identical copies|
|sword-and-shield|BLOCKED|arm 4 jewels / 3 slots; source pending|identical copies; blocked result|
|dual-blades|VERIFIED_LIMITED|27 body Hits / db-manifest.json|identical copies|
|hammer|VERIFIED_LIMITED_STANDARD_REFERENCE|HAMMER_REFERENCE_REPORT.md; standard4/4Hits, source main purpose unconfirmed|identical copies|
|hunting-horn|ACCEPTED_LIMITED_TARGET_FOUR|HH_TARGET_FOUR_REPORT.md; N1/bubble1/start0; 869.94376/1167.51176; 01a19566-ba58-7206-970f-ab0829388dd5|identical copies; explicit stock/placement; no automatic generation|
|lance|ACCEPTED_LIMITED_COUNTER_REFERENCE|LANCE_COUNTER_REPORT.md; charge3/startup counter success single2Hit 456.24/705.96; standard4 retained; repetitions/time unverified|identical copies|
|gunlance|VERIFIED_LIMITED_MIXED152|MIXED152_REPORT.md; normal/charged plus adopted body mix; other shell routes unverified|identical copies; old blocked results preserved|
|switch-axe|VERIFIED_LIMITED_SA_REV2|SA_MV_REV2_REPORT.md; standard4 OFF/ON; source revision2, official version/live pending|identical copies|
|charge-blade|ACCEPTED_LIMITED_INDEPENDENT_R_H_SUM|CB_INDEPENDENT_MIX_REPORT.md; no time/weight/average; normal3586.0131 / maximum4357.1291; review 01a19561-14f0-77f8-b067-4f65cc6bdaf8|identical copies; current shared starts/content unchanged; not different equipment AB|
|insect-glaive|HP_REFERENCE_PASS_EQUIPMENT_UNCONFIRMED|KAN22 diagonal HP forwarding; charm unconfirmed; sweep Airborne limited adoption now implemented, review pending|identical copies; HP result preserved|
|light-bowgun|VERIFIED_LIMITED_EFFECTIVE_LV3_RAPID|LBG_COMMON_EFFECT_REPORT.md; real16 skills, single5Hit, capacity6 consume1; prior BLOCKED logs retained|identical copies; shared conditions/content unchanged|
|heavy-bowgun|VERIFIED_LIMITED_NORMAL_AMMO_REFERENCE|hbg-manifest.json; source spread rotation untested|identical copies|
|bow|VERIFIED_LIMITED|Kotatu + Salada05 / current-accepted-manifest.json|two different equipment builds|

## Static screen
All 19 current product templates were checked by record lookup (weapons, armor, post-limit slots, jewel kind/size, charm rule matches, preset/TechniqueDB metadata). No template application, calcBuild, combat execution or save. IIFE helper access was instrumented only in isolated JSDOM memory; no product edits. Evidence: static-template-screen.json and static-screen-manifest.json.
EVIDENCE_GATED alone does not prove a technique unadopted: dedicated reference consumers can be approved. Missing status likewise does not prove usability. Charm rule mismatch is not proof of game impossibility.

## Historical execution priority (superseded; not current work queue)
1. KOTATU_HBG_01: non-Artia weapon 1094; recovered DB Normal Lv3 capacity 2; armor/jewel/charm static checks match. Adopted HBG_NORMAL_AMMO_3 reference. Next public run should explicitly set distance, shot ordinal and starting state; preserve equipped First/Force skills.
2. IG: reconcile previously adopted limited HP-body contract with the newer Pipeline. Charm mismatch remains independent; fixing the route would not validate equipment legality.
3. LBG: first verify actual Normal Lv2 support and magazine state. LS/Hammer/HH/Lance need existing common Artia stage-table reconciliation, not automatic new measurement requests. CB has a separate charm rule mismatch. GL requires version/stage check and melee profile must not be presented as shelling verification.
SNS source pending and SA MV update pending remain. No new game adoption, product changes, beta regression, commit or push.

HBG priority item above has now been executed within its normal-ammo scope; see HBG_REPORT.md.

## Separate acceptance axes
Equipment loading and an adopted reference calculation do not establish the original build’s main-use attacks. Each JSON row now records both axes. HBG has Normal Lv3 evidence only; its source spread purpose remains unverified. IG HP forwarding is under independent review, not whole-build acceptance. See IG_HP_FORWARDING_REPORT.md.

IG review accepted: 01a1917f-d989-7219-92af-b5bf3865abd9, diagonal HP only. LBG latest attempt is not a new passing representative: see LBG_REPORT.md. No numerical-success count increase.

## Latest acceptance boundary
SA/LBG numerical adoption review 01a19195-5828-77ad-93d3-e5bb4356ed1a; LBG five common effects review 01a1919c-08df-72ac-a02f-416b09466cce. Current LBG normal271.7756842248001/maximum355.93066488735013. P3 UI wording fixed without behavior changes. lbg-common-lv1.json includes a limited current-hash Lv1/F01 injection regression; WEX/rank boundary injections are not game observations. Guts consumed state/all levels/Safari/live remain unexecuted. Historical execution-priority paragraphs below earlier reports are history, not instructions to repeat accepted tests.

Latest: LAN common-material forwarding accepted by 01a191c7-41a9-74f2-9739-27f8e5e6c4e2. LS actual red-blade3 sequence now passes at 643.55/946.82, limited independent review accepted. Four weapon kinds remain unexecuted (HAM/HH/GL/CB). Counts do not imply source-main-purpose or beta completion.

LS acceptance: 01a191cc-1cde-70ab-95bc-9f8ac3f479e0 (no new findings); LAN acceptance: 01a191c7-41a9-74f2-9739-27f8e5e6c4e2. Documentation only, no new test run. See lan-ls-acceptance-record.json for current product hashes and per-batch execution-hash distinction. Old RED logs retained.

Hammer standard4 reference passed 1020.1/1341.8 after legacy-ID/WEX forwarding correction, pending review. Three weapon kinds remain unexecuted (HH/GL/CB). This reference does not establish unknown source main-purpose coverage.

Latest: HAM accepted review01a1920a-803c-743d-b7e4-8235d0283dd2. HH now attempted with real melody-capable equipment: normal available, maximum blocked by178 scope; not full representative success. Two weapon kinds remain unexecuted (GL/CB).

HH UI2-technique connection accepted: 01a1920f-3429-723d-8da1-50149ffb3c10. This does not resolve178 HH component adoption; maximum remains BLOCKED, decision pending. No added execution at acceptance.

HH178 scope addition: owner approved; current public GREEN evidence hh178-final.json, independent review 01a1922c-b03f-7349-b8d2-3f9c8abb374f accepted. Rank II unexecuted; uncapped control uses resolved-plan injection. Earlier HH BLOCKED evidence remains historical. No full-regression claim.

## All-14 checkpoint after CB
All14 have at least an attempted public representative path; this is not14 successful main-purpose builds. Accepted limited/reference paths: GS/LS/DB/HAM/HH/LAN/SA/LBG/HBG/Bow (Bow2 templates). HBG spread, LAN charged counter, HAM source use, LS repeated iai/gauge and source-video sequences remain unverified. Partial: IG HP-only with charm boundary; sweep adoption subsequently added; CB single AED with conversion ON blocked. Original-equipment reconciliation: SNS arm jewels. Adoption/version waiting: GL. CB name-only correction awaits independent review; old failure logs retained.

GL更新：承認2点（480共通式/属性激化wide-high導出）実装・レビュー待ち。旧版保留ログは履歴。現代表は渾身/属性変換ONガードで未成立、gl-shell-final.json exit2。CB名称正規化はレビュー01a19251-8f55-7144-b390-24f2339e7bab受入、CB最大ON保留維持。

GL99更新：渾身の砲撃非適用配線を限定是正、レビュー待ち。溜め通常113.262225、明示152OFF最大165.63955875、152ONは未成立。旧版/旧渾身停止ログ保持。属性/型2点は独立受入済。

GL99受入：01a19257-afd1-7540-a592-b1156bfca64d。溜め砲撃・渾身Lv1で残弾3→2を実証、通常砲撃/渾身Lv2・3は今回未実行。152ON停止を維持。gl99-acceptance-record.json参照。旧レビュー待ち記述は履歴、現況は限定受入/152混合契約回答待ち。

152混合契約承認後：GL通常/溜めと叩きつけ混合、CB榴弾AEDは公開通常/最大成立、独立レビュー待ち。MIXED152_REPORT.md参照。旧BLOCKED記録は履歴保持。CB原典連続列/スタンやGL他砲撃技は未確認。

152混合限定計算受入：01a19264-2e0b-715f-b928-bb99cc1a630f。GL/CBともVERIFIED_LIMITED_MIXED152。旧BLOCKED/レビュー待ち記述は経過履歴。診断に非適用成分と総計収録の区別を追記し、旧実行hashからの差は診断のみ。原典全連続列/実機/全回帰の成立とは扱わない。

## Current next scope after mixed152 acceptance
POST_MIXED152_NEXT_SCOPE.md separates adopted wiring from new target adoption and equipment-source conflicts. No new product change or execution in this checkpoint. IG sweep/Airborne is the smallest proposed target decision; charm remains independently unconfirmed. 82/82 is adopted-scope static coverage, not Stage IV completeness.

IG_SWEEP限定更新：承認に基づく飛燕非適用接続、通常77.73/最大111.91、JSDOM公開同内容2保存比較と状態境界確認。独立レビュー待ち。IG_SWEEP_AIRBORNE_REPORT.md参照。護石確認不能は維持、旧飛燕BLOCKEDは履歴、全ビルドPASSではない。

IG_SWEEP独立受入：01a192d5-a4b5-70e3-9232-d26eb6b0eb3e、限定受入可・必須修正なし。IG_SWEEP_AIRBORNE_REPORT.md参照。旧レビュー待ち記述は履歴。通常77.73／最大111.91、検証入力による飛燕除去対照、同内容2保存のみ。護石未確認のため全ビルド完成ではない。実機/Safari/F-01注入/全回帰未実施、今回追加実行なし。

IG護石表示是正（独立レビュー待ち）：登録済みスキル構成＋正規形状の未登録スロット組合せを「確認不能」へ分離。合法性を可能へ昇格しない。IG_CHARM_VERDICT_REPORT.md参照。公開77.73/111.91と同内容2保存不変、SNS装備不整合は未解決。

IG護石スロット組合せ表示修正：01a192fc-2885-7205-8a8d-ec091a4a9234限定受入。合法性未確認は維持。

護石診断の同型分岐是正：CHARM_CLASSIFICATION_REPORT.md、独立レビュー待ち。未登録を確認不能、公式Lv/種別等の不正を別判定。IG合法性・SNS原典問題は未解決、火力数値/同内容保存比較不変。

護石分類P2是正・再レビュー待ち：公式kind情報不足を確認不能へ分離し、既知set/group・Lv違反拒否維持。charm-kind-manifest.json参照。最終ソースIG77.73/111.91と同内容2保存不変。合法性未確認は継続。

護石判定後続差分の最終限定受入：01a19301-c4f7-75ca-b809-a3a84b641ed6、P2解消・必須修正なし。旧再レビュー待ちは履歴。CHARM_CLASSIFICATION_REPORT.md参照。製品/テスト変更・追加実行なし、装備合法性未確認と検証範囲を維持。

次の主用途候補：PRIMARY_USE_NEXT_DECISION.md。HBG/GL/LANを比較し、LAN溜め3・当て身成功の二連突き単発を新規限定採用候補として選定。採否待ち、製品変更/追加実行なし。43単発や標準突き成功を原主用途確認へ置換していない。

LAN限定暫定追加（独立レビュー待ち）: LANCE_COUNTER_REPORT.md。溜め3・当て身成功・両Hit命中1回を明示、物理のみ丸め前1.7/属性不変。JSDOM原装備、同内容2保存。旧「主用途未確認」は当該単発範囲で是正、反復/動画全列/実機未確認は維持。

LAN限定受入：review 01a19349-2d59-7781-a23e-c64ca805f1da、必須修正なし。LANCE_COUNTER_REPORT.md参照。単発二連突き通常456.24／最大705.96、標準4技643.52／1004.75。同内容2保存。公開REDのexit0は期待停止、attempt3撤回。実機/Safari/F-01注入/全回帰/反復/DPS未検証。文書記録のみ、製品・テスト変更なし。先のレビュー待ち記述は履歴。

現行護石表示訂正（レビュー待ち）：CHARM_WORDING_REPORT.md。情報不足は「未確認」、確定した条件違反は「条件不一致」＋具体的理由。内部status/装備/保存/計算契約不変。IG参考通常77.73／最大111.91、同内容2保存。過去の判定表示を記録した段落・証拠は履歴として保持。

護石表示訂正は01a19508-daf0-7171-ae57-242dfee2f988で限定受入済み（必須なし）。HBG主用途の次採用案はHBG_SPREAD3_SCOPE_PROPOSAL.md。製品未変更、散弾の公開計算は未実行。


## CB R公開プリセット（今回・独立レビュー待ち）

[CB_R_PUBLIC_REPORT.md](CB_R_PUBLIC_REPORT.md): R四技を既存profileから公開選択・保存へ接続。KOTATU_CB_01、152両側OFFの別条件で通常2200.53/最大2622.18、同内容2保存/共有条件不変を確認。元最大152ONはED1等の混合scopeで停止維持。H/時間比ミックス未成立、OFFを元条件の成功にしない。


## CB R 152成分分離（独立レビュー待ち）

[CB_R_152_REPORT.md](CB_R_152_REPORT.md): 元実装備・通常OFF/最大ONで2200.53/2678.23、同内容2保存不変。25属性成分の一回適用、物理/榴弾29成分不変、ビン消費不変を確認。旧最大ON BLOCKEDは是正前証拠として保持。R公開プリセット受入済み、今回3ID許可表差分はレビュー待ち。H/ミックス合成は未完了。


## CB R152限定受入／H調査

review01a19529-ca94-7711-9dc4-9605c0967c44受入可。R元条件2200.53/2678.23。H残件は[CB_H_SHIELD_AND_MIX_DECISION.md](CB_H_SHIELD_AND_MIX_DECISION.md)：盾突き爆発数・成立/消費契約、冒頭変形方向、TR/TH正式値と非正規化合成。新製品変更・追加試験なし。

## CB H限定接続（独立レビュー待ち）

[CB_H_CONNECTION_REPORT.md](CB_H_CONNECTION_REPORT.md)：斧→剣変形→盾突き→AED→追撃AED。2026-11-01承認範囲で元KOTATU_CB_01公開通常1385.48/最大1678.90、同内容2保存・共有条件不変、開始ビン2→1。152対象13属性へ一回、他16成分不変。6状態境界停止、R既受入2200.53/2678.23維持。盾突き2本体+爆発1/消費0は暫定で直接実測確定ではない。先頭逆方向追加4Hitは使わない。H単独成立をR/H時間比ミックス成立へ流用せず、TR/TH・合成・実機/Safari/全回帰は残る。

## CB H限定受入とミックス残件

01a19553-e2e8-77f7-9f1f-9f3923e4e288限定受入可・必須なし。[CB_H_CONNECTION_REPORT.md](CB_H_CONNECTION_REPORT.md)の既存証拠を再利用し、新実行なし。H/R個別計算と同内容2保存の範囲。TR/THおよび非正規化ミックス表示式は[CB_MIX_TIME_METRIC_PROPOSAL.md](CB_MIX_TIME_METRIC_PROPOSAL.md)に分離。ミックス完成ではない。

## CB基準ミックス：時間廃止・独立各1回の単純合算（独立レビュー待ち）

最新承認Sentinel_f79b13690cc88191a9dbb458853805fcを反映。[CB_INDEPENDENT_MIX_REPORT.md](CB_INDEPENDENT_MIX_REPORT.md)。R/H各1回の丸め前総計は通常3586.0131/最大4357.1291。独立開始/消費、片route失敗時の総計停止、最大のみ未指定時通常維持、同内容2保存/共有条件不変を確認。時間比・TR/TH・DPSはこの基準ミックスの要件から廃止し、旧記述は履歴。H暫定範囲・実機/Safari未確認は保持。異装備比較や連続実行の成功ではない。

CB独立ミックスreview01a1955eのP2入力検証を局所是正、再レビュー待ち。p2-red exit1→p2-final exit0。不正/未知ID拒否、正規合算3586.0131/4357.1291・保存不変を最終hashで確認。adapter境界注入と公開実テンプレ試験を区別。CB_INDEPENDENT_MIX_REPORT.md追記参照。

## CB単純合算の最終限定受入

01a19561-14f0-77f8-b067-4f65cc6bdaf8：P2解消、必須なし。通常3586.0131/最大4357.1291、p2-final.json、同内容2保存。製品hash不変を確認、追加試験なし。次候補はHH目標4技の既採用イベントモデルへの公開接続（CB_NEXT_BASELINE_CANDIDATE.md参照）。

## HH目標4技公開接続（独立レビュー待ち）

[HH_TARGET_FOUR_REPORT.md](HH_TARGET_FOUR_REPORT.md)。左→前方→自分強化演奏→ジャスト重ねを既存モデルへ公開プリセット接続。KOTATU_HH_01/自己強化在庫1/響玉1/開始0で通常869.94376/最大1167.51176。本体5Hit＋響玉4＋音波1、遷移2、N1固定0・N2対照固定10。3未知状態停止、同内容2保存・共有比較不変。音符収集/在庫生成/異装備AB/実機Safari全回帰は未実施。CB既受入機能不変。

HH4技限定受入：01a19566-ba58-7206-970f-ab0829388dd5。N1響玉1開始0、固定10は別N2対照。現行の受入範囲はHH_TARGET_FOUR_REPORT.md。

## HH受入後のHBG属性弾接続点検

[HBG_TARGET_ELEMENT_REPORT.md](HBG_TARGET_ELEMENT_REPORT.md): 実DB武器1094のfire→flaming照合漏れを最小是正（独立レビュー01a1956c-7a04-76b6-ac7e-09422cc1d37aで名前照合のみ限定受入）。通常/最大はID160刃鱗増装の属性弾併用未採用guardで未算出。基準成立・原典散弾用途成立には算入しない。このケースの保存比較は未実行。変更前exit0はハーネス判定誤り、変更後exit2は理由付き停止。

## HBG属性弾160明示OFF（限定受入 01a19571-593b-71b4-af4e-5dd3525c3057）
[HBG160_OFF_REPORT.md](HBG160_OFF_REPORT.md): 原装備の通常OFF/最大ONは通常89.35344のみ成立。別対照両OFFで89.35344/112.2421344、同内容2保存・共有OFF/ON比較と保存不変を実行。160ON適用/実機/異装備比較は未確認。装備差替えなし。

## HBG属性弾比較表示（レビュー待ち）
[HBG_ELEMENT_DISPLAY_REPORT.md](HBG_ELEMENT_DISPLAY_REPORT.md): 共通Pipelineのchannel成立を主表示/件数へ接続。両OFFは2/2・2/2、共有OFF/ONは2/2・0/2。計算結果は160OFF受入証拠と一致、同内容2保存と条件不変。

## HBG表示受入／LBG属性弾原代表点検
HBG表示review 01a19574-0ad3-77b6-b187-cf49a961498d限定受入。末尾の表示丸め説明のみ訂正。LBG原代表1169は回収DBに属性弾なし。火炎Lv1/3接触の拒否対照と同内容2保存の停止維持のみ確認（exit2）。[LBG_TARGET_ELEMENT_REPORT.md](LBG_TARGET_ELEMENT_REPORT.md)。通常弾速射成功は属性弾基準成立に数えない。
