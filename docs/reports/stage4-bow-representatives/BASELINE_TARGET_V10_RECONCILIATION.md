> 最新CB要件（2026-11-01 13:23）：時間を廃止し、R/H各1回を独立開始して単純加算。詳細 [CB_INDEPENDENT_MIX_REPORT.md](CB_INDEPENDENT_MIX_REPORT.md)。以下の時間比/合成未決記述は過去履歴であり現行要件ではない。

# 基準目標・V10限定採用・公開UIの照合

## 最新確認 12:23：CBは2ループ混合

ユーザー `Sentinel_0275a13ba9288191a78a29ff6453ab53`「チャアクはミックス」、直前「そうそう」により、CB基準は解放系Rと高出力系Hの**2ループ混合**であることを確認。ⅠⅡ単独ではない。割合と最終合成式は後続合意の照合結果を待って固定する。10/5の時間比は履歴根拠として保持するが、最終式の確定とは扱わない。実装済み4放出技の成功はR経路の証拠であり、基準ミックス全体の成立証拠へ流用しない。

## 決定履歴 12:20

ユーザー `Sentinel_6fb081ff7cd08191a6063ad159a57421`「ゼーリエの方を承認します」により、親が列挙した目標14武器を採用。機械可読整理は `baseline-target-signatures.json`。CBは後続R/H合意の発見によりⅠⅡだけのsignatureを完成扱いしない。目標選択は確定、未確定係数・状態パラメータは未承認のまま。V10限定経路を代替基準にしない。以下12:19時点の照合と結論は判断履歴として保持し、未確定との記述は最新承認により目標選択についてのみ更新された。

## 12:19時点の照合履歴

2026-11-01。**14 signatureは確定していない。** 最新の12:19発言「ゼーリエの方が正しいかも」はどちらの一覧への新規採用承認とも扱わない。目標STANDARDと、工程②で計算できる限定経路は別軸である。限定経路の受入を目標変更/廃止へ読み替えない。

## 根拠と権限

- 目標側：親から提供された2026-10-03会話（ユーザー「コレで全て揃いましたね」「次に進みましょう」）、10/5大剣最大溜め。URL: https://chatgpt.com/c/6abe4490-0b28-83ee-9c55-8cca2efbbb5e?messageId=3396f8a0-2400-49f5-b412-6eb058fa6637 。本担当は会話原文を再取得していない。親の引用として記録。
- 12:17の14武器整理も保存するが、直後12:19の留保により正式signature確定の根拠としない。
- 実装側：ローカルGit固定 `5ac4382e32bd01c576d275f5f4545a03ccd8cac8` の index.html、STAGE2_ACCEPTANCE.md、武器別索引をgit showで読取。受入文書内部の実行対象SHAは `6c71e818919379b0b0649d2389237470cbe3802f`。文書を含むSHAと試験対象SHAは異なる。
- 工程移行承認 `Sentinel_715b96dae46481918f9fe00597e4d4ea` は「採用範囲限定で②受入、③移行」。全条件技術Doneでも、目標STANDARD全件置換でもない。
- 現行UI index.html:4370–4385 と固定SHA index.html:4322以降のプリセットを照合。参考と名付けたUIの存在は目標達成証拠ではない。

## 14武器比較

|武器|合意目標（親提示履歴）|実装採用の技ID/モデル|状態・公開UI|差分・変更承認の確認範囲|
|---|---|---|---|---|
|GS|溜め斬り→強溜め→なぎ払い（10/5最大溜め）|GS_CHARGED_SLASH_3 → GS_STRONG_CHARGED_SLASH_3 → GS_STRONG_WIDE_SLASH_3|最大溜め3技。現在UIも同列|代表3技を実行済み。時間/DPSは別。|
|LS|赤ゲージ赤刃系ループ|LS_RED_BLADE_I → LS_RED_BLADE_II → LS_RED_BLADE_III|RED。UIは3技1列|反復・ゲージ維持までの実証ではない。|
|SNS|斬り下ろし→横斬り→水平斬り→斬り返し|SNS_DOWNWARD_SLASH → SNS_SIDE_SLASH → SNS_HORIZONTAL_SLASH → SNS_RETURN_SLASH|UI同列|技列確認済み、実テンプレ腕4珠/3slotは原資料待ち。|
|DB|鬼人化乱舞Ⅰ→Ⅱ→Ⅲ|DB_DEMON_DANCE_I → DB_DEMON_DANCE_II → DB_DEMON_DANCE_III|鬼人化・必要ゲージは明示。UI同列|27Hit代表確認。ゲージ量・スタミナ時間の保証ではない。|
|HAM|横振り→縦振りⅡ→アッパー→渾身溜めアッパー|HAM_SIDE_SWING → HAM_VERTICAL_II → HAM_UPPERCUT → HAM_MIGHTY_CHARGE_UPPERCUT|UI同列|代表4技確認。原動画運用全体とは区別。|
|HH|△→△→自分強化旋律→重ね掛け（響玉込み）|候補旧列 HH_LEFT_SWING → HH_FORWARD_ATTACK → HH_SELF_IMPROVEMENT_PERFORMANCE → HH_ENCORE_JUST；V10はHH_NORMAL_MELODY_PROVISIONALイベントモデル|旋律N/種類・初期強化段階・響玉Bを明示。UI既定はLEFT_SWING→FORWARD_ATTACK参考のみ|④は演奏→ジャスト重ね→左ぶん回し。旧目標4技をこの3技へ置換する合意は本調査で未確認。|
|LAN|中段突き×3→三段突き|LAN_MID_THRUST_I → LAN_MID_THRUST_II → LAN_MID_THRUST_III → LAN_TRIPLE_THRUST|UI同列|標準4技確認。後続承認カウンター単発は追加経路であって基準置換ではない。|
|GL|叩きつけ→なぎ払い→竜杭FB→連装竜杭FB|旧GL_SLAM → GL_SWEEP → GL_WYRMSTAKE_FULL_BURST → GL_MULTI_WYRMSTAKE_FULL_BURST；②短列 GL_SLAM → NORMAL砲撃 → GL_SWEEP → CHARGED砲撃|残弾・溜め消費明示。UI既定SLAM→SWEEP参考のみ|②短混在成立、④通常/溜め等成立。旧杭FB目標の廃止/正式置換承認は未確認。|
|SA|剣開始右斬り上げ→左斬り上げ→変形二段→斧変形ループ|現在 SA_SWORD_VERTICAL → SA_SWORD_RIGHT_RISING → SA_SWORD_MORPH_DOUBLE → SA_AXE_MORPH_SLASH|開始SWORD、覚醒/ビン等明示。UI現在4技|旧会話右→左と現在縦→右は異なる。現在4技への追撃・revision2数値承認はあるが、目標列置換の明示合意とは分離。|
|CB|独立R1回＋H1回、時間なし単純和（2026-11-01最新承認）|R: ED1→ED2→AED→FOLLOWUP、H: AXE_TO_SWORD_MORPH→SHIELD_THRUST→AED→FOLLOWUP|両routeの開始状態を明示、終状態を引継がず通常/最大を独立加算|01a19561-14f0-77f8-b067-4f65cc6bdaf8限定受入。3586.0131/4357.1291。同内容2保存。時間比/計測待ちは旧履歴、実機等未実施。|
|IG|3色横移動斬り→前移動連斬→強化急襲斬り→飛天螺旋斬|旧 IG_TRIPLE_SIDESTEP_SLASH → IG_TRIPLE_ADVANCING_COMBO → IG_ENHANCED_DESCENDING_THRUST → IG_RISING_SPIRAL_SLASH；② IG_ENHANCED_DIAGONAL_SLASH|②3色本体。UI既定IG_DIAGONAL_SLASH無エキス参考|旧螺旋はLEGACY_AGGREGATE/版・状態未採用境界。②強化斜め・④無エキスけさ/なぎ払いを目標4技完成へ流用不可。|
|LBG|属性弾（詳細比較：属性/通常/貫通/散弾）|LBG_ELEMENT_FIRST_HIT_REFERENCE + EXPLICIT_CONTACTS 1～6（非速射Lv1/2）|属性/弾Lv/距離/命中数/状態明示。UI既定NORMAL_AMMO_2参考|④通常実効Lv3速射は別用途。基準属性弾の代表ビルド成立証拠ではない。|
|HBG|属性弾（詳細比較：属性/通常/貫通/散弾）|HBG_ELEMENT_FIRST_HIT_REFERENCE + EXPLICIT_CONTACTS 1～6（Lv1/2）|属性/弾Lv/距離/命中数/装填条件明示。UI既定NORMAL_AMMO_3参考|④通常Lv3/竜撃弾等は別参考。散弾案未承認。基準属性弾を通常弾へ置換不可。|
|BOW|射撃→剛射→剛連射|BOW_SHOT_3 → BOW_POWER_SHOT_3 → BOW_POWER_VOLLEY_3|溜め3、ビン/距離明示。UI同列|④異なる弓2テンプレ比較あり。特定ビン/距離以外へ一般化しない。|

## 証拠索引と残るsignature項目

固定SHAの次の資料を読み取った。時系列の旧保留は末尾の後続受入と区別する。

- docs/reports/r262-review-boundary/STAGE2_ACCEPTANCE.md: 採用範囲14行、F01、通常/最大共通入力、移行承認。
- docs/reports/r262-ig-scope-hbg-contacts/STAGE2_REVIEW_SCOPE.md: 武器別索引、現在の限定成立と未採用旧STANDARD。
- docs/reports/r262-gl-mixed-resource/README.md: SLAM→NORMAL→SWEEP→CHARGED、明示開始3/溜め消費2の実行例。これは全ビルドの固定初期弾数ではない。
- docs/reports/r262-cb-ed1-half/README.md: 末尾Adopted four-action release route、斧OFF1/ON0.5、強化優先、爆発数1/2/2/3と消費の分離。初期CHARGE/盾ON等は証拠入力であり全signatureの暗黙既定値にしない。
- docs/reports/r262-hh-provisional-total/README.md + 固定index HH_NORMAL_MELODY_MODEL: イベント生成/効果成立後更新。N/B/初期段階/旋律系統の明示が必要。特定試験の3技を全体目標としない。
- docs/reports/r262-contact-ui/README.md: 1～6命中、CURRENT_TARGET→各contactの対象ID/部位/肉質/距離。装填数から命中数を生成しない。
- 現行 STAGE4_14_WEAPON_LEDGER.md: 実装備の実行経路と主用途未確認を区別。過去ログを今回再実行したとは扱わない。

正式signatureに必要な対象ID・部位・切断/打撃/弾/属性の肉質、傷状態と傷前肉質、武器状態・開始資源、旋律/命中数等は対象ごとに明示して固定すべきである。今回資料から全14共通の一意な数値肉質を確定していない。StageIIのトレモ前面や合成入力の値を全体基準へ勝手に転用しない。

通常/最大は同じ技列・順序・対象・武器状態を使用し、スキル条件のみ独立。未指定条件を成功状態に補完しない。単発総ダメージは非正規化値。ループ反復回数・時間・DPSは別欄で、今回全14の確定値を確認していない。既存時間未確認を0や便宜秒数へ置換しない。

版は固定ソースの所在と技revision/出典版/公式ゲーム版実測を分ける。SA現revision2のMV更新は承認済みだが正確な公式版対応・実機確認は未確認。indexの古いV1042等profile名だけで全技を同版検証済みにしない。

## 判断

現時点で「14武器の基準コンボをすべて正確に理解し、その基準で④を確認済み」とは言えない。目標と限定参考経路を混同した進捗説明を修正する必要がある。GS/SNS/DB/HAM/LAN/BOWは技列が対応、LSは反復、SAは技列差、残6武器はモデル/経路または入力粒度の差がある。

読取対象の受入資料から、旧目標全件をV10限定経路へ正式置換/廃止した明示合意は確認できなかった。「存在しない」と断定する全履歴検索ではない。新たな採否を先に求めず、親が持つ変更承認履歴と本比較を照合して目標を確定する。両案の資料は保持し、製品・試験・係数・UIを変更していない。


## 後続合意の追加照合：CB 10/4（現行訂正）

親が確認した会話 https://chatgpt.com/c/6abe4490-0b28-83ee-9c55-8cca2efbbb5e?messageId=26a30775-255f-4506-b038-e203a1ae5579 では、R=解放Ⅰ→ⅡとH=高出力変形斬り→剣盾突き→斧高出力→追撃高出力を各50%の等価評価軸とし、`0.5×R_X/R_A + 0.5×H_X/H_A` の後にユーザー「進めましょう」。本担当は親の原文確認を出典として保持する。

これは時間50:50指定ではない。後の非正規化実ダメージ主表示とは指標が異なるため、旧式を計算へ復活させない。今回目標承認を10/3のRだけへの巻き戻しとも解釈しない。**CB目標はR/Hの後続指定を含めて整合が必要で、ⅠⅡのみのsignatureは未完成。**

現在indexのCHARGE_BLADE_STANDARD_PROFILES（約5415）はRELEASE_ROUTE=ED1/ED2/AED/FOLLOWUP、AED_ROUTE=MORPH/SHIELD_THRUST/AED/FOLLOWUPで、前者は旧Rと異なる。H冒頭の『高出力変形斬り』と現CB_SWORD_TO_AXE_MORPHの名称同定は候補として残す。両routeのdurationFrames=nullを時間0や任意配分へ変換しない。工程②4解放列受入はR/H合成仕様の受入と同義ではない。

他武器の6:4等は現行index、spec、docsのMarkdownを限定検索。今回見つかった明示6:4はindex:288の画面workspace比率であり、武器コンボ配分ではない。50:50もkan-18の画面レイアウトは除外。武器比率の後続承認はこの探索では追加特定できていない。全会話に存在しないという結論ではなく、他武器の比率を勝手に1:1/6:4へ設定しない。

製品変更・試験実行なし。元履歴は保持し、本追記とJSONのcompositeHistoryを最新のCB整理とする。


## 最新CB訂正：10/5の時間比への変更（10/4を上書きせず履歴化）

親が確認した後続合意: https://chatgpt.com/c/6abe4490-0b28-83ee-9c55-8cca2efbbb5e?messageId=ed24e76c-8d70-4856-901b-095fcdf435e9 。ユーザーが技の出始めから終わりまでの時間比とRの追撃高出力までの延長を提案し、「はい。それでいきましょう」と決定。

- R: CB_ELEMENT_DISCHARGE_1 → CB_ELEMENT_DISCHARGE_2 → CB_AED → CB_FOLLOWUP_AED。
- H: CB_SWORD_TO_AXE_MORPH → CB_SHIELD_THRUST → CB_AED → CB_FOLLOWUP_AED。
- wR=TR/(TR+TH)、wH=TH/(TR+TH)。10/4の等価50:50はこの後続合意で変更された。実測TR/THは当時未確定、現profileもdurationFrames=null。

現在の2profile技列はこの10/5履歴と対応する。前節の「現Rは旧Rと異なる」は10/4との比較として残し、不一致の理由が10/5変更で解けたと訂正する。新たな技列採用は不要。時間値の創作・旧50:50への復帰・旧正規化比率式の無断再導入はしない。後の非正規化主表示と合成仕様との整合は引き続き別欄で追跡する。親が他の後続合意も調査中のため、14武器signatureは最終確定としない。

独立レビュー01a19523-c684-720a-b25c-6c238e9f7ee1を反映。旧CB表のⅠⅡ単独/変更承認未完という記述は10/4以前の履歴へ移し、現行表はR/H混合へ訂正。10/18の6:4はユーザー原文「ビルドとスキル構成を左右で６：４で表示」で画面比率。親の10/18〜11/1検索では固定割合への変更承認は未発見。10/5時間比を既存方針として保持、時間値と非正規化合成は別途整合が必要。
