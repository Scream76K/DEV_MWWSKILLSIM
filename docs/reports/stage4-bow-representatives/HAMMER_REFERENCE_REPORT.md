# ハンマー実テンプレ標準4技（独立レビュー待ち）

KOTATU_HAM_01、禁戒のデスヴァンケルMHDB1154。原典URLは実行ログtemplate.source、用途欄は空。原典主用途を特定済みとはしない。既採用横振り→縦振りII→アッパー→渾身溜めアッパーの4技各1Hitを確認した参考経路であり、動画コンボ再現・持続火力・スタン計算ではない。

## 実装備照合
回収DB hash9491bfc1cf357aed4967418949d78c0ddd73407c6461443a7b594a2b2710c810、取得済みアプリ正規化データ（取得日時/API版不明）。防具609/706/707/612/709、限界突破最大slots3,2,1 /3,2 /1,1 /2,2,1 /3,3。珠/武器/護石の静的照合はstatic-template-screen.json再利用、今回DOM読込全装備照合、護石見切り3+鎖刃刺撃1/武1-防1-防1はpossible。装備差替えなし、全スキル維持。
共通アーティア式は先の受入済み素材参照をそのまま使用。龍属性350=基礎320+同属性3素材30+攻撃激化0+属性復元0。生産攻撃3/affEX,atkIII,sharpEX,atkEX,affIII復元は実行ログ内訳。新数値なし。

## 2つの配線修正
1. index.html既存LEGACY_CANONICAL_IDENTITY_MAP.hammer.hm_bigはMATCHED→HAM_UPPERCUT、CANONICAL_COMBO_ADOPTION/標準4技で採用済み。しかし公開/保存比較共通resolveAdoptedLegacyPresetIdがSNS/GSのみでhm_bigを未変換。hammerの採用済hm_side/hm_bigを同じ明示表照合へ追加。旧MV48を使わず正規TechniqueDBの採用MV95を使用。保存キーは書換えない。他legacy技を包括許可しない。
2. adapterのordinary物理入口はhammer/hunting-horn本体をblunt解決していたがWEXは同じ解決を使わずWEX_DAMAGE_TYPE_REQUIRED。既存通常Hit種別解決を関数化し物理入口/WEXで共用。既存対象/数値/傷条件は変更せず、特殊reference分岐はそのまま。未知の明示damageTypeはnull拒否を維持。

## 公開検証
JSDOM DOM実テンプレ読込→公開calcBuild→実数表示。訓練場正面、属性変換通常OFF/最大ON、既存最大条件契約、正規4技ID/4Hit・属性350をassert。通常1020.1/最大1341.8。同内容2保存を読込・現共有条件比較、現在入力/結果/保存内容不変。別装備2ビルドではない。
変更前TECHNIQUE_NOT_FOUND:hm_big、途中WEX_DAMAGE_TYPE_REQUIREDの失敗を保持。最終exit0。
変更近傍1対照だけ、公開calcBuild→adapter境界で対象を切断80/打撃44/傷なしに注入。4Hit×物理属性のWEX8effectsがblunt/加算0、通常最大完走を確認。これはゲーム実測ではなく明示対象契約検証。元対象に戻し同結果一致。

差分hammer-forwarding.patch、コマンド/exit/hashはhammer-manifest.json。実機/Safari/他武器回帰/F01注入/全体β検証なし。既存83暫定・86対象外採用等は変更なし。主用途未特定、全体Doneとはしない。SNS腕/IG護石・なぎ払い飛燕残件保持。commit/push/統合なし。

## 限定受入
01a1920a-803c-743d-b7e4-8235d0283dd2：受入可。旧ID正規解決/WEX打撃共用の範囲。原典主用途未確認、実機等未実行を保持。追加試験なし。
