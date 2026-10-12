# KAN-24：LBG通常弾Lv1・2の限定P0実装

2026-10-11。r250 worktree /Users/scream/Projects/DEV_MWWSKILLSIM-r250、codex/integrate-r249。
HEAD fb6d82cd525da9273af10ac6b719f330208608c5。commitなし。開始時1272ファイルのハッシュを保存し、index.htmlとbowgun-normal-reference.jsを/private/tmp/kan24-start/へ保全。既存ファイルの削除0。元リポジトリ・PROJECT GUILD 3Dを変更していない。

Jira KAN-24 #10095を読取で確認。作成・編集・コメント・ステータス更新なし。#10097等の後続情報も返されたが、他武器の距離仕様を今回変更する根拠にはしていない。Gitの読取確認のみ、commit/push/merge/rebase/公開なし。

## 成立範囲

|経路|対象|条件|
|---|---|---|
|単発|LBG_NORMAL_AMMO_1、LBG_NORMAL_AMMO_2|1射3Hitすべて命中|
|参考テンプレ|adopted:lbg_normal：通常弾Lv2 1射|単発と一致|
|自由コンボ|Lv1・Lv2の射撃列|各射3Hit、全段を共通式で合計|

全経路で適正距離×1、非速射・非チェイス・非騎乗、未照合弾スキル影響なし。射撃条件の明示選択が必要。現在の真攻撃、会心期待値（既存の超会心処理）、弾肉質を反映し、武器属性と斬れ味を弾に加算しない。装備変更・会心・肉質変更で再計算する。

装填可否は今回未確認。全出力とUIに「共通参考条件・武器適用未検証」を表示し、結果もweaponApplicability:UNVERIFIED、equipmentSupportVerified:false、ammoCapacityVerified:false。実MHDB武器に対して装填可能と推測しない。実装備対応確認数の増加は0。既存11/14を二重計上せず、LBG限定参考経路の追加だけを別記する。14武器種の完全対応を意味しない。

## 数値と共通式

Lv1 MV17、Lv2 MV23.8、hitCount3は既存Technique DBをそのまま参照。3等分せず各Hitへ同じMVを適用。
旧BOWGUN_AMMO_NUMERIC.lbg.normalPhysical=0.8をLBG_NORMAL_REFERENCE_RULESへ移管。旧APIはDBを読むgetterとして互換維持し、同じ数値の別正本を残さない。新しい通常弾MV・距離値を採用していない。

HBGのbowgun-normal-reference.js shotを武器別レコード参照にし、同じ物理式へDBから読んだLBG補正を一度だけ適用。UI側に式を複製しない。HBGは従来どおり自分のモード・距離・弾スキル表を参照し、数値結果を維持。LBGのルールには適正距離と未強化の恒等条件だけを保持し、HBG固有モード倍率は採用しない。

出典：https://macarongamemo.com/entry/mhwilds-bowgun-bullets 。既存r38の0.8から移管。資料更新2025-06-29、sourceVersion1.011.00、baselineGameVersion1.042.00.02、採用承認KAN-24#10095。numericStatus SOURCE_CONFIRMED、adoptionStatus PROVISIONALLY_ADOPTED、verificationStatus UNVERIFIED、liveGameVerification PENDING。正式DBのEVIDENCE_GATEDを解除しない。新レコードはSPECIAL_REFERENCEで、完成技が1件増えたという意味ではない。

比較VM検証で既存538レコードが全フィールド完全一致、追加はlight-bowgun:LBG_NORMAL_REFERENCE_RULESだけ。KAN13/19/21・SAED・猟虫などに数値変更なし。Lv3の32.3は元DBのまま、30.6との差は保留して選択肢には出さない。

## 不明・未接続条件

未選択、速射、チェイス、騎乗、未照合弾スキルがある場合は全体未算出。通常弾強化の日本語別名、First/Force Shot、Rapid Fire Up、Tune-Up等をガード。特殊成分や範囲外技を混ぜると既知段の部分合計を総ダメージとして表示しない。通常弾強化等の後続接続は別判断。

combo.lightBowgunState.shotModeを追加。既存キー・JSON versionを変更しない。保存・JSON読込・preserveCombo・比較条件一時退避/復元を検証。状態のない旧JSONは未選択に戻して保留し、JSONにweaponApplicability:VERIFIEDを書いても計算結果を昇格させない。保存比較の既存STANDARD/相対指数/DPSにはLBG参考値を流し込んでいない。DPS・時間計測の開発なし。

## KAN-23集中竜杭穿ち

ユーザーの動画Aフレーム追跡：先行水平突き60/1Hit、終盤440/24Hit、最終536/25Hit。したがって傷口破壊条件の集中竜杭穿ち24Hit、最後の1Hit+96。原動画・対象ゲーム版の独立再検証は未実施で、ユーザー確認観測と明示。
初段／多段部／傷口破壊追撃を別成分として資料化。追撃前は初段と多段部合わせて23Hit、分割回数は未確定。0.1は多段部だけの未採用暫定候補。+96を固定値/MVへ変換していない。専用完成DBレコードは未確認。通常竜杭の係数・Hit構成を流用せず、総ダメージ未算出を維持。
資料：docs/reports/kan-23/FOCUS_WYRMSTAKE_EVIDENCE.md、FOCUS_WYRMSTAKE_OBSERVATION.json。算術と非採用のJSON条件を検証済み。計算DBへ読み込まない。

## 回帰検証

|対象|前工程|今回合格|失敗|skip|
|---|---:|---:|---:|---:|
|Node|830|833|0|0|
|DOM|353|358|0|0|
|Browser・保存/Template Gates・旧OCR|127|129|0|0|
|合計|1310|1320|0|0|

追加10件（Node3、DOM5、Browser2）。対象8件のREDでルール・状態UI・接続が存在しないことを確認、実装後GREEN。Browser375/1440pxで3経路一致、JSON復元、条件/スキルの保留、ページ横はみ出しなし・pageerrorなし。375px画像を目視確認。スクリーンショットはevidence/lbg-375.png・lbg-1440.png。Safari実機と独立担当レビューは未実施。

初回全回帰の失敗は旧前提5件：DB参考ルール追加で保留レコード498→499、登録538→539の3テストと、LBG未接続前提のDOM2テスト。新ルールのIDを別枠で厳密確認し元537レコード/保留497件を維持。DOMは承認Lv2テンプレとLv1/2 Handlerの正確な範囲を検証するよう更新。ダメージ期待値の緩和、テスト削除・skipなし。最終版で全スイート再実行。git diff --check合格。

## 残課題・レビュー依頼

Lv3出典差、近遠距離、速射/チェイス/騎乗、未照合弾スキル、実MHDBの装填可否、属性弾・特殊弾は対象外。CBのSAED以外とGLの特殊成分は保持。集中竜杭は24Hitだけで計算を開始しない。

ゼーリエへ：LBG Lv1/2の限定共通参考3経路をレビュー依頼。実装備対応とは区別し、正式完了承認は実機確認・別レビューの判断を待つ。

Jira転記用：LBG通常弾Lv1/2を適正距離・非速射/非チェイス/非騎乗・全3Hit・未照合弾スキルなしで3経路接続。0.8をTechnique DBへ移管しHBG共通式再利用、既存538レコード不変。JSON互換保持。1320件合格、失敗skip0。装填未確認のため実装備対応数増加0。GL集中竜杭の傷口破壊24Hit観測を更新し、+96/0.1を計算係数へ採用せず未算出維持。Git/Jira更新・公開なし。
