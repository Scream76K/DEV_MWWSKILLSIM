# 護石の未登録と不正入力の分類 — 限定独立レビュー受入済み

先行スロット組合せ修正はreview01a192fc-2885-7205-8a8d-ec091a4a9234限定受入。今回は同じspec/01_DATA_AND_EQUIPMENT.md:5に基づく別差分。公式スキルとして有効でも護石グループ/構成の登録がないことだけでゲーム内不可能と断定していた2枝を是正。CHARM_RULES/GROUPSへの合法性追加なし。

## 分類
validateCurrentCharm内で、rule helperがLvを丸める前に1以上の整数/最大3個/入力typeの許容語彙/既存slot shape/重複を確認。公式DBは名前一意解決→公式ID・kind・ranksを参照。既知set/groupはinvalid、欠損・未知kindはunconfirmed。既知の登録Lv範囲外はkind未確認でもinvalid。公式レコード未特定/情報不足はunconfirmed、公式Lv正常だが護石グループ表にない/構成がない場合もunconfirmed。登録済み正常はpossibleを維持。unknownをpossibleにはしない。

保存スキルはIDを持たない従来の名前キー契約。公式IDを名前から一意に解決するので、保存へID追加・変更はしていない。旧テンプレローダーは全スキルの保存typeをarmorにしている(indexのsrcSkills)。その値を公式種別と比較して武器スキルを不正にするのは誤りであり、公式DBのkindを正本として判定する。保存typeは保持。許容語彙外のtypeは不正。type正規化やローダー変更は今回なし。

これは護石診断/表示だけの変更。validateCurrentCharmの製品consumerはrenderCharmLegality。スキル集計・ダメージ・Pipelineの未知スキル/Lv guardを変更しない。未知名を確認不能表示にしても計算許可を与えるものではない。既存normalizeCharmの保存読込正規化は変更しておらず、正規化前インポート全般の厳密validationを完成したとの主張はしない。

## 検証
JSDOM実DB・KOTATU_IG_01公開読込/IG_SWEEP calcBuild・同内容2保存読込と共有比較を使用。通常77.73/最大111.91と現在条件・保存map不変。護石合法性はなお未確認。飛燕除去は入力注入対照で異装備比較ではない。
RED exit1: 公式Lv内の見切り4が護石グループ未登録でinvalidとなる。GREEN exit0: 登録済み防2 possible、見切り4/見切り3+攻撃3構成/未知名はunconfirmed、見切り6/0/1.5・入力type INVALID・公式系列種別・不正slot・重複はinvalid。各公開護石表示ラベルも確認。護石境界はvalidator入力を一時変更した対照で実在ビルドの証拠ではない。元護石復元・保存map不変。
実機/Safari/F01注入/全回帰は未実行。旧ログ保持、既存独立受入済み差分保持、commit/pushなし。

証拠: charm-classification-red.json / charm-classification-green.json / charm-classification.patch / charm-classification-manifest.json。

## P2是正（再レビュー待ち）
review01a192ff-b620-700b-a440-bf75d72b3e34指摘を実ソースで再現。旧kind全否定は欠損/null/未知値を誤って対象外としていた。回収MHDBの既知kindはweapon/armor/set/group。set/groupだけ既知対象外としてinvalid、欠損/null/未知はunresolvedに保持する。保存typeから補完しない。kind未確認でも同レコードの既知Lv検証を続けるので、未知kind＋見切り6はinvalid。公式種別の新規採用なし。
charm-kind-red.json exit1はmissingがinvalidとなる反例。charm-kind-green.json exit0でmissing/null/unknown→unconfirmed、set/group→invalid、known weapon→possible、unknown＋既知Lv違反→invalid。既存Lv0/小数/超過/重複/不正slot/入力typeも同最終ソースで確認。kind変更は隔離JSDOMのDB複製に対する検証注入で、原本DBや保存装備は不変。
同最終hashで実IG公開経路77.73/111.91、同内容2保存読込/共有比較/現在条件/保存map不変も確認。合法性は確認不能のまま。新しい実機/Safari/F01注入/全回帰なし。前回ログは旧hashとして保持。差分charm-kind.patch、コマンドexit/hashはcharm-kind-manifest.json。

## 最終独立受入
01a19301-c4f7-75ca-b809-a3a84b641ed6：P2解消、後続護石判定修正全体を限定受入可。前節の再レビュー待ちは履歴。製品・テスト変更や追加実行なし。護石合法性未確認、kind境界のDB複製注入、同内容2保存、実機/Safari/F01注入/全回帰未実施を維持。
