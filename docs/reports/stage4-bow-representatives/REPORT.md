> ③82/82は明示採用範囲の静的接続であり、全武器・全成分・全実ビルド利用可ではありません。ID152横断の現流入/拒否/採否論点はATTRIBUTE_CONVERSION_COMPONENT_SCOPE.mdを参照。CB/笛特殊成分を一律除外済みとは扱いません。

# ④ 弓代表テンプレ：照合準備と取得阻害

対象は現製品BUILD_TEMPLATE_DBのKOTATU_BOW_01とSALADA_BOW_05。selected-product-templates.jsonはそのまま抽出した現行装備/珠/護石/Artia構成であり、合成装備ではない。これ自体はMHDB整合済みの証明ではない。
両武器は亡国のクピドバイン。こたつは頭/胴シュバルカγ、腕ゴアα、腰ダハディラγ、脚ゴグα、護石弾導3/連撃1。さらだ⑤は頭シュバルカγ、胴ゴグβ、腕護火竜β、腰ダハディラγ、脚クイーンα、護石見切り3/無我3。

根拠: spec/07_BUILD_TEMPLATES.md、SALADA_REVIEW.md、製品テンプレの後続R10注記、docs/reports/r250-stage6/SALADA_FOLLOWUP.md。さらだ主武器龍統一/流水→破龍、腰体術珠・脚挑戦珠/重撃珠はユーザー採用変更。旧外部v14 JSONとr6単独記述は後続訂正前のため正本として再適用しない。元動画を今回再視認していない。

テンプレ自体にはコンボなし。次回は既採用の弓代表計算プロファイル（通常射撃3→剛射3→剛連射3）を評価条件として明示する方針で、出典動画のコンボとは呼ばない。ビン/距離/黒蝕等の状態は公開入力に明示し、未指定を有効状態に補完しない。現在はまだ実行していない。

公開MHDB取得は通常環境DNS失敗→承認確認で保存操作拒否→親の明示許可で一回の正規再確認が許可されたが、最初の/ja/skills GETがHTTP403で終了。後続armor/decorations/weapons未取得、取得JSON保存0。認証/ネットワーク設定変更、別経路迂回なし。
既存のr258 fixtureはシュバルカβでγ代用不可、r250腕fixtureは護火竜腕の一部確認のみ、r252弓fixtureは限定武器/珠。これらだけで2装備一式の実現可能性を認定しない。全キャッシュ網羅探索の主張はしない。

次に必要なのは、正規アクセス可能なMHDBの対象装備/珠/スキル/弓レコード一式、または来歴付き既存完全キャッシュの所在。公開計算・実数表示・保存2件読込/ABは未実行。装備不足を仮データで埋めない。製品変更なし、③82/82と全未commit差分を保持。全体βテスト/commit/push/統合なし。

## 2026-10-31 ユーザー書出DBで再開

Downloadsの原本15,340,738 bytes / SHA256 9491bfc1cf357aed4967418949d78c0ddd73407c6461443a7b594a2b2710c810が添付情報と一致。原本を変更せず同一コピーmhdb-loaded-cache.jsonを保存。書出2026-10-31T03:46:08.878Z、取得日時/API版不明。アプリ内正規化後の公開データで、生HTTPレスポンスではない。件数は武器1160、防具714、護石64、装飾品361、スキル179、シリーズ194、モンスター34。

JSDOMで現製品のテンプレ選択change→loadボタン→calcBuildを実行。DB初期化だけ書出データを注入し、装備/スキルの合成なし、ブラウザー原画面への操作なし。両テンプレ全装備照合、珠スロット/武器防具区分の全配置一致、既存護石生成ルールで両方実現可能。現製品のArtia正規化（parts攻撃×3）は既存処理で、今回変更なし。

評価プロファイルは通常射撃3→剛射3→剛連射3、ビンなし/適正距離/射撃順1/狂竜症克服済み、トレーニング正面。動画コンボではない。さらだ⑤は通常712.5190541820002・最大827.7434966820001、表示712.5/827.7を確認。時間未指定のためDPS未算出。

こたつは属性変換Lv3を装備し、adapter:473のisReferenceOnly拒否でREAL_SLICE:ATTRIBUTE_CONVERSION_BODY_SCOPE_UNSUPPORTED。属性変換の既存ルールは龍本体限定、現在弓referenceへの適用経路は拒否される。今回guard解除・装備差替えなし。属性変換発動状態も未指定のままであり、範囲確認後に明示シナリオ設定が必要。弓への新採用か旧接続漏れかは追加の承認履歴確認が必要で、今回断定しない。

保存2件→各読込→共有条件比較を実行。さらだ両channelの成分/総計は直接計算と一致、こたつは同じ理由で未算出。保存マップと現在snapshot/conditions/resultは比較前後完全一致。比較のconditionKeyは直接評価とメタデータ差があるためresult全文一致とは呼ばずchannel一致を確認した。

実行履歴: public-before.json exit1（ハーネスがclosure内関数を直接参照、テンプレ実行前に停止）。公開bridgeへ修正後public-run.json exit1（2件の計算/保存比較まで実施、最後の成功assertがこたつのchannels不存在でTypeError）。エラーを隠さず保存。既存rawから別途静的検算した結果はloaded-data-manifest.json。④全体PASSではない。追加製品実行なし。

製品hash不変:index 3df80ab8c531680179e9214589ab2df8ee82d19bd18fde0507717273871379d3 / adapter 908c0aa9d460fcb85278321bcec1ec19e0dc577ab3e718f4c2dccbdc012c131f。③82/82分類変更なし。Safari/ゲーム/全回帰/F01注入/最終β検証未実行。commit/pushなし。

### ID152弓範囲承認後
上記こたつ阻害はユーザー承認された龍弓3技・ビンなし・適正距離の限定接続で解消。最新証拠はattribute-bow/manifest.jsonとafter.json。両代表ビルドの公開calcBuild/表示/保存2件読込・共有比較がJSDOMで成立。こたつ通常663.8690796000001/最大893.0267754、さらだ既存値不変。全武器/全条件/ゲーム/最終β検証ではない。旧阻害・失敗ログは履歴として保持。

## 最新受入製品での縦断確認（2026-10-31）

Macのローカル実行成功。index aab29e2b1a83282647628532380710dd602f1fd89d444c998758727a2dc24a6d / adapter 1b348b1db8c992548cc7438ad0b1b33d6f7e4391b407dbf030a199da7b9a6820、回収DB9491bfc1…0c810を確認。新取得/ブラウザー操作なし。

既存公開テンプレ読込ボタン→採用3技→通常最大→保存2件→読込→共有比較をJSDOMで再確認、exit0。こたつ663.8690796000001/893.0267754、さらだ⑤712.5190541820002/827.7434966820001で前回数値と完全一致。保存内容/現在入力/共有条件不変。実DB装備テンプレを使用し合成装備注入なし。取得日時/API版不明は維持。

ハーネスはコピーで保持し、非採用ビン境界の旧「両側停止」期待だけを承認済みOFF継続へ更新。通常OFF成立/最大ON保留を確認。製品修正なし。ログ/コマンド/対象hashは current-accepted-manifest.json。過去ログを現hashの証拠へ置き換えない。

## 次の代表と④全体の残件

次は **KOTATU_GS_01（こたつ大剣・簡単厳選ver）** を選定。製品BUILD_TEMPLATE_DB、indexの__buildTemplateRegression、GREATSWORD_TEMPLATE_REGRESSION_FIXTURE.json、spec/07_BUILD_TEMPLATES.mdに既存資産がある。武器は忘却のオストランツァ、シュバルカγ頭胴脚/ベイル腕α/ラギア腰β、暗黒騎士の証+ヌシの魂。護石攻撃2/爆破属性強化1/挑戦者1、攻撃生産Artiaの既存指定を変更しない。旧fixtureの武器/防具/護石整合は補助根拠であり最新実DB公開成立証明ではない。

採用済み代表プロファイルGS_CHARGED_SLASH_3→GS_STRONG_CHARGED_SLASH_3→GS_STRONG_WIDE_SLASH_3（index:6940）を利用でき、新MV/新技採用不要。動画コンボの再現とは呼ばない。次回は実DBテンプレのスロット/護石/Artia/系列集計を確認し、既存ダークアーツ健康枝等の明示契約で通常最大を確認する。未指定条件を推測補完しない。本ターンは次代表の選定のみ、GS公開試験は未実行。

④全体は代表2弓の成立で14武器完了ではない。残12武器の代表装備・採用コンボ/状態対応、実DB照合、公開表示/保存比較の証拠は個別に必要。全70テンプレや全技の網羅を要求/実施したものでもない。Safari/実機/最終β全回帰は未実施。commit/push/統合なし。

## KOTATU_GS_01 実DB縦断の停止（2026-10-31）

公開テンプレ読込は全装備MHDB照合済表示。武器/防具/珠を変更せず、護石はR8・武1防1防1、攻撃2(G2/4)/爆破1(G1)/挑戦者1(G10)でpossible。既採用標準3技を明示したが通常最大はARTIA_COMPLETED_VALUES_UNRESOLVEDで未算出。

原因：回収DBの忘却のオストランツァID1148（派生完成記録1148/1150/1149）はspecials空・全variant属性未知。index:1720の根拠付きARTIA_ELEMENT_SOURCE_DBは大剣基礎450/攻撃激化0を持つがthreePartBonus=null。テンプレは龍・同属性3部品なので1741–1755がELEMENT_ARTIA_THREE_PART_BONUS_PENDING、1796が完成値未解決を返す。旧artiaElementPartBonusには+30の補助値があるが、根拠付き表の未確定を上書きする採用証拠ではない。現在は仕様/データ根拠不足であり配線漏れと断定できない。必要なのは同属性3部品加算の出典・採用、またはこの構成の完成龍属性値の確実な記録。推測値/装備交換/2部品化で回避しない。

2回の実行失敗を保持。初回は未算出に対する成功assert。2回目はGS/既存弓をそれぞれ保存読込し元結果一致まで確認したが、異武器比較はindex:8553の既存仕様で保留、ハーネスがnull行をmapした。製品欠陥として修正しない。GS同武器A/B火力比較は未実施で、保存A/B成功とは報告しない。以降の反復試験は止めた。

生ログgs-public-attempt1.json / gs-public-blocked.json、詳細gs-blocker-manifest.json。いずれもexit1、製品hash不変、製品編集なし。直前弓2件の成功は維持される。実ゲーム/Safari/全体β/commit/push/統合なし。

## 限定受入記録（2026-10-31）

独立レビュー 01a1916f-059c-76f4-bf72-5774a6a32ad6：今回SA覚醒4技範囲は受入可、新指摘なし。KOTATU_SA_01 標準4技の本体5Hit＋追撃4回、通常1052.95／最大1327.35。覚醒OFF849.03／1050.67。MV42を維持した結果であり、現参考58への版更新は未採用。保存比較は同内容2件、異装備比較ではない。

証拠は sa-rising-awakened-manifest.json / sa-rising-awakened-after.json。変更前失敗を削除せず保持。165併用・他ビン・実機・Safari・全回帰・F01故障注入は今回未実施。④全体Done／βDoneではない。文書更新のみ、製品再変更・再試験・commit/pushなし。

## 双剣代表の追加確認
KOTATU_DB_01 は回収実DB・既採用乱舞3技27Hitで通常1529.69/最大1857.73、同内容2保存読込/共有比較/保存不変が成立。製品変更なし。詳細DB_REPORT.md、実行hash/exit0はdb-manifest.json。異なる双剣2構成・実機・Safari・最終β未実施。

## 操虫棍代表の公開停止
KOTATU_IG_01の共通武器属性280は解決。通常けさ斬りEVIDENCE_GATEDと秘歴護石スロットのルール不一致を別件で確認。火力未成立、同内容2保存の停止理由/保存不変のみ確認。IG_REPORT.md / ig-manifest.json。製品変更なし。

## HBG limited representative
KOTATU_HBG_01 actual equipment with adopted Normal Lv3 one-shot reference: normal182.140992 / maximum233.3437272; identical saved copies/reload/common comparison invariant, exit0. Source build is spread-oriented, so this is not source-rotation verification. HBG_REPORT.md / hbg-manifest.json. Product unchanged.
