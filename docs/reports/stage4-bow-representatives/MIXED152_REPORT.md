# 152 GL/CB混合総計：限定実装・計算限定受入

承認Sentinel_0a16b323a9488191bc7a88b798b2204b。既存152共通倍率/flat/cap処理は変更せず、152だけに混合技許可判定を分離。165や他referenceは旧判定維持。
採用範囲：既存GL通常/溜め（正規sourceと消費契約必須）、CB_AED榴弾（OBSERVED phialReference/IMPACT state/既存資源計画/IMPACT Formula/追加Hit source一致必須）。既存通常本体を含むGL列も既存資源契約の範囲。CBの他派生/SAED榴弾やFBには広げていない。
成分契約：shellはphysical/attackのみ、専用火は既存Formula値。IMPACT phialはphysical/attackのみ。element効果は本体/追加属性へ1回、除外成分へは渡らない。Formula/数値/イベント/消費処理の変更なし。

## JSDOM公開calcBuild・実装備
装備差替え/珠削除なし。回収正規化MHDBを使用。明示状態・選択技・スキル/装備・sourcehashは各生JSON。
- KOTATU_GL_01 溜め：通常113.262225／最大165.63955875。152最大ON/OFFで全砲撃成分同値、残弾3→2。
- 同GL通常砲撃：通常65.590125／最大94.68864375。152ON/OFF砲撃成分/状態同値、残弾3→2。
- 同GL叩きつけ＋通常砲撃：通常233.640125／最大369.73864375。本体属性だけ増加、物理/砲撃同値、消費状態不変。
- KOTATU_CB_01 盾/斧強化ON・榴弾AED単発（前段ED2明示）：通常501.5092／最大607.3512。152最大OFF最大596.1412。各本体/追加属性のflat差180、属性効果1回、物理/榴弾同値・最終資源状態不変。
- 両代表：同内容同技2保存→読込→共有比較、保存内容/現在条件不変。異装備比較ではない。
- 未指定152状態は固有拒否。GL HIGH FBは成分HIGH_ACTION_NOT_ADOPTED/最大152範囲guard、総計未算出維持。

変更前実行根拠gl99-final.json/cb-final.json。初回CBハーネスの旧BLOCKED期待が成功結果を失敗扱い（mixed152-cb-initial.json exit1）を保持。GL FB負例もexecution完了とmetric算出可を混同したassert失敗を保持（mixed152-gl-harness-failure.json exit1）；製品成分は正しく未算出であり、総計statusを検証するよう訂正。最終2ハーネスexit0、failureなし。

実機/Safari/全回帰/F01注入/CB他派生/他武器reference未実行・未拡張。原典連続コンボ・スタン・時間は確認していない。採用範囲の限定検証で全体Doneではない。独立レビュー待ち、commit/pushなし。

## 独立受入と診断追記
レビュー 01a19264-2e0b-715f-b928-bb99cc1a630f 計算限定受入。旧NO_FIXED_IMPACT_AMMO_SHELLを保持し、attributeConversion.mixedComponentAdoptionへ今回承認/混合scope/excludedEffectComponentsを追加。砲撃専用火/榴弾は効果非適用だが、成分が成立すれば総計へ含まれると明示。既存metrics.scopeや計算条件は変更しない。追加ブロックを除くと旧ソースと完全一致、node構文検査exit0。計算再実行なし、旧実行hashと診断追記後hashをmixed152-acceptance-record.jsonで区別。旧BLOCKED/ハーネス失敗ログ保持。
