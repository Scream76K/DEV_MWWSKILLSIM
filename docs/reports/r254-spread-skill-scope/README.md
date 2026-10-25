# 散弾・剛射強化の共通対象契約

ユーザー2026-10-25 23:12 UTC: 散弾強化はボウガン散弾/弓剛射・クイックショットに1.05倍を適用。これはスキル採用であり、散弾Lv2 MV/6Hitのゲート解除承認ではない。

index.html SPREAD_SHOT_SKILL_RULEが係数[1,1.05]、正式skillId2、PHYSICAL_ONLY、出典/OWNER_APPROVED、明示技ID対象を唯一の定義として保持。bow-reference.jsの旧独立spread係数表をこの同一オブジェクト参照へ置換し、spread-shot-skill.jsの共通resolveで技ID・weaponKind・component・levelを判定する。既存通常矢強化と乗算する位置を維持し、既存spread倍率を重ねない。

対象IDはTechnique DBのsourceLocatorを照合したBOW_QUICK_SHOT、BOW_POWER_SHOT_1/2/3、BOW_POWER_VOLLEY_1/2/3、HBG/LBG_SPREAD_AMMO_1/2/3。剛連射は既存採用範囲を維持。guided系や未知IDへ名前による推測展開なし。共通resolverはこれらに物理だけ1.05を返し、属性/通常弾/弓射撃は1。現存弓3技だけが実Formulaで使用する。LBG/HBG/クイックの未実装Handlerへ勝手に総計を返さず、技DBのEVIDENCE_GATEDを維持。これらは共通効果契約の準備であり実ダメージ接続完了ではない。

## 最小実入力
実MHDB通常rare8弓71（slot3）、散弾珠246（weapon slot3・id2 Lv1）の無し/有り。水・固定同属性攻撃3素材・復元なし、既存BOW_SHOT_3→POWER_SHOT_3→POWER_VOLLEY_3、ビンNONE/適正距離。装備集計からcalcBuild→公開Pipeline→実Formulaのtraceを検証。通常=最大。

|技|物理なし→あり|属性（不変）|
|---|---|---|
|射撃3|65.7558→65.7558|20.7|
|剛射3|109.593→115.07265|27.6|
|剛連射3|164.3895→172.608975|41.4|

合計429.4383→443.137425。各Hit物理を直接1.05比でassertし、属性の完全一致、非対象の不変を確認。別の最小契約確認ではHBG/LBG散弾・クイック物理1.05、HBG通常弾/弓属性1を確認し、技ゲートがEVIDENCE_GATEDのままとassert。これを実ボウガンのダメージ実証とはしない。stats/skill集計/plan/result上書きなし。

初回は既存弓単発reference経路がtraceを公開結果に保持しておらず、trace assertionで失敗。計算値を変えずFormulaの実traceを返すようAdapterを修正。初回ログを保存。最終ログにbase b47fdabと実行製品4ファイルSHA256。実行検証器はtools/spread-skill-proof.cjs。全体回帰・過去検証の再実行なし、bundle内部変更なし。

## 残作業
散弾Lv2の資料値/6Hit暫定採用承認と専用Formula接続は別。LBG固有0.7/速射/チェイスは今回有効化なし。クイック等の技側ゲートも維持。既存採用済みの会心分類修正b47fdabは別成果として保持。
