# 心眼136：既採用SA覚醒追撃物理の限定接続（レビュー待ち）

2026-10-30ユーザー承認。既採用3技 SA_SWORD_VERTICAL / SA_SWORD_MORPH_DOUBLE / SA_AXE_MORPH_SLASH から既存DBイベントが生成する SA_AMPED_FOLLOWUP の物理のみ。傷前切断肉質44以下、既存心眼Lv倍率をattack乗算段で一回、flatは後。実ダメージは現在肉質。属性・会心・Hit数・ビン補正を変更しない。笛特殊4成分は保留のまま。直接実機根拠なし、OWNER_APPROVED_PROVISIONAL。

indexに対象採用メタデータのみ追加、係数はMHContextAttackSkillRules.mindsEye唯一源。adapterは既存modeContractと本体Hit配列から既存イベントと同じ追撃component IDを対応し物理効果を生成。解決済み当該追撃の物理/属性についてのみ特殊guardを通す。属性へ心眼効果は生成しない。新技/数値/時間/消費モデルなし。

公開JSDOM calcBuild、合成ホープSA914（基礎90、火100・強属性ビンに差替え）・攻撃5/挑戦者1/心眼3、剣縦1回・覚醒済み。実装備合法性/実機/Safariは検証していない。

修正前は追撃でCONTEXT_ATTACK_COMPONENT_SCOPE_PENDING。初回afterは訓練場固定データがfixtureを上書きし傷前不明assert失敗(exit1)。製品ではなくfixtureを既存trainingRoomMonster差替え方式へ修正。初回stderr保持。修正前adapterを読み込んだ公開反例再現(exit0)と最終ソースafter(exit0)。前者は現在indexの採用メタデータ＋保存した旧adapterであり、旧製品全体再実行ではない。

44の本体物理 通常15.64→19.92、最大16.37→20.69。追撃物理 通常5.69→7.24、最大5.95→7.52。各属性4.35不変。追撃通常期待 round((90*1.04*1.3+9)*.12*1.05*.44,2)=7.24、最大flat13/会心期待補正1.0075で7.52。flat込み全体1.3ではない。45はありなし一致。傷前44/現在60は追撃9.88/10.26、傷前不明はORIGINAL_HITZONE_UNRESOLVED。保存off/on2件は共有条件で現在結果と一致、現在snapshot/storage不変。

実行代表はSA_SWORD_VERTICALのみ。他2技の剣Hit対応は既存modeContractに沿う静的接続。Lv1/2、他ビン、笛guardの新規実行、F01注入、全回帰は未実行。既存SAED等の再実行なし。136部分維持、81完全/1部分/対象外3。commit/pushなし。
