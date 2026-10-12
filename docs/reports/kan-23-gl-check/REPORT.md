# KAN-17 P0次工程：GL非砲撃2技の再検証・LBG最小範囲確認

2026-10-11。r250 worktree /Users/scream/Projects/DEV_MWWSKILLSIM-r250。
ブランチ codex/integrate-r249、HEAD fb6d82cd525da9273af10ac6b719f330208608c5。
既存未コミット成果を維持。main/develop・原本・PROJECT GUILD 3Dへ変更なし。commit/push/merge/rebase/公開/Jira操作なし。

## 結論

GL_SLAM（叩きつけ）、GL_SWEEP（なぎ払い）は既に単発・参考テンプレ・自由コンボへ共通計算経路で接続済み。接続不足を再現しなかったため製品修正・新規数値採用なし。Technique DB、計算式、保存JSONを変更していない。

既存 tools/kan17-gunlance-p0-dom.test.cjs 4件を再実行：単発2技の合計と参考テンプレ・自由コンボ一致、現ビルド攻撃/会心/肉質による再計算、特殊成分が欠ける場合の全体未算出、JSON復元を確認。Browser375/1440pxの既存2件も全スイート内で再実行。
経路は comboTechniqueDamage → ordinaryComboTechniqueDamage → genericProfileDamage。テンプレ adopted:gl_melee は砲撃・竜杭を含まない独立した2技であり、STANDARDの部分合計ではない。
DB値 GL_SLAM MV57・属性補正1、GL_SWEEP MV40・属性補正1.5 は既存値のまま。PARTIALLY_VERIFIED、対象1.042.00.02、MACARONGAMEMO_GUNLANCE_MOTION_CURRENT。実機VERIFIEDへ昇格なし。

砲撃・竜杭は固定/物理/属性成分の式と状態適用が未接続。Hit数のみでは算出しない。既存回帰で叩きつけ＋竜杭フルバーストの総ダメージnull・未算出表示を確認。係数やHit構成の推測補完なし。

## LBGの既存データと阻害条件

|DBキー|MV/Hit|Hit数|状態|
|---|---:|---:|---|
|LBG_NORMAL_AMMO_1|17|3|SOURCE_CONFIRMED / UNVERIFIED / EVIDENCE_GATED|
|LBG_NORMAL_AMMO_2|23.8|3|同上|
|LBG_NORMAL_AMMO_3|32.3|3|同上|

出典レコード MACARONGAMEMO_LBG_R49_SOURCE、baselineGameVersion1.042.00.02。hitsは空、specialComponents AMMO_PHYSICAL、weaponApplicability UNVERIFIED。unresolvedReasonsは特殊式・イベント数、対象版、武器への弾適用。

bowgun-normal-reference.js のshotはheavy-bowgunのHBG_NORMAL_REFERENCE_RULESとHBG_NORMAL_AMMO_nを固定参照。prepareP0RangedContextもbow/heavy-bowgunだけを対象とする。LBG専用の通常弾ルールレコードは確認できなかった。
距離補正、通常/速射モード、通常弾強化・射順スキルのLBG適用を根拠付きで限定できれば、既存弾計算モジュールの武器別レコード参照化を検討可能。現時点ではHBGの通常モード補正等をLBGへ無条件流用しない。数値が登録済みであることと、全補正の適用が成立することを区別した。
新しい外部数値調査は実施していない。ゼーリエへの判断事項：LBG通常・非速射の限定計算に適用できる既存根拠/ルールを指定できるか。適用条件が揃うまで理由付き未算出を維持する。

## 回帰テスト

|対象|実行/合格|失敗|skip|
|---|---:|---:|---:|
|Node tests/*.test.cjs|830|0|0|
|DOM tools/*dom.test.cjs|353|0|0|
|Browser＋integration/template gates＋旧OCR|127|0|0|
|合計|1310|0|0|

GL単独4件は上記DOMに含まれるため重複加算しない。ログはevidence/。git diff --check合格。テスト削除・skip・期待値変更なし。Chromiumを使用。Safari実機および独立担当レビューは今回未実施。

## 変更ファイル・影響

今回の手動変更は本報告書とevidence内の4ログのみ。既存GLブラウザテストはdocs/reports/kan-17-gl/evidence/gl-375.png、gl-1440.pngを再生成した。製品コード・DB・テストファイルの編集なし。KAN-13/19/21、他武器、保存JSONを変更する必要はなかった。

## 残課題・次工程

GL砲撃/竜杭の特殊成分、LBG通常弾の限定条件、CBのSAED以外（解放ⅠⅡ/高出力等）を保持。猟虫新規数値採用は保留。DPS・時間計測を実施していない。

ゼーリエ転記用：GL非砲撃2技は3経路接続済みで追加修正不要。1310件合格、失敗skip0。LBG通常弾MV/Hitは既存DBにあるが、HBG専用補正のLBG適用根拠が不足。特殊成分の部分合計は総ダメージとして表示しない。限定接続維持とLBG次工程の条件判断を依頼。
