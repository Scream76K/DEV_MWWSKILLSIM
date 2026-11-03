# 大剣巨戟アーティア属性・既存根拠照合

製品未変更、外部取得/新ゲーム計測なし。対象はKOTATU_GS_01、忘却のオストランツァID1148、攻撃激化、龍・同属性3個、攻撃生産3個。復元aff:EX/atk:III/sharp:EX/atk:EX/aff:IIIで属性復元は0。生産ボーナス種と素材の属性一致数は別概念。

## 確定できた事項

- 回収済MHDB正規化キャッシュの1148/1150/1149は攻撃/属性/会心の完成variantだが、3件ともelementKnown=false・specials空。武器名やMHDB_FIXED_COMPLETEだけから完成属性を確定できない。
- docs/reports/kan-19-artia-source/SOURCE_DB_AUDIT.jsonとREPORT.mdは、レア8大剣の基礎表示属性450、攻撃激化属性増減0、threePartBonus=null。REPORTは素材3個の空欄を0や30へ置換しないことを明示。取得2026-10-11、対象ゲーム版不明。
- docs/reports/r254-approved-artia/REPORT.mdとr253-base-artia-source/STAGE_RECONCILIATION.mdの承認Sentinel_b67c836659e4819188a37beddccd300aは段階分離の限定採用。通常大剣の+30はnormalElementRowsとbaseArtiaStatsに存在する。
- r254-artia-rare8/REPORT.mdの大剣ID305属性480の実行証拠は通常rare8。index:1722–1736のbaseArtiaStatsはisBaseArtia専用で、既存normalElementRowsの+30を使用。巨戟1148のartiaSourceElementは別で、nullを保留する。通常305の成功から巨戟1148の+30承認へ転用できない。
- GREATSWORD_TEMPLATE_REGRESSION_FIXTURE.jsonと現テンプレは装備・復元/会心の整合用。完成龍属性の実測値を含まない。旧補助artiaElementPartBonusの30も新たな根拠ではない。

## 残る一点・候補

巨戟大剣の同属性3素材加算Xが不足。現在の構成のスキル前表示龍属性は450+X+攻撃激化0+属性復元0。X=30なら480だが、これは候補の算術であり採用値ではない。X=0を仮定した450も未採用。取得済資料だけではXまたは完成値を確定できない。

次に必要なのは巨戟大剣にも適用すると明記された同属性3素材加算の原典/承認、または同構成の加工屋等のスキル前完成龍属性記録。ユーザーへ直ちに再製作/撮影を依頼する必要はない。外部資料の狭い追加確認、または根拠と限界を示した限定採用判断が先。通常/巨戟や武器種の推測転用はしない。

## ハーネス是正（製品と分離）

tools/stage4-real-gs-proof.cjsを同一KOTATU_GS_01装備のA/B名2保存へ変更。異武器比較をやめた。同じ装備の保存往復確認であり、異なる実ビルド2件の性能比較と称さない。比較結果nullは明示的なハーネス停止理由で扱う。属性未解決ならBLOCKEDかつexit2で、保存assertが成立しても火力PASSにはしない。

node --checkはexit0。根拠未解決なので製品公開経路は今回再実行せず、変更後ハーネスの保存/比較結果は未実証。旧gs-public-attempt1.json/gs-public-blocked.jsonのexit1を保持。commit/push/統合なし。
