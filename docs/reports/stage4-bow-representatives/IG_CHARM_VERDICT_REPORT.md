# IG護石の登録ルール未確認表示 — 独立レビュー待ち

根拠: spec/01_DATA_AND_EQUIPMENT.md:5 は未確認組合せを不可能と断定しない契約。IG_EVIDENCE_AND_CHARM_RECONCILIATION.mdの既存照合では見切り3/弱特1はR7 G3/G10と一致するが、防2防1は出典ルールに未登録。原典テンプレと現在テンプレの構成は同じで、スロット受渡し欠落ではない。ルール表へ防2防1を追加する根拠はなく、可能とは扱わない。

## 製品差分
validateCurrentCharmの、スキル構成一致後にスロット込み一致がない枝のみ変更。charmSlotPatternが不正を返す場合はinvalid/不可能を維持、認識済みスロット形状ならunconfirmed/確認不能。既存renderCharmLegalityはinfo表示を使用する。重複スキル、未登録スキル/スキル構成の他枝は今回変更なし。ルール、装備集計、スキル効果、Formula、Pipeline、保存キー、元装備データは不変。可能性の保証ではない。

## 最小公開検証
JSDOM＋回収実MHDB＋実テンプレKOTATU_IG_01、IG_SWEEP単発NO_EXTRACT/STOWED。変更前はinvalidで期待unconfirmedに失敗(exit1)。変更後はUIに確認不能を表示し公開通常77.73/最大111.91、飛燕除去検証入力対照同値、同内容2保存読込/共有比較/保存mapと現在条件不変(exit0)。前回の成功数値を期待値変更していない。
護石だけの境界対照は検証用入力で、別の実装備ビルドではない。登録済み防2はpossible、不正3/3/3はinvalid、スキル重複もinvalid。対照後に元護石を復元し保存map不変。エキス未指定/猟虫展開停止も保持。
既存のHP/IG_SWEEP専用ハーネス2件の古いinvalid期待だけをunconfirmedへ整合。旧実行ログ・hashはそのまま保存し、この2件を新hashで再実行したとは扱わない。新専用ハーネスで縦断を実行。

## 残件
護石の実在/合法性はなお確認不能で、実ビルド全体PASSではない。SNSはSNS_FOLLOWUP.md/SNS_SOURCE_AND_NEXT.mdの直接画像待ちを維持。新たな直接資料が提供されていないため同じ原典調査を反復せず、珠削除/移動なし。原典主用途とHP参考技成功、異装備比較と同内容2保存を区別。
実機/Safari/F01注入/全回帰は未実行。commit/push/統合なし。ig-charm-red.json/ig-charm-green.json、ig-charm-verdict.patch、ig-charm-manifest.json参照。

独立レビュー01a192fc-2885-7205-8a8d-ec091a4a9234で当該スロット組合せ表示修正を限定受入、必須修正なし。後続の未登録スキル/構成分岐は別差分で扱う。
