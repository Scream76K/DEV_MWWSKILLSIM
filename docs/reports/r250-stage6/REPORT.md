# r250 Stage6 統合報告

2026-10-11。対象 `/Users/scream/Projects/DEV_MWWSKILLSIM-r250`、branch `codex/integrate-r249`、HEAD `fb6d82cd525da9273af10ac6b719f330208608c5`。KAN-16は承認済みP2候補3件の局所CSS修正、KAN-17はDPS根拠整理。最終完了承認はゼーリエ待ち。

## 保全と実稼働

開始時922ファイルのSHA256、Git状態、参照をevidence/before-manifest.jsonとbefore-worktree.tar.gzへ保護。既存Stage4/5未コミット成果を保持。index.html編集はヒンメル一人、シュタルクは再現・CSS案・新規回帰・画像担当。フリーレンのDPS監査、ハイターのSALADA追確認、フェルンのQA、アイゼンの独立レビューを実際に委任し結果を回収。ザインの新規実画像検証は行わず、KAN-8の待ち条件を維持。ゼーリエは承認者であり起動済み担当には数えない。

## KAN-16

[UI_CHANGES.md](UI_CHANGES.md)。index.html head末尾に局所CSS10行（6規則）を追加。長い参照IDを折り返し、比較理由の文字色を改善、装備／スキルの外側配置を全幅の縦積みにした。確定仕様のスキル内部2列を復元し、既存比較表の局所スクロールと`.two`境界を保持。JS、計算、DB、保存仕様の変更なし。

実Chromium375/390/768/1024/1440px。ページoverflowは34/19/0/0/0→全0。通常理由文字の実背景コントラストは最小1.7406→11.1438。前後画像30枚とcontact5枚、測定・RED/GREENログをevidence/uiに保存。新規回帰は親集計含む26件、RED8成功/18失敗→GREEN26成功/0失敗。子25件はRED8成功/17失敗。通常実行のUI_PHASE既定はafterとして、before証跡を上書きしない。合成装備・表示stressによる監査であり、実iOS/Safari・全MHDB・実画像OCR成功を保証しない。

## KAN-17

[DPS_EVIDENCE.md](DPS_EVIDENCE.md)。14武器537レコードを引き継ぎ、旧参照23件の出典locatorを追跡。HH1件は同一IDの出典URL、17件は関連registry、5件は対応registry未特定。関連資料発見を数値や対象版VERIFIEDに昇格しない。正式DPS成立確認0/14を維持。資料追跡・実装接続不足・出典競合・実機計測を分離した。

最小計測案は大剣STANDARDの限定一条件・連続3技。装備／標的／版／入力／時間境界を先に合意し、実際の映像値を記録する。CBは放出Ⅰのイベント識別から段階化、IGは追加撮影前に既存動画の版・本体／猟虫帰属を追跡。全14武器の一括撮影や数値推測は要求しない。Technique DB数値・検証状態の変更0。

## 継続課題

- KAN-8: [OCR_FOLLOWUP.md](OCR_FOLLOWUP.md)。実画像golden0/3。未加工3系統の画像と独立viewport／10境界／7名前bbox注釈を待つ。合成crop回帰と実画像OCR・装備反映を区別。
- KAN-12: [SALADA_FOLLOWUP.md](SALADA_FOLLOWUP.md)。元動画の取得はCache miss、接続ブラウザなし。削除／非公開とは断定しない。腕の容量整合と腰脚の過去ユーザー確認記録を維持し、映像verifiedには昇格しない。該当タイムコード、部位詳細、ゲーム版画面が必要。
- KAN-14: 全回帰とブラウザ並列不安定の切り分けをQAへ記録。既存テスト削除・skip・期待値変更0。

## 品質ゲート

|試験|成功|失敗|skip|結果|
|---|---:|---:|---:|---|
|Node|752|0|0|exit0|
|DOM|304|0|0|exit0|
|旧OCR＋Template Gates|17|0|0|exit0|
|Browser全体（既存50＋新UI26＋smoke16）、並列|91|1|0|exit1|
|同じBrowser全体、直列|91|1|0|exit1|
|失敗対象単体|1|0|0|exit0|

上表は初回結果。新UI26は両全体実行でも全成功。既存power-change-displayの幅が期待[112,120,120]に対して[0,0,0]になる失敗は、追加trace15回の3失敗すべてで旧locator要素のisConnected=false、同じcallbackの現行表幅[112,120,120]と確認できた。C：resizeによる表再描画とテスト測定の競合。直列でも再発するため「並列だけの問題」とはしない。

ヒンメルが測定1箇所を、現行DOMが接続・非ゼロになるまで待機し同じ評価ターンで現在の表を取得する方式へ変更。厳密期待値[112,120,120]は不変、任意sleep／削除／skipなし。製品追加変更なし。初回失敗ログを保持した。

修正後は対象単体10回すべて成功、全Browser並列92成功/0失敗、直列92成功/0失敗、各skip0/exit0。Node752・DOM304・旧OCR＋Template17の成功結果と合わせて、今回範囲の自動回帰ゲートを通過した。ブラウザ測定方法だけの後続変更でありNode／DOM対象コードには追加変更がない。実iOS/Safari、全MHDB、実画像OCRの保証は追加していない。独立レビューの最終判断をREVIEW.mdへ記録し、正式完了承認はゼーリエ待ち。

終了時照合は開始922ファイルの欠落0。更新2件（index.htmlと前記Browserテストの測定方法）、追加73件（新規回帰・報告・バックアップ・画像・ログ等）、削除0。追跡327ファイルの欠落0、Stage4/5文書変更0。前段階で保全確認した143ファイルを含む母集団を保持。refs全一致、origin/develop先行3コミット維持、ステージング／削除0、git diff --check成功。既存indexのJS／DB／OCR差分0。原本の現在状態を再調査するためのアクセスは実施していない。

KAN-16/17へ結果とゼーリエ承認依頼を投稿しレビュー中へ移行。KAN-8/12/14は進行中を維持、KAN-10のレビュー中を変更していない。[JIRA_UPDATE.md](JIRA_UPDATE.md)。次の判断はBrowser失敗の原因切り分け、限定UI修正の採否、大剣計測の時間境界契約、実画像／元映像根拠の取得である。

[QA.md](QA.md) / [REVIEW.md](REVIEW.md) / [CHANGED_FILES.md](CHANGED_FILES.md)。

原本リポジトリ・PROJECT GUILD 3Dにはアクセスせず、commit/push/merge/rebase/deploy/PR/公開設定変更を行っていない。
