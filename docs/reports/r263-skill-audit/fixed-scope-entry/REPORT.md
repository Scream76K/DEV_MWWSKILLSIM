# 固定状態指標の入口分類是正（限定範囲受入済み）

承認 Sentinel_dca9784629308191a75344e157512129。ゲーム仕様の新係数/新技採用なし。製品はindex.htmlとadapterのみ、このproduct.patchは今回開始時からの差分。以前の③/④未commit成果を保持。

## 変更

- 17系列をMHDB正規ID/親名/kind/rank名/必要部位/上位rank置換/一意発動/level1で検証し、既存nonDamageEffectsへ。未知・重複・不正は未解決のまま。変換併用も同じ検証済み計画との一致を再利用する。
- 37/158/166は採用武器Hit指標で非適用。爆弾/豪鬼アクションの火力を否定しない。自動装填や残弾補完は一切追加していない。
- 千々矢・速射の入口は既存の正規非火力判定とbodyEffect:false注釈だけを再利用。系列は発動情報と解決済み計画の一致が必要。152/162など本体効果ありは除外しない。129の採用no-wound技集合など別の成分範囲guardは維持。
- 84は181なしなら正規ID/名前/Lvだけ直接HP効果なしとして受理。装備耐性集計は保持。181ありは従来の値・負値/未知拒否・加算順序を維持。

## 公開経路（JSDOM・合成契約装備）

実ページのcalcBuildを呼出。MHDBスキルレコードは既存資料。実装備合法性/実ゲーム検証ではない。通常/最大は非正規化総計。

|ケース|修正前|修正後 通常/最大|
|---|---|---|
|千々矢+体術/ボマー/集中/鎖刃刺撃/回避装填|SKILL_COMBINATION_NOT_ADOPTED|121.77000000000001 / 128.11260000000001（対照と同一）|
|通常Lv1速射+同スキル|SKILL_COMBINATION_NOT_ADOPTED|43.911 / 46.19818000000001（対照と同一）|
|太刀+水耐性単独|execution incomplete|83.23 / 83.23（対照と同一）|
|太刀+無尽蔵I 2部位|BONUS_DAMAGE_EFFECT_PENDING|83.23 / 83.23|
|千々矢/速射+無尽蔵I|今回修正前の系列射撃個別実行なし（共通停止を静的確認）|各対照と同一|
|水耐性1+水変換1|今回前実行なし、従来水変換証拠とは別|加算24、83.95 / 83.95|

負例：ボマー不正Lv4、未知ID、負水耐性は公開入口から拒否。系列rank99は公開呼出のadapter境界で発動情報を破損注入した負例（通常UI操作で生成した不正ではない）。17系列全rankの正規/重複/rank不正/level不正は共通分類関数だけの整合確認で、全17実ビルド試験ではない。

千々矢と速射それぞれで保存2件を比較。共有条件・現在値・保存localStorage全内容の不変をassert。通常読込の対照一致も確認。実ブラウザのユーザー保存データには触れていない。

before/after-attempt1/after は全exit0（beforeは既知停止のassert成功）。生ログを保持。最終afterの対象hashはmanifest参照。after-attempt1後にlevelと注釈系列の受理を厳格化し、最終afterで確認した。

## 実行していないもの

全武器/全技能組合せ、Safari、実機、F01注入、最終β全回帰、④実弓2テンプレの再実行はなし。以前の実弓証拠を現hash検証済みに置換していない。距離・ビン・速射完遂・消費ロジックは変更なし。152/165特殊流入の採否は未変更。82/82台帳を新しい全体合格と扱わず、今回分類数変更なし。

commit/push/統合なし。後続の受入記録参照。

## Acceptance follow-up 2026-10-31

Independent review 01a1904a-832c-720e-bbdf-f8cc743780c0 accepted the three authorized correction groups and GL/HBG entry follow-up, with no new findings. Historical findings and raw logs are retained.

Final product SHA256:
- index.html: `e3bf16fc0888082dd1b89ef208a2fd22cd6275e1102ce08f8615e8f6a2ab2ce5`
- hope-hammer-browser-adapter.js: `4fe933d639c80682b14ca1a074014782706c9bb760ef43d2f039dc2a54eae7fe`

See [P2 manifest](p2-manifest.json) and [entry report](P2_SPECIAL_ENTRIES.md). GL NORMAL 35.8 and HBG wyvern 285.75 match baseline in both channels with water resistance84 alone or series11. Two saved records per route compare without changing current/shared state or storage; invalid Lv and unknown ID remain rejected. Before/after exit0.

Bow/rapid/181 evidence in manifest.json and after.json is reused at its recorded earlier adapter hash, not rerun at final hash. Tests use synthetic contract equipment in JSDOM. No all-weapon/all-skill regression, game/Safari, F01 injection, actual bow-template rerun, or final beta test. This acceptance update changes documentation only, with no added test. 152/165 special-component adoption remains unresolved; this is not overall Stage3 or beta Done. No commit/push/integration.
