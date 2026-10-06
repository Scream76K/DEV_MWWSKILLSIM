# r68 旧技IDとcanonical技IDの明示対応

旧組み込み60技を全件照合し、MATCHED35件、AMBIGUOUS21件、UNMAPPED4件に整理した。MATCHEDは表示名と明示された条件から対象IDを絞れた意味であり、旧MVが正しい・現行版を実機検証済みという意味ではない。

全件の判断と候補・保留理由はLEGACY_CANONICAL_MAPPING_R68.jsonおよびLEGACY_CANONICAL_MAPPING_R68.mdに記録。根拠R66_LEGACY_COMBO_SEEDはr66の保存値、R68_EXPLICIT_IDENTITY_REVIEWは今回の既存DB名称・条件の照合を意味し、新しい実ゲーム検証ではない。

## 間違えやすい対応

- db_dance1/2は鬼人連斬Ⅰ/Ⅱで、DB_DEMON_FLURRY_I/IIに対応。乱舞Ⅰ/Ⅱへ置換しない。鬼人連斬Ⅲは対応技なし。
- ls_fadeは表示名が見切り斬りで、斬り下がりではない。
- cb_saedは表示名が高出力属性解放斬りで、超高出力ではない。
- hbg_clusterは表示名が徹甲榴弾。拡散弾へ変換しない。Lvは未指定なので候補のみ。
- 真溜め3の強撃、ランス突きの段階、弓剛射・曲射の溜め段階、スラアクのモード、ガンスの砲撃タイプ・威力は推測で補完しない。

## 参照API

TechniqueDBEngine.legacyArchive.mapping(kind,id)は凍結した照合結果を返す。不明IDはnull。候補値は既存canonical DBを参照し、対応表に数値を複製しない。元の合算要素数はlegacyEntryCount、DBの登録Hit要素数はregisteredHitEntriesとし、実機の命中数と認定しない。

legacyArchive.canonicalHits(kind,id)はMATCHEDの対象を既存の厳密なhits()で読む。未対応・曖昧・特殊成分・未検証・通常Hitなしは拒否し、旧MVや候補値へフォールバックしない。

canonicalHitsReadyは登録済み通常Hitを厳密な経路から読めることだけを示す。10件が該当。canonicalReadScopeはREGISTERED_NORMAL_HITS_ONLY、completeTechniqueReadyとdpsReadyは全件false。チャアク本体・弓の矢などが読めても、ビン・装着・状態・経路全体が計算可能とは認定しない。旧所要時間は全件LEGACY_TIMING_UNVERIFIED。

今回は対応と安全な読み出しの基盤を追加した段階。既存コンボ・装備比較・DPSの数値、保存形式、UI、OCR、技DBの採用値は変更していない。数値と状態の確認が必要な技を自動切り替えしない。

## 検証

92単体、10DOM統合、4Chromium、計106件成功。全60件の判断と対象IDの存在、武器種の境界、鬼人連斬と乱舞の混同拒否、大剣旧160とDB176の分離、曖昧状態の拒否、未検証値・特殊成分の拒否を検証。既存の全14武器の参考値と保存・比較レイアウトの回帰も成功。

実機の追加検証を行ったリリースではない。再現：npm ci、npm test、npm run test:dom、ブラウザ準備後npm run test:browser。
