# 蒼雷162と変換の限定接続

既存groupPlanの162にも検証済みID/rank/親名/発動情報を保持。変換入口で正規名・rank1/2・2/4部位・一意計画・bodyEffect:true・注釈policy/除外成分を検査。resolverへ渡るskillTotalの正規効果名/Lv1との一致を要求し、別名/別rankの同時混入は許可しない。会心+15の定義と供給は既存calcMaxAffinity→最大会心差分effectのみ。追加倍率・会心再加算なし。

公開calcBuildの合成GS+雷変換+蒼雷Ⅱで修正前拒否、修正後成立。通常全成分/metrics不変、最大conditional-affinity-maximum一件15%、変換属性550と本体成分数不変。追加ダメージは注釈unavailable/includedInPower:false。保存比較・通常読込・復元一致、不正rank3は有効技からgroup未解決と変換guardに到達し拒否。

rankI/変換152は静的確認のみ。実機未検証。生出力・exit・hashはconversion-sourai-execution.json。今回終了時点で製品を固定、40/85分類は据え置き。Git操作なし。
