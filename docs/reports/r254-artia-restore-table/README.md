# 最新復元表・用語訂正

ユーザー2026-10-25 22:53 UTC通常rare8表: 攻撃+5最大5、会心+5%最大3、斬れ味+30最大2近接、属性武器種別最大4、装填+1最大2ボウガン。総5枠維持。22:54 UTC「レア8というのはアーティアⅡのことです」。ユーザー区分アーティアⅡ=通常rare8であり、原典完全武器名の末尾Ⅱ/rare7とは別。4df7029のrare7装填対象判定は誤解で撤回。raw ID/name/rarityは改変しない。rare6/7素材・他復元採用は維持するが装填は対象外。

巨戟追加表: 通常斬れ味+30/装填+1、EXMAX斬れ味+50/装填+2。既存保存キーI=通常、EX=EXMAXと対応。旧sharp:I/EXはボウガン境界だけ容量へ解釈し、保存JSONは改変しない。未知段階拒否。巨戟他係数/種別上限は通常rare8表で上書きしない。巨戟総5枠は既存制約、種別上限は未確定。

## 実装
index.html NORMAL_ARTIA_R8_RESTORE / GOGMA_SHARP_CAPACITY_RESTOREにオーナー根拠を記録。restoreStatsは対象/各上限/総枠を検証。属性は既存ARTIA_STAGE_ADOPTION.normalElementRowsの復元Ⅰ値のみ参照。斬れ味+30は長さの補正値を保持するがゲージ分布/消耗未実装、通常近接白の最大色とダメージへ加算しない。

realPipelineWeaponはraw ammoを改変せず、通常弾容量に復元分を一度加え、base/restoration/totalと未対応弾種を証拠へ保持。adapter resolveReferenceStateは復元後原典容量をmagazineCapacityへ供給。UI入力容量へ再加算しない。通常/最大と比較の共通入口。砲弾装填スキルや生産素材の弾補正とは混合しない。

対象は既存公開計算で扱う通常弾のみ。貫通/散弾/麻酔等の原典容量は保存し、その計算を要求するとARTIA_CAPACITY_AMMO_SCOPE_PENDINGで停止。全弾種装填対応完了ではない。rare7はNOT_APPLICABLE。

巨戟実入力で武器属性なしを近接属性解決へ送っていたため停止を検出。ammo配列と空specialsを持つ巨戟ボウガンだけ武器属性なしと扱う（通常ボウガンと同契約）。属性弾数値は補完しない。修正前失敗ログ保持。

## 最小実証
実原典はr254-artia-capacity-scope/records.jsonおよびr254-artia-rare8/mhdb-normal-rare8.json。HBG523通常rare8の原典通常Lv2容量2→1枠3→2枠4。HBG1157巨戟容量3→通常4→EXMAX5。calcBuild→公開Pipeline→Formulaのstate.magazineCapacityを両chでassert。1射値は両容量で不変、523通常=最大118.5597、1157通常=最大119.7378。

restoreStats境界は実305で攻撃5/6、会心3/4、斬れ味2/3、属性4/5、実523で装填2/3。上限値と超過理由をassert。521/522は対象外、巨戟未知III拒否。攻撃6は総5枠で拒否。stats/skills/計算結果の上書きなし。全体回帰・保存A/B再実行なし。LBG経路は静的接続のみ、今回実証はHBG。

result.jsonのbaseは4df702936ab399ab4577a2d531b242489a66dfd0。実行時製品index/adapter SHA256を記録。生成bundleの内部モジュール変更なし、adapterは外部scriptで読む。

## 未確定・次の質問
- 通常弾以外（貫通/散弾/属性/状態異常/補助弾等）の装填増加対象と例外。原典各弾容量を保存したまま、適用範囲確認後に接続する。
- 巨戟の各種別個数上限。今回根拠は総5枠のみ。通常rare8の種別上限を転用していない。
- 実ゲーム版検証、消耗を含む斬れ味長運用は未実施。
