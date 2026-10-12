# 今回の変更一覧

前回KAN-19/20終了状態との比較。Git全差分には第1〜6段階等の未コミット成果が含まれるため、今回差分と分ける。

| ファイル | 今回の変更/影響 |
|---|---|
| element-display.js | 共通アイコン参照をSVGから承認PNGへ変更。キー/ラベル/計算状態不変 |
| assets/element-icons/{fire,water,thunder,ice,dragon,poison,paralysis,sleep,blast}.png | 新規9透過PNG。承認原画像から切り出し/等比縮小/中央配置 |
| tests/kan20-element-display.test.cjs | 9参照先拡張子のみPNGへ合わせる。数値・機能期待値不変 |
| tools/kan20-element-integration-browser.test.cjs | 参照先拡張子とローカルPNG MIME対応。既存9種×5幅を維持 |
| tests/kan20-approved-assets.test.cjs | 新規9件。128px/RGBA/共通表示/承認PNG SHA検証 |
| tools/kan20-approved-assets-audit.cjs | 新規。実decode/透明画素/余白/5幅/前後画像の証跡生成 |
| docs/reports/kan-19-20-followup/ | 新規REPORT/REVIEW/CHANGED_FILES、保全、MHDB、原画像/crop、前後画像、QAログ |

既存ファイル更新3、新規製品アセット9、新規テスト1、新規検証ツール1。文書/証跡は別添final-preservation.json参照。削除0、ステージ0、commitなし。index.html、計算式、MHDB/Technique DB、既存SVGは変更なし。
