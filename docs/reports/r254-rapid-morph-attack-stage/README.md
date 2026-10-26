> SA morph rows below are superseded by r262-sa-hit-mode: they tested an incorrect assumption that start mode equals every Hit mode. Owner clarified SWORD→[SWORD,AXE]→AXE and AXE→[SWORD]→SWORD. Old logs retained; CB evidence is unaffected.

> 後続訂正：ED Iを非対象とした対照は派生元不明を非成立扱いしていたため撤回。r254-cb-morph-origin/README.md参照。旧ログは実行SHAの履歴として保持。

# 高速変形の攻撃段階への訂正

採用: OWNER_APPROVED_PROVISIONAL。2026-10-25 23:53 UTC、Sentinel_97f55cacbddc819197a6c09997391956。
対象変形攻撃にLv2=1.1/Lv3=1.2を攻撃スキル乗算と同段階で適用し、属性には掛けない。
出典 https://kuroyonhon.com/mhwilds/memo/26.php 。現行ゲーム版実測未検証。
Game8表は適用段階の確定証拠ではなく、YouTube動画実画面は未確認。
旧 docs/reports/r254-cb-rapid-morph の140.55→168.66は旧ダメージ乗算式の履歴であり、新契約の成功証拠から除外する。

期待出力: 加算併用で最終物理×1.2と区別。属性/非対象/ビン不変。未計算のCB斧追撃・SA覚醒追撃は未算出。単独/保存比較一致・元装備復元。

## 実行結果

数値実装commit: 9f6c14c729f6d234ad0d34f8238026073c228bc9。after.jsonはこのSHAで実行、index/Adapter SHA256付き。後続のAdapter変更はresolveSkillApplicabilityの説明・出典・採用statusの訂正のみで、計算式変更なし（静的確認）。生成bundleに含まれるmin8には変更なし。

実MHDB CB147（通常rare8）とSA1175（巨戟強撃）、速変珠III46と攻撃珠255を合法な武器スロットへ装備。巨戟は1175/1176/1177の原典3レコードをconsolidateArtiaFixedVariantRowsへ渡す実取込経路を使用。集計stats/skills/条件plan/計算結果への手上書きなし。同属性攻撃3素材、復元なし、非覚醒。fixtureは既取得原典、取得時刻は不明と記録。

| 対象（両channel同値） | 高速変形なし | Lv3 |
|---|---:|---:|
| CB剣変形・攻撃1 | P132.10 E10.35 total142.45 | P158.14 E10.35 total168.49 |
| CB解放I（非対象） | 170.054 | 170.054 |
| SA剣変形二連・攻撃1 | P78.63+131.04 E9.66+9.66 total228.99 | P94.17+156.94 E9.66+9.66 total270.43 |
| SA縦斬り（非対象） | 96.15 | 96.15 |
| SA斧変形（強撃ビンなし） | 83.73 | 98.34 |

CBは205*1.2+3、SA剣は215*1.17*1.2+3で攻撃を解決。丸め済み物理の比をこの期待比と照合し、最終物理*1.2とは区別する。倍率は各物理Hit一度だけ、属性Hitなし。CB非対象のビンを含む成分和も不変。SA剣は強撃一度・斧はビン補正なし。単独実DOM、実saveNamedBuild/runBuildCompare、A/B数値一致、比較後snapshot/条件/real結果一致、暫定表示を確認。

CB斧強化ONとSA覚醒ONは専用理由で未算出。SA剣/斧混在はSA_MIXED_MODE_TRANSITION_UNCONNECTED。各技のmodeはそのHitの攻撃モード。連続変形の初期mode/状態遷移を自動解決したとはしない。

before.jsonは旧b3604bbで新契約のeffect段階assertが失敗した反例。初回旧HTML読取のNode標準バッファ上限ENOBUFSはハーネス側で上限だけ訂正。initial.jsonは成分のkindフィールドがないのに参照した検証器不備、initial-label-assert.jsonは実表示ラベルの取り違え、initial-sa-ingest.json/result.jsonは巨戟1レコードのみの入力不足を記録。いずれも履歴保持。after.jsonが最新成功証拠。sa-result.jsonは追加斧境界前の途中成功。

## 限定事項

Lv2、SA強属性ビンとの実装備対照は未実行。共通ruleのLv2=1.1、既存強属性はelement段階の別effect（高速変形はphysical限定）という静的確認に限定。SAなぎ払い全モーション/傷集中変形、CB条件付きED/AED/SAED/属性廻填/対象追撃/蝕攻装衣は未接続。共通rule.unconnectedScopeに保持し、技名一致で拡張しない。CB追撃は対象だが成分未接続、ビン爆発は倍率対象外。旧143ファイルの削除なし。全体回帰・既存CBスイート反復なし、全14武器完成ではない。
