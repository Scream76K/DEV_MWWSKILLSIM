# KAN-22：操虫棍限定P0接続

2026-10-11。Revisionはr250開発中・未コミット。/Users/scream/Projects/DEV_MWWSKILLSIM-r250、codex/integrate-r249、HEAD fb6d82cd525da9273af10ac6b719f330208608c5。作業開始時index.htmlを/private/tmp/kan22-before.htmlに保全。原本変更・commit・push・merge・公開・Jira編集なし。

## 指示・資料照合

KAN-22コメント10077/10078を直接読み取り。猟虫資料 https://k-k-kohei.com/2026/03/26/insectglaive-kinsects/#toc17 も確認。ユーザーによる最新情報確認と実機VERIFIEDは別。記事は旧版表記のみを理由に除外しない。新規数値を採用する場合は個別承認が必要なため、今回は既存DB数値だけを使用。

既存Technique DBは操虫棍43レコード。けさ斬りIG_DIAGONAL_SLASH・なぎ払いIG_SWEEPは通常本体のMV/Hit/属性補正が登録済み、特殊成分・エキス消費遷移なし。出典MACARONGAMEMO_IG_R49_SOURCE、baselineGameVersion 1.042.00.02、SOURCE_CONFIRMED/PARTIALLY_VERIFIED、正式calculationStatusはEVIDENCE_GATED。公式版照合・部位耐久補正の不確定理由を保持。HPダメージの限定参考だけで使用し、検証状態を昇格しない。

三色移動斬り等は旧集約・属性補正競合。強化空中突きは属性Hit対応競合・猟虫成分、飛天螺旋斬は本体Hit数競合・エキス消費・猟虫成分が残る。これらは接続しない。既存insectGlaiveStatePlanは三色・消費遷移の検査であり、猟虫ダメージの実装ではない。

既存MHDB取得・装備集計経路では武器攻撃／属性・肉質を利用。猟虫選択、系統、パワー、ボーナスごとのダメージ処理を持つ取得・状態管理経路は確認できなかった。MHDBサービス全体にデータが存在しないとは断定しない。

## 実装と3経路

- 単発：canonical:IG_DIAGONAL_SLASH、canonical:IG_SWEEP。
- 参考テンプレ：adopted:ig_body_reference、けさ斬り1回（エキスなし・猟虫収納／参考）。ゲーム内の未知の連携順を推測しないため1技テンプレとする。
- 自由コンボ：上記2技の任意順・反復。全段が条件を満たす場合だけ合計。

エキス状態と猟虫状態の明示UIを追加。NO_EXTRACT＋STOWED（連携なし）のみ算出。未選択、三色、猟虫攻撃／連携ありは理由付き全体未算出。猟虫を含む技の本体だけを完全な総ダメージとして出さない。

InsectGlaiveBodyHandlerは薄い状態確認アダプターとして新設し、既存ordinaryComboTechniqueDamage→genericProfileDamageの式へ委譲。式のUI重複なし。現在のビルド・超会心・会心条件・選択肉質・属性・斬れ味を既存P0入力から使用。部位耐久倍率をHPに加算しない。
正式techniqueDbHitsのゲートを変更せず、限定した2技のSOURCE_CONFIRMED・Hit数値・特殊成分なし・状態遷移なしを検証する参考読込を使用。DBレコードそのもののREADY/VERIFIED昇格なし。

## 保存・比較互換

combo.insectGlaiveStateを追加（extractState/kinsectState）。既存キー/versionは維持。旧JSONに状態がなければ未選択・未算出へ復元。保存比較共通条件へ状態を伝播・復元し、preserveComboで現条件を維持。既存KAN-13/19/21、弓・HBG・SAED、ガンランスの回帰を実行。
Technique DB領域を開始時と比較し完全一致。数値・出典・既存状態プラン・DPS・時間データを変更しない。

## 変更ファイル

- index.html：限定技・テンプレ、状態確認アダプター、エキス／猟虫状態UI、保存・条件伝播。
- tools/kan22-ig-p0-dom.test.cjs：追加5件。
- tools/kan22-ig-p0-browser.test.cjs：追加2件、375/1440px。
- tools/canonical-presets-dom.test.cjs：旧IG未接続前提を対象限定で変更、正確な技ID・条件・Handlerを追加1件で確認。
- tools/expanded-combo-dom.test.cjs：IG専用アダプターを普通技と区別し、DB由来・特殊成分なし・時間未確認を検証。
- docs/reports/kan-22/：報告・ログ・差分・画像。

## 検証

|対象|実行/合格|失敗|skip|
|---|---:|---:|---:|
|Node|830|0|0|
|DOM|347|0|0|
|Browser・保存・テンプレ・旧OCR|125|0|0|
|合計|1302|0|0|

REDで未接続を確認、GREEN5件。3経路一致・反復、状態不明／猟虫展開の保留、装備会心肉質変更、特殊成分混在で合計保留、JSON保存復元・旧JSON欠損を確認。Chromium375/1440pxで3操作・JSON復元・横はみ出し／pageerrorなし。375px画像を目視確認。Safari実機と独立担当レビューは未実施。git diff --check合格。既存テスト削除・skip・無条件期待値緩和なし。

## 猟虫計算の例外採用判断事項

今回は未採用。以下をTechnique DBの参考数値として採用する承認が必要：
1. 猟虫技別MVと猟虫攻撃補正・切断／打撃補正。
2. パワー段階表と属性武器での段階調整ルール。
3. 猟虫種類→系統／ボーナスの対応と、技・エキス状態別の物理／属性補正。
4. 専用物理・属性計算契約。猟虫属性はスキル適用前の武器属性を入力し、装備最終属性を流用しない。

採用候補の根拠は上記記事＋KAN-22#10078のユーザー鮮度確認。記事内Ver.1.041.03.00、プロジェクト基準1.042.00.02との差を保持しREFERENCE_ONLY／実機未検証として記録する方針を提案。これらの承認だけでHit回数を確定しない。技ごとの猟虫イベント数・三色連携回数・発動条件が不足するものは未算出維持。

## 次工程・Jira転記用

KAN-22のエキスなし・猟虫収納条件で本体2技を3経路へ限定接続。既存式再利用、DB数値変更なし、1302件合格・失敗skip0。猟虫成分・三色・飛天螺旋斬は理由付き保留。猟虫用外部データの例外採用をゼーリエへ判断依頼。CBのSAED以外も残課題。KAN-23/24は今回未実装で、次工程で指定コメントを照合する。
