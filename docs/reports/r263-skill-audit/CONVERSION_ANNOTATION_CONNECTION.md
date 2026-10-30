# 注釈専用71/149と変換の限定接続

既存groupPlanで検証済みの71/149だけにID/rank/親名/発動情報を保持。変換入口はpolicy bodyEffect:false、正規名、rank1/2と2/4部位、Ⅰの上位部位排除、一意の計画との情報一致、攻撃flat0/mult1、除外成分とconditionを照合。全系列許可ではない。162の自己会心・152の本体属性は対象外。ScorchReferenceが成立しないgroupPlanは従来どおり未解決。

公開calcBuildで合成GS・灼熱化Ⅱ+雷変換の修正前拒否と修正後成立を確認。灼熱化OFF/ONで通常最大の本体全成分とmetricsが一致、注釈additionalDamage.includedInPower=false。保存2ビルドの比較・通常読込・比較後状態一致。不正rank3は有効技から未解決計画/変換guardへ到達し拒否。

注釈値計算失敗時は既存catchで注釈unavailableのみ。本体への加算はなし。149は静的確認のみ。証拠と最終hashはconversion-annotation-execution.json。新係数・回数・状態入力なし、実機未検証、分類昇格なし。
