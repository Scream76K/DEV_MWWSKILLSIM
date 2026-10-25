# SAED装填Lvの実装備接続

修正前基点3d121cccdb98ed5b8f470839be9820ac85a7f53a。実行はそのHEAD上の未コミット修正、result.jsonに製品/ハーネスハッシュを保存。コミット後再実行とはしない。

## 期待と根拠

MHDB正式skill109=砲弾装填。既存chargeBladeSaedDamageだけがLv0/1を強化3+通常2、Lv2を強化5へ解決する。満装填全5命中という既存KAN-21限定モデルであり、消費数から命中数を推測しない。盾ON・斧OFF・POWER_ELEMENTのまま、差は2×(強化1本−通常1本)、本体物理/属性は不変。

## 最小変更

index.html realPipelineSkillsResolvedは武器skills・防具の部位/skills・選択装飾品の原典解決・護石skillsが確認できたことを単独/保存比較両入口で伝える。未解決装飾品等はfalse。AdapterはSAED選択時のみこの証拠を必須とし、砲弾装填正式名称のentryをID109・整数Lv0〜2で検証。集計済み装備のスキルなしを明示0へ正規化する。技能レベルは既存calcBuild集計を用い、武器内蔵と集計値を足し直さない。

本数解決や係数は変更せず既存唯一箇所に任せる。旧直接APIの未指定互換は維持するが、製品入口から未指定へ落とさない。混在列状態遷移・REFERENCE_ONLY・版未検証・DPS未算出の契約は維持。

## 実入力と証拠

fixture.json：既存取得のMHDB103武器原典、武器スロット[2,1]。Aは珠なし、Bはweapon用増弾珠Ⅱ【２】ID29（slot2、skill109 Lv2）をw0へ。防具/護石なし、同一武器・技・盾斧条件。取得済みcacheのハッシュ/mtimeをsource-meta.jsonへ保存（HTTP取得日時と偽らない）。stats/skills/plan/結果の上書きなし。

tools/saed-loading-ab-proof.cjsは実calcBuild、saveNamedBuild、runBuildCompare、rendererを通す。通常/最大ともA759.193335、B815.977335。本体物理234.877335と属性23.4不変、ビン500.916→557.7、差56.784。各合計は成分和。trace Lv0/2と3+2/5+0、単独/比較一致、比較後Bの装備/技/スキル/結果復元、DOM759.2/816.0と参考値暫定をassert。選択珠が原典不明の境界はCB_EQUIPMENT_SKILLS_UNRESOLVEDをassert。保存済みchecks pass、JSDOM errorsなし。Lv1は今回実行せず既存本数分岐の静的確認のみ。

旧r253-kan21-reference/result.jsonの815.977335は削除せず、未指定互換値の履歴として維持。この新証拠が実装備接続の最新結果であり、同値のBには合法なLv2装備が必要。近接チャージマスター/通常アーティアは承認待ちのまま。全体回帰なし、pushなし。
