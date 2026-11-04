# CB強属性H — イベント別ビン資源契約のCI固定（2026-11-04）

## 対象・受入状態
基点 `flamme/cb-152-phial-kind-boundary-20261104` の `02eb6eccc90f9f1b625ed4e155d01628b925525e` から専用ブランチ `flamme/cb-h-resource-event-guard-20261104` に分岐。**OWNER_REVIEW_PENDING / CANDIDATE_NOT_ADOPTED**。今回の変更は検証テストとCI、報告書のみ。数値DB・実計算本体・Hit/MV・UIは不変更。

## 目的と新規検証
これまでの検証は「H最終ビン残数」や「盾突きビン爆発の成分数」を確認していたが、前段の2技それぞれが消費0であることと、後段のビン種選択を直接固定していなかった。

`tools/cb-h-power-component-audit.cjs` に公開 `calcBuild()` の `routes.H.channels.normal/maximum.diagnostics.resourceContracts` を使うイベント別assertを追加。実MHDB103 ウズ・ヴァレロヤⅡ、訓練場正面、R/H独立開始、Hの斧強化ON・盾強化ON・剣強化OFF、開始在庫2条件で確認。

| Hイベント | 既存候補の消費 | 既存契約・状態 |
|---|---:|---|
| `CB_AXE_TO_SWORD_MORPH` | 0 | `CB_H_PREFIX_RESOURCE` |
| `CB_SHIELD_THRUST` | 0 | `CB_H_PREFIX_RESOURCE` |
| `CB_AED` | 0.5 | 斧強化時の放出消費 |
| `CB_FOLLOWUP_AED` | 0.5 | 斧強化時の放出消費 |

- 4イベントの順序・ID・消費量・個別出典をassert。前段2件のstatusは `OWNER_APPROVED_PROVISIONAL` を維持。
- H開始「通常2・強化0」では高出力/追撃がともに通常ビンを選ぶ。
- H開始「通常0.5・強化0.5」では高出力が強化ビンを先に選択し、追撃は通常ビンを選ぶ。
- 盾突きの物理2Hit/属性2成分/ビン爆発1成分、成分独立算術、最終ビン残数は従来のテストを維持。通常/最大の両方で検査。
- R/H全体の丸め前実数値合算、強属性20・榴弾61の限定条件、異装備A/B保存比較、属性変換152の最大側拒否なども従来CIで継続検証する。

## 確定事実と未確定の線引き
これは**既存候補コードがイベントごとの資源契約を守っている証拠**であって、ゲーム内の強属性盾突きが本当に1爆発Hit・ビン消費0であることを新たに実測した証拠ではない。
[ワイルズのチャアク計算資料](https://kuroyonhon.com/mhwilds/memo/12.php) にある盾突きの強属性ビン係数1.5と盾強化補正1.3は参照できるが、H連携中のビンHUD変化・爆発Hit数の実動画証拠は現在確認できていない。元の榴弾H暫定契約を強属性Hの確定仕様へ無条件昇格させない。

## 受入前の残件
- 実ゲームVer.1.042.00.02での盾突きの爆発Hit数、技の前後のビンHUD残数を同時に確認。
- 属性変換152の正式適用範囲、雷耐性変換165・刃鱗163・飛燕86の候補受入判断。
- Safari、全装備・全スキル・全状態の評価、main/UI統合、β公開。

`81/81` は限定条件の候補CI成立であり、これらの正式完了を意味しない。

## 2026-11-04 ユーザーによる仕様確定（後続決定）

**今回の明示承認により、強属性ビンHの正規4技列に限り、盾突きのビン爆発を1Hit、盾突き自体のビン消費を0として正式採用する。**

- 採用区分: `OWNER_APPROVED` / `OWNER_SPEC_CONFIRMED_GAME_MEASUREMENT_NOT_CLAIMED`
- 採用技: `CB_SHIELD_THRUST`（強属性ビン `POWER_ELEMENT`、盾強化ON、剣強化OFF、斧モードから正規Hへ）
- 爆発Hit数: **1**
- 盾突きのビン消費: **0**
- 承認日: 2026-11-04
- 実計算係数は既存Technique DBおよび出典を維持し、当該承認で変更しない
- 通常の変形斬り、後続の高出力・追撃高出力、他の技列、他の武器種、強属性以外にはこの新しい区分を流用しない
- ゲーム内で直接計測されたと記録しない。**ユーザーによる仕様承認と実測確認は別**
- 今回の実装は `hope-hammer-browser-adapter.js` 上で、正規H、POWER_ELEMENT一致、`prefixConsumption===0`、盾突きTechnique DB `phialReference.hitCount===1` のチェックを設け、盾突きイベント単位の資源契約に `ownerDecision` を付ける。値の乖離は `CB_POWER_H_SHIELD_OWNER_CONTRACT_MISMATCH` で計算停止
- 既存榴弾H／前段変形斬りの承認区分は変更せず、`MHCBHRouteRule` の全体ステータスも広げない

**この決定によって解消したのは、強属性H盾突き1Hit・消費0の「オーナー承認待ち」です。** 全装備・全スキル網羅、他のH強化状態、Safari、β統合、ゲーム内数値精度は独立した未完了項目として保持する。
