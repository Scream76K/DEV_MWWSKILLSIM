# 23 Lv1通常弾速射・開始条件付き参考接続

承認 Sentinel_0985d184016c8191984a6856057b3370 (2026-10-29 23:51 JST)。OWNER_APPROVED_PROVISIONAL、現行実機未確認。

LBG_NORMAL_RAPID_1: 1トリガー5発×各1Hit、同部位・適正距離。MVは既存LBG_NORMAL_AMMO_1参照、速射0.7(非速射0.8を重ねない)、23正規名Lv1で算出物理1.05、属性0。共通physicalHitを非速射と共有。速射数値はLBG_RAPID_NORMAL_RULE唯一源。通常/最大は同じ明示状態、完成攻撃/会心だけ各channelから渡す。
MHDB ammo normal Lv1 rapid:true、正整数capacity、loadedRounds 1..capacity、RAPID/rapidReady=true/ALL_FIVE/CRITICALが必要。Artia容量補正は未採用で拒否。完遂可能はユーザー開始前提でありゲージ量/回復/時間計算なし。モード切替で残弾を補充しない。旧保存未入力は補完なし。
L2→専用reference5Hit→既存F-01共通実行器→consume1。失敗時に総計完成/消費確定しない。所持弾無限と装填残弾を区別。First/Force/抜刀/その他未採用併用・反復・チェイス・騎乗・可変命中は保留。

公開JSDOM合成装備: raw90/aff10/攻撃5/挑戦者1、弾肉質80。なし通常50.05854/最大52.390702、23通常52.561467/最大55.0102371(各1.05)。5成分と各channel残弾2→1確認。未指定完遂/残弾0/不正Lv2は固有guard。保存2件の通常復元・共有比較・現状復元一致。最大3Hit目だけ試験注入で未算出にすると通常成立残弾1、最大総計未算出残弾2、入力残弾2保持。既存非速射1ケース通常34.325856維持。
初期失敗も削除せずrapid23-execution.jsonに原因とexitを記録。最終生出力rapid23-after.json、差分rapid23.patch、harness tools/rapid23-proof.cjs。製品最終hashはmanifest参照。今回共通engine/bundleの変更はreferenceイベント展開と限定消費のみ、F-01本体変更なし。

根拠: https://kuroyonhon.com/mhwilds/memo/14.php (Lv1通常弾[速射]と速射の消費1)、https://kuroyonhon.com/mhwilds/program/skill.php (速射強化Lv1)。2026-10-29取得内容。資料確認を実ゲーム検証としない。
分類23欠落→部分。その他弾種・射撃単位依存併用等の製品目標拡張は残る。71完全/14部分/0欠落/6注釈/88非火力。全体Doneやβ最終検証完了ではない。Git操作/公開なし。
