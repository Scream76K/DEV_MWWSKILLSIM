# 検証済み非火力計画と変換

## producerの一巡棚卸し
index.html hpRelevantBonusEffectsが除外し、standardGroupPowerPlan.nonDamageEffectsへ格納する現行カテゴリは以下のみ。
- ID33 加速再生Ⅰ/Ⅱ：RECOVERY_BONUS_HP_POLICIESの親名/series/部位/rank/ID/整数countを検査。複数回復発動は除外せず未解決へ。
- ID4 竜都の護り：親名/技名/group/3部位/rank1/ID/整数countを検査。複数発動は除外せず未解決へ。
祭事4系統/千刃rankIはnonDamageEffectsではなくappliedのNO_DIRECT_HP_EFFECT。既に専用照合接続済み。固定追加ダメージ注釈はapplied/annotationであり、ここへ混ぜない。その他の未解決系列を非火力と推測しない。

## 最小修正
既存hpRelevantBonusEffectsを使う読取resolver MHWValidatedNonDamageBonusEffectsを公開。adapterはID4/33に限定してproducerの検証を再利用し、元発動一件・nonDamageEffects一件・全発動キー一致・applied側重複なしを要求。元のgroupPlan.unresolvedEffects=0/selfState.pending=0条件も維持。非火力booleanだけで許可しない。新係数・新ゲーム効果なし。

## 公開証拠
修正前：33rankII＋165/4rankI＋152とも変換guard拒否。修正後：両者通常/最大complete、攻撃200/200。雷表示属性550/550、龍500/680。非火力効果の数値加算なし。合成GS契約入力で、合法装備や実機の証明ではない。
通常保存読込・2build保存A/Bで結果一致、開始状態/共有条件不変。正規技＋重複33の計画は未解決のまま変換guard拒否。before/after exit0、途中失敗なし。具体値・hash・rawはconversion-non-damage-execution.json。
祭事/千刃rankI/IIの既存枝は今回変更なし（直前証拠を再利用、再実行なし）。33rankIはproducer同一ルールの静的確認のみ。全武器/CI/Safari/実機は未確認。

152/165の分類は部分維持。今回までで見つけた非火力計画カテゴリの取りこぼしは修正したが、全採用組合せの完成を自動宣言しない。commit/pushなし。
