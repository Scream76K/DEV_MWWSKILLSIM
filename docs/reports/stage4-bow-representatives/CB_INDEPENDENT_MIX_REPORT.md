# CB独立R/H合算 — 独立レビュー限定受入

承認 `Sentinel_f79b13690cc88191a9dbb458853805fc`（2026-11-01 13:23 JST）「シンプルに足しましょう」。先の「時間の概念はやめましょう」と合わせ、CB基準ミックスは **R1回＋H1回の独立開始・丸め前実ダメージ単純合算**。時間比・平均・DPS・旧相対合成は使用しない。旧時間資料を削除せず現行必須条件から外した。

## 設計と操作

[設計](cb-independent-mix/DESIGN.md)。既存公開Rプリセットを選び、CB評価方式で基準ミックスを明示。共有盾/斧/剣強化・ビン種を保持し、既存開始入力はR用、追加H開始入力はH用。Rの終状態はHへ渡さない。未指定を補完しない。通常/最大とも同じ2列・状態・対象、スキル条件のみ既存契約で分離。

browser adapterの薄い集計層から、既存evaluateCurrent/6層PipelineをR/Hそれぞれ呼ぶ。技IDは既存profileから取得しMV/Hit/係数を複製しない。計算結果はroutes.R/Hに全成分・実行・消費・終状態を保持し、集計channelは両route完遂かつ利用可能な値だけ加算。どちらか未完了ならそのchannelの総計は未算出、理由にR/Hを付す。消費を一本の連続在庫に見せずfinalState.routesに分離。

通常画面および同武器保存比較に『R/H各1回の合計実ダメージ（独立開始）』と各内訳を表示。比較の専用表示では旧時間/相対式の保留を混合判定へ持ち込まない。別機能の時間DB/DPSは保持し、ミックス選択時だけDPS対象外。保存キーは既存chargeBladeState内へmixMode/mixHを追加、旧欠損はミックスOFF・H未選択。既存保存レコードの自動書換えなし。

## 公開最小検証

実行 `node tools/stage4-cb-mix-public-proof.cjs`。JSDOM、回収MHDB実データ、KOTATU_CB_01を公開テンプレ読込→Rプリセット→ミックス明示→calcBuild。合成装備/直接adapter注入なし。

対象training-room/front、黒蝕OVERCOME、通常152OFF/最大ON。共通盾ON・斧ON・剣OFF・榴弾・通常ビン。RはAXE/CHARGE/通常2/強化0、HはAXE/AXE_NEUTRAL/通常2/強化0。

|channel|R原始値|H原始値|丸め前合計|
|---|---:|---:|---:|
|通常|2200.5296000000008|1385.4835000000003|3586.013100000001|
|最大|2678.2256|1678.9035000000003|4357.1291|

旧受入生ログを期待対照として再利用し、今回実行した両routeの各全成分と原始値が一致。表示丸め値の加算ではない。R残数2→0、H残数2→1を独立に確認。

- H開始形態欠損：H理由付き停止、R完遂、両channel合計未算出。
- R残数1.5／H残数0.5：不足したrouteが停止、もう一方は完遂、部分総計を出さない。
- 最大152未指定：最大合計未算出、通常channel全体は対照同一。
- 同内容2保存→各読込の結果同一→共有比較同一→元条件/保存不変。異なる装備2件ではない。
- 状態を変更後に保存を読み込み元結果を復元。共有H残数1で両保存を比較しH終残数0、保存中の残数2と内容は不変。
- 旧保存相当の欠損復元はmixMode=null/H状態null。
- 比較DOMの非正規化合計行・R/H内訳を確認、DPS行なし。

## 実行履歴・保全

[manifest](cb-independent-mix/manifest.json)、[最終生ログ](cb-independent-mix/final.json)、[本件差分](cb-independent-mix/incremental.patch)。RED exit1は未実装UIのReferenceError。attempt1/2/3は段階的成功exit0、final exit0が最終製品・ハーネス対応。旧失敗・H/R先行受入証拠は保持。変更はindexとbrowser adapterのみ。min8二ファイル/bundleは直前受入hash不変。

実機/Safari/全回帰/異装備A/B/任意反復/一般F01故障注入は未実施。ビン不足停止だけをF01全境界実証としない。H盾突き等の暫定成分確度は引継ぐ。独立合算の限定成立であり、実連続コンボ・持続DPS・全14武器基準の完成ではない。時間計測は本機能の残件ではなくなった。commit/push/統合なし。

静的保護確認：ミックスdispatchとDPS除外はCB種に限定。別武器へ切り替えた時に残ったCB入力で他武器計算を止めない。別武器の追加実行は行っていない。

## 独立レビューP2是正（履歴・再レビューで解消）

review01a1955e-4981-747b-84a0-219085826a61：合算本体/保存表示は整合、入力検証1件。正規化したidsだけでは `canonical:` の未解決情報が消え、正規Rと誤一致していた。正規化結果を保持し、profile照合前にunresolved.lengthを検査する2行追加相当の局所是正。係数/合算式/時間/他仕様の変更なし、index不変。

`p2-red.json` exit1：実公開calcBuildから取得したadapter入力へ不正IDを加える境界注入で、修正前OKを再現。`p2-final.json` exit0：不正canonical:はTECHNIQUE_ID_UNRESOLVED、未知CB_UNKNOWN_TECHNIQUEはCB_MIX_R_PROFILE_REQUIRED、正規RはOK。これら3件はadapter境界試験であり、不正IDをUI選択した証拠ではない。

同じ最終実行で実テンプレ公開合算通常3586.0131/最大4357.1291、R/H成分の既受入値一致、片route不足・最大のみ状態欠損、同内容2保存読込/共有条件/保存内容不変を再確認。最終製品hash対応ログは [p2-final.json](cb-independent-mix/p2-final.json)。旧final/attempt/REDは当時hashの履歴として保持。[P2だけの差分](cb-independent-mix/p2.patch)、全差分/現hashはmanifest参照。新たな全回帰・実機・Safari試験なし、commit/pushなし。

## 最新独立受入

01a19561-14f0-77f8-b067-4f65cc6bdaf8：P2解消、限定受入可・必須なし。現行は時間なしR1+H1の単純和、通常3586.0131/最大4357.1291。最新実行証拠p2-final.jsonを保持し、今回は製品/テスト変更・再実行なし。保存は同内容2件で、異装備A/B・実機・Safari・全回帰未実施。旧時間比/TR/TH計測待ちは履歴であり、このCB合算の残件ではない。現行5製品hash不変。
