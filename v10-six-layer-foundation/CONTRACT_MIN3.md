# V10 min3 — L4構造補強契約

状態：独立構造プロトタイプ。min2を継承し、既存製品・MHDB・Technique DB・14武器Handler・UIには未接続。ゲーム数値と実式は対象外。

## 6層責務
- L1: 技IDの順序付き `evaluation.techniqueIds`、評価条件、時間候補を保持。
- L2: 装備・スキル・基礎値をMHDBに基づき確定。旧calcBuildの補正済み値を再適用しない。
- L3: 効果の条件、適用先、順序を決定する。技中の条件を先取り確定しない。ダメージを計算しない。
- L4: 単一注入窓口 `readTechnique(id,dbVersion)` で技レコードを順序通り取得。ID/版/revision/Hit順/単位/出典を検査。共通実行器が `makeInitialState` から技を順に進め、Handlerの `emissions,nextState` を取得。共通 `formulaRegistry[kind]` が成分別計算を行い、適用効果を記録。Handlerはdamage/total/DPSを出力禁止。
- L5: 計算済み成分の合計、時間、DPSを集計。成分が不明なら合計を保留、時間のみ不明ならダメージを保持。trace/根拠/未算出理由を保持。
- L6: 単独/コンボ/保存比較を同一評価結果から作成。武器別分岐や旧計算フォールバックを追加しない。

## 今回固定するAPI
`resolveTechniques(ids, readTechnique, dbVersion)` — レコードの同版性、技ID、Hit順、成分単位と出典を検証。
`initialState(build, conditions, channel, makeInitialState)` — A/Bと通常/最大の独立開始状態。
`executeChannel({channel,build,effectContext,request,records,handler,formulaRegistry,makeInitialState})` — 技順の状態遷移と成分評価。
`aggregateComponents(result,request)` — L5で合計・時間・DPSを所有。
`createStructuralPipeline(dependencies)` — 6層を通る新入口。

## 構造上の残課題（レビュー時に必ず確認）
1. Technique DB版と装備DB版を独立管理。現在はL2の装備版をL4へ渡す仮設計。
2. 現在の状態遷移は技単位。Hit単位での状態変化は未実装。
3. min2のL5とmin3のaggregateComponentsを単一L5へ統一。
4. 中断時の未評価成分・実行完了範囲・依存関係を明示し、未処理分がゼロとみなされないようにする。
5. CommonJSをブラウザで使用する導入方法と保存JSON互換を明示する。

## 構造受入条件（現状未達）
- 新武器Handler接続時にUI/比較分岐を追加しない。
- 共通スキル変更を各武器Handlerへ複製しない。
- Technique DB更新時にHandler/コンボの数値重複が発生しない。
- 同一条件の単独/保存比較は同一Pipelineを通過。

検証範囲：min2 11件＋min3 9件の独立Nodeテスト。実製品E2Eは未実行。
