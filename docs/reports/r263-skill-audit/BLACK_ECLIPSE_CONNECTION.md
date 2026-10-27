# 黒蝕一体：明示状態から公開 Pipeline への接続

製品基点 6c71e818919379b0b0649d2389237470cbe3802f。今回差分は未commit、未push。

## 契約と適用段階

MHDB skill106。Ⅰは2–3部位、Ⅱは4部位以上。rank/name/required/countを照合し置換後の最高rankを要求。Ⅰの攻撃加算0、Ⅱの感染前0/感染中10/克服後15。`STANDARD_BLACK_ECLIPSE_RULE` に値を一元化。通常は明示状態、最大は克服後。攻撃は基礎攻撃への乗算後の加算。克服会心15と無我(id18)の3/6/10を一度だけ適用。現行版実測VERIFIEDではない。

`standardGroupPowerPlan` → `standardPowerConditionPlan` → Adapter `resolveEffects` → engine `applyEffects` →既存Formula。最大攻撃は既存conditional flat、最大会心は既存calcMaxAffinityを使用し黒蝕の別加算を追加しない。通常側のみ明示状態のL3効果を供給。通常攻撃内訳normalFlatも整合。会心上限100はL3の最終capで共通化し、参照式に100超を渡さない。

## 最小実行確認

`tools/skill-black-eclipse-proof.cjs` / `black-eclipse-after.json`。原典GS236と採用3技、合成スキル発動metadata。合法防具構成の実証ではない。

|条件（無我Lv3）|基準|最大|
|---|---:|---:|
|Ⅰ 感染前/感染中|375.73|399.22|
|Ⅰ 克服後|399.22|399.22|
|Ⅱ 感染前|375.73|465.74|
|Ⅱ 感染中|417.48|465.74|
|Ⅱ 克服後|465.74|465.74|

基準未入力は理由BLACK_ECLIPSE_NORMAL_STATE_REQUIRED、最大は保持。Ⅱ3部位は未解決として拒否。灼熱化Ⅰ・鎖刃刺撃Lv5併用でも465.74を保持し2注釈を出力。隔離JSDOM originの保存→通常読込はINFECTED復元、preserveCombo比較読込は現在BEFOREを保持。Safariと実ユーザーstorage未操作。

実装読取確認と実行確認を区別する。GS共通本体は両方確認。全14武器の固有式・属性弾等の既存interaction制限をこのテストで解禁/確認したとはしない。母集団106/18は全体として部分接続を維持し、GS列だけ採用範囲で完全接続へ更新。全179分類件数は変化なし。

## 残件と試験履歴

攻撃72はGL砲術との攻撃加算順が既存ガードで未接続。属性強化5種のIG状態内訳消失は前回局所修正済み。見切りは今回上限の共通段階を明示したが全特殊式の実証はしていない。会心撃の武器別Lv係数/弾導強化Lv3の新規採用は別判断待ち。

最初の保存試験はテスト側が存在しないloadBuildSnapshotを呼んだため失敗。実関数applyBuildSnapshotへ訂正後成功。製品原因と扱わない。再接続前の編集コマンドはtransport切断で未実行を読取確認してから実施した。CI/実機/Safari未実行。追加の全武器回帰なし。
