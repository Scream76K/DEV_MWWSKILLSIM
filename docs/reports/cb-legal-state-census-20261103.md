# CB公開R/H — 合法な復元・泡状態を明示した全81武器検証

2026-11-03、基点 `123bba82d17a23d5ca39d349685137a9b1b60e8c` から作業。製品計算コード・DB・Hit/MV/ビン係数を変更せず、テスト入力に合法な開始状態を明示して原因別の算出率を確認した。

## 採用済み条件と再分類

固定R/Hコンボは独立開始して丸め前の実ダメージを合算。training-room/front、実MHDB全81武器、既存テンプレKOTATU_CB_01、属性変換152は通常・最大ともOFF。

| 要因 | 明示した条件 | 対象MHDB | 結果 |
|---|---|---|---|
| 通常アーティア復元 | 復元ボーナス5枠none | 145/146/147 | 通常・最大complete |
| 濡れ刃紋 | `powerWetNormal=DRY` と `powerWetMaximum=DRY` | 153/154 | 通常・最大complete |

前回アーティア合法条件の榴弾対応55/61から、濡れ刃紋2件を追加して**57/61**。検証コードで未入力の条件を推測せず、個別に合法値を指定。前回の未入力停止は期待どおり維持する。

## 残る榴弾4武器（同条件）

- MHDB1071 アスラトアルマイサⅠ、1072 叛盾斧アルマイサ: `BLADESCALE_FIRST_HIT_SCOPE_PENDING`。現行`MHBladescaleFirstHitRule`適用は特定の単発技・1Hitに限定。R/Hの複数成分へ無条件適用しない。
- MHDB1073 ラギアストロムⅠ、1074 雷盾斧ヴァンクロム: `THUNDER_CONVERSION_BODY_SCOPE_UNSUPPORTED`。現行`MHConversionComponentScope`の適用技・成分を超えるので、属性値/耐性値を推測してゲート解除しない。

強属性ビン20件は、Hの正式`CB_H_IMPACT_ONLY`が残り、今回の対応対象外。

## 証拠

`tools/cb-production-unresolved-census.cjs` を更新し、61榴弾+20強属性を公開`calcBuild()`で実行。全61榴弾のうち57件で、両チャネル`complete`。テスト時に属性変換152を強制ONした別条件は**13/61**で、条件が異なるため混同しない。

- CI: https://github.com/Scream76K/DEV_MWWSKILLSIM/actions/runs/41650545530 — success（既存単体/保存比較/合法入力調査とも成功）
- JSDOM、固定テンプレート、固定ターゲットによる限定結果。Safari、実ゲーム、全装備・全スキル・全状態・正式β統合は未完了。
- 今回新たに算出可と確認した2件は**製品機能追加ではなく、合法入力の明示による再分類**。アーティア3件と同様、未入力や不正な状態を補完する製品変更ではない。
