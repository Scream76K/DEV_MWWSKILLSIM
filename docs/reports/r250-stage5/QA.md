# Stage5 QA監査 — KAN-14／fern（フェルン）

2026-10-11 JST。正式役割04 QA・品質保証。対象 `/Users/scream/Projects/DEV_MWWSKILLSIM-r250`、branch `codex/integrate-r249`、HEAD `fb6d82cd525da9273af10ac6b719f330208608c5` を確認。AGENTS.md・fern role受領。今回ユーザーの後続許可により本報告と専有evidence/qaのみ作成。製品・DB・既存tests変更0、Git変更操作0、原本/GUILDアクセス0、再委任0。

## 判定

Stage4からの回帰範囲とStage5監査資料は証拠整合。報告・証跡は統合可能。製品全機能の品質承認、14武器正式DPS完成、実画像OCR精度達成、公開可能の判定ではない。UIにP2所見、OCR黄金不足、対象版実機検証不足が残る。重大矛盾は検出していない。SALADA_AUDIT.md到着後にfixture・現行関数・R10を読み取り追補照合した。映像未確認とゲーム版未確認は保持。

## 既存記録のログ監査

|範囲|Stage4基準|Stage5ログ成功/失敗|skip|
|---|---:|---:|---:|
|Node|752|752/0|0|
|DOM|304|304/0|0|
|Browser + smoke|50 + 16|66/0|0|
|旧OCR files + template|11 + 6|17/0|0|

`evidence/{node,dom,browser,legacy-template}-baseline.log` を読取確認。cancelled/todoも各0。Browser66は50とsmoke16の合計でsmoke親試験を含む。独立66シナリオではない。旧OCR11はファイル単位のNode runner件数。新規部分回帰・Stage4記録・Stage5再実行を重複加算しない。実行exit0はhimmel確認による記録で、ログ末尾の件数から独立推定していない。fernは今回テスト再実行なし。

## 新実施した保全照合

before-manifestの852全ファイルをSHA256独立再計算：欠落0、変更0、852/852一致。HEAD/main/develop/origin/main/origin/developをread-only git rev-parseで照合し全refs不変。origin/develop先行3コミットを履歴取り込み済みとは扱わない。既存製品/DB/OCR/template/testsのhashが保全されており、この段階のTEST追加・期待値変更・削除0。既存testのskip/only宣言追加もなし（現行検索該当0）。証跡 [evidence/qa/audit.json](evidence/qa/audit.json)。新規監査文書・証跡追加は保全対象852ファイルの変更と区別。

## UI監査の照合

UI_AUDIT.mdとresults.jsonの40操作、5幅375/390/768/1024/1440、8領域equipment/skills/technique/combo/dps/comparison/ocr/templateを照合。全action OK、pageerror0、40/40画像存在、contact5枚。合計45PNGであり40独立画像条件と5枚の派生一覧を加算しない。画像の独立視覚再レビューは今回未実施。starkの視覚所見をJSONおよび条件と照合した。

全details開放・短名合成大剣・合成コミュニティ技・外部取得遮断という限定条件。実MHDB全装備、長名/多数保存/多数skill、全武器、Safari/iOS実機、タッチ実機、アクセシビリティ、OCR認識/反映、template実DB反映は保証しない。ページoverflowは375で34px、390で19px、768以上0pxと一致。P2横overflow、P2保留理由の低コントラスト、P2狭い2列は記録済み。コントラスト比は未測定。追加overflow-probeでは参照資料の長い識別子の文字Range右端408.6875pxを特定し、techAuditPanelまたは内側参照資料を閉じるとdocument幅375/390へ戻ることを記録。比較表生成前にも再現し、内部スクロールとは区別される。これは資料展開条件での原因切分けで、製品修正完了ではない。P0/P1再現なしを製品全体の不存在保証にしない。

## Technique DB監査の照合

runtime-records.jsonを再集計：14武器537レコード、VERIFIED28／PARTIALLY_VERIFIED321／UNVERIFIED188。verificationStatusとnumeric/field statusは別軸。レコード数やVERIFIED数を正式DPS件数へ変換しない。正式絶対DPS成立確認0/14、現行evaluateComboRouteには正式VERIFIED producerがない。未成立を将来成立不能とも解釈しない。Generic READYは採用範囲のHPダメージ計算で、実機対象版・時間・特殊成分の完全検証ではない。

旧evidenceRefs23種は抽出registryで未解決という範囲の所見。他の旧埋込資料を含めた出典不存在と断定しない。ライブMHDB14武器実計算、動画照合、外部原出典再取得は未実施。runtime JSONは監査snapshotであり数値正本ではない。

## OCR ground truth監査の照合

ground-truth-audit.jsonの黄金0/3（fullscreen/top-bottom-bars/framed-photo）、各viewport/9行境界/name bbox/crop unknown=nullを確認。4種類の目視確認と複製画像hashを独立黄金件数に加算しない。Stage3実Tesseract2画像各7部位・auto0は認識実行/安全性の記録。phone5防具の手動反映は自動認識正解ではない。現行中央16:9仮定や過去係数/検出矩形はtruthではない。

合成座標browser3件は構築済みoffset/9色行をcropへ直接渡す試験。viewport/9行検出器の実画像正解は証明しない。未知を検出値でexpectedへコピーしない。

## 残課題と今後の回帰ゲート案（提案のみ）

- P1：実画像golden3系統の未加工原画像・独立注釈・二者照合。viewport、10境界、7名前bbox、drawImage source cropの一致を先に検査し、認識精度は別ゲート。
- P2：375/390参照資料長identifierの折り返しと展開時横overflow回帰、保留文言コントラスト測定、狭幅列組み。既存比較表の内部スクロールとページoverflowを分離。
- P2：技の対象版・各成分・状態・時間・実機条件を揃えた正式DPS成立ゲート。source_confirmed、暫定採用、VERIFIEDラベル単体では昇格しない。
- P2：ライブMHDB装備、実画像OCR→候補確認→反映、公開資産E2Eの独立ゲート。実行承認と対象範囲を別途定める。
- 維持：未検証DPS UI/JSON/AI/提案のnullと理由、ダメージ・参考時間・Hit・保存復元・基準変更時絶対値不変、異武器種ガード、失敗/skip/部分集合の透明記録。

上記は提案でありテスト・仕様・製品を変更していない。himmel/serieは統合・品質判断、stark/eisenはUI原因切分け、seinは黄金整備、frierenは技根拠、heiterはSALADA正本照合に関係する。

## SALADA到着後追補

SALADA_AUDIT.mdをfixture `r250-salada-arm-mhdb.json`、現行limitBreakSlots/maxBreakSlots、SOURCE_CONFIRMATIONS_R10.mdと読取照合。rarity6のraw[2,1,1]にmaps6['211']を適用する現行コードは実効[3,2,1]であり、rawだけを珠容量と比較して衝突とは判定しない。heiterのメモリVM再確認は現行実装/fixtureの検証で、今回QAは再実行なし。連撃珠3・重撃珠2・体術珠1の容量整合はゲーム内実測や映像の珠所有権保証とは別。

腰体術珠、脚挑戦珠/重撃珠はR10の過去user-confirmed記録と一致。R10文書自体のCANDIDATE pending simulator revalidation表記を、現ゲーム版の映像verifiedへ昇格しない。P1該当動画タイムコード・珠所有部位の独立確認、P2MHDB対応ゲーム版/ゲーム内限界突破容量が未解決。撮影チェックリストは元映像照合で解消できない部分を補う案であり、撮影必須の追加要件ではない。現行テンプレを維持する結論は整合し、数値変更は不要。

最終監査でも8領域×5幅の限定snapshotと、OCRUI表示だけの限定完了を保持。全画面OCR解析成功の証拠として画像40枚を扱わない。
