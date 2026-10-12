# Fortify Condition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** 不屈の最大側の発動回数を共通比較条件として選択・追跡する。
**Architecture:** 既存の条件スナップショットにfortifyCountを追加。standardPowerConditionPlanが厳密なグループ判定後に倍率を選び、0回だけ未確定の順序依存を除く。
**Tech Stack:** 既存単一HTML、Node test、JSDOM、Playwright。
**Spec:** TECHNIQUE_DB_SPEC_R106.md

## Global Constraints

- 既定2回、通常側0回、最大側0／1／2回。
- 攻撃倍率1／1.1／1.21は資料参考値。実機未照合。
- 無効値と1／2回の加算順序は最大側保留。DPS接続を解除しない。
- 項目112px／ビルド120px／表最大474pxを維持。

## Review Focus

- 未指定の旧呼び出しは2回。
- 空文字・文字列・非整数・範囲外は保留。
- 0回は加算を許可するが他の保留は解除しない。
- 比較の内部ビルド切替で選択回数を保存・復元する。
- UI変更はキャッシュと古いレポートを無効化する。

### Task 1: 共通比較条件と倍率選択

**Files:** index.html、tools/fortify-condition-dom.test.cjs、tools/fortify-condition-browser.test.cjs。
**Interfaces:** compareStep5Snapshot().fortifyCountはnumber。standardPowerForStats(kind,stats,conditions,total)のconditions.fortifyCountもnumber。未指定は2。

- [x] 0／1／2回で最大物理比1／1.1／1.21、通常不変、無効値保留、0回の加算許可と他条件保留のDOMテストを追加し失敗確認。
- [x] 条件・単一資料表・最大側適用レコード・UI説明を実装。
- [x] 保存装備3部位の比較でselect変更後のレポートnull、再比較後のconditions回数と指数110／100、UI値復元、モバイル幅を確認。
- [x] 全unit／DOM／browserを実行しレビュー完了。配布ZIPへ保存する。
