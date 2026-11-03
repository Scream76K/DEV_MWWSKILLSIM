# HBG属性弾：刃鱗増装の明示OFF接続（限定受入）

既存不成立側の接続修正。160のON倍率・対象成分・特殊装填は未採用のまま。KOTATU_HBG_01の装備/スキルを削除せず保持。

## 変更
index.htmlに属性弾用の通常/最大未指定・OFF・ON入力を追加。既存explicitAffinityState→combo保存/通常読込→compareStep5Snapshot/共有比較の経路にboolean/nullを保持。旧保存欠損・認識外の保存値は未指定。通常弓160の条件は変更しない。
Adapterの属性弾reference内だけで正規160/Lv1/一意を検査し、channelのstrict falseだけ効果0で継続。ON/未指定/未知はHBG_ELEMENT:BLADESCALE_OFF_REQUIRED。不正Lv等はBLADESCALE_INPUT_INVALID。その他chargeMaster/152/165・系列・条件属性・資源/距離ガードは変更なし。係数/Formula/TechniqueDB/時間は変更なし。

## 公開実装備での最小確認
JSDOM、回収実MHDB、テンプレ読込ボタン、公開技追加/入力同期/calcBuild。火炎弾Lv1、明示3接触、同じ訓練部位、適正距離、特殊mode0、容量2/第1射/満タン。160Lv1を含む22スキル保持。今回条件例であり全属性/命中数を固定採用したものではない。

変更前after.jsonは両側SKILL_INTERACTION_UNSUPPORTED/exit2。新UI未指定も両側停止/exit2。
- 通常OFF/最大ON：通常89.35344、最大理由付き未算出。
- 別対照の両OFF：通常89.35344、最大112.2421344。160発動最大とは呼ばない。
- 通常ON/最大OFFは通常だけ停止。未指定片側もその側だけ停止。
- 旧保存欠損/未知保存値は未指定に戻り、両側停止。
- 両OFFの同内容2保存→各読込で計算一致→共有両OFF比較一致。共有条件をOFF/ONに変えると両保存とも通常成立/最大停止、保存されたOFF/OFFと装備は不変。計算前後の現在装備・条件も不変。

後段系列/条件属性guardは原装備の両OFFで実際に通過し、今回さらに変更する必要なし。スキル除去対照・装備差替えなし。総計は既存Formulaの非正規化実ダメージ、DPSは未算出。

## 証拠と限界
hbg160-off/final-shared.jsonが最新製品hashでの最終実行（exit0）。unspecified.json exit2、attempt1/finalの途中成功ログも保持。最終ハーネスの期待値はattempt1出力との退行対照であり独立実機数値ではない。原理上160倍率を一切生成せず、既存Formulaの結果へ加算しない差分。
同内容2保存であり異装備比較ではない。実機/Safari/F01注入/全回帰/LBG実行/160ON計算は未実施。HBG属性弾の明示OFF条件だけ成立、ON込み基準全体完成ではない。共通属性弾分岐のためLBGへの静的波及はあるが実証範囲に含めない。

最終差分incremental.patch、hash/exitはmanifest.json。受入済みHH/CB等は保護し再実行なし。commit/pushなし。

独立review 01a19571-593b-71b4-af4e-5dd3525c3057：明示OFF接続限定受入可。比較旧指数表の集計表示は別残件として追跡。
