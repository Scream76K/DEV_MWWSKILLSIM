# 共通効果の下流照合（黒蝕・攻撃・見切り・五属性強化）

基点6c71e818。現差分はローカルのみ。読取確認と実行確認を区別し、14武器の実行総当たりはしない。

## 14武器の消費先

共通P/Eは `sourced-physical-formula.cjs` → `damageFromParams`。L3 `resolveEffects` の攻撃乗算/加算・会心・属性を `engine.applyEffects` が成分別に消費する。攻撃内訳はB×M+F。非会心の特殊成分は会心を消費しないのが正しい。

|武器|本体/固有式での実消費|残る限定境界|
|---|---|---|
|大剣|共通P/E、溜め属性係数はEへ|特殊衝撃波の条件は既存範囲限定|
|太刀|共通P/E＋既存ゲージ係数|未採用技は対象外|
|片手剣|Hit別切断/打撃肉質＋共通P/E|後半属性0は既存Hit定義|
|双剣|共通P/E＋既存モード|未採用技・状態は対象外|
|ハンマー|共通P/E|溜打強化の新仕様は別行|
|狩猟笛|本体P/E。音波はattack/element段階のみ。固定10は効果対象fixed|非会心音波へ会心を掛けない|
|ランス|共通P/E、DB切断肉質|未採用技は対象外|
|ガンランス|本体P/E。砲撃はattack段階のみ→GunlanceShellReference.calculate|砲術＋非identity攻撃内訳は採用範囲外（下記）|
|スラアク|Hit時mode条件のビン補正＋共通P/E。覚醒追撃は高速変形除外|覚醒追撃の会心属性は共通Eへ接続（pass5）|
|チャアク|本体P/E。榴弾はattackComponents、強属性ビンはstats.element。SAEDは専用式へattack/element/affinity|SAED本体の会心属性は接続（pass5）。ビンへ会心は非適用|
|操虫棍|stateStatsのB×1.15+F、共通P/E。属性は計算済みelementValue|猟虫自身は仕様上除外|
|ライト|通常弾はBowgunNormalReference.shotのattack/affinity。属性弾はattack依存部＋別flat|属性弾でactiveBonusEffects一律guardが残り黒蝕未接続|
|ヘビィ|通常弾同上。竜撃弾はaggregateAttack、砲術対象HitのみB×M×砲術+F。火成分は専用fireLevel|属性弾黒蝕guardは残る。会心撃はflat後へ接続（pass5）|
|弓|BowReferenceへattack/affinity/elementBasis。CMは基礎×乗算部だけ、flat後置|既存採用3技・明示射撃条件に限定|

## 今回解消

GL入口のunreviewedSkillsは、producerで正当なrank/部位を確認した黒蝕と無我だけを認識する。砲術なし通常砲撃は感染中9.4/最大克服9.8（従来中立8.6）。会心は砲撃に適用せず、攻撃flatのみ。砲術Lv1併用は既存順序gateを維持。公開Pipeline最小証拠 `gl-black-after.json`。

GLのTechnique DB artilleryReference.scopeは **NORMAL_ONLY_NEUTRAL_ATTACK_NO_CONDITIONAL_BONUS**。従ってガードを削除することは既存採用内の修正ではない。資料候補は `(B×M×砲術+F)×技係数`。現実装の中立限定式は `(B×M+F)×砲術×技係数` となるため、単純解除するとflatまで増幅する。候補順序を採用する判断が必要。数値係数を変更したわけではない。

根拠：`docs/reports/gl-research-handoff/REPORT.md` 22–34行、`gl-artillery-version/REPORT.md`、https://kuroyonhon.com/mhwilds/program/skill.php 。歴史資料と現行版実測は区別。

## 判定の更新

見切り3：既存全対象の物理会心へL3から到達し、非会心特殊成分は段階フィルタ/専用式で除外。会心100上限を共通L3で保持。採用済み範囲の静的完全接続へ変更する。全14実行確認とはしない。
攻撃72：GL砲術との順序の採用制限を残すため全体は部分。黒蝕106も属性弾のactiveBonusガードとGL砲術制限が残る。五属性強化：通常属性本体・強属性ビン・弓・属性弾の下流は追跡済み、条件属性の上限/競合と特殊成分は別確認が残るので全体の完全へは昇格しない。

## 新承認2効果の限定接続

係数正本 `COMMON_SKILL_DAMAGE_RULES`。会心撃Lv1/2/3を武器群別に保持し `MHResolveCriticalElement` →equipment→共通属性Formulaへ供給。Bow公開経路も同resolverへ。非会心のHH音波、GL砲撃、CBビンへ新係数は渡さない。属性弾・CB SAED本体・SA覚醒追撃の会心撃guardはpass5で解消。係数承認だけで全成分適用済みとはしない。
弾導強化Lv3は採用済み弓/通常弾/属性弾の適正距離の物理攻撃+5。属性弾は専用physicalAttackAddで攻撃依存属性部分・属性flatとも不変。竜撃弾は距離契約未接続なので明示理由で保留。非射撃には加算しない。原典の拡散弾等は今回未採用技のため拡張しない。

実行証拠：`critical-element-after.json`（IG公開式と大小2群の共通Formula、負会心対照）、`ballistics-after.json`（HBG公開式のLv2/3、距離対照、属性flat不変）。出典 https://kuroyonhon.com/mhwilds/d/dame.php と https://kuroyonhon.com/mhwilds/program/skill.php 。現行版実機VERIFIEDではない。新しい大量回帰・④代表build確認・CI・Safariなし。
