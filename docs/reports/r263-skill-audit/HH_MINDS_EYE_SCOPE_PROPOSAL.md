# 心眼136・笛4成分の限定判断案（未採用）

読取りのみ。製品/監査分類/テスト変更なし。index 91156416806bc0d789095e8a68df2e58cf52212ea3cfef46e5f5eed908f5c010、adapter 642a986f49a770a21ba69e1a7650df5d2422047a01a8d55452a5550878c0072e。

|既存DB成分|採用済み算術|心眼の残判断|
|---|---|---|
|HH_PERFORMANCE_SHOCKWAVE|攻撃×27/100＋表示属性×1×属性肉質/1000|物理部分への適否が未確定。属性は既存物理専用心眼の対象外|
|HH_ECHO_BUBBLE_FOLLOWUP|攻撃×5/100＋表示属性×0.3×属性肉質/1000|同上|
|HH_ECHO_BUBBLE_MELODY_EVENT|攻撃×12/100＋表示属性×0.3×属性肉質/1000|同上|
|HH_MELODY_COMPLETION_FIXED_10|固定10×既存イベント数。攻撃/属性/会心を参照しない|既存固定契約上、心眼で数値を変更しない|

係数は既存DBの説明で、新採用ではない。sourceFormulaとindex huntingHornSpecialSourceEstimate、min8/real-technique-one-hit-adapter.cjs:18、browser adapter referenceFormula を照合。

重要な経路差：単体 hunting-horn-sound はSOURCE_ESTIMATE_ONLY_FORMAL_TOTAL_EXCLUDEDを維持。一方、既承認hhNormalMelodyが生成するhunting-horn-model-eventは全発生成分を総計へ入れる採用経路（r262-hh-provisional-total/README.md、r262-stage2-remaining/SA_HH_LOCAL_IMPLEMENTATION.md）。心眼のresolveComponentIssueがここを停止するのは実在する併用境界であり、全て未採用referenceだから不要という整理は誤り。

物理/属性は一つのreferenceイベントで専用式へ渡る。属性だけ対象外としてイベント全体のguardを解除すると未確定物理まで通るため、今回は行わない。固定10だけ解除しても採用演奏列の音波物理は未解決のまま。4成分の責務をまとめて判断する。

最小採用提案：既承認hhNormalMelodyの上記4成分について心眼による補正なし（最初の3成分の物理非適用のみ新たな暫定判断）。通常本体物理は既存心眼と傷前肉質判定を継続。属性/固定10/発生数/旋律状態/通常最大/専用丸めは変更しない。適用対象の単体referenceを総計へ昇格させない。未知成分は停止。OWNER_APPROVED_PROVISIONAL、実機未確認を明記して承認後に実装する案。

根拠と限界：https://kuroyonhon.com/mhwilds/memo/8.php と https://macarongamemo.com/entry/mhwilds-damage_calculation の既存音波/固定式は上記算術を支持。後者2025-04-30、前者数値版未確定。心眼そのものの音波物理非適用を直接実測した記述は限定調査で確認できず、肉質非依存/非会心のみから確定していない。物理非適用は承認を要する候補。一般心眼の閾値/段階資料 https://macarongamemo.com/entry/mhwilds-skill-minds_eye （2025-05-04）は音波適否の証明ではない。

承認後の最小検証候補：既採用演奏→重ね掛けと響玉ありの1列、心眼なし/あり・傷前肉質44で本体物理だけ変化、3音波物理/属性/固定10不変、共有保存比較。現時点で実行していない。81完全/1部分136/対象外3維持。commit/pushなし。
