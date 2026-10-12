# 既存テスト更新の根拠

ACCEPTED COMBAT_METRICS_DISPLAYの「未検証DPSは数値を表示せず理由を示す」を優先。計算DB・実測時間の昇格は行わない。ファイル削除、test削減、skip追加なし。

| ファイル | 変更理由・維持した検査 |
|---|---|
| tests/r192-dps-build-parity.test.cjs | C：追加共通ヘルパーをVMへ抽出。B：合成VERIFIED状態を明示し比率/負値/ゼロ/ルートガードを維持 |
| tests/r248-independent-dps-diagnostics.test.cjs | C：共通ヘルパー抽出。B：合成状態を明示し火力指数から独立するDPS契約を維持 |
| tools/ai-comparison-dom.test.cjs / browser | B：合成VERIFIED fixtureでAI比較の指数・基準更新を検査。未検証nullは新回帰で別検査 |
| tools/comparison-baseline-dom.test.cjs / browser | B：合成状態を明示し基準変更・選択保持・回転を維持 |
| tools/comparison-index-dom.test.cjs / browser | B：合成状態を明示し比率・wrap・resize・独立比率を維持 |
| tools/comparison-report-dom.test.cjs / browser | B：合成状態を明示し非破壊JSON・実download・保存条件/基準を維持 |
| tools/comparison-rounding-dom.test.cjs | B：合成状態を明示し桁/丸め/元値保持を維持 |
| tools/canonical-timing-dom.test.cjs / browser | B：参考時間登録は正式DPSを有効化しない。null/未算出/理由へ変更し、時間保存削除・版・証跡・復元・幅検査を維持 |
| tools/canonical-combo-dom.test.cjs | B：参考DPSnull/stateを検査。canonical MV/Hit/ダメージ/時間不変を維持 |
| tools/charge-blade-combo-dom.test.cjs / browser | B：参考時間からの実戦DPS表示→未算出。CB専用状態・Hit・時間・保存/復元・幅検査を維持 |
| tools/combo-evaluation-dom.test.cjs | B：参考DPSnull/state/reason、ダメージと時間を維持。入力非破壊を維持 |
| tools/combo-persistence-dom.test.cjs | B：比較の未算出理由表示へ整合、現在コンボと保存コンボの責務・復元検査を維持 |
| tools/expanded-combo-dom.test.cjs | B：custom参考時間は未検証。提案の未算出理由、合成VERIFIED差分/0順位契約を検査。canonical未確認時間・Hit/ダメージは維持 |
| tools/combo-verification-dom.test.cjs | B：既存null一致だけに依存せず、UNVERIFIED/理由/時間2秒/正ダメージ/UI一致のassertを追加 |

合成VERIFIEDは表示契約を検査する入力。現実の技/ルート/時間をVERIFIEDへ昇格する操作ではない。新規回帰は未検証参考経路と旧キャッシュを実製品経路で拒否することを別検査する。
