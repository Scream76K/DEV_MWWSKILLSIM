# ランス実装備・標準突き参考経路（限定独立レビュー受入済み）

KOTATU_LAN_01、MHDB1166天涯のゲガルンロウ。原典 https://youtu.be/PY9rcu2NlPA?si=uTlx22k9-WI4bY80 の用途欄は「属性変換／溜めカウンター主体」。今回確認は既採用LAN_MID_THRUST_I/II/III→LAN_TRIPLE_THRUST、4技6Hit。原典コンボ・主用途の成立ではない。LAN_CHARGED_COUNTER/COUNTER_DOUBLE_THRUSTはDBに存在するがEVIDENCE_GATED、OFFICIAL_BASELINE_VERSION_AUDIT_PENDING。今回解除・数値変更なし。

## 装備と根拠
回収DB hash9491bfc1cf357aed4967418949d78c0ddd73407c6461443a7b594a2b2710c810。新取得ではなくアプリ正規化済みユーザー書出し、取得日時/API版不明。防具66/706/68/685/709、限界突破最大スロットは3,3 / 3,2 / 3,2,1 / 1 / 3,3。珠はテンプレどおり（腕3珠）、護石見切り3+弱特1、武1-防1-防1は既存ルール一致。static-template-screen.json の装備/珠照合を再利用し、今回DOM読込の全MHDB照合・護石possibleも確認。装備差替えなし。

## 共通式の接続修正
ARTIA_ELEMENT_SOURCE_DB.lance.threePartBonusがnullで停止。しかしARTIA_STAGE_ADOPTION.normalElementRows.lance[3]に承認済み30（Sentinel_b67c836659e4819188a37beddccd300a、https://www.phantombrawlers.com/mhwilds/Artian）が存在。GSでも同じ共通式を根拠に補完済み。新しいランス固定値や旧補助+30の転用ではなく、元出典DBに値がなければ既採用武器種別素材表を参照するよう共通artiaSourceElementを接続した。明示値は優先、未知武器/素材数・資料版保留・未知復元の拒否を維持。

今回龍属性=基礎270＋同属性3素材30＋属性激化50＋属性復元0=350。生産攻撃3素材は攻撃側+15であり、素材の属性一致による30とは別。復元affEX/atkIII/sharpEX/affIII/atkEXを維持。原典からの基礎/激化/復元表と共通素材表の出典・承認をelementEvidenceへ記録。ゲーム版は未特定、実測済みにはしない。

同じ未記入欄を持つ太刀/ハンマー/笛/CBも採用済み共通表参照の対象となる（静的確認のみ）。GLはsourceVersionNoteガードが先に残る。既存明示値GS/SNS/DB/SA/IG/弓は数値不変。GS既存実テンプレ最小ハーネス1回を影響回帰として実行exit0、同属性480/既存通常最大/保存比較を保持。

## 公開実行
JSDOM、実テンプレDOM読込→calcBuild、通常643.5200000000001／最大1004.75。属性変換通常OFF/最大ON、採用最大バフ条件は既存契約、訓練場正面・最大斬れ味。正規4技ID/6Hit assert、属性350 assert、実数表示と比較表示確認。テンプレはランス1件のみなので同内容2保存、読込/共有条件比較/現在入力/保存内容不変。異装備比較ではない。

lance-first.jsonの初回失敗は公開計算後に診断取得realPipelineWeaponがthrowしcase保存前に終了したもの。数値RED成功と偽らない。lance-after.json exit0、lance-common-gs-regression.json exit0。diff/hash/コマンドはlance-manifest.json。Safari/実機/主用途カウンター/全武器全回帰/β最終は未実行。SNS腕・IG護石/なぎ払い飛燕の保留を維持。commit/push/統合なし。

## 独立受入
01a191c7-41a9-74f2-9739-27f8e5e6c4e2：共通素材参照修正とランス参考経路は限定受入可。追加実行なし。主用途カウンター未確認を維持。

太刀後の受入記録：LANの証拠はlance-manifest.jsonの当時のadapter hash。現在の太刀受渡し修正後にLANを再実行したとは扱わない。溜めカウンター、実機/Safari、全回帰の未確認を維持。
