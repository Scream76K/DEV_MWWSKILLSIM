# 未反映・部分保持スキル一覧

179スキル・全442有効rank ×14代表武器、6188ケース／12376通常・最大channelを公開入口で検証しました。全ケース算出、残停止0。全武器個体・全装備組合せ・全発動条件・ゲーム内実測精度を検証したものではありません。

旧版で算出できた12232 channelの数値は全て同一。旧未算出から144 channelが回復。未反映の観測は144件、対象スキルIDは13種です。以下は組合せごとの省略結果であり、理由をそのスキル単独の因果関係と断定しません。

検証DBはMHDB APIから2026-11-05T02:32:05.085Zに取得したsnapshot（APIデータ版 2026-04-15T01:28:18+00:00）です。このAPIデータ版はゲーム版の実測証明ではありません。取得先とhashは source-metadata.json に記録しています。

ユーザー指定の全域除外6種（8/85/103/129/138/160）、標準比較だけの163、既存非HP93種、未対応効果、部分保持を別管理しています。詳しくは skill-inventory.json と owner-exclusion-observations.json を参照してください。

| ID | スキル／効果 | Lv | channel | 区分 | 武器 | 未反映理由 |
|---|---|---|---|---|---|---|
| 24 | チャージマスター | 1 | 最大 | この組合せで効果未反映 | 太刀、片手剣、双剣、狩猟笛、ランス、ガンランス、スラッシュアックス、ライトボウガン | UNRESOLVED_EFFECTS:チャージマスター:CONDITIONAL_DAMAGE_FORMULA_PENDING |
| 24 | チャージマスター | 1 | 最大 | この組合せで効果未反映 | チャージアックス | R:UNRESOLVED_EFFECTS:チャージマスター:CONDITIONAL_DAMAGE_FORMULA_PENDING;H:UNRESOLVED_EFFECTS:チャージマスター:CONDITIONAL_DAMAGE_FORMULA_PENDING |
| 24 | チャージマスター | 1 | 通常 | この組合せで効果未反映 | ライトボウガン | HBG_ELEMENT:SKILL_INTERACTION_UNSUPPORTED |
| 24 | チャージマスター | 2 | 最大 | この組合せで効果未反映 | 太刀、片手剣、双剣、狩猟笛、ランス、ガンランス、スラッシュアックス、ライトボウガン | UNRESOLVED_EFFECTS:チャージマスター:CONDITIONAL_DAMAGE_FORMULA_PENDING |
| 24 | チャージマスター | 2 | 最大 | この組合せで効果未反映 | チャージアックス | R:UNRESOLVED_EFFECTS:チャージマスター:CONDITIONAL_DAMAGE_FORMULA_PENDING;H:UNRESOLVED_EFFECTS:チャージマスター:CONDITIONAL_DAMAGE_FORMULA_PENDING |
| 24 | チャージマスター | 2 | 通常 | この組合せで効果未反映 | ライトボウガン | HBG_ELEMENT:SKILL_INTERACTION_UNSUPPORTED |
| 24 | チャージマスター | 3 | 最大 | この組合せで効果未反映 | 太刀、片手剣、双剣、狩猟笛、ランス、ガンランス、スラッシュアックス、ライトボウガン | UNRESOLVED_EFFECTS:チャージマスター:CONDITIONAL_DAMAGE_FORMULA_PENDING |
| 24 | チャージマスター | 3 | 最大 | この組合せで効果未反映 | チャージアックス | R:UNRESOLVED_EFFECTS:チャージマスター:CONDITIONAL_DAMAGE_FORMULA_PENDING;H:UNRESOLVED_EFFECTS:チャージマスター:CONDITIONAL_DAMAGE_FORMULA_PENDING |
| 24 | チャージマスター | 3 | 通常 | この組合せで効果未反映 | ライトボウガン | HBG_ELEMENT:SKILL_INTERACTION_UNSUPPORTED |
| 69 | 特殊射撃強化 | 1 | 最大 | この組合せで効果未反映 | ライトボウガン | REAL_SLICE:SKILL_EFFECT_NOT_PROVEN:特殊射撃強化 |
| 69 | 特殊射撃強化 | 1 | 通常 | この組合せで効果未反映 | ライトボウガン | REAL_SLICE:SKILL_EFFECT_NOT_PROVEN:特殊射撃強化 |
| 69 | 特殊射撃強化 | 2 | 最大 | この組合せで効果未反映 | ライトボウガン | REAL_SLICE:SKILL_EFFECT_NOT_PROVEN:特殊射撃強化 |
| 69 | 特殊射撃強化 | 2 | 通常 | この組合せで効果未反映 | ライトボウガン | REAL_SLICE:SKILL_EFFECT_NOT_PROVEN:特殊射撃強化 |
| 86 | 飛燕 | 1 | 最大 | この組合せで効果未反映 | ガンランス | REAL_SLICE:AIRBORNE_HIT_SCOPE_PENDING:GL_WYRMSTAKE_FULL_BURST |
| 86 | 飛燕 | 1 | 最大 | この組合せで効果未反映 | チャージアックス | H:REAL_SLICE:AIRBORNE_HIT_SCOPE_PENDING:CB_AXE_TO_SWORD_MORPH |
| 86 | 飛燕 | 1 | 通常 | この組合せで効果未反映 | ガンランス | REAL_SLICE:AIRBORNE_HIT_SCOPE_PENDING:GL_WYRMSTAKE_FULL_BURST |
| 86 | 飛燕 | 1 | 通常 | この組合せで効果未反映 | チャージアックス | H:REAL_SLICE:AIRBORNE_HIT_SCOPE_PENDING:CB_AXE_TO_SWORD_MORPH |
| 94 | 貫通弾・竜の矢強化 | 1 | 最大 | この組合せで効果未反映 | ライトボウガン、弓 | REAL_SLICE:SKILL_EFFECT_NOT_PROVEN:貫通弾・竜の矢強化 |
| 94 | 貫通弾・竜の矢強化 | 1 | 通常 | この組合せで効果未反映 | ライトボウガン、弓 | REAL_SLICE:SKILL_EFFECT_NOT_PROVEN:貫通弾・竜の矢強化 |
| 159 | 焼き砲モロコシ | 1 | 最大 | この組合せで効果未反映 | ガンランス | GL_SHELL:CORNPOPPER_TECHNIQUE_NOT_ADOPTED |
| 159 | 焼き砲モロコシ | 1 | 通常 | この組合せで効果未反映 | ガンランス | GL_SHELL:CORNPOPPER_TECHNIQUE_NOT_ADOPTED |
| 162 | 海竜の渦雷／蒼雷一閃Ⅰ | 1 | 最大 | 本体保持・砲撃への効果未反映 | ガンランス | GL_TARGET:UNREVIEWED_MODIFIER:蒼雷一閃Ⅰ |
| 162 | 海竜の渦雷／蒼雷一閃Ⅰ | 1 | 通常 | 本体保持・砲撃への効果未反映 | ガンランス | GL_TARGET:UNREVIEWED_MODIFIER:蒼雷一閃Ⅰ |
| 162 | 海竜の渦雷／蒼雷一閃Ⅱ | 2 | 最大 | 本体保持・砲撃への効果未反映 | ガンランス | GL_TARGET:UNREVIEWED_MODIFIER:蒼雷一閃Ⅱ |
| 162 | 海竜の渦雷／蒼雷一閃Ⅱ | 2 | 通常 | 本体保持・砲撃への効果未反映 | ガンランス | GL_TARGET:UNREVIEWED_MODIFIER:蒼雷一閃Ⅱ |
| 165 | 耐性変換【雷】 | 1 | 最大 | この組合せで効果未反映 | 大剣、太刀、片手剣、ハンマー、狩猟笛、ランス、ガンランス、スラッシュアックス、操虫棍、弓 | REAL_SLICE:THUNDER_CONVERSION_BODY_SCOPE_UNSUPPORTED |
| 165 | 耐性変換【雷】 | 1 | 最大 | この組合せで効果未反映 | チャージアックス | R:REAL_SLICE:THUNDER_CONVERSION_BODY_SCOPE_UNSUPPORTED;H:REAL_SLICE:THUNDER_CONVERSION_BODY_SCOPE_UNSUPPORTED |
| 165 | 耐性変換【雷】 | 1 | 通常 | この組合せで効果未反映 | ガンランス | GL_TARGET:UNREVIEWED_MODIFIER:耐性変換【雷】 |
| 168 | 暗黒 | 1 | 最大 | この組合せで効果未反映 | 太刀、片手剣、双剣、ハンマー、狩猟笛、ランス、ガンランス、スラッシュアックス、操虫棍、ライトボウガン、ヘビィボウガン、弓 | UNRESOLVED_EFFECTS:暗黒:DARK_WEAPON_UNRESOLVED |
| 168 | 暗黒 | 1 | 最大 | この組合せで効果未反映 | チャージアックス | R:UNRESOLVED_EFFECTS:暗黒:DARK_WEAPON_UNRESOLVED;H:UNRESOLVED_EFFECTS:暗黒:DARK_WEAPON_UNRESOLVED |
| 171 | 炎の料理人 | 1 | 最大 | この組合せで効果未反映 | ライトボウガン、ヘビィボウガン | COOKING:SPECIAL_AMMO_ELEMENT_SCOPE_PENDING |
| 172 | 暗黒騎士の証／ダークアーツ | 1 | 最大 | この組合せで効果未反映 | 狩猟笛、ガンランス、操虫棍、ライトボウガン、ヘビィボウガン、弓 | UNRESOLVED_EFFECTS:BONUS_DAMAGE_EFFECT_PENDING:ダークアーツ |
| 172 | 暗黒騎士の証／ダークアーツ | 1 | 最大 | この組合せで効果未反映 | チャージアックス | R:UNRESOLVED_EFFECTS:BONUS_DAMAGE_EFFECT_PENDING:ダークアーツ;H:UNRESOLVED_EFFECTS:BONUS_DAMAGE_EFFECT_PENDING:ダークアーツ |
| 172 | 暗黒騎士の証／ダークアーツ | 1 | 通常 | この組合せで効果未反映 | 狩猟笛、ガンランス、操虫棍、ライトボウガン、ヘビィボウガン、弓 | UNRESOLVED_EFFECTS:BONUS_DAMAGE_EFFECT_PENDING:ダークアーツ |
| 172 | 暗黒騎士の証／ダークアーツ | 1 | 通常 | この組合せで効果未反映 | チャージアックス | R:UNRESOLVED_EFFECTS:BONUS_DAMAGE_EFFECT_PENDING:ダークアーツ;H:UNRESOLVED_EFFECTS:BONUS_DAMAGE_EFFECT_PENDING:ダークアーツ |
| 172 | 暗黒騎士の証／ブラックナイト | 2 | 最大 | この組合せで効果未反映 | 大剣、太刀、片手剣、双剣、ハンマー、狩猟笛、ランス、ガンランス、スラッシュアックス、操虫棍、ライトボウガン、ヘビィボウガン、弓 | UNRESOLVED_EFFECTS:BONUS_DAMAGE_EFFECT_PENDING:ブラックナイト |
| 172 | 暗黒騎士の証／ブラックナイト | 2 | 最大 | この組合せで効果未反映 | チャージアックス | R:UNRESOLVED_EFFECTS:BONUS_DAMAGE_EFFECT_PENDING:ブラックナイト;H:UNRESOLVED_EFFECTS:BONUS_DAMAGE_EFFECT_PENDING:ブラックナイト |
| 172 | 暗黒騎士の証／ブラックナイト | 2 | 通常 | この組合せで効果未反映 | 大剣、太刀、片手剣、双剣、ハンマー、狩猟笛、ランス、ガンランス、スラッシュアックス、操虫棍、ライトボウガン、ヘビィボウガン、弓 | UNRESOLVED_EFFECTS:BONUS_DAMAGE_EFFECT_PENDING:ブラックナイト |
| 172 | 暗黒騎士の証／ブラックナイト | 2 | 通常 | この組合せで効果未反映 | チャージアックス | R:UNRESOLVED_EFFECTS:BONUS_DAMAGE_EFFECT_PENDING:ブラックナイト;H:UNRESOLVED_EFFECTS:BONUS_DAMAGE_EFFECT_PENDING:ブラックナイト |
| 173 | オメガレゾナンス／レゾナンスⅠ | 1 | 最大 | この組合せで効果未反映 | ガンランス | GL_TARGET:UNREVIEWED_MODIFIER:レゾナンスⅠ |
| 173 | オメガレゾナンス／レゾナンスⅠ | 1 | 通常 | この組合せで効果未反映 | ガンランス | GL_TARGET:UNREVIEWED_MODIFIER:レゾナンスⅠ |
| 173 | オメガレゾナンス／レゾナンスⅡ | 2 | 最大 | この組合せで効果未反映 | ガンランス | GL_TARGET:UNREVIEWED_MODIFIER:レゾナンスⅡ |
| 173 | オメガレゾナンス／レゾナンスⅡ | 2 | 通常 | この組合せで効果未反映 | ガンランス | GL_TARGET:UNREVIEWED_MODIFIER:レゾナンスⅡ |
| 178 | 巨戟龍の黙示録／宣戦呼応Ⅰ | 1 | 最大 | この組合せで効果未反映 | ガンランス、ライトボウガン、ヘビィボウガン | UNRESOLVED_EFFECTS:GOG:DEDICATED_COMPONENT_NOT_ADOPTED |
| 178 | 巨戟龍の黙示録／宣戦呼応Ⅰ | 1 | 最大 | この組合せで効果未反映 | チャージアックス | R:UNRESOLVED_EFFECTS:GOG:DEDICATED_COMPONENT_NOT_ADOPTED;H:UNRESOLVED_EFFECTS:GOG:DEDICATED_COMPONENT_NOT_ADOPTED |
| 178 | 巨戟龍の黙示録／宣戦呼応Ⅱ | 2 | 最大 | この組合せで効果未反映 | ガンランス、ライトボウガン、ヘビィボウガン | UNRESOLVED_EFFECTS:GOG:DEDICATED_COMPONENT_NOT_ADOPTED |
| 178 | 巨戟龍の黙示録／宣戦呼応Ⅱ | 2 | 最大 | この組合せで効果未反映 | チャージアックス | R:UNRESOLVED_EFFECTS:GOG:DEDICATED_COMPONENT_NOT_ADOPTED;H:UNRESOLVED_EFFECTS:GOG:DEDICATED_COMPONENT_NOT_ADOPTED |
| 181 | 耐性変換【水】 | 1 | 最大 | この組合せで効果未反映 | 大剣、太刀、片手剣、双剣、ハンマー、狩猟笛、ランス、ガンランス、スラッシュアックス、操虫棍、ライトボウガン、ヘビィボウガン、弓 | REAL_SLICE:WATER_CONVERSION_SCOPE_UNSUPPORTED |
| 181 | 耐性変換【水】 | 1 | 最大 | この組合せで効果未反映 | チャージアックス | R:REAL_SLICE:WATER_CONVERSION_SCOPE_UNSUPPORTED;H:REAL_SLICE:WATER_CONVERSION_SCOPE_UNSUPPORTED |
| 181 | 耐性変換【水】 | 1 | 通常 | この組合せで効果未反映 | ガンランス | GL_TARGET:UNREVIEWED_MODIFIER:耐性変換【水】 |

## 既存の追撃等の別成分管理

次の8件は今回のfallback省略とは別の既存方針です。注釈のみ6件と、本体効果＋別成分2件を分けて記録します。全域除外の6件や今回発見の未対応件数へ重複加算しません。武器・発動条件ごとの数値受入を追加したものではありません。

| ID | スキル | Lv | 既存区分 | 火力値とは別管理の成分 |
|---|---|---|---|---|
| 21 | 毒ダメージ強化 | 1 | 注釈のみ | POISON_DURATION |
| 38 | 鎖刃刺撃 | 1,2,3,4,5 | 注釈のみ | NON_ELEMENTAL_EXTRA |
| 71 | 火竜の力 | 1,2 | 注釈のみ | FIXED, FIRE |
| 96 | 白熾の奔流 | 1 | 注釈のみ | EXTRA, FIRE_WHEN_SCORCH |
| 149 | 獄焔蛸の反逆 | 1,2 | 注釈のみ | EXTRA |
| 152 | 属性変換 | 1,2,3 | 本体効果あり・別成分は注釈 | FIXED_FOLLOWUP, DRAGON_FOLLOWUP |
| 162 | 海竜の渦雷 | 1,2 | 本体効果あり・別成分は注釈 | FIXED, THUNDER |
| 182 | 解キ放ツ鏡刃ノ破片 | 1 | 注釈のみ | AREA_EXTRA |

機械可読の全観測は unsupported-effects.json、全179件の母集団は skill-inventory.json。製品・DB・fixture・試験のhashと未実施範囲は catalog-summary.json に保持しています。新たなゲーム係数は採用していません。
