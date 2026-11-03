# 太刀実テンプレ・赤刃3技（限定独立レビュー受入済み）

KOTATU_LS_01（斬罪のエルガンシオMHDB1172）。テンプレ用途「居合カウンター／赤刃ループ」のうち既採用赤刃斬りI/II/IIIを1列確認。3技7Hit、反復ループ時間・ゲージ消費・居合カウンターまでは未検証。通る別用途への差替えではないが原典動画そのものの再現ではない。

回収DBは既存hash9491bfc1cf357aed4967418949d78c0ddd73407c6461443a7b594a2b2710c810（正規化済みユーザー書出し、取得日時/API版不明）。武器/防具700,649,650,19,618/全珠は既存static-template-screen.json照合再利用、今回DOMテンプレ読込も全装備MHDB一致。護石見切り3+鎖刃刺撃1、武1-防1-防1はpossible。装備・珠変更なし。抜刀術【技】は現リリース対象外のまま保持。

先のLAN共通素材修正を再実装せず使用。属性300=基礎270+同属性3素材30+攻撃激化0+属性復元0。生産attack3/復元sharpEX,atkEX,atkII,atkIII,atkEXの内訳はls-result.jsonのweapon.artiaCalculationEvidence。元テンプレpartsの正規化結果を実行ログに保存。

## 修正根拠
index.html GENERIC_STANDARD_PROFILES.long-sword（約6960）は3技全部をADOPTED/REDで採用。旧partPhysHz（1134）はこの太刀本体列に切断肉質を使用。新adapter STANDARD_NORMAL_HIT_CONTRACTはIだけ登録、II/IIIはDB damageType欠損のため:420でDAMAGE_TYPE_UNRESOLVEDとなった。II/IIIにも既存切断/部位補正1/RED契約を接続。新MV/係数/技・全太刀一括fallbackは追加しない。根拠は既存標準列契約の転送であり、新たな実測主張ではない。元TechniqueDB値・版ラベルは今回変更しない。

## 公開検証
JSDOM実テンプレDOM読込、練気RED/訓練場正面、黒蝕OVERCOMEを明示。通常643.5500000000001、最大946.8199999999999。正規3技ID/7Hit、龍属性300、通常最大完走、実数表示確認。通常/最大の既存条件バフ差を維持。2保存は同内容コピー（別太刀テンプレなし）、読込/現共有条件A/B/保存内容・現在入力不変。練気未指定では両channel総計未算出、RED復元で同結果を確認。

初回ls-before.json exit1は公開DAMAGE_TYPE_UNRESOLVED反例。ls-initial-green.json/ls-result.json exit0。最終コマンド/製品hash/diffはls-manifest.json/ls-body-forwarding.patch。追加他武器回帰・ゲーム・Safari・F01注入・全体β検証なし。LANレビュー01a191c7-41a9-74f2-9739-27f8e5e6c4e2受入記録は保持。SNS腕/IG護石・飛燕残件維持。commit/push/統合なし。

## 受入記録
01a191cc-1cde-70ab-95bc-9f8ac3f479e0：限定受入可、新指摘なし。今回記録時の製品追加変更・追加試験なし。実行版hashはls-manifest.json/ls-result.jsonのまま。居合、反復ループ、練気消費・回復、実機、Safari、今回F01注入、全体β回帰は未実行。旧REDを保持。
