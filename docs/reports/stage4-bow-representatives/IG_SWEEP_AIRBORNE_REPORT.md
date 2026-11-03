# IG_SWEEP 飛燕非適用の限定暫定接続 — 限定独立レビュー受入済み

承認 Sentinel_b7abd4c8c3888191a343528430975484。index.html MHAirborneHitRuleのhitIndicesへIG_SWEEP:[]と対象限定のnonApplicationEvidenceだけを追加。既存adapter356–361がNO_EXTRACT/STOWED、出典確認、本体Hit構造を先に検査する。未知状態/猟虫展開は既存guardのまま。GROUND一般分類や他技への非適用推論は導入しない。MV22/属性0.8/1Hit/HP参考契約、Formula/adapter/F01は変更なし。

根拠 https://kuroyonhon.com/mhwilds/memo/13.php の通常なぎ払いと空中技の区別、https://kuroyonhon.com/mhwilds/memo/27.php の対応一覧への不掲載。直接の非適用実測ではないためOWNER_APPROVED_PROVISIONAL/GAME_UNVERIFIED。部位耐久不明も保持。

## 公開検証
JSDOM、回収実DB、実テンプレKOTATU_IG_01をDOMから読込。装備差替えなし。IG_SWEEP単発、NO_EXTRACT/STOWED、訓練場正面、狂竜症OVERCOME、属性変換通常OFF/最大ON。原典動画コンボとは主張しない。
RED exit1はAIRBORNE_HIT_SCOPE_PENDING:IG_SWEEP。GREEN exit0は通常77.73/最大111.91、本体1Hit（物理/属性の各成分）。飛燕なし対照は公開calcBuildのadapter入力から飛燕だけを除く検証用注入で、別実装備ではない。両channelのmetrics完全同値、復帰後の公開resultも完全一致。
同内容2保存をそれぞれ公開読込、共有比較2行と現在結果の一致、現在入力/条件と保存map不変を確認。異装備2ビルド比較ではない。
近傍境界：エキス未指定はIG_REFERENCE_EXTRACT_STATE_REQUIRED、猟虫DEPLOYEDはIG_REFERENCE_KINSECT_STOWED_REQUIRED。陽性飛燕技の再実行は行わず、今回変更した技の状態境界を選択。他技マッピングの変更なし。
護石は現登録ルールでinvalidだがゲーム内不可能とは断定しない。今回HP経路の成立であり実代表装備全体PASSではない。実機/Safari/F01注入/全体回帰は未実施。旧RED・旧けさ斬り証拠保持。commit/push/統合なし。

最終hash・コマンドexitはig-sweep-manifest.json、差分ig-sweep-airborne.patch、生出力ig-sweep-red.json/ig-sweep-green.json。

## 独立受入
01a192d5-a4b5-70e3-9232-d26eb6b0eb3e：IG_SWEEP限定受入可、必須修正なし。対象表の限定追加のみで既存陽性対象・係数・計算処理は不変のため、陽性技再実行は今回必須ではないとの確認。通常77.73／最大111.91、飛燕除去は検証入力対照で別実装備ではない。同内容2保存、護石未確認、実機・Safari・F-01注入・全回帰未実施を維持。受入記録時の製品・テスト変更、追加実行なし。
