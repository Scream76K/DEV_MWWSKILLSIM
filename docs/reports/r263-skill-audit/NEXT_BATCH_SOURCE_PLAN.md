# Checkpoint固定待ち・次バッチ静的計画
製品はpass13-manifest.jsonと完全同一。文書のみ更新、commit/pushなし。

## ダークアーツ172
既存STANDARD_DARK_ARTS_BODY_SOURCE(index.html:7049)：GS/HAM/HH1.2、他1.14。standardGroupPowerPlanは2部位rank1・赤ゲージ条件で生成、supportedKindsはGS/LS/SNS/DB/HAM/LAN/SAのみ。係数定義と対象guardを区別。
原典 https://kuroyonhon.com/mhwilds/program/skill.php は属性強化の乗算段階と同じ場所を明記。新係数不要で既存maximumElementComponentsへ倍率として合流しflat不変→capへ進める候補。フルチャージの体力満タンと赤ゲージは同時成立しないため、両方を最大へ足すのではなく既存HEALTH排他計画に統合する。どちらを採るかは単純な攻撃flatの大小で決めず同一入力で実式評価が必要。判定ルールの採用が必要ならそこで提示。
GS衝撃波は別成分（既存MV30/龍600）。本体武器Bのcapを流用しない。固定ダメージ系注釈と混同しない。新ブラックナイト技は今回の対象拡張。
最小検証候補：五属性倍率＋flatとダークアーツの併用1件、フルチャージ排他1件。実行はcheckpoint固定後。

## 系列flat群
62凍峰竜の反逆/束縛反攻：MHDB2/4部位・拘束解除等の条件。資料 https://game8.jp/mhwilds/673702 に比較画像付き+25/+50。既存repo数値採用記録は今回検索で未発見。候補値は特定できたが採用済みとは称さない。採用確認後、STANDARD_SERIES_ACTIVATION_FLATS→standardGroupPowerPlan→attackComponentsに移す最小候補。
107雪獅子の闘志/ウォークライ：MHDB自己周囲の攻撃上昇、2/4部位。自己/他ハンター/オトモの係数差がある。今回参照したkuro skill表では名前検索に一致なし。具体値の裏付け未取得のため数値案を作らない。
167千刃竜の闘志/千刃の身躱し：rank1時間延長（固定条件HPへ新flatなし）、rank2再条件成立の攻撃増。MHDBの発動記述は確定、加算値と巧撃との合成値/差分の採用記録は未発見。今回kuro表一致なし。先にrank1の指標非算入とrank2未解決を分離できる。

## 新たに見つかった資料差（製品変更なし）
同じkuro skill表は蛮勇の食卓IIを+25と記載。現在の既存採用STANDARD_SERIES_ACTIVATION_FLATSは+30。今回無断変更なし。従来の+30根拠と版の比較が必要。資料自身にも旧版説明の不整合があり、検索値だけで訂正しない。

## 次の順番
1 SA/Bow capおよび混在WEXの最小境界を閉じる。
2 ダークアーツ属性内訳合流（HEALTH排他を明確化）。
3 ビン追加5/44/65/79/116の非選択時能力許可（係数不要）、167rank1の時間効果分類。
4 62は+25/+50の採用可否を判断。107/167IIは自己作用値と追加分を原典で取得。
期間限定祭事、未採用射撃技、ブラックナイトの任意技は別範囲。全179行の調査は継続、完全完了とはしない。
