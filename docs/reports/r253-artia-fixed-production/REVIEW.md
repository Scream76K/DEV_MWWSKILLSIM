# アーティア生産素材固定

承認済み前提：全14武器の同一属性・攻撃素材3個。素材選択UIを除去し、既存build.artiaのpartsとsameElementPartCountだけを共通の読込・計算・保存境界で正規化。激化、属性選択、復元、シリーズ/グループは独立して保持。旧保存JSONへの一括書換えは行わない。

## 期待と最小入力

MHDB取得済み原典の弓1139/1140/1141を既存consolidateArtiaFixedVariantRowsで統合。取得キャッシュ日2026-10-25、HTTP取得時刻不明。原典武器レコードはfixtureに無加工保存。武器の水属性選択・攻撃激化・復元atk:II/aff:I/elem:Iのみ。旧保存Aの素材affinity/none/affinityと同属性2、Bの空素材と個数欠損を実読込ボタンで読む。

期待は両者が固定素材となり、真攻撃200+6=206、会心-10+5=-5、水属性210+20+0+30=260となること。属性値の補完には既存ARTIA_ELEMENT_SOURCE_DBのみ使用し、新しい数値は採用していない。完成属性値が存在する場合の優先順位は既存artiaFixedVariantStatsのまま。属性種や原典レコードは変更しない。

## 修正と結果

- normalizeArtiaProductionをnormalizeCharm/renderArtia/calcBuild/buildSnapshotへ接続。テンプレートの旧素材値も固定。
- 完成値に生産攻撃+15を再加算しない。既存restoreStatsは復元分のみ。
- 実入口で元MHDBの空specialsを読んで属性不明扱いになる欠落を発見。realPipelineWeaponが既存完成値+復元をスキル前装備入力として複製し、単独と比較へ共通供給。原典DBを変更せず、sourceId/属性根拠/素材/激化/復元をartiaCalculationEvidenceに保持。未確定完成値は理由付き停止。
- 既定弓3技列で両保存とも通常/最大567.5524559999999、実DOM567.6。これは素材固定の接続証拠であり全弓式の再検証ではない。
- 実runBuildCompareの両行と単独が一致。finally後の装備・共通条件一致。旧A/Bの保存JSON不変、新規保存のみ固定値。
- 激化UIをelementへ切替：真攻撃190+6=196、会心0+5=5、水属性210+20+30+30=290。復元指定維持、元武器レコード不変。
- 通常アーティア303/304はisArtia=false、原典の値を保持。巨戟のみ武器1部位の既存判定関数は未変更。

## 範囲と検証履歴

14武器共通の素材正規化を使用し、14個の数値実行はしていない。通常Ⅰ/Ⅱの新しい強化計算、未知属性/未対応技、斬れ味復元のFormula接続、ゲーム版精度を追加保証しない。アーティア以外のSA/HBG/弓既存テストや全体回帰は再実行していない。

before.jsonは基点e613b2996838732779d41c73d1c38b0366950e86をbefore-harness.cjsで読む最小反例（素材不一致とPipeline未算出）。最終ハーネスは激化独立性確認を1つ追加。初回証拠出力でGit読取バッファ不足、追加ハーネスで文字列引用ミスがあり、ハーネスだけ修正した。各失敗を製品PASSとは扱っていない。

result.jsonは作業ツリーで実行しindexSha256を保存。製品commitとの内容一致はidentity.jsonを参照。全体回帰・push・公開なし。origin/developはDNS失敗で取得できず、リモートとの差は未確認。
