# GL/CB 後続guard：読取整理（製品固定）

## 既採用の非適用受渡し漏れ
渾身99（同型：弱点特効57、力の解放142）はadapter:84–88のconditionalAffinity。754の共通resolverは正規ID/Lvを検証し、会心計画へ解決する。一方188のshellingInput.unreviewedSkillsはaffinity/criticalBoostは許容するがconditionalAffinityを含めず、解決済み渾身を未審査として残す。755→gunlance-shell-reference.js:31で拒否される。
既存shell成分はreal-technique-one-hit-adapter.cjs:37でphysical/attackだけ。gunlance-shell-reference.js:59はaffinity/maxAffinity=0を明示し、Formula入力に会心効果を渡さない。したがって正規の純会心効果の装備同居を止めることは、既存非会心砲撃契約との不整合であり、新たな倍率採用ではない。
最小案：CONDITIONAL_AFFINITY_SKILLSの正規ID/名前/Lvと共通resolver成立を検証した純会心効果だけshell未審査一覧から除外。砲撃を会心化しない。本体の会心計画は維持。未解決/未知/不正Lvを包括許可しない。57は肉質依存の本体判定が別に必要なため、同型候補ではあるが単に3名称を無条件追加しない。39濡れ刃紋等explicitAffinityは明示Hit入力が別契約のため今回一括許可候補に含めない。攻撃も持つ挑戦者/黒蝕/系列を純会心と混同しない。

## 152：適用対象と停止の粒度
adapter:523–533 conversionComponentsSupported は全選択技everyで判定。shellingActionでfalse、CB phial付き技はPOWER_ELEMENTのみ許可。721はONchannelでその結果をthrowするため、専用成分への加算流入を止める代わりに、本体の既採用属性成分も含むchannel全体が停止する。OFFchannelは既承認の独立契約により通過（他guard別）。武器種一律というより選択技内に除外成分がある場合のchannel一括停止。
- GL武器属性本体：龍152の既採用通常本体契約。砲撃専用火：source表示火+砲術/焼き砲だけで、武器龍属性を使わない（shell-reference:59）。152を火へ転用しない。
- CB本体/斧強化追加属性：既採用武器属性範囲。強属性ビン：計算済み属性の既承認対象。榴弾：CJS98–99 physical/attackのみ、adapter756 IMPACT_PHIALはbaseAttack/mult/flat、displayedElementを読まない。
つまり物理/専用火/榴弾への非適用は式から明確。しかし『対象と除外成分を含む技をONで継続』は、CONVERSION_152_165_SCOPE_DECISION.mdの除外範囲と承認Sentinel_620e279cceec81918778e2036f65971f（固定/榴弾/専用弾/砲撃には広げない）から、停止を維持する意味か非適用で継続する意味か明示されていない。現実装は前者。既承認配線漏れと断言せず、混合技の完成総計契約として確認する最小論点。
提案：正規152 ONは採用済龍本体/追加武器属性だけに共通flat/capを一度適用、同技内の砲撃専用火・榴弾は変化0で継続。純砲撃は152効果0で継続。未知状態/未採用技/不明成分は従来停止。新係数・専用属性付与なし。152/165を同時に包括解禁しない（165は独立条件契約）。

## 実行と今回の範囲
今回は静的のみ、追加テストなし。既存gl-shell-final.jsonが渾身/152停止、cb-final.jsonが152 ON停止/OFF成立の実行根拠。GL承認2点（480/型導出）成立と代表火力未成立を区別する。製品変更なし、レビュー待ちhash保持、commit/pushなし。
