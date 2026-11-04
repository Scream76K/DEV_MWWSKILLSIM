# PR #1：共有計算コード6ファイルの独立差分監査（2026-11-04）

## 固定対象
- 基準UI：`flamme/ui-integration-latest-20261103` — `3096b71293f22ff1835214fc941a6431cdacf8a0`
- 候補計算：`flamme/cb-h-resource-event-guard-20261104`、直前の監査基点 `d2224053635a3d8ef4375002c8d54e5dd57a2e62`
- GitHub Draft PR：[#1](https://github.com/Scream76K/DEV_MWWSKILLSIM/pull/1)。**統合・β公開未承認**。比較対象は151コミット・多数の積み重なった候補を含む。
- 審査は実パッチ（PR #1）・既存の公開 `calcBuild()` CI・新規非チャアク物理式単体テストを突き合わせたもの。Safari/実ゲーム/全14武器の網羅再実行を主張しない。

## 共有6ファイルの変更点と判定

|ファイル|変更内容|現時点のレビュー|
|---|---|---|
|`v10-six-layer-foundation/min8/engine.cjs`|formula引数へイベント `techniqueId` と `componentId` を追加|式に渡す情報だけを追加。既存算術を変更せず、任意引数として非CBにも供給|
|`v10-six-layer-foundation/min8/sourced-physical-formula.cjs`|追加IDを `resolveSharpness` のコンテキストへ転送|非CBの検証済み同一入力で旧引数経路と新引数経路の物理数値が厳密一致。値・攻撃・肉質への無関係な加算は行わない|
|`v10-six-layer-foundation/min8/real-one-hit-pipeline.cjs`|ビン優先エラーのチェックを `consumeNormalPhials>0` の場合だけ実行|消費0のH前段では優先資源を強制しない。実際に消費する技は従来どおり優先判定。共通コード変更につき他武器に対する広範囲スモークは別ゲート|
|`v10-six-layer-foundation/min8/real-technique-one-hit-adapter.cjs`|強属性H盾突きの承認済みの資源計画を限定受入|技ID・scope・承認state・爆発1Hit・消費0・検証ステータスすべてを照合。変形斬りは従来の暫定区分を維持|
|`himmel-real-browser-bundle.js`|上記engine/physical/adapter/pipeline変更のbrowser二重コピーへ反映|新規テストで両aliasと元4ファイルが正確に同じ契約要素を含むことを検査。browser bundle全行の機械的同一性は今回検査外|
|`hope-hammer-browser-adapter.js`|CB状態スキル・実MHDB・H資源・承認メタデータなど|**審査区分：混合候補につき保留。** 強属性H盾突きの1Hit／0消費のみユーザーが2026-11-04明示承認。その他の候補は個別証拠と採用判断を要する|

## 追加した反例・恒久テスト
`tests/flamme-cb-shared-integration-audit.test.cjs`：
1. 代表的な非CB物理式（大剣）で旧仕様のIDなし入力と新仕様のIDあり入力の実ダメージが一致。
2. `techniqueId`/`componentId` は物理斬れ味リゾルバーだけへ送られ、肉質・攻撃値・ゲーム計算の引数は変わらない。
3. 未根拠の斬れ味0は引き続き unavailable（値を補完しない）。
4. engine二重コピー、物理式二重コピー、資源優先判定二重コピー、H承認scope二重コピーの契約が単体モジュールとともに存在する。

別途既存の公開JSDOMテスト：
- 強属性H盾突きのユーザー承認済1Hit／0消費を、TechniqueDB値と資源契約に照合。
- 計測ではなく契約の意図的破損（0→1）に対し、通常・最大とも `CB_POWER_H_SHIELD_OWNER_CONTRACT_MISMATCH` で停止。
- 実装備A/B比較、独立R/Hの丸め前加算、榴弾61/61・強属性20/20の**限定条件下候補**に対して公開 `calcBuild()` を通す。

## 本統合の判定と残りのゲート
**REVIEW_PARTIAL / HOLD_MERGE**。共有コードのID転送と所有者確定H盾突きについて単体・候補公開入口のテストを追加し、局所整合性を確認した。一方でPR #1は計算未承認候補を含むため**一括受入しない**。

- 刃鱗研装163のR/H初撃、雷耐性変換165のR/H複合適用、飛燕86 H技限定非適用、属性変換152の非龍no-flatなどはそれぞれの根拠・ユーザー承認境界を保持。
- 強属性Hの他の状態と消費分岐、全14武器スモーク、Safari上のUI A/B保存・レスポンシブ動作、実機ダメージ精度はこのテストだけで保証できない。
- **統合先UI `3096b71` と計算側の差分は積み重なっている。承認済みHの1Hit/0消費だけを、強属性Hルートの別の暫定条件まで認定したものとして扱わない。**
- PRはDraftを維持し、同意されない候補を取り込まず、製品コミットと試験/報告書を仕分けた上で統合判断する。
