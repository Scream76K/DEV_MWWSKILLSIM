# GL砲撃力段階の限定接続（2026-10-12）

## 実装結果

MHDB公式データ生成元の81GL実レコードと武器資料を照合。shellLevel2→ふつう/MEDIUMのみTechnique DBの既存GL_SHELL_NORMAL_MEDIUM.specialSourceValues.p0ReferenceRulesへ対応表を追加。UI側に段階数値を重複定義せず、共通P0入口で照合する。
既知shellLevelで対応未採用、型不正、又は手動指定と矛盾すれば全3経路未算出。メタデータ欠損時の既存UNVERIFIED共通参考は維持し、実武器対応済みとは数えない。

|公式生成元game_id|名称|タイプ|shell_level|attack_raw|会心|
|---:|---|---|---:|---:|---:|
|1|ホープガンランスⅠ|normal|2|90|0|
|6|骨銃槍Ⅰ|wide|2|110|0|
|11|トライバヨネットⅠ|long|2|120|0|

3件とも武器資料のふつうと一致。game_idはAPIのidではなくゲーム内識別子。テストのid987は選択UI用識別子であり実武器API IDを捏造していない。rawは公式生成元をそのまま使う。新しい完成武器数値を本番DBへ登録していない。
生成元の81件はlevel1=9/2=41/3=29/4=2。level1やや弱い、level3やや強いという照合候補は見えるが、今回は既存採用済みMEDIUMだけ接続。他段階をMEDIUMとして計算しない。

## 根拠と版

公式APIの403継続に対し、公式ドキュメントからリンクされたMHDBデータ生成元を取得。
- 固定取得Revision：c50a1eb892f4a1ad9bb35c147801658804be2cc2（2026-04-14、README資金設定更新）
- GLデータ最終更新：e5676f8d69f9e1c10922bbe5506ba77f6304a941 / 2026-03-02T23:16:22Z / Update merged files
- 現ゲーム版1.042.00.02との一致は未確認。API import timestampはゲーム版番号ではない。
- 根拠状態：PROVISIONALLY_ADOPTED / UNVERIFIED。新証拠KAN23_MHDB_SHELL_LEVEL_20261012。実機VERIFIEDへ昇格なし。

URL：
https://github.com/LartTyler/mhdb-wilds-data/blob/c50a1eb892f4a1ad9bb35c147801658804be2cc2/output/merged/weapons/Gunlance.json
https://github.com/LartTyler/mhdb-wilds-data/blob/c50a1eb892f4a1ad9bb35c147801658804be2cc2/tools/merger/src/processor/weapons/gunlance.rs
https://kuroyonhon.com/mhwilds/buki/gannsu.php
https://docs.wilds.mhdb.io/

## 砲術の照合と保留判断

公式生成元Skill.jsonはLv1/2/3の火属性+30/+60/+90を明記。物理倍率は数値記載なし。kuroyonhon skill.phpはGL倍率1.05/1.1/1.15、攻撃スキルの掛け算段階で計算すると記載。砲弾装填Lv2+1も公式生成元と補助資料で一致。
しかし、物理倍率の対象ゲーム版、現在のweaponBaseAttackと通常攻撃スキルの適用順序、火加算と溜め/FBの適用単位を組み合わせて全成分確定できていない。このため火だけ補完して不完全な総量を表示せず、砲術付きは全体未算出を維持。既存砲術/装填ガードは外していない。
保留理由は欠損数値が完全にないという意味ではなく、資料数値と計算条件の整合未了。砲術候補値をTechnique DBへ本番採用していない。

ゼーリエ判断事項：対象版をどの資料版に限定して暫定採用するか、通常攻撃スキルの掛け算/加算を砲撃へどう適用するかの根拠、火加算の技別適用範囲。資料の式/検証条件の確認を先に行い、計測要否はその後判断する。追加撮影を依頼していない。

## 変更と保全

index.html：対応表/根拠メタデータと共通ガード。tools/gl-shell-level-dom.test.cjs：18件追加。docs/reports/gl-shell-level/：報告・元資料・証跡。
既存539レコードは追加対応表2フィールドを除けば全件一致、MV/火数値/Hit/既存係数変更0。新しい証拠登録1件。KAN-13/19/21と他13武器の既存計算を維持。

## 回帰・レビュー

18件：公式生成元3武器の単発FB/参考FB/自由FB一致、未採用level1/3/4保留、3タイプ×砲術Lv0/1/2/3（Lv0計算可、Lv1～3保留）。修正前に未採用段階をMEDIUMで計算できる3件の失敗を確認。
全体結果はevidenceログ。独立レビューはREVIEW.md。Safariは未実施、SAFARI_CHECKLIST.mdをオーナー操作手順とする。

公開・commit・push・merge・rebase・Jira編集なし。作業場所r250、codex/integrate-r249、HEAD fb6d82cd525da9273af10ac6b719f330208608c5不変、origin/develop先行3のまま。

## 最終テスト結果

|スイート|実行/合格|失敗|skip|
|---|---:|---:|---:|
|Node|839|0|0|
|DOM|442|0|0|
|Browser・統合・旧OCR・Template|134|0|0|
|合計|1415|0|0|

基準1397から18増。全回帰終了0。既存テスト削除/skip/期待値緩和なし。開始時ファイル削除0、既存内容変更はindex.htmlだけ。試験で変化した既存PNGは開始時内容へ戻した。

Jira転記用：公式MHDB生成元81GLからshellLevel2ふつうを3タイプ実レコードで照合し、Technique DB対応表と共通P0ガードへ限定接続。他段階の手動上書きは全体未算出。砲術火加算はMHDB確認、倍率/順序/対象版の整合は保留。1415件合格・失敗skip0、独立レビュー阻害なし。539件の既存戦闘値不変。Safari操作手順提出、未公開未コミット。
