# ID152 共通属性上限への接続

既存部分39行を一度確認し、適用側の局所断絶としてattributeConversionの旧候補>=B+350拒否を特定。MHAttributeConversionRuleの龍本体+80/120/180とMHWElementCapRuleの承認済み1.04+上限を再利用。入口は承認済みcap定義の存在/有限値を確認し、上限処理自体は既存engine.applyEffectsへ任せる。整数値、龍本体、特殊成分除外、CM/条件属性/系列併用の既存制限は維持。新係数なし。

公開calcBuildの契約LS入力（既存900レコードの属性display1000/raw100を明示変更。実装備の検証ではない）。龍強化3、属性変換3、基準OFF/最大ON。修正前はATTRIBUTE_CONVERSION_CAP_INTERACTION_UNRESOLVED。修正後: 基準属性1260、最大1440（cap2300）、本体総計106.03/111.43。物理45.95+22.28不変、属性各18.90→21.60。保存snapshot通常読込→calcBuildでも両channel一致。A/B比較は今回未再実行、保存/比較コード変更なし。上限到達時自体は既存共通cap証拠を再利用し、今回の新境界は旧入口拒否だけ。

通常弾差分レビュー: normal-ammo-exclusion.patchは直前バッチの正確なdiff。MHDB保存原典23=速射、69=特殊弾/列挙矢、94=貫通弾/列挙矢。非適用は明示NORMAL射撃を判定し、装備ammo.rapid能力フラグを射撃モードと同一視しない。未知技IDは正規表現集合外、未知ID/名前/整数範囲外Lvはこの枝を通らない。未加工不正Lvはadapterで拒否、UIはMHDB上限へ丸める。速射/特殊/貫通の効果自体を実装したとの主張はしない。

全体38/85、部分39/欠落8は据置。ID152は他の併用条件と特殊経路の制限が残るため昇格しない。ID165には同類の旧B+350制限が残るが今回は変更しない。次候補: ID165の共通cap接続、ID8/103のCB SAED本体Hit対応（爆発除外の確定が必要）、ID13/95/133の竜撃弾専用属性基礎/flat/cap順（既存WYVERN_ORDER資料の判断待ち）。

Git/Safari/元Stage3不変。adapter現在diffはattribute-conversion-cap-current.patch、実行証拠before/after JSON、ハーネスtools/attribute-conversion-cap-connection-proof.cjs。
