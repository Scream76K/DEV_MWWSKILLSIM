# Pass10 共通属性入力（ローカル、部分成果）
基点 6c71e818919379b0b0649d2389237470cbe3802f。commit/pushなし。

## 確定欠陥と接続
standardPowerConditionPlanは武器属性なしのボウガンで災禍転福13と属性吸収133を効果なしにしていた。ammoElementConditionを別に保持し、基準はM=1/F=0、最大は既存の解除後30秒倍率・3回被弾成立時加算を使う。referenceFormulaはMHWElementSkillResolverの五属性強化と合成し、BowgunElementReference.firstHit/contactSequenceへ一度供給。武器属性値自体を変更しない。
連撃95は既存STANDARD_BURST_SOURCEのボウガン属性加算0を維持、攻撃加算のみ。属性吸収は既存表、災禍は既存武器群倍率を再使用し数値正本を増やしていない。

## 最小実行
HBG467、雷弾Lv1、雷強化Lv2、同一肉質。合成スキル条件の契約試験であり合法装備網羅ではない。
修正前は災禍/吸収とも通常最大で同値を正常返却。
修正後：通常P10.3424・攻撃依存E10.56・flatE1.5。
災禍Lv3最大P不変・攻撃依存E13.728・flatE1.5。
吸収Lv3最大P不変・攻撃依存E10.56・flatE3.6。
連撃Lv1最大P10.73024・攻撃依存E10.956・flatE1.5、修正前と一致。
HBG公開経路3ケースのみ。LBGは同一consumer静的追跡、今回実行なし。後続命中も既存contactSequenceが同式へ渡す静的確認のみ。

## 未完と具体的採用候補
https://kuroyonhon.com/mhwilds/memo/31.php はver1.04以降の武器属性上限をmax(B+400,2.3B)、以前をmax(B+350,1.9B)と記載。属性弾は+400を使わず、攻撃依存の元属性×2.3が上限。現コードに共通capなし。今回cap係数の新採用はしていない。result detailsにVERSION_POLICY_PENDINGを保持。今回の実行値は資料上の上限未到達のみで、上限境界実行は未実施。
採用質問案：ver1.04以降の上限を正本へ採用してよいか。武器はmax(B+400,2.3B)、属性弾は(弾基礎表示属性/10×完成攻撃/100×既存LBG補正)×2.3、加算後・肉質/会心前に制限する。CMも上限対象、SA強属性ビン/覚醒追撃はその補正を含む基礎から上限を作る。版差を保持し現行版実測済みとはしない。
武器側の災禍+五属性強化/連撃/吸収はCOALESCENCE_ELEMENT_STACKING_ORDER_PENDINGが残る。最大element差をconditionalFlatへ送る現接続は倍率分までflat扱いになり得るため、特に弓CMでは基礎/倍率/加算の分離を先に閉じる必要。guard単純削除はしていない。属性弾の源泉は https://kuroyonhon.com/mhwilds/memo/25.php （災禍を乗算へ明記、加算は攻撃倍率外）。
五属性強化ID50/91/127/121/41、連撃95、災禍13、吸収133は全体分類を部分接続のまま維持。数値が出たことをcap含む完全接続にしない。

## 次順序
1 上限版の採用判断と武器側elementComponents倍率/flatの保持。
2 条件会心57/99/142/39の条件・排他・下流。
3 射撃23/69/94とビン許可5/44/65/79/116。
CI/Safari/実機/全14実行なし。元Stage3と保存ビルドへ変更なし。
