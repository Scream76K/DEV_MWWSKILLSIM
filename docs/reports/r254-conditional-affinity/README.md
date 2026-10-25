# 採用済み最大会心スキルの分類漏れ

確定1件（同じ欠陥が弱点特効/渾身/力の解放に影響）。index.html calcMaxAffinityには既存の最大会心計算、Adapter resolveEffectsには物理/属性用の最大会心差分があるが、classifySkill/resolveSkillApplicabilityに3種がなくSKILL_EFFECT_NOT_PROVENで両chが停止していた。

正式MHDB ID57/99/142・Lv範囲を照合してconditionalAffinityへ分類。係数・最大条件・武器/技・通常側の会心は変更なし。最大物理/属性の既存L3経路を再利用し、新しい倍率定義なし。

実GS236＋実armor687アナライズアイα（head、弱点特効Lv2のみ）。装備なし/ありの最小1組、calcBuild→公開Pipeline。修正前の失敗をbefore.json保持。修正後は通常375.73不変、最大375.73→389.82、会心0→最大15%。各物理Hitは1.0375倍（既存丸め誤差内）、conditional-affinity-maximumが1回であることをassert。属性0のため属性側への効果は静的確認のみ。渾身/力の解放は分類/ID/既存resolverの静的確認のみ。保存比較再実行なし。

before/afterのbaseは033a9e6d08db2222231126f7755fb668db56ec91、各adapter SHA256保持。再現はAFFINITY_FIXTURE=docs/reports/r254-conditional-affinity/fixture.json node tools/conditional-affinity-proof.cjs。fixtureのarmor/skillsは既取得/tmp/armor1000.jsonと/tmp/serie-skills-source.jsonから抽出、今回通信なし。

別途確認した未接続: 属性変換/耐性変換【雷】はAdapterがconditions.*Activeを読むがcompareStep5Snapshotにproducerがなく通常UIでは有効化できない。standardPowerConditionPlan側もpendingを保持するため、完成と誤報告しない。今回の対象条件や版採用を追加判断せず変更なし。通常スキル全体完了とはしない。
