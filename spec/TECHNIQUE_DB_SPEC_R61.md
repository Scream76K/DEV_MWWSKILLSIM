# r61 狩猟笛の特殊成分：資料参考計算

## 意図

資料で確認できた音波式を、発生回数が不明なSTANDARD全体に自動適用せず、明示したシナリオだけで計算する。通常本体、音波、固定ダメージを別成分として扱う。既存の追撃4回の確認とイベント種類の保留を維持する。

## 出典

- https://macarongamemo.com/entry/mhwilds-damage_calculation （狩猟笛の音波ダメージ、2026-10-06確認）
- https://kuroyonhon.com/mhwilds/memo/8.php （衝撃波・響玉・固定10ダメージ、同日確認）

資料式：物理＝攻撃力×係数÷100、属性＝表示属性値×属性補正×属性肉質÷1000。斬れ味・会心・物理肉質は不使用。固定イベントは攻撃力などの補正を使わない。

## API

BuildComparisonEngine.huntingHornSpecialSourceEstimate(stats,events)

statsは数値のbaseAttack、displayedElement、elementalHitzone。eventsはtechniqueId、0以上の安全な整数count、空白でないevidenceRefを持つ配列。根拠IDは呼び出し側のシナリオ出典であり、実機確認済みと認定する仕組みではない。

対応：HH_PERFORMANCE_SHOCKWAVE、HH_ECHO_BUBBLE_FOLLOWUP、HH_ECHO_BUBBLE_MELODY_EVENT、HH_MELODY_COMPLETION_FIXED_10。設置係数の資料競合があるHH_ECHO_BUBBLE_PLACEは拒否。MV・属性補正・固定値は技DBを参照し、ハンドラ側に複製しない。

出力はSOURCE_ESTIMATE_ONLY、completeStandard=false、comparisonPower=null、scenarioCountsAdopted=false。sourceEstimateTotalは未丸めの参考値。traceに明示したイベント種類・回数・根拠と各成分を保持する。全体のDPSやビルド比較の通常出力には接続しない。

技確認画面に資料式と保留条件を追加。参考計算APIを呼ぶ専用フォームは今回追加していない。

## 未確定項目

実ルートのイベント種類と発生回数、固定10の回数、撮影版と基準1.042.00.02の照合、ゲーム表示の丸め、音波に使う攻撃力のバフ処理。sourceFormulaの確認状態は、既存formulaStatusや計算可否を昇格させない。

## 検証

node --test tests/*.test.cjs：89件成功。異なるイベントの合算、属性肉質、通常攻撃用補正を混入しないこと、固定値、不正入力拒否、入力不変、既存の計算保留を検証。

手計算例：攻撃力200、表示属性100、属性肉質20で通常追撃2回＋旋律成立追撃1回＋固定10を1回の場合、物理44・属性1.8・固定10、参考合計55.8。実ゲームの確定ダメージを示すものではない。

レビュー指摘を修正：監査APIはsourceFormula.evidenceRefsも収集し、既存の資料リンクを保持する。
