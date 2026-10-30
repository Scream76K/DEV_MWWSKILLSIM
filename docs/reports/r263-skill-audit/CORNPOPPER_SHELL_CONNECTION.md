# ID159 焼き砲モロコシ：限定暫定接続

承認: Sentinel_b427654e40d88191a6ea7d004849a9dd (2026-10-29 17:26 JST)。Lv1、通常非発動／最大は放熱継続、通常・溜め砲撃のみ。現行実機未確認。Source: https://note.com/kehaar6/n/n1be0abdb3a0a (Ver1.020.02.00), https://kuroyonhon.com/mhwilds/program/skill.php 。倍率/加算順序は OWNER_APPROVED_PROVISIONAL。FBは非適用確定ではなく未採用。

数値唯一源は index.html Technique DB `GL_SHELL_NORMAL_MEDIUM.specialSourceValues.p0ReferenceRules.cornpopperReference`。adapterはID/名前/Lv/武器/採用技を検証し、通常false/最大trueを特殊Formulaへ渡す。共通physical効果に倍率を生成しないので本体へ混入しない。通常・溜め以外の未採用技は停止。FBは最大の未解決計画へ残し、通常側は既存契約で実行。

`GunlanceShellReference.calculate` は砲術0でも発動時に攻撃内訳の有限性と完成attackへの一致を要求。物理は `base*mult*artillery*1.35+flat` の後に既存技係数。火は `existingDisplayFire+artilleryDisplayAdd+30` を既存共通Formulaで一度÷10。既存Hit数/弾数/消費は変更なし。scope/state/versionを公開結果diagnosticsへ保持。F-01/engine/state executorは変更なし。

## 最小公開実行

JSDOM + 実calcBuild→共通Pipeline→実ShellReference。Hope315＋合成護石Attack5/Artillery3/159Lv1。実装備成立/ゲーム実測ではない。基礎90、攻撃倍率1.04、flat9、火肉質20。

| 入力 | 159なし通常/最大総計 | 159あり通常 | 159あり最大 | 最大砲撃入力攻撃 | 1発の火ダメージ 前→後 |
|---|---:|---:|---:|---:|---:|
| GL_SLAM→通常、砲術0 |58.728|58.728|61.9488|135.36 (=90*1.04*1.35+9)|1.4→2.0|
| GL_SLAM→溜め2発、砲術3 |89.11232|89.11232|101.162432|154.314 (=90*1.04*1.15*1.35+9)|3.2→3.8|

本体物理49.12は不変。通常1発消費／溜め2発消費と残弾は対照不変。FB単独は通常77.3472、最大は CORNPOPPER_ACTION_NOT_ADOPTED により未算出。Lv2は通常UIではMHDB最大Lv1へclampされるため、負例だけ合成MHDB rank2を注入して公開calcBuildから固有CORNPOPPER_CONTRACT_INVALIDへ到達させた（製品DB変更ではない）。

通常読込一致、保存1件と現在共有条件での比較一致、現状態復元不変を確認。異なる保存A/B2件や実ブラウザ操作の実証ではない。攻撃内訳欠損時拒否、未知技/別武器は静的確認のみ。砲撃type/power総当たり、β全体回帰は行っていない。

## 実行と証拠

最終コマンド: `/Applications/ChatGPT.app/Contents/Resources/cua_node/bin/node tools/cornpopper-shell-proof.cjs after`、cwdは当該worktree、exit0。
- `cornpopper-before.json`: 修正前、159はSKILL_EFFECT_NOT_PROVENで停止。コントロール成立。
- `cornpopper-after.json`: 最終入力、全component/raw ShellReference入出力、保存比較、製品hash。
- `cornpopper-shell-execution.json`: command/exit/hash/失敗来歴/限界。
- `cornpopper-shell.patch`: 今回開始時の未commit状態からの正確な3製品ファイル差分。
- `tools/cornpopper-shell-proof.cjs`: 後工程へ渡せる手順と期待式。合成不正rankの説明を保持すること。

ハーネス失敗は隠さず保存。1回目はIEEE浮動小数点の厳密一致、2回目はUIのLv上限clamp、3回目は技列をDOMへ反映せず空保存にしたfixture欠陥。診断再実行のログも保持。期待ゲーム式を変えず、誤差許容・不正入力fixture・restoreComboRowsを是正。製品保存処理は変更なし。最終証拠は保存比較が後からケースのcalls配列を書換えないようコピーした後のexit0。失敗回の中間製品hashは未固定であり、最終hashの試験結果とは称さない。

分類159は欠落→部分接続（限定実装済み、独立レビュー待ち）。71完全/9部分/5欠落/6注釈/88非火力。既存採用範囲の完全判定はレビューへ。全スキル/β技術Doneではない。β全体最終検証は後工程のローカルLLM担当、今回は開始せず、モデル出力を実行結果と扱わない。
