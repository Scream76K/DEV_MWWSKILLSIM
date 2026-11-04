# チャアク強属性ビンH — 製品アダプター限定候補と全20武器調査（2026-11-04）

## 作業対象と採用境界
- 分岐元: `flamme/cb-bladescale-first-hit-candidate-20261104`、固定 `b4ece1bef87da2dc27c92245c5d63b409603e956`。
- 作業ブランチ: `flamme/cb-power-h-product-candidate-20261104`。**OWNER_REVIEW_PENDING / CANDIDATE_NOT_ADOPTED**。main/UI公開版には未統合。
- 正式Hの榴弾限定 `CB_H_IMPACT_ONLY` の判定を、**候補上のみ**「公式MHDBと明示入力のビン種が双方IMPACT、または双方POWER_ELEMENT」で通す条件へ変更。未知ビン種・不一致・H前段と状態条件、ED資源契約、通常/最大別評価は従来通り拒否・維持。
- 既存 `ChargeBladeEngine` の強属性ビン/高出力/追撃・盾強化・属性肉質の式、共通R/H独立Pipelineを再利用。新しい係数・Hit/MV・ビン消費ルールは捏造しない。
- **重要な未承認項目:** Hで使う強属性盾突きのビン爆発1Hit・ビン消費0は既存の榴弾H暫定を用いた候補で、強属性Hに対する実機独立検証/ユーザー承認は未実施。既存source付き係数の算術一致は実機のHit数を証明しない。

## 新たに実行した公開計算検証
- `tools/cb-h-power-element-gate-probe.cjs`、`cb-h-power-component-audit.cjs`、`cb-h-power-real-weapons-ab-proof.cjs` は既存の「テストHTMLメモリからHゲートを削除する方式」から、**候補ブランチの実アダプターを無変更で呼ぶ方式**へ切り替えた。元データはMHDBキャッシュ（SHA256 `9491bfc1cf357aed4967418949d78c0ddd73407c6461443a7b594a2b2710c810`）。
- `tools/cb-power-h-public-census.cjs` を新設し、MHDB実チャアクのPOWER_ELEMENT 20武器すべてを公開 `calcBuild()` に通した。装備は防具なし/護石スキル空/装飾品なし、盾ON/斧強化ON/剣OFF、RとH独立開始、H通常2本、強化0、training-room/front、属性変換152通常/最大ともOFF。
- 対象16/20武器が通常・最大双方 `complete`。4武器は以下の**別技能の未承認境界**で停止。H強属性ビン計算が成功したことと、スキル全部が完成したことは別。

| 区分 | MHDB ID | 件数 | 原因 |
|---|---|---:|---|
| R+H通常/最大が成立 | その他の強属性チャアク | 16 | 候補Hが実アダプターで通過 |
| スキル86 飛燕の技範囲待ち | 118,119,120,121（風爪盾斧系） | 4 | `H:REAL_SLICE:AIRBORNE_HIT_SCOPE_PENDING:CB_AXE_TO_SWORD_MORPH` |

- 不明な飛燕非適用を推測で確定させない。過去のハンマーHM3/HM4と操虫棍IG_SWEEPの「非適用」証拠は**その特定技だけ**の契約であり、CBの剣変形へ流用しない。
- 既存榴弾61武器の限定条件61/61・雷耐性変換候補・刃鱗初撃候補の回帰を継続。強属性の16/20と榴弾の61/61を混同しない。

## 成分別・保存比較
- MHDB103（ウズ・ヴァレロヤⅡ、水260）でH盾突きビン爆発15.21、H高出力は通常85.176/強化121.68、追撃127.764。盾強化1.3、相手水属性肉質30、既存係数1.5/4.2/6を使い計算式と値が一致。新ルール採用の証拠ではない。
- 実MHDB103/104の異武器保存→読込→共有条件A/B比較→現在状態/保存map不変について、候補アダプターを使ってCIで再実行。H強化ビン0.5+通常ビン0.5を含む既存明示開始状態を維持。

## CI・残件
- [候補の初回全ジョブ CI run 41737271093](https://github.com/Scream76K/DEV_MWWSKILLSIM/actions/runs/41737271093)：completed/success。
- 追加で20武器の成功16/保留4を固定assertしたCIは新コミットで再実行。
- 旧スクリプト名に含む「isolated」「in-memory」は履歴を指す名称であり、この候補ブランチ上の実行はメモリゲート解除なし。
- 依然として強属性Hの盾突きHit数/消費・飛燕対象技・属性変換152最大ON・Safari/実機・正式β統合は未完了。
