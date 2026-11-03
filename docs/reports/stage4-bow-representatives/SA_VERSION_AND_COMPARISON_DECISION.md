# SA版・追撃範囲と異装備比較候補

製品変更・テスト実行なし。GS共通式は独立review01a19122-3baa-73e3-9d19-bd70eb100b6f受入をmanifestへ記録。

## MV42と58
- docs/reports/r250-stage5/evidence/technique/runtime-records.json:6468以降: SA_SWORD_RIGHT_RISING、MV42/属性1/部位1、evidenceRefs=MACARONGAMEMO_SWITCH_AXE_CURRENT。validFromVersion=1.042.00.02、VERIFIEDという旧メタデータがあるが、このラベルだけで同版実機検証済とは扱わない。
- https://macarongamemo.com/entry/mhwilds-switch_axe-motion （2026-10-31再読）: ページ日付2025-04-10/2025-08-11、右斬り上げ42。変更欄はVer1.020.00の別技変更で、42の有効終了版は書かれていない。
- https://kuroyonhon.com/mhwilds/memo/11.php 現在表は58。
- https://kuroyonhon.com/mhwilds/d/dame.php の12/20更新記録で右斬り上げ42→58、剣縦33→40、斧変形33→40が併記。これで旧新値の関係は確認できる。ただし日月記録だけから年・ゲーム版を断定しない。
- 公式Ver1.040.00.00ページの読取はHTTP403。内容未取得であり、その版への確定対応は未成立。迂回・再試行なし。

結論: 42は根拠のない数値ではないが、旧DBの1.042.00.02/VERIFIED表示は現在参考58と整合が確認できていない。新係数は未採用なので変更しない。現行版へ揃えるなら右だけ58に置換せず、採用標準4技の同じ更新組（縦・斧変形を含む）を一括で照合・採用判断する。全設定のゲーム計測は要求しない。

## 覚醒追撃
r262-stage2-remaining/SA_HH_SOURCE_CANDIDATES.md と SA_HH_LOCAL_IMPLEMENTATION.md の OWNER_SA_HH_PROVISIONAL_2026-10-26 は明示的に3技限定（縦、剣変形二連、斧変形）。全SA共通対象承認ではない。1剣接触→1追撃という発生式は採用済みだが、右斬り上げを登録漏れとして自動許可する根拠にはならない。
最小提案: SA_SWORD_RIGHT_RISINGの既存1本体Hitへ、覚醒ON・SWORD・接触成立の明示条件で既存SA_AMPED_FOLLOWUPを1回追加。既存MV12/属性1/ビンと爆発補正/非高速変形を再利用。斧Hit生成なし、時間/ゲージ/追加技拡張なし。元資料の剣追撃一般則は支持するが、製品の発生・接触モデル対象拡張として承認が必要。MV改訂とは分離可能。

## 異なる保存2装備
GS/SA/SNSの直近試験は同内容2保存であり、装備差による順位比較を証明しない。一方、④弓は既に異なる実テンプレ2件を実行していた。current-accepted-manifest.json / current-accepted-source.json / tools/stage4-real-bow-current-proof.cjs が根拠。
次候補は KOTATU_BOW_01 と SALADA_BOW_05。同じ弓・亡国のクピドバインだが胸/腕/脚が異なり、採用済み龍統一構成と代表3技を使用できる。新しい装備改変・仕様採否は不要。
前者: シュバルカγ胸/ゴアα腕/ゴグα脚。後者: ゴグβ胸/護火竜β腕/クイーンα脚。共有条件はビンなし/適正距離/初射1/克服済み/変換通常OFF最大ON。既存実行は通常663.8690796 vs712.519054182、最大893.0267754 vs827.743496682、2保存読込・共有比較・内容不変を確認済み。
対象hashは旧index aab29e2b1a83282647628532380710dd602f1fd89d444c998758727a2dc24a6d、adapter1b348b1db8c992548cc7438ad0b1b33d6f7e4391b407dbf030a199da7b9a6820。今回の最新hashで再実行したとは扱わない。次回実行するならこの1組を最新差分で確認し、装備差・条件不変のassertを明示する。今回は選定のみ。
