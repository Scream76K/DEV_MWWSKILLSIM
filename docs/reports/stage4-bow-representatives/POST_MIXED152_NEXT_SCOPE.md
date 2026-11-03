# MIXED152後の④残件選別

今回は読取照合と台帳訂正のみ。製品・保存データ・テストは変更していない。既存採用範囲だけで解消できる新たな配線漏れは、以下の優先残件からは確定できなかった。全製品に漏れがないという結論ではない。

|残件|現ソース・既存根拠|次に必要なこと|
|IGなぎ払い＋飛燕|adapter356–361でKAN22 HP契約を受渡し済。index7122のMHAirborneHitRuleにIG_SWEEPなし、adapter672–680が明示停止。DBは1Hit MV22/属性0.8、数値再採用は不要。|最小候補はNO_EXTRACT/STOWEDのIG_SWEEPだけ飛燕非適用を明示する対象採用。既存のけさ斬り非適用を自動流用しない。|
|IG護石|IG_REPORT.md記載の秘歴・見切り3/弱特1・防2防1が現登録ルールに一致しない。|原典または護石ルール根拠との整合確認。ゲーム内不可能とは未確定。なぎ払い解決だけで実装備全体PASSにしない。|
|SNS腕|SNS_FOLLOWUP.md。限界突破後3/2/1に4独立珠。複合珠とする記録なし。|原典腕の3スロット内容の確認。削除・移動・装備差替え不可。|
|HBG原典散弾|HBG_REPORT.mdは通常Lv3参考のみ。HBG_SPREAD_AMMO_3 DBには18.2/7という参考値があるがhits空、SPECIAL_FORMULA_AND_EVENT_COUNT_PENDING/WEAPON_AMMO_APPLICABILITY_PENDING。bowgun-normal-reference.js28–30は通常弾専用。|散弾の距離・弾対応・接触数・スキル対象をまとめた新公開契約が必要。通常弾consumerへの名前置換は不可。|
|LAN原典溜めカウンター|LANCE_REFERENCE_REPORT.md。LAN_CHARGED_COUNTERはMV43/属性1のSOURCE_CONFIRMEDだがEVIDENCE_GATED、公式版未照合。|カウンター成立条件と採用版を既存資料からまとめて判断。標準突きの成功を主用途成立にしない。|
|CB/GL原典連続用途|MIXED152_REPORT.md。CB単発榴弾AED、GL通常/溜めと限定本体混合は受入済。|CB連続派生/スタン、GL他砲撃技への拡張は既存単発証拠とは別。今回追加実行なし。|

## 最小の次採否案
IG_SWEEP（エキスなし・猟虫収納）の既存本体1Hitについて飛燕は非適用と明示し、装備に飛燕があってもその技のHP計算を継続する。MV・属性補正・部位耐久・猟虫・空中技は変更しない。承認後の検証は当該技の飛燕なし/あり不変、既存飛燕陽性技の最小対照、未知技停止、同内容保存比較。護石確認不能は別に残す。

根拠照合: https://kuroyonhon.com/mhwilds/memo/13.php の通常なぎ払いと、https://kuroyonhon.com/mhwilds/memo/27.php の飛燕対象一覧を今回読み取り。通常なぎ払いの明示的な非適用実測記述までは確認できないため、一覧への不掲載だけで製品guardを解除していない。KAN22はHP本体採用であり飛燕対象採用の代替ではない。個別武器の新たな数値実測を求める案件ではない。

## 実行・環境
公開calcBuild/テストの新実行なし。既存成功・失敗証拠は各REPORTの当時hashを維持。新たなRED/GREENを主張しない。
起動時pwd/branch/status/worktree確認済。承認済himmel/stage3-mindseye-cb-followup内。git ls-remote origin refs/heads/developはexit128、Could not resolve host: github.com。リモート最新HEADは未確認、迂回・設定変更なし。checkoutの.agents/skillsは存在しない。commit/push/統合なし。
