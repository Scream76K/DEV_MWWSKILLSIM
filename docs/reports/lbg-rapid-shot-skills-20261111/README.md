# LBG標準速射のFirst / Force適用

対象基準: `5c7013ab067c35edee3fc0b3d4e82eca0d8e553d`。これは同作業枝への限定変更であり、公開・実ゲーム検証の記録ではありません。

## 採用範囲

2026-11-11のユーザー指示「５発撃つので、初弾5ヒットにファーストショット適応、4&5発目にフォースショット適応です」「難しく考えなくていいです」「５発固定で考えているので、何発目かは管理しなくてもいい」に従います。

通常弾のSTANDARDライト速射は固定5発・25Hitとして自動計算します。射順の手入力や管理は不要です。装填容量、保存された射順、満装填フラグ、残弾数によるリセットはしません。内部の固定5発予算から各Hitの所属する発を求めます。

- First140: 5発のうち最初の1発、その5Hitすべて。
- Force137: 5発のうち後半2発、その計10Hit。既存の効果内訳を維持し、攻撃加算は4発目の5Hit、会心加算は4・5発目の10Hitです。5発目に攻撃加算を新設しません。
- 係数の正本は既存Technique DBのHBG通常弾 `shotSkills`。既存 `shotSkillBonuses` をそのまま再利用し、別の製品係数表を追加しません。通常・最大とも各Hitに攻撃と会心を一度だけ加算し、会心100%上限・負会心・超会心の処理を通します。
- 通常弾強化、速射強化、75/142/154/81等の既存条件ボーナスを維持します。採用済みFirst/Forceの未反映注記だけを外し、82等の別の未対応効果は注記・計算継続の対象として残します。
- 非速射5発15Hit、HBG10射30接触、明示された旧速射1トリガー、入力・保存形式・対象IDは変更しません。

対象速射ソースはLv1、native Lv2、native Lv3、既存のLv2＋通常弾粉末によるLv3です。ソース、必須状態、スキルID/Lv、重複入力、射数規則が不正な場合に係数を補完しません。武器固有Lvと集計済みビルドLvの二つの表示は正当なため、各入力元の重複を検証したうえで集計済みの最大Lvを一度だけ消費します。

## 実装

- `bowgun-normal-reference.js`: rapidFiveShotとrapidHitを既存HBGの射順別スキル評価へ接続。25HitにshotOrdinal、roundOrdinal、triggerOrdinal、shotAttackAdd、shotAffinityAdd、effectiveAffinityを記録。
- `hope-hammer-browser-adapter.js`: 標準5発のスキルLvを維持し、各チャンネルの内部5発予算を参照。共有入力を書き換えず、明示1トリガー経路の既存ガードを維持。

## 限定検証

`tools/lbg-rapid-shot-skills-proof.cjs` / `tests/lbg-rapid-shot-skills.test.cjs` は4ソース経路でFirst/Force各Lv0–3の全16組を検証します。各25Hitの射順・通常最大の独立算術、通常弾強化・速射強化・既存条件効果、負会心から正会心への移行・100%上限・超会心、異なる2ビルドの保存読込比較、入力と条件キーの不変性、不正入力・ソース欠落、旧1トリガー境界、別の未対応注記を含みます。

RED: 製品変更前164チェック中149失敗を記録。初回GREENでは179チェック中23失敗を確認し、武器固有Lvと集計Lvの正当な併存を拒否していた新規ガードを修正しました。残る検証側の問題は、護石3スキル上限を超えた入力、ソース失敗のチャンネル状態確認、有限な別係数ではなく欠落配列を使う不正ソースfixtureとして明示的に修正。最終179チェックは失敗0。専用wrapper、既存ライト非速射5発、HBG通常弾10射、旧速射5発の4ファイルを合わせた限定実行も17テスト成功・失敗0です。

再現例: `NODE_PATH=../isolated-ci-dependency-KPpAvu/node_modules node tools/lbg-rapid-shot-skills-proof.cjs`。既存依存を利用し、新規インストールはしません。専用JSON証拠はリポジトリ隣接 `evidence/lbg-rapid-shot-skills-20261111/`。製品、proof、fixtureのSHA-256を各実行の冒頭・末尾で照合します。旧限定proofの期待値更新、Chromiumの実操作検証は同変更の別担当証拠として扱い、数値proofとの混同を避けます。

全suite、CB getter/prototype変更、実ゲーム測定、Safari実機、全装備・全スキル組合せ、公開はこの限定検証の対象外です。`liveGameVerification: PENDING` を維持します。

## 最終確認と監査登録

最終製品bytesに対し、数値179チェック、Chromium43チェック（3武器）、既存数値proof 109＋81＋169チェック、既存公開5発3ケース、既存Chromium9ケースが成功。限定回帰321件と再読込15件も成功しています。各proofのbound hashは最終製品へ照合し、独立レビューで確認しました。

ユーザーの明示承認を受け、監査契約は列挙済み10ハッシュのみを変更し、3入力と専用wrapper 1件を末尾へ追加しました。既存133入力とテスト順序を保持し、136入力・期待1555件です。runner、CI workflowは変更していません。契約のrapidFiveRoundScopeは過去導入時のメタデータとして変更せず残っており、最新のFirst/Force採用範囲は本追補とCURRENT_CONTRACTSを参照してください。

契約更新後の321件再実行は接続中断で完了未確認のため成功とは扱いません。再接続後、専用wrapperとfreshnessのみ31件を再実行し全成功（post-contract-resumed.log）。全1555 suiteと公開CIは未実行です。証拠はリポジトリ隣接の evidence/lbg-rapid-shot-skills-20261111 に保存しています。
