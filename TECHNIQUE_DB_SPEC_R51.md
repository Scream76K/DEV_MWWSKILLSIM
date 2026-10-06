# r51: 乱舞Ⅰ・Ⅱ・Ⅲの分割とMV採用

## 合意と変更範囲

2026-10-06のユーザー指示により、手元で確認した最新候補のHit別MVを採用します。乱舞Ⅰ12Hit、Ⅱ4Hit、Ⅲ11Hit、計27Hitは複数資料の一致とユーザー確認により確認済みとして扱います。属性補正の確定はこの採用判断に含みません。

変更範囲は既存の技DB、双剣STANDARDのID参照、確認パネルです。計算式・スキル・装備・OCR・保存キーの変更はありません。

| 技ID | 技名 | Hit別MV | Hit数 | MV合計 |
|---|---|---|---:|---:|
| DB_DEMON_DANCE_I | 乱舞Ⅰ | 18/18/6/6/10/10/4/4/20/20/11/11 | 12 | 138 |
| DB_DEMON_DANCE_II | 乱舞Ⅱ | 16/16/6/25 | 4 | 63 |
| DB_DEMON_DANCE_III | 乱舞Ⅲ | 22/8/5/22/5/14/18/8/18/36/36 | 11 | 192 |

STANDARDは上記3つの技IDを順に参照します。ProfileやHandlerにMV配列を複製していません。旧 `DB_DEMON_DANCE` は履歴参照と互換性のため保持し、`LEGACY_AGGREGATE` と後継3IDを明記します。新規3技を加え全14武器種525レコードとなります（旧一括レコードも数に含みます）。

## 確認状態

- `fieldVerification.motionValues.status = ADOPTED`：ユーザー指定による採用。公式のバージョン検証済みという意味ではありません。
- `fieldVerification.hitCount.status = VERIFIED`：資料間のHit構成の一致とユーザー確認。
- `fieldVerification.elementModifiers.status = UNVERIFIED`：本文と変更履歴の相違を解消していません。
- `fieldVerification.partModifiers.status = UNVERIFIED`：対象資料に記載がありません。

採用HitにはMVだけを入れ、属性・部位補正を仮の1で埋めません。資料の属性候補値は `sourceAlternatives` に分離します。全Hitが未確定なため、通常の計算用 `hits()` と双剣STANDARDは引き続きEVIDENCE_GATEDです。

`TechniqueDBEngine.motionValues(kind,id)` は、MVがADOPTEDまたはVERIFIEDと明示された技の不変なMV配列だけを返します。これは数値確認用で、ダメージやDPSを計算するAPIではありません。旧一括レコードや未採用技に対してはFAIL_CLOSEDです。

確認パネルはMV採用、Hit数確認、属性・部位補正の保留を個別に表示します。旧一括レコードは履歴参照用、AlGestの掲載MVは採用対象外の過去掲載値として表示します。

## 参照資料

- [KUROYONHON 双剣](https://kuroyonhon.com/mhwilds/memo/6.php)：鬼人化の乱舞Ⅰ・Ⅱ・Ⅲ個別表。確認日2026-10-06。
- [まかろん 双剣](https://macarongamemo.com/entry/mhwilds-dual_blades-motion)：MV一括表、属性補正本文とVer.1.020変更履歴の候補値。
- [AlGest 双剣](https://al-gest.com/mh-wilds/mh-wilds-motion-dualblades/)：ページ表示日2025-03-12。12/4/11Hitと一致しますがMV合計122/52/156（計330）は採用値と異なります。対象バージョンと属性補正は不明なため、Hit構成の裏付けと掲載値比較に限定します。
- ユーザー採用判断：2026-10-06「モーション値はあなたが持っている最新値を使いましょう。27Hitであることは他の人の検証でもわかりました」。ユーザー判断の証拠ID `USER_DB_R51_ADOPTION` に記録しています。

基準バージョン1.042.00.02はプロジェクト採用値です。公式バージョン監査はPENDINGのままであり、今回のユーザーによるMV採用と区別します。

## 検証と残件

`node --test tests/*.test.cjs`：45件成功、失敗・スキップ0。3技の全Hit順序・合計、STANDARD参照、属性候補の混入防止、MVのみの取得、確認パネルの表示、従来STANDARDの計算回帰、全inline JavaScript構文と5つの内蔵自己テストを確認しました。

実ブラウザでの表示確認は未実施です。旧コンボ編集/DPS経路の全面移行は行っていません。このリリースによって旧コンボの技選択・DPSが新しい分割DBを使うようになったという意味ではありません。属性補正・部位補正・所要時間・バージョン監査の残件は別途確認します。

GitHub PagesではZIPルートの `index.html` を公開してください。最新差分は本r51仕様書、r50以前の仕様書は経緯資料として参照してください。
