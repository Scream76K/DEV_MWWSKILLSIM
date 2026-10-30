# 採用範囲の閉鎖判定 — 2026-10-29

## 137 / 140 / 50
今回の製品変更・テスト追加はなし。直前の竜撃弾限定実装が独立レビュー受入となったため、残理由を現ソースと照合して分類更新。

- 137 Force: BowReference.standardの固定3射/ビン条件/刃鱗排他/射撃位置、BowgunNormalReference.shotSkillBonusesの4/6発目物理・属性倍率と4発目以降会心、adapter属性弾consumerの攻撃依存属性/cap/flat分離を確認。竜撃弾は最新実装で同resolverから物理flat・第2属性倍率へ接続。任意射撃や未採用モードは対象拡張。
- 140 First: BowReferenceではBOWGUN_ONLYとして非適用。通常/属性弾は満装填1発目の共通resolver。竜撃弾は最新実装で接続。First140/Force137のMHDB IDとLv検証を維持。
- 50 Fire Attack: 共通武器/属性弾の採用済み倍率→flat→cap経路に加え、HBGWyvernReferenceのfireSkillTargetは既存DBで第2だけ。fireMultipliers/fireFlatsはDB一箇所。承認済みFirst/Force併用で第2表示値324/312、第1の400不変を最新公開証拠で確認。原典一般capの未確定を、採用済み限定式の未接続と混同しない。災禍/吸収/料理の専用火属性への未採用拡張は各スキル側の課題。

根拠: PARTIAL39_ACTION_MAP.md の137/140残理由、EXPLICIT_AFFINITY_SHOT_INPUTS.md、PASS13_ELEMENT_CAP.md、最新WYVERN_SHOT_ORDER_CONNECTION.mdとwyvern-shot-execution.json。静的consumerはhope-hammer-browser-adapter.js referenceFormula、bow-reference.js、bowgun-normal-reference.js、hbg-wyvern-reference.js。最新証拠は合成契約入力、実機/合法装備保証なし。過去証拠を最新全回帰PASSとしない。

3行は部分→完全。最後の断絶を閉じたのは前バッチの製品実装であり、今回さらに3件を実装した意味ではない。OWNER_APPROVED_PROVISIONAL・実機待ちは維持。

## 残るまとまりの選別
既存PARTIAL39_ACTION_MAP / CONVERSION_SCOPE_CLOSEOUTを再利用。今回の順序承認だけで新たに解除できる別の確定断絶は特定できなかった。未知の対象を推測してguard解除しない。

優先する次の判断は13災禍転福・133属性吸収・171料理の竜撃弾専用火属性。既存資料はFirst/Force/FireAttackの第2適用を示すが、これら一般条件属性の対象Hitとcapを示していない。既存候補は第1を400に据え置き、第2を (200*M*条件倍率*S + F + 条件flat) とするもの。ただし対象を第2だけとすること、cap基礎/上限の採用は未承認。候補上限460（弾の類推）と600（固定基礎武器の類推）のどちらも直接根拠なし。自動採用せず、適用対象と上限を確認する必要がある。料理flatの専用属性への単位適用も別途確認。資料: WYVERN_ORDER_AND_REMAINING_DECISIONS.md、https://kuroyonhon.com/mhwilds/program/skill.php 、https://kuroyonhon.com/mhwilds/memo/31.php 。前者の旧A/B順序質問は今回承認で解消済み。

その他の部分: 7前段/対象Hit、8/103特殊本体対象Hit、18黒蝕なし感染入力、53竜撃弾距離適用、66守勢GL、85/136特殊成分、86アッパー同定、154/168満タン共存。既知論点は再調査していない。
欠落6:23/69/94は新しい対象技採用、159/163は単位/対象、178は既採用倍率を保持し加算単位/成分範囲の確定が必要。

commit/push/統合なし。製品hash不変、追加テストなし。

最新分類: {"火力非対象": 88, "完全接続": 65, "部分接続": 14, "固定ダメージ系・注釈のみ": 6, "欠落": 6}

訂正: 13/133/171の専用火属性は最終製品向け未採用拡張であり、採用済み接続完成の必須残件ではない。ADOPTED_VS_PRODUCT_REMAINDERS.mdを最新判断とする。
