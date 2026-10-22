# V10 6層共通評価基盤 — min2 契約（DB接続前）

状態: **独立骨格実装・製品未統合**。MHDB/Technique DB/UIへの実データ接続なし。ゲーム計算式の追加は対象外。

| 層 | 責務 | 入力 | 出力 | 禁止 |
|---|---|---|---|---|
| L1 Input Adapter | 入力を標準形式へ | build,target,conditions,evaluation | EvaluationRequest | DOMを計算側へ渡す・暗黙補完 |
| L2 Build Resolver | MHDB装備スキル確定 | request, MHDB adapter | ResolvedBuild | 補正済み数値の二重適用 |
| L3 Effect Resolver | 効果ID・適用先・順序・条件解決 | build,conditions,channel | EffectResolution | ダメージ・補正後statsを算出 |
| L4 Weapon Engine | 14武器Router・共通Hit・Handler | build,effects,target,technique | WeaponResult | 共通効果表の複製 |
| L5 Result Aggregator | 指標単位で有効性と理由を集約 | per-channel WeaponResult | EvaluationResult | ダメージを再計算 |
| L6 Presentation Adapter | 単独/コンボ/比較表示 | EvaluationResult A/B | ViewModel | DOM・共有状態変更による比較 |

## ID・単位・来歴
- 武器種は既存DBのハイフン形式（例 `charge-blade`）。DBのkindを推測/変更しない。
- L1 target: `id,hitZoneKey`。evaluation: `mode,kind,signature` と任意の `techniqueRevision`。上流Adapterで実際の技構成に基づく署名を生成する（現状は形式検査のみ）。
- L2: `weaponType,dbVersion,source,equipment.ids[],equipment.trueAttack,equipment.displayElement,equipment.baseAffinity,skills.entries[]`。skills entriesは `id,level,rank,source`。真攻撃と表示属性の単位を混同しない。
- L3 effect: `id,target,stage,order,operation,amount,condition,source`。operationはadd/multiply/cap。L3は**適用すべき効果だけ**を返す。L4内の共通計算が1度だけ適用する。実適用は未接続。
- L4 technique ID/revision、Hit順、技数値の単位、適用済み効果は実DB接続時に必須component契約として追加。現在components空配列を許容。
- extensionsは武器固有状態専用。DB版・単位・根拠は共通契約で保持。
- Datumはknown(value)、inactive、unknown、not_applicableを区別。数値knownは有限数値のみ、暗黙のNumber変換禁止。

## 失敗隔離
- L1/L2の共通入力・DB基礎解決失敗はevaluate全体で例外にできる。
- L3/L4は**通常・最大別々に**例外を捕捉。失敗側のみBLOCKED+理由。通常成功は保持。
- L5指標ごとにavailable(value)/unavailable(reason)。不正値はその指標のみINVALID_METRIC。BLOCKED/NOT_IMPLEMENTEDは紛れ込んだ数値も採用しない。PARTIALの有効ダメージは保持可能。
- 例外を架空の数値に置換しない。issuesへ原因を保存。

## 比較契約
- 比較キー：weaponType,targetId,hitZoneKey,evaluationKind,evaluationSignature,dbVersion,techniqueRevision。装備・スキル差は比較対象でありキーに入れない。
- 絶対数値は通常/最大ごとに保持。相対値は別フィールド。
- **共通分母A通常**：A通常100、B通常=100×B通常/A通常、A最大=100×A最大/A通常、B最大=100×B最大/A通常。
- 各指標で基準と対象のavailableを確認し、基準0・条件不一致・未算出は理由付きunavailable。

## 製品移行に先立つ保留
1. 旧calcBuildのスキル適用済みstatsから基礎値だけを取り出し、二重補正を防ぐAdapterが必要。
2. 保存JSON互換変換はL1だけ。不明値はunknownと理由にする。
3. CommonJS core.cjsのブラウザ導入は明示したビルド工程または共有ソース化。ブラウザからrequireを直呼びしない。
4. DB版、Technique revision、比較署名、L4 componentの単位/出典/適用履歴は実DB接続で検証。
5. 旧経路は新3入口接続前に削除しない。旧計算への自動フォールバックは禁止。

## 検証範囲
min2独立テスト11件（Node）。実画面/DB/14武器/保存比較E2Eは未実施。
