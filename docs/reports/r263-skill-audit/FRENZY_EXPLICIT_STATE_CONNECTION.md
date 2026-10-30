# 無我18：黒蝕なし明示状態接続
2026-10-29。承認Sentinel_b8703293b9ec8191b5e788fd1296eff1。OWNER_APPROVED_PROVISIONAL / 実機未確認。

## 変更
index resolveFrenzyAffinityを表示calcMaxAffinity・条件計画・adapterの共通係数解決として追加。唯一数値源STANDARD_BLACK_ECLIPSE_RULEの克服15、無我3/6/10を参照。敵名regex推定を除去。既存blackEclipseStateキー/selectを共用しラベルを狂竜症の状態へ。通常読込/共有ABコードは変更なし。
黒蝕なし無我: BEFORE=0/0、INFECTED=0/克服、OVERCOME=克服/克服、未指定/未知は両方FRENZY_STATE_REQUIRED。通常L3へ一度、最大は共通resolver由来差分のみ。黒蝕ありの通常指定/最大克服と攻撃加算を維持。両者同時生成しない。状態不明の表示最大会心は未算出。
adapter無我適用入口の旧black限定を共通明示状態へ接続。既存ID18/名前/Lv1–3チェック維持。会心非適用成分のconsumer/filter、engine/F01は変更なし。無我も黒蝕もない装備へ状態入力だけで新効果は作らない。

## 公開最小証拠
合成GS、無我3。通常/最大会心追加と非正規化総計:
|条件|会心追加 通常/最大|総計 通常/最大|
|---|---|---|
|黒蝕なし未発症|0/0|1144.54/1144.54|
|黒蝕なし感染中|0/25|1144.54/1210.15|
|黒蝕なし克服済み|25/25|1210.15/1210.15|
|黒蝕なし未指定|未算出/未算出|同左|
|黒蝕II未指定|未算出/25|未算出/1293.79|
|黒蝕II感染中|0/25|1197.03/1293.79|

初回は通常読込で感染中を復元し、保存1件を現共有OVERCOMEで評価して現在値と一致・復元不変を確認。異なる保存A/B2件の実証ではなかった。旧保存キーなしと未知値は両チャンネル未算出。未知値は有効技のcaptured adapter境界で確認。訓練場fixtureの名前/part.monsterNameだけをゴア・マガラ狂竜へ変えた公開calcBuildでも未発症両値1144.54不変。追加resolver対照でも名前非依存。

before/after生出力・exit/hashはfrenzy-state-execution.json。初回afterは既存無我入口guardで失敗し、その断絶を修正して同じハーネスを再実行。実機・合法装備・実ブラウザ未検証、Lv1/2・rankIは静的共通経路のみ。全武器回帰なし。
独立レビュー受入に基づき分類18を採用範囲で完全へ訂正。新しい未採用範囲は追加していない。commit/pushなし。

## P3訂正と保存2件の追加確認
初回manifestのsave comparisonは1件と明記。追加は1比較ケースのみ（frenzy-two-saved.raw.json）。黒蝕なし無我3／黒蝕II+無我3をともにBEFOREで保存し、現在共有状態OVERCOMEで公開runBuildCompareを実行。前者は通常/最大1210.15、後者1293.79、会心追加はいずれも両側25。比較後の保存map全体は一致（両保存BEFORE維持）、現在ビルド/状態も復元不変。exit0、chunk64c408。製品変更なし、既存ケース再実行なし。合成GS/JSDOMであり実機・合法装備の確認ではない。
