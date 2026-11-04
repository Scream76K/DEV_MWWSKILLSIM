# CB PR #1：他13武器種の新旧公開計算差分監査（2026-11-04）

## 固定比較
| 区分 | ブランチ | 計算ソース基点 | CI |
|---|---|---|---|
| 旧UI | `flamme/ui-integration-latest-20261103` | `3096b71293f22ff1835214fc941a6431cdacf8a0` | [41808959471](https://github.com/Scream76K/DEV_MWWSKILLSIM/actions/runs/41808959471) |
| CB候補 | `flamme/cb-h-resource-event-guard-20261104` | `6b74a2a8edaa9af3b3fb10ce1c626d61ee28693a` | [41808609673](https://github.com/Scream76K/DEV_MWWSKILLSIM/actions/runs/41808609673) |
| 監査専用ブランチ | `flamme/cb-pr1-crossweapon-smoke-20261104` | 上記CB候補より分岐 | 新規恒久回帰テスト |

新旧それぞれ同一の `tools/cb-pr1-other13-product-smoke.cjs` を使い、同じMHDB cache SHA256 `9491bfc1cf357aed4967418949d78c0ddd73407c6461443a7b594a2b2710c810`、各武器種の代表実武器、無防具・無装飾品・無護石スキル、訓練場正面、公開 `calcBuild()` を使用。ゲーム内実測ではない。

**結果：13武器種すべてで、旧UIとCB候補の通常・最大の状態、値、未算出理由が完全一致。** 現在の監査条件で新規CB共有差分による退行は検出しなかった。ただし既存の未算出を解消したことも意味しない。

## 新旧比較結果

| 武器種 | 実MHDB ID | 通常／最大 | 旧UI・候補とも |
|---|---:|---|---|
| 大剣 | 236 | 375.73／375.73 | 算出 |
| 太刀 | 836 | unavailable／unavailable | `COMPONENT_UNAVAILABLE` |
| 片手剣 | 985 | 68.04／68.04 | 算出 |
| 双剣 | 155 | unavailable／unavailable | `COMPONENT_UNAVAILABLE` |
| ハンマー | 387 | 221.51／221.51 | 算出 |
| 狩猟笛 | 531 | unavailable | `TECHNIQUE_NOT_FOUND:hh_left` |
| ランス | 685 | 135.33／135.33 | 算出 |
| ガンランス | 315 | unavailable | `TECHNIQUE_NOT_FOUND:gl_thrust` |
| スラッシュアックス | 914 | unavailable | `TECHNIQUE_NOT_FOUND:sa_vertical` |
| 操虫棍 | 608 | unavailable | `DAMAGE_TYPE_UNRESOLVED` |
| ライトボウガン | 763 | unavailable | `TECHNIQUE_NOT_FOUND:lbg_normal3` |
| ヘビィボウガン | 464 | unavailable | `TECHNIQUE_NOT_FOUND:hbg_normal3` |
| 弓 | 1 | unavailable | `TECHNIQUE_NOT_FOUND:bow_shot` |

集計：**4武器種が通常・最大で数値算出／2武器種は成分未算出／7武器種は同じ理由付き保留**。旧UIも候補も同じ。これは各武器1代表条件の結果であり、各武器種の正規コンボ全体の利用可否を示さない。とくに各武器のデフォルト旧コンボIDを取得した場合、Technique DBの正規技IDと不一致になりうる。正規コンボに切り替えた別テストの成果と混同しない。

## 回帰テスト化
監査専用ブランチでは上記旧UI CIの出力を `docs/reports/cb-pr1-other13-ui-baseline-20261104.json` として固定し、`tools/cb-pr1-other13-product-smoke.cjs` が次を検査する：
- 13件すべて実MHDBで一致した武器IDを使用し、連続2回の計算結果が同じ。
- 旧UIで数値算出済みの武器は、今後の候補で値・通常最大の利用可否が変化しない。
- 旧UIで未算出のケースは、引き続き未算出なら理由を変えず、新しく正規計算へ進めた場合には明示的なavailable／有限値のみ許容する（改善を禁止しない）。
- CB固有H承認・ビン資源異常が他13武器の結果へ漏れ出ない。実行がcompleteでも指標unavailableのことがあるので、`execution.status` と `metrics.comboTotalDamage.status` を別に検証。
- Web DOMで未処理のJS例外がない。

## 採用境界
**REVIEW_PARTIAL / HOLD_MERGEを維持**。この検証で証明できるのは代表13条件での新旧一致と決定論性。新規物理ID転送、強属性Hの所有者承認1Hit/0消費、13武器種の代表スモークは一部の退行リスクを抑えるが、全13武器種の正規計算を受け入れた証拠ではない。

チャアクR/Hの候補81/81は限定条件下で成立、未承認スキル接続は残る。UIのPC／横タブレット2列とスマホ縦並び、実機Safari、全14武器・全スキルの網羅、ゲーム内計測、β公開はこの監査の範囲外。PR #1はDraftを維持する。

## PR #1への統合用回帰テスト移植
比較用UI基準branchと専用CB監査branchでの結果一致後、**PR #1のheadブランチにテスト、13件の基準JSON、文書を移植**した。`.github/workflows/cb-rh-distinct-ab.yml` でこれらを毎回実行する。

- [PR #1対象CI run 41809408997](https://github.com/Scream76K/DEV_MWWSKILLSIM/actions/runs/41809408997) は **completed/success**（テスト・JSON・CIまで含むSHA `cef6362f646fdd7260e8aedce1bcbdc3c8810204`）。
- この回帰は既存の4武器種の値が予期せず変わることを禁止し、旧UIで未算出の9武器種は根拠なしの状態変化を拒否する一方、将来の正当な未算出解消は許可する。
- したがって、候補PRへの追加によって他13武器種の**この代表条件**では新旧一致が継続。全13武器種の正規全技計算が可能になったという認定ではない。
