# CB本体 心眼切断種別受渡し修正

固定7c6a37c基点、himmel/stage3-mindseye-cb-followup。既存差分保持。
index Technique DBのCB_SWORD_TO_AXE_MORPH/ED1/ED2/AED/FOLLOWUP_AED本体6HitにdamageType:slashを明記。従来adapter physicalKeysのCB切断契約と既採用心眼の切断条件をDB本体へ渡す修正で、新しい係数/対象技/倍率ではない。数値・Hit数は変更なし。
心眼の既存hit.damageType優先解決へ供給するため、斧強化追加Hitの許可状態に依存せず本体種別が決まる。adapter自体は前ターンからbyte不変、追加Hit側の単発/斧強化/DB配列照合、未知技・未知肉質停止を維持。

## 実行範囲
公開JSDOM calcBuild、CB103合成契約入力、代表CB_AED前段ED2・盾強化・斧強化OFF、攻撃5/挑戦者1/心眼3。修正前はORIGINAL_HITZONE_UNRESOLVEDを再現。修正後44陽性/45不変/傷前不明停止。斧強化OFFでは追加Hitが一切生成されず、本体と属性・ビンのみ。属性ビン/消費OFF-ON一致、通常最大独立。ONへ切り替えた1対照で追加物理4Hitが成立。
保存OFF/ON2件の共有条件比較一致、現在snapshot/storage不変。ガード前段＋盾強化の既存拒否も保持。before/afterともassert成功exit0。
他4技の斧強化OFFは正規DB本体→共通hit.damageType→心眼効果生成経路を静的確認のみ。Lv1/2・Safari・実機・F01注入・全回帰未実行。

## 残境界
既採用componentSource追加Hitは5技とも限定接続済み。その本体種別が斧強化OFFで失われる今回の既知断絶も解消。現在の調査範囲では136の既知採用範囲に新たな具体的断絶は見つかっていない。ただしこれは全体回帰/任意入力を検証した主張ではなく、独立レビュー前の分類81/82は維持する。反復列・未採用技拡張、暫定適用の実機未確認は別の制約として保持。対象外8/85/103再有効化なし。
commit/push/統合なし。正確な個別差分・累積差分・生ログ/hashは同フォルダ。
