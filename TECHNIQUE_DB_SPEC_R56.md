# r56 狩猟笛の本体・特殊成分の分離

通常の本体5Hit（MV合計195）を、演奏衝撃波・響玉追撃・旋律成立固定ダメージから分離した。通常Hitの数値は技DBを参照し、狩猟笛側の数値重複を削除した。

確認済みの響玉追撃4回は保持する。通常追撃の資料係数5と旋律成立時の12を別レコードとし、各イベントの種類の対応が未確定なため5×4の合算を停止した。響玉設置の30と45は資料競合として保存し、採用値を推測しない。設置は現行STANDARDの本体計算には含めない。

重ね掛けの旋律成立時に記載された固定10ダメージを通常MVから分離した。攻撃力・斬れ味・肉質を掛けない資料値として保持し、STANDARDでの発生数は未確定とする。衝撃波・響玉の攻撃力換算と会心の扱いも計算保留とする。

`huntingHornBodyComponents`は本体のみの部分結果を返す。`comparisonPower`はnull、`completeStandard`はfalse。笛全体の比較火力・DPSは公開しない。`huntingHornComponentPlan`のREADY表示を修正し、未確定項目がある限りFAIL_CLOSEDとする。

技DB画面には本体のHit数、別計算の成分ID、追撃4回の確認状況、専用STANDARDの保留理由を表示する。旧混在レコードは変更履歴に保存した。基準バージョンは1.042.00.02であり、最新ゲーム版への適用・実機検証を完了と扱わない。操虫棍の保留状態と動画確認項目は維持する。

参照資料：
- https://macarongamemo.com/entry/mhwilds-hunting_horn-motion
- https://kuroyonhon.com/mhwilds/memo/8.php

検証：`node --test tests/*.test.cjs`で70件成功。実際のインライン監査UIをモックDOMで実行し、表示と数値参照を確認した。実ブラウザによる表示確認は未実施。
