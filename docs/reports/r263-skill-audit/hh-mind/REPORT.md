# 心眼136：採用済み笛演奏モデル4特殊成分の対象外接続（レビュー待ち）

2026-10-30ユーザー承認。MHHornMindsEyeExclusionは既存演奏モデル内のHH_PERFORMANCE_SHOCKWAVE / HH_ECHO_BUBBLE_FOLLOWUP / HH_ECHO_BUBBLE_MELODY_EVENT / HH_MELODY_COMPLETION_FIXED_10のみ。音波物理非適用はOWNER_APPROVED_PROVISIONAL/実機未確認。属性/固定の非適用は既存契約。係数・イベント数・旋律遷移・時間・丸めに変更なし。

公開反例は当初想定した特殊guardより先にORIGINAL_HITZONE_UNRESOLVED。本体レコードにはdamageTypeがなく、既存hhModelがイベント化時に付けるbodyDamageTypeを心眼入口が参照していなかった。既存bodyDamageTypeへfallbackを接続し、現在肉質ではなく傷前肉質で判定。特殊guardはモデルID、referenceKind、4成分ID、正の整数count、SOURCE_CONFIRMEDと検証済みモデルのDBレコード内容一致を条件に限定解除。単体hunting-horn-soundと未知成分は対象外。心眼効果は本体component ID限定のまま、共通attackへ事前混入させない。

最小公開JSDOM calcBuild：合成HH531/火100、攻撃5/挑戦者1/心眼3、自己強化旋律2・響玉1、演奏→ジャスト重ね掛け→左ぶん回し。元打撃44/現在60。通常総計268.1608→301.5308、最大277.4908→311.1108。本体4物理だけ増加（通常22.62→28.81、15.29→19.53、57.32→73.25、25.22→32.23）。全特殊referenceのdetails/effectsApplied一致をassertし、攻撃入力・物理・属性・固定10の不変を確認。属性本体も不変。45は心眼有無のmetrics一致。傷前不明は固有guard停止。保存off/on2件比較と現在snapshot/localStorage不変を確認。実装備合法性/実機/Safariの証明ではない。

履歴：初回beforeは特殊guardを期待して失敗(exit1)、実際の本体肉質参照欠落を特定し期待する既存不具合を訂正、before exit0。初回afterは参照同一性がPipeline複製で成立せずexit1。DBレコード内容の完全一致へ修正しfinal after exit0。失敗stderrを保持。final以外のソースhashは現在製品の合格証拠ではない。

未実行：Lv1/2、別旋律/他列、単体reference/未知成分の動的負例、F01注入、SA/SAED回帰、実機、Safari、全体βテスト。単体総計未採用guardと未知guardはソースで維持。既存SA/SAED・対象外8/85/103は変更なし。

笛限定修正は独立レビュー受入可。レビューで既採用CB変形/ED/AEDの斧強化追加Hitに別残件を確認：adapterのcomponentSource付き追加Hitが心眼効果生成をskipし、resolveComponentIssueでCONTEXT_ATTACK_COMPONENT_SCOPE_PENDINGとなる。適否根拠未確認、今回の退行ではない。未採用拡張扱いで除外せず136部分・81完全/1部分/対象外3維持。以前の「全残件閉鎖候補」は列挙不足として訂正。commit/pushなし。
