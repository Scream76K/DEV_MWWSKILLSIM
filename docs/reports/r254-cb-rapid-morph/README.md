> 履歴：23:53の攻撃段階契約採用により、本書の最終物理/属性倍率と140.55→168.66は旧式の証拠です。最新成功証拠として使用しません。訂正は ../r254-rapid-morph-attack-stage/README.md。

# CB高速変形：既存本体補正の公開入口接続

Owner承認: 2026-10-25 23:31 UTC Sentinel_8f34883d98e48191996e0fac3ebd8505「はい」。旧読み取り専用制約による拒否後、新承認で拒否対象を一度再試行し許可。迂回なし。

製品commit 8b90d0dd024c356a5faf28940db529b5a1c0cad8。実行時HEADはab9478ed7218f7af1f13c36834764258ebefabad＋Adapterの限定変更。after.jsonに実行Adapter SHA256、commit内内容と一致を静的照合済み。before.jsonは同じハーネスの読み込み時だけgit show ab9478eのAdapterを使用し、原本やcheckoutを変更せず修正前のSKILL_EFFECT_NOT_PROVENを再現。

## 実装
hope-hammer-browser-adapter.js classifySkillで正式id7高速変形を分類。CBだけ、Lv1..3、既存ChargeBladeEngine.techniques登録済み技に限定。未検証SAはRAPID_MORPH_SCOPE_OR_LEVEL_UNRESOLVEDで拒否維持。

resolveEffectsは既存chargeBladeTechniqueComponents(id,{shieldBoosted:false,axeBoosted:false,rapidMorphLevel})のtrace.rapidMorphDamageMultiplierを参照。Lv2=1.1/Lv3=1.2を再定義しない。rapidMorphDamageEligibleが真のCB_SWORD_TO_AXE_MORPHだけ物理/属性のcoefficient段階で乗算し、丸め前の本体係数に1回反映。attackへ乗算して加算スキルを漏らす実装にしない。盾1.1は既存Formulaに任せ、resolver呼出時の盾はfalseにして重複を防止。ビンはeffectStagesがattack/elementでcoefficientを受けない上、対象技条件も異なる。

同技の盾/斧状態はboolean必須。axeBoosted=trueは未接続の追加成分を落とした総計を出さずCB_MORPH_AXE_BOOST_COMPONENTS_UNCONNECTED。斧強化の数値やHitを新規採用していない。速度/DPSは対象外。既存承認済み技のsource gateは変更しない。

## 最小実装備・結果
MHDB147テンプス・ギア、通常rare8、スロット3/3/3、榴弾ビン、武器内蔵スキルなし。既存承認の同属性攻撃3素材/水・復元なし。速変珠Ⅲ46はweapon slot3、正式id7 Lv3。防具/護石スキルなし。両条件とも盾ON/斧OFF/強化ビンON。calcBuildから集計、結果の手上書きなし。

|技/成分|Lv0|Lv3|
|---|---:|---:|
|剣:変形斬り 物理|130.20|156.24|
|剣:変形斬り 属性|10.35|12.42|
|剣:変形斬り 総計|140.55|168.66|
|属性解放斬りⅠ 物理|122.96|122.96|
|属性解放斬りⅠ 属性|10.35|10.35|
|属性解放斬りⅠ ビン|34.44|34.44|
|属性解放斬りⅠ 総計|167.75|167.75|

各通常=最大。実表示140.5/168.7等は実計算値toFixed(1)一致で検証（140.55内部値140.54999999999998）。各対象成分effectsAppliedに高速変形1件、非対象には0件をassert。盾/斧状態は実UI。斧ONの正しい理由を確認。保存A/Bは変形斬りLv0/3、単独と比較値一致、比較後の元装備snapshotと条件一致。preserveCombo:true変更なし。既実行弱特や全体回帰なし。

Lv2は同じ既存resolverの静的確認、今回実実行はLv0/3。SA、高速変形の全対象技、斧強化追撃の計算成立は未確認/未対応。fixtureの武器はr254-artia-rare8保存原典、珠/skillは既取得/tmp/decos1000.json・/tmp/serie-skills-source.jsonから保存（今回新規通信なし）。

再現: CB_MORPH_FIXTURE=docs/reports/r254-cb-rapid-morph/fixture.json node tools/cb-morph-proof.cjs

## 条件会心3種の保存比較（静的）
compareSnapshot→applyBuildSnapshot(preserveCombo:true)→各装備calcState.total/stats→evaluateSavedSnapshotOneHit→同evaluateCurrent。calcMaxAffinityの最大差分はnormalへ出さずmaximumだけphysical/elementへ渡る。比較後は既存finally復元。今回は当該3種の再テストなし、追加の静的欠陥は確認していない。
