# CB強属性ビンH — 成分別算術と証拠境界（2026-11-03）

## 対象
基点 `a78b34378359383def84661d75a8d4db182f7470` の `flamme/cb-h-power-element-audit-20261103` から新規ブランチ `flamme/cb-power-phial-components-20261103` に分岐。製品の `CB_H_IMPACT_ONLY` は維持し、テストJSDOMメモリ中のみHの榴弾限定チェックを置換。正式採用ではない。

MHDB103 `ウズ・ヴァレロヤⅡ`、表示水属性260、対象水肉質30、盾強化1.3、斧強化ON、H: AXE_NEUTRAL開始、R/H独立AXE開始。各チャネル個別Pipeline。出典はTechnique DBに保持された [モーションとビン係数表](https://kuroyonhon.com/mhwilds/memo/12.php)、および既存H暫定採用資料 `docs/reports/stage4-bow-representatives/CB_H_CONNECTION_REPORT.md`。

## 実際の H ビン成分
`tools/cb-h-power-component-audit.cjs` は公開 `calcBuild()` の `routes.H.channels[ch].components` を技IDで抽出。独立算術と値/出典を比較する。

|H開始在庫|CB_SHIELD_THRUST|CB_AED|CB_FOLLOWUP_AED|H終了ビン|
|---|---:|---:|---:|---|
|通常2・強化0|15.21|85.176|127.764|通常1・強化0|
|通常0.5・強化0.5|15.21|121.68|127.764|通常0・強化0|

- 盾突き: `(260/10) × 1.5 × 1.3 × 0.3 = 15.21`。H連携時のビン爆発1Hit・消費0は榴弾限定の既存暫定を仮に転用した計算であり、強属性Hの正式な採用根拠は別途必要。
- 高出力: 通常 `26 × 4.2 × 1.3 × 0.3 × 2 = 85.176`、強化 `26 × 6 × 1.3 × 0.3 × 2 = 121.68`。
- 追撃高出力: `26 × 4.2 × 1.3 × 0.3 × 3 = 127.764`。開始強化0.5の場合は先行高出力が強化0.5を消費し、追撃は通常0.5を消費。
- 通常・最大は同じ入力条件のため各ビン成分が一致する。全体 R/H 合計はそれぞれ `1940.8619999999992` / `1977.365999999999`、両チャネル一致。主表示は丸め前の実計算値であり、DPS・加重平均なし。

## 検証
- CI [初回成分取得](https://github.com/Scream76K/DEV_MWWSKILLSIM/actions/runs/41624603884) 成功。
- CI [成分別の独立算術assert](https://github.com/Scream76K/DEV_MWWSKILLSIM/actions/runs/41624891547) 成功。途中 `41624802557` の失敗はテストの `expected` 二重宣言によるSyntaxErrorであり、後続コミットで修正した。計算本体の失敗ではない。
- 通常R/H・異装備A/B・保存比較・既存境界テストも同一CIで成功。計算本体、Technique DB、Hit/MV/係数は変更していない。

## 未承認と残件
- H盾突き強属性の爆発1Hit/消費0を、ユーザー承認の榴弾H暫定から無条件転用して正式採用しない。現行 `CB_H_IMPACT_ONLY` ゲートは維持。
- 水以外の各属性肉質、盾強化OFF、剣強化ON、実ゲーム版の直接測定、Safari、強属性Hの異装備保存比較は本件で未検証。
- 斧強化OFFで強化0.5/通常0.5を1コストに跨いで使う係数選択は未定義のまま。
- 全チャアク未算出ゼロの完了宣言をしない。
