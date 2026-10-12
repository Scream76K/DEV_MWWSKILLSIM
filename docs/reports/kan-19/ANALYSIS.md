# KAN-19 SALADA_BOW_01 属性60の原因調査

2026-10-11。ヒンメル統合、ハイターDATA照合、フリーレンCALC追跡。調査のみ・修正未着手・ゼーリエ判断待ち。

対象 `/Users/scream/Projects/DEV_MWWSKILLSIM-r250`、branch `codex/integrate-r249`、HEAD `fb6d82cd525da9273af10ac6b719f330208608c5` 一致。オーナー確認：さらだ氏の弓・物理特化型SALADA_BOW_01を適用した直後、設定変更なしで「属性60 dragon」。適用後の手動変更を原因とする仮説は除外できる。Safariの実state取得・完全実機再現は今回未実施。

## 結論と確定範囲

元アーティアの属性値が計算入力から事実上欠落する経路を特定した。計算式自体に基礎属性を渡す処理はあるが、MHDBの属性未提供を0へ変換している。この0に龍属性強化Lv3の固定加算60が乗ることで、表示60に整合する。

正しいゲーム上の基礎属性値・最終表示値は未確定。現行テンプレートと過去保存記録では種別dragonが整合するが、元映像の属性種別・値を再検証した意味ではない。「物理特化」名称から無属性を推定しない。属性60を正しい最終属性値と確定しない。

## テンプレ定義

index.html:7618のSALADA_BOW_01：主武器は亡国のクピドバイン、artia.element=dragon、production=element（属性激化）。主珠は破龍・積弾3／超心III3／超心II2。復元はatk:EX、atk:III、atk:III、aff:EX、atk:EXで、属性復元なし。

保存partsのelement×3はnormalizeTemplateArtiaProduction（:7798）でattack×3へ正規化される。保存定義と実行時partsを区別する。production=elementは維持。激化／生産／復元の数値を独自に足し戻さない。

notesの2026-10-02主武器5ビルド龍訂正とREGRESSION_GATES.txt:31は現行龍採用方針に整合する。これは過去記録であり元映像verifiedではない。副武器の雷光・積弾は別フィールド。templateApply（:7738）は主weaponを参照しsubweaponを使用しないので、副珠から主武器を雷と判定できない。

## ライブMHDB読取照合

ハイターが承認付き公共APIのread-only GETで取得、HTTP200。通常sandboxの初回ENOTFOUNDをサービス停止とは判断していない。取得日時は2026-10-11。認証情報・ファイル出力なし。

[弓武器レコード](https://wilds.mhdb.io/ja/weapons?q=%7B%22kind%22%3A%22bow%22%7D&limit=250)は87件。その中の同名3件：

|ID|raw／display攻撃|会心|specials／elements|現行分類|
|---|---|---|---|---|
|1139|200／240|-10|specials空、elements未提供|attack|
|1140|180／216|15|specials空、elements未提供|affinity|
|1141|190／228|0|specials空、elements未提供|element|

[1141個別レコード](https://wilds.mhdb.io/ja/weapons/1141)も照合。属性未提供は無属性・明示0の証明ではない。現行分類は同名3件を真攻撃順で並べる既存実装の結果であり、今回ゲーム版の激化状態を映像検証した意味ではない。

[装飾品レコード](https://wilds.mhdb.io/ja/decorations?limit=250)のid207「破龍・積弾珠【３】」はweapon／slot3、龍属性攻撃強化Lv3（説明×1.2＋60）とフォースショットLv1。逆順id230「積弾・破龍珠【３】」は龍Lv1／フォースLv3で別物。

[API version](https://wilds.mhdb.io/version)の2026-04-15T01:28:18+00:00はimporter更新時刻で、対象ゲーム版の確定根拠ではない。

## 欠損が確定値になる箇所

1. consolidateArtiaFixedVariantRows（index.html:798付近）は同名3件を固定variantへ分類。
2. mhdbRecordElementValue（:787）の初期best=0は属性候補不在でも0を返す。
3. artiaFixedRecord（:797）がその0をelementとして保存。
4. artiaFixedVariantStats（:1664）は属性0を有限値として受理し、種別はbuild.artia.elementのdragonを使う。
5. calcBuild（:1777以降）は属性復元なしで基礎0を龍強化へ渡す。calcElementSkill（:1053）は龍Lv3の×1.2＋60を返す。
6. renderSummary（:2004）が属性値を丸めて表示。damageFromParams（:2044）では表示属性を÷10して使用。

現行データとテンプレの条件式は `0 × 1.2 + 60 = 60 dragon`。欠損を0と扱う入口と、未提供を保留せず受理する固定variantの境界が問題。種別ラベルだけを変えて解決する問題ではない。

正しい式の基礎入力は確認済みの完成武器属性値Eで、龍Lv3なら `E × 1.2 + 60`。Eに属性激化・生産ボーナス等をどこまで含むかを正本と照合し、二重加算を避ける。旧hardcodeをEとして採用せず、未提供のEを推測確定しない。

攻撃190＋復元42＝232はattackTrueの算術。弓係数1.2の表示設定がONなら表示攻撃は異なるため、オーナーの攻撃232との完全一致とは未断定。会心0＋復元10＋見切りLv3の12＝22も算術整合候補。最大87・防御463までの全state照合は未実施。

## 根拠取得と承認後の修正案

- 取得レコード・キャッシュ・variant sourceID、実際の装飾品ID／スキル集計、artia設定、calcStateのelementComponents、係数設定を読み取りで照合する。オーナー操作中の画面設定は変更しない。
- 元動画の対応武器詳細・属性激化／生産／復元・ゲーム版画面とタイムコード、または対象版の属性正本を取得しEを確定する。現時点で正しい具体値を提示できない。
- 承認後は属性の欠損と明示0を区別し、固定variantへ未確定状態を伝播させる。欠損時に属性強化の加算だけで確定表示しない。確認済み攻撃／会心を不要に失わない設計もレビューする。
- 属性依存の計算・保存比較・JSONへの保留伝播を検証し、珠・テンプレ・DB数値を推測変更しない。Technique DB変更不要。
- 明示0、欠損、確認済み非0の回帰条件を分け、既存の激化・復元・属性強化・保存復元比較の退行を確認する。今回新規テスト実行・生成・実装は行っていない。

## 実施・保全

ハイター／フリーレンを実際に起動・委任し成果回収。両担当は書込0。ヒンメルは本報告1件のみ追加。KAN-19は読取のみで、Jira状態変更・コメント・起票なし。Stage6成果、原本、PROJECT GUILD 3Dに変更なし。commit/push/merge/rebase/deployなし。コード修正はゼーリエ判断後。
