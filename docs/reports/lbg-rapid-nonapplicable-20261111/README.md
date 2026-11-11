# Current status after owner approval

Product and contract saved locally in commit `576752b4578f2662b55a4baea6993d612c3e5a5e` on the existing work branch. No new branch or GitHub push. The exact latest saved commit is `git rev-parse HEAD`.

The owner approved the enumerated 9 hash updates, 3 new inputs and 1 test. Only those changes were applied. Existing input/test order and all other metadata are preserved: 139 inputs, expected 1556 aggregate tests. Contract SHA-256: `bf730d6419427a5bdcd03e1c354d0455c618461e112cc2c34640548e530328e0`. All 139 input hashes match. Independent review found no blocker.

After contract registration, 56 explicitly selected tests passed: 21 focused regressions, 5 CI dependency checks and 30 synthetic freshness checks. Evidence: `../evidence/lbg-rapid-nonapplicable-20261111/post-contract-tests.log` and `contract-applied.json`. The full 1556 aggregate was NOT run. No full-suite or live-game accuracy claim.

Bundle creation and restoration receipts belong in the same evidence directory as `save-receipt.json`. GitHub publication remains subject to separate approval. An encoding error prevented the first status-document update before the product commit; this documentation-only follow-up corrects that status without rewriting history. Product, tests and contract bytes are unchanged.

The original candidate report below is preserved as historical evidence. Its pending-approval/uncommitted statements describe the earlier stage and are superseded by this section.

---

# 標準ライト速射の既存非適用効果の共通判定

## 状態

基準commit `2ddd8c03aff331f370e0f9163f1e0ab07c4c78ec` 上の未commit候補。正本更新・push・新branchは行っていません。監査contractの変更は承認待ちであり、本体は変更していません。候補と証拠の保全先はリポジトリ隣接 `../evidence/lbg-rapid-nonapplicable-20261111/`。現在の製品adapter SHA-256は `36802461ecca1200986f16c76814b8a7c562a9475f2d14d46561ef7b144215fb`。

## 対象と共通原因

13災禍転福、66攻めの守勢、82会心撃【属性】、133属性吸収は、既存の共通計画や物理通常弾の式では当該条件に作用しませんが、速射入口のスキル列挙が先に拒否していました。今回、正常な標準5発25Hit、物理通常弾のみ、既知の属性ゼロ、非ガードLBG、解決済みplan、正確なID/名前/Lv1–3、正規ソースの単一AMMO_PHYSICALを確認した場合に限り、同じ判定を入口と効果分類へ使います。

通常/最大と最大属性内訳の属性基礎・加算がゼロ、倍率が有限正数であることを検証します。13/133の正規plan行はrank、条件、非適用scope、加算/倍率と許可フィールドを確認。未指定や不正な状態をゼロとして補完しません。武器固有スキルと集計スキルの正当な併存は保持し、同じ入力元の重複は拒否します。

係数、MHDB、Technique DB、index.html、ユーザーの保存、非速射/HBG、明示された旧1トリガーの採用範囲は変更しません。急襲67等の別の未対応効果は省略注記を保持します。未対応全体の解消ではなく、当該4効果の条件付き非適用認識です。ゲーム内精度は未検証です。

## 最終限定検証

- `multiplier-green.json`: 専用356チェック行、失敗0。うち2行はnative Lv3武器771の固有82Lv3によりLv1/2到達不能と明示。実到達rankはcalcState.totalとの一致を確認。4ソース（Lv1/native Lv2/native Lv3/Lv2+粉末）で全25Hit、通常/最大の数値・入力不変、別未対応67の保持、ID/Lv/重複/plan/片側属性/特殊成分/旧経路の負例を検証。
- `focused-verified.log`: 列挙した8ファイルの21テスト成功、失敗0。新規、common、counterstrike、foray、First/Force、速射5発、非速射5発、HBG10射に限定。
- `audit-before` と `audit-verified`: 対象4スキル各Lv1–3×太刀/LBG速射/LBG非速射/HBGの48ケース。全96channel数値変更0。dispositions差分はLBG速射12ケースの24未反映注記解消のみ。その他3代表のdispositionsも同一。
- `verified-browser-nonapplicable`: 使い捨てChromium3武器で実保存A/B、読込、比較、表示数値、DB・入力・保存領域の不変を確認。ページreload試験とは区別します。
- `verified-browser-common-skills/counterstrike/foray/shot-skills`: 既存4本も再実行成功、各3武器、First/Forceは43チェック。全結果のbound hashは最終製品に一致。
- adapterと新規proof2本の `node --check`、`git diff --check` 成功。

独立レビューでは最終356行に追加80負例を加えた436行を実行し失敗0、実行中hash不変を確認。監査と契約提案の最終所見は `INDEPENDENT_REVIEW.md` を参照。

## 失敗と修正の履歴

初回testのsavedAt比較と不正入力fixtureの型を修正し、補正RED156行中68失敗を記録。最初の製品候補は正規sourceの特殊成分がAMMO_PHYSICALであることを空成分条件で誤拒否し、診断して正規の単一成分検査へ訂正。レビュー負例で余分なattackMultiplierを受け入れる8例を確認し、plan許可キーで拒否。独立レビューで最大属性内訳のInfinityを受け入れる欠落を確認し、Infinity/NaN/0の48例RED後に有限正数検証を追加しました。

旧proofの82/13を必ず未反映とする期待は今回の非適用範囲に合わせ更新。First/Forceの別未対応対照は13から引き続き未対応の67へ変更し、数値期待は変更していません。途中の `focused-final.log` は実行中の試験ファイル更新をhash検知して失敗したため有効な最終証拠ではありません。コード固定後の `focused-verified.log` を使用してください。過去ログは消していません。

## 未完・承認待ち

`CONTRACT_PROPOSAL.json` は既存9hashの差替と新3入力・wrapper1件追加だけを提案します。既存136入力と試験順序を保持し、提案後139入力、期待1556件。contract、runner、CIは未変更。全aggregate・freshness合格、全suite成功、CB runtime、実ゲーム・Safari実機・全装備組合せ、公開は主張しません。

契約変更承認と必要な最終確認後に同じ履歴へcommit/bundle保存予定。現段階は明示した候補保全のみです。
