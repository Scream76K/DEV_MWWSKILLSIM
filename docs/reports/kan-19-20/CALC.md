# KAN19 frieren計算担当成果

正式名frieren（フリーレン）/01 CALC。指定-r250、codex/integrate-r249、HEAD fb6d82cd525da9273af10ac6b719f330208608c5一致。ユーザー承認による専有新規ファイルのみ変更、index/DB/既存tests編集0。再委任/Git変更なし。

## 作成ファイル

- element-state.js: 共通属性状態契約。ゲーム数値を所有しない。
- tests/kan19-element-state.test.cjs: 契約10件、実index ingest2件、実calcBuild1件、保存比較/AI/JSON1件（計14件）。
- CALC_PLAN.md: root専有indexの統合案13箇所、build-relative-comparison提案、UI状態契約。
- CALC.md: 本記録。

## 実装契約と根拠

UNKNOWNはelement=null/elementKnown=false。テンプレ指定種別はtypeKnown=trueで残せるが基礎値の証拠にしない。明示0は有効、通常specials明示空はCONFIRMED_NONE、Artiaの同空はUNKNOWN、全field未提供はUNKNOWN。raw-onlyは表示単位不明として保留。状態異常はUI蓄積値を保持、HP寄与だけ0。confirmedNoneの主張と明示属性レコードの矛盾は保留。applySkillはunknownへ60等の加算を適用しない。既存数値200×1.2+60=300は維持するテストで確認。

owner条件はテンプレ適用直後/変更無し。MHDB id1141の属性未提供を現indexが0化し、主珠207の龍Lv3で60が生じる。ヘイター取得資料で原因鎖を支持するがライブユーザーstate取得/元映像/正しい基礎属性値は未確定。fixture attackTrue232/aff10は見切り無し限定条件。表示attackは武器係数チェック別で、owner会心22の完全再現を宣言しない。

## TDDと検証

1. 初回11件:1成功/10失敗。mhdbRecordElementValueの0≠null、実calcBuild60≠null、AI60≠nullを確認。module未存在の契約7件もassert失敗。
2. module作成後11件:8成功/3失敗。module7件GREEN、明示0の現index確認GREEN。root専有index統合3件はRED。
3. 追加raw-only/blank display/none矛盾3件:2成功/1失敗。noneの証拠矛盾を修正後module契約10件:10成功/0失敗。期待値を修正して成功させていない。

Node全tests/*.test.cjsもdefault sandboxで1回実行し終了1。r232/r233の子execFileSyncが既存HAMMER監査JSONへ書込を試みてEPERM（書込阻止）となった。直接writeFile/execSync検索だけではexecFileSync子スクリプトを見落としたため、承認範囲外の再実行は行わない。出力大量による切れがあり正確な全件集計は未取得。新統合3件以外も含むため全スイートGREEN宣言なし。rootへ隔離・管理された全体検証を依頼済み。

## 未解決・統合提案

P1: rootのindex属性state伝播/ダメージ・STANDARD・比較・AIのguard統合で、残る実index3件をGREENへ。starkのnull+reason表示も同契約へ。P1: 正しいArtia属性値は取得未確定、独自推測で埋めない。P2: raw-only単位とnormal無属性の証拠契約、multi候補選択を今後MHDBschemaと照合。

module単体は統合可能。製品不具合解消・全スイート成功はroot統合と回帰後に判断する。Technique DB値/ゲーム数値変更・verified昇格なし。

## KAN19/20実統合追記

rootからindex編集権を一時委譲されたため、index.htmlとbuild-relative-comparison.jsも変更。DB定数・ゲーム数値・既存testsは変更なし。equipmentElementDisplay定義、詳細/比較の共通表示、Artia旧helper、combo context、STANDARD、snapshot、fingerprint、AI、JSON、direct generic/CB resolverを統合した。比較純moduleは異なる属性種別の属性成分比を保留する。UNKNOWNの古い比較cacheもpower/damage/DPSをnullとしてJSONへ伝播する。攻撃と会心は保持。状態異常蓄積値を表示に残し、HP計算入口でのみ0とする。入力shape/type tagの不整合はUNKNOWN。

追加RED: direct generic/CB null入口、combo null入口、stale比較cacheの3件失敗、および不正レコードshape/type・poison HP加算の2件失敗を確認。修正後 Node --test tests/kan19-element-state.test.cjs tests/kan20-element-display.test.cjs tests/kan20-element-comparison.test.cjs は39件成功/0失敗（KAN19 19件、KAN20 20件）。ユーザー実機・全武器live計算の主張はしない。全suiteは本追記時点では再実行していない。fernがDOM/Browser検証担当、rootが隔離全体検証担当。

編集権をrootへ返却済み。残課題: 正しいArtia属性正本の取得、legacy fixture/物理only橋渡し入口とstrict null guardの整合確認。公開genericStatsForBuildComparisonのNumber(st.element||0)は上位bonus guardで通常経路は保護されるが、直接利用境界としてrootへ指摘した。既存基準値・verified昇格は変更しない。正式DPSの未検証条件は今回解消範囲外。

### 独立レビュー追加対応

公開genericStatsFromCalcStateの欠損→0、damageFromParamsのtyped poison HP加算、POWER_ELEMENT_PHIALのnull→0、異種属性component変化率漏れを修正した。3回帰のRED（missing exception、18≠0、50≠null）を確認後、関連3ファイル42件成功/0失敗。phial係数を含むゲーム数値は変更せずinline input guardのみ。damageFromParamsもfinite number以外を拒否する。比較の属性変化率/寄与率は異種または種別欠損時null、componentReasons.element=ELEMENT_TYPE_NOT_COMPARABLEを記録し、物理と総計は維持。今回新規テストはKAN19 22件。index編集権を再びrootへ返却。全体QA結果はroot/fernの記録を参照。
