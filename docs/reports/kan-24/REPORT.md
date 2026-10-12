# KAN-24 LBG非速射通常弾・限定P0成立条件

2026-10-11。作業場所 /Users/scream/Projects/DEV_MWWSKILLSIM-r250、branch codex/integrate-r249、HEAD fb6d82cd525da9273af10ac6b719f330208608c5。
既存未コミット成果を保持。今回製品コード/DB/テスト編集なし。Git更新/Jira操作/公開なし。新規数値採用を伴う範囲は判断待ち。

## DB・出典照合

既存LBG_NORMAL_AMMO_1/2/3はmvPerHit17/23.8/32.3、hitCount3。出典MACARONGAMEMO_LBG_R49_SOURCE、sourceUpdatedAt2025-06-29、baselineGameVersion1.042.00.02、numericStatusSOURCE_CONFIRMED、verificationStatusUNVERIFIED、calculationStatusEVIDENCE_GATED、weaponApplicabilityUNVERIFIED。
まかろんの一次資料は17×3/23.8×3/32.3×3と記載。3Hitは一射の3接触を合計する構成であり、合計MVを3等分する意味ではない。各Hitが同じMVを持つ。全3命中が成立する参考条件を明示し、速射やチェイスショットを混ぜない。
https://macarongamemo.com/entry/mhwilds-bowgun-bullets

独立資料のLBG表ではLv1は17×0.8を3回、Lv2は23.8×0.8を3回、Lv3は30.6×0.8を3回。Lv3はDB32.3とのSOURCE_CONFLICT候補。今回最新対象ゲーム版までの変更時点を確定できていないため、30.6で上書きしない。
https://kuroyonhon.com/mhwilds/memo/14.php

## 既存値の再発見と訂正

BOWGUN_AMMO_NUMERIC.lbg.normalPhysical=0.8 がr38の既存コードに存在した。前回の報告はこの既存係数を見落としていた。LBG物理補正自体は未知ではない。出典でも通常弾LBG専用補正0.8を確認。
ただしこの係数はTechnique DB外の旧レジストリ。新しい計算へ直接別正本として接続せず、既存値と出典を維持してTechnique DB参照に統一する設計が必要。新規数値ではなく既存値の移管候補。

## 距離・モード・スキル

まかろん表は通常弾の近距離LBG1/HBG0.5、適正距離共通1、遠距離共通0.1。近距離LBG1は現HBGルール表にはないためHBG表流用不可。
通常/竜熱モード特化1.1/1.2はHBG対象。LBG非速射で無条件適用しない。速射0.7、チェイス1.9、騎乗0.4等は本件対象外。
通常弾強化Lv1の既存HBG補正1.05、ファースト/フォースショットの射順補正は既存Handlerにあるが、LBGへの対象適用と部位/弱点条件まで確認済みと扱わない。初回限定範囲では未照合スキルがあれば理由付き保留とする案。
上記は出典の確認結果であり今回DBへの新規採用なし。まかろん記事の変更履歴Ver1.011.00でMV更新を確認できるが、現在版1.042.00.02への全係数維持を実機VERIFIEDにしない。独立資料のLv3変更版は未特定。

## MHDB武器への適用

武器取得は/weapons→DB.weapons、kind/API_WEAPON_KINDでLBGを識別。P0の既存HBG追加参考比較はammoCapacityVerified:falseで、武器固有の装填可否を検証していない。LBGにも全武器全Lv対応と推測しない。
今回ローカルでLBG個別武器の実MHDB装填可否を証明する保存データは確認できていない。API取得コード・kindだけから弾Lv可否を確定しない。初回は装填可能であることを明示確認した武器条件、または武器適用未検証の共通参考条件として範囲を区別する必要がある。

## 共通化案と判断事項

共通部分：真攻撃×MV/100×弾肉質/100×距離×会心期待値×適用可能な弾強化。武器属性/斬れ味を弾に加算しない。既存bowgun-normal-reference.jsのshotを武器別DBレコード参照に分離すれば計算式重複不要。
LBG固有部分：物理0.8、LBG距離表、非速射/非チェイス/非騎乗の明示条件、武器への弾適用。HBG特化補正は流用しない。

新規数値の採用候補はLBG近距離1（必要なら遠距離0.1もLBG対象として根拠記録）。出典は上記まかろん記事、資料更新2025-06-29、現在対象版1.042.00.02での実測未検証。暫定採用後は非速射・通常弾Lv1/2の3Hitを距離別に算出可能。Lv3は32.3維持か30.6採用か別判断が必要。
先行案は既存値だけのLv1/2・適正距離限定・未照合弾スキルなし・全3命中を対象とし、0.8をDBへ移管して3経路を接続する。Lv3/近遠距離/速射/チェイスは保留。装填可否の確認方法を別途明示する。
今回はまず成立条件を報告し、上記限定範囲と新規距離値・Lv3差の判断前に製品実装を行わなかった。未算出を0や部分合計で置換していない。

## 検証・変更

既存r49拡張、ranged P0 DOM、GL P0 DOMを再実行。結果はevidence/scope-tests.log参照。全スイート再実行ではない。前工程の1310件合格を今回の実行数に計上しない。テスト削除/skip/期待値変更なし。git diff --check合格。
今回追加は本報告書と検証ログのみ。既存11/14進捗は据え置き、LBG接続済みへ加算しない。CBのSAED以外、GL特殊成分、KAN13/19/21は変更なし。

ゼーリエへの依頼：Lv1/2適正距離の限定接続を先行する範囲、装填可否を明示する条件、LBG距離係数の暫定採用、Lv3の出典差の扱いを判断してください。新規値はSOURCE_CONFIRMED/PROVISIONALLY_ADOPTEDとしVERIFIEDへ昇格しない。
