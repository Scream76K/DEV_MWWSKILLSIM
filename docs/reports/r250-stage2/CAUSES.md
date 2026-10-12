# 残存13件の原因分析

A：製品不具合、B：旧仕様/期待値、C：テスト読み込み/依存、D：根拠不足。混在を明示。beforeはNode test runnerのファイル単位11 OCR＋テンプレート個別6＝17検査中4成功/13失敗。assert数の合算ではない。

| 対象 | 分類 | 原因・根拠 | 対処 |
|---|---|---|---|
| SALADA_BOW_05 | B＋A注記 | r6/REGRESSION_GATESは脚なし。後続R10と2026-10-10ユーザー回答は腰体術・脚挑戦/重撃。実データはR10、notesのみ旧r6残存 | 既存ゲートと注記をR10へ整合。映像再検証未実施を明記 |
| KOTATU_DB_01 | B | REGRESSION_GATESの連芸珠はR9でユーザー確認済み誤記訂正。MHDB達芸珠【3】id66/weapon/達人芸1 | 達芸珠を検査。製品データ変更なし |
| step118 | C＋B | 外側HTMLのescaped JSを実行、supportBonus欠落。旧scalar/ratioと現行score object/count契約が不一致 | JSON復号、support,totalとtotalScore。ケース5件は同じ入力の現行閾値で判定。近接候補3件ambiguous、十分差autoを維持 |
| step119 | C＋B | 上記＋旧Step1.19タイトルとfinal入力 | 現行埋込境界、totalScore/信頼度、候補差・第2候補なしの検査維持 |
| step120 | C＋B | ratioだけのsupportBonusと旧.07期待。step121/122で後続count契約/score componentsが確認できる | support/total、.06、object.totalScore、信頼度による確認維持 |
| step121 | C＋B | 旧版タイトル、objectをscalar減算、final入力 | 後続122/123と同じscore components契約。支持段階6条件を保持 |
| step122 | C＋B | 旧タイトル・escaped抽出 | 復号と現行埋込検査。成分・信頼度assert保持 |
| step123 | C＋B | 同上 | 支持行平均・補正assert保持 |
| step124 | C | escaped抽出 | 復号のみ。候補差・支持行assert保持 |
| step125a | C | escaped関数境界で未検出 | 復号。旧layoutの全検査保持。画像精度成功とは扱わない |
| step125b | C＋B | normalizeDecorationSlotLevels/usableText等欠落、巨大sliceがDOM初期化混入。旧inline投影、旧pass構造 | 必要関数の構文確認抽出。投影内容を検査、現行4pass、救済分離を保持 |
| step125b_v311 | C＋B | 上記＋V312委譲依存欠落。旧crop spikeは幅増加を強制/古い狭幅・左端固定 | 後続v3.1.2のMath.maxと動的左余白/card境界に整合。全後段検査実行 |
| step125c_v4_0_1 | C＋B＋A | 上記＋廃止adaptive帯315×26。現行はgrid直接315×45。adapterがocrを捨てるためactual297と表示315が不一致 | 現行gridそのものとactualcrop一致を検査。製品はocrコピー1行。refined優先回帰追加 |

共通根拠：JSON化されたindex埋込、step122/123/124の既存後続契約、V312/v4.2/v4.5.1の既存コードコメント、spec/02_OCR。旧タイトルassertは消去せず現行埋込統合境界のassertに置換。検査の削除・skip追加なし。歴史Stepの仕様を現在のタイトル/契約として要求しない。

追加A：実画像で候補が全てpendingでも反映処理がbest全件を送信。r12の明示確定状態契約を無視。candidate_pending時は状態保存/イベント/ビルド操作前に中止。auto/user/manual確定は許可。赤1失敗→緑2成功。
