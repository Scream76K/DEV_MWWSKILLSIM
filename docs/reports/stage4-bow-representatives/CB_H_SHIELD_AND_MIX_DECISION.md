> 後続変更：時間概念は2026-11-01 13:23の承認で廃止。現在のミックスは [CB_INDEPENDENT_MIX_REPORT.md](CB_INDEPENDENT_MIX_REPORT.md) の独立各1回単純合算。本書の時間残件は当時の履歴であり再要求しない。

> 最新追記：2026-11-01 13:09 JST限定案承認後の実装は [CB_H_CONNECTION_REPORT.md](CB_H_CONNECTION_REPORT.md) を参照。以下の保留記述は採否前調査履歴。H限定公開検証は独立レビュー01a19553-e2e8-77f7-9f1f-9f3923e4e288で限定受入。R/H時間比合成は未完了。

# CB H盾突き・時間・ミックス残件（読取調査）

最新追補（2026-11-01）: [追加10フレーム読取・時刻/hash](cb1-shield-limited/approved-readout.log)を参照。旧Swift失敗exit1→通常AVFoundationデコード失敗exit2→保存許可不足による未実行の拒否→ユーザー明示許可後の正規再申請で10PNG取得成功exit0、という時系列。下記本文の未取得・失敗記述は当時の記録として保持する。

独立確認 01a19546-718c-7040-8f31-22825d3b8920 で10画像のHit増加、残留表示、変形方向、hashを確認。CB_AXE_TO_SWORD_MORPH（MV30/属性1、EVIDENCE_GATED）が方向候補で現Hの逆方向と不一致。逆方向の斧強化追加4Hitを流用しない。本体2＋爆発1と整合するが成分同定未完、消費0は未確定。盾強化あり・剣強化なし・榴弾・本体2＋爆発1・消費0の暫定案と方向修正はユーザー承認待ち。製品変更なし。

製品はR152受入hash7456d598…ddd05eのまま。新製品変更・テストなし。

## H成分の対応

|対象|既存根拠/実装|不足・判断|
|---|---|---|
|H先頭変形|index CHARGE_BLADE_STANDARD_PROFILES.AED_ROUTEはCB_SWORD_TO_AXE_MORPH。CHARGE_BLADE_TECHNIQUESでは剣→斧側の盾強化斧本体/斧追加4Hit扱い|盾突きは剣側。原典操作表の『斧：変形斬り』→盾突きとID方向の照合が必要。CB_AXE_TO_SWORD_MORPHもDBに別途存在するがEVIDENCE_GATED。無断差替え・移行自動生成をしない|
|CB_SHIELD_THRUST|index:5386付近 phial榴弾0.05/強属性1.5、count:null。axeBoostHits:null。phialEvents CANDIDATE、暫定爆発数registryに登録なし|係数の再承認を求める問題ではなく、盾強化等の成立条件、爆発数、在庫消費/遷移の採用が不足。0回や1回へ補完しない|
|CB_AED|既存本体・追加4・爆発2、盾突き/ガード前段の高速変形契約、消費1/斧強化0.5|SHIELD_THRUST前段を明示したAED単体の既存証拠はあるが、前段盾突き自体を計算した証拠ではない|
|CB_FOLLOWUP_AED|本体・追加4・爆発3、前段AED、消費1/斧強化0.5|H全列成立の代替ではない|

停止点：index chargeBladeTechniqueComponentsは盾突きのcountEvidence欠損でPHIAL_EXPLOSION_COUNT_UNVERIFIED。adapterはOBSERVED phialReferenceと資源計画からビン成分を作る。MHCBDischargeResourceRules.predecessorsには盾突きそのものの資源契約がなく、解放技の消費1/0.5を盾突きへ転用できない。盾強化OFFで爆発0の枝も現在のcount欠損を無視して勝手に解除しない。

## 既存映像・原典

CB1既存解析 `/Users/scream/Documents/Codex/2026-10-27/task/video-review-cb1/READOUT.md` は8.5〜11秒/50〜52.5秒のAED前に盾突きがあると記録。解析目的は心眼本体/斧追加比較で、盾突き爆発数の分離記録ではない。爆発表示の反復から新たな発数を決めない旨も明記されている。新動画抽出は今回していない。既存映像が足りないと断定して再撮影依頼へ飛ばず、この盾突き区間の限定再読が次の根拠取得候補。

原典を今回限定再読：[チャージアックス資料](https://kuroyonhon.com/mhwilds/memo/12.php)。爆発補正表（web抽出2527–2536）は盾突きの既存0.05/1.5を支持。操作表531–557は斧側から剣へ戻る変形と盾突きへの接続を示す。今回読取だけでは盾突きの厳密爆発回数・装填在庫消費を確定する記載を特定していない。正確なゲーム版/実機検証と資料主張を区別する。

工程② STAGE2_ACCEPTANCE.md:29は盾突き自体の爆発を明示的に採用外としている。単に数値がコード内にあることから採用済みに昇格できない。

## 最小の次案

1. H先頭IDを操作方向/元合意に照合。現在の剣→斧IDのまま剣盾突きへつなぐ矛盾を隠さない。
2. 既存CB1の盾突き区間を限定再読し、盾強化明示・1回両本体Hit命中時の爆発数と在庫変化が識別できるか確認。既存係数と共通榴弾式は再利用。識別できなければ、爆発数/消費を根拠なしに提案値へ埋めず、その2項だけの資料または暫定採否へまとめる。
3. 最小採用範囲は当該H列の通常盾突き1回、明示盾状態・公式ビン種、固定した剣強化条件。爆発数と消費が採用されてから専用component/resource計画を追加。未知状態/反復/他盾技へ広げない。現時点では具体的回数の採用提案を確定できない。

## TR/THと指標設計は別残件

index:5398付近 CHARGE_BLADE_EVIDENCE.routeTimingはR/Hともfps30・startFrame/endFrame/durationFrames=null、CANDIDATE。profile側durationFramesもnull。chargeBladeVerifiedRouteDurationsは未検証時間を拒否。既存r262 CB README/ハーネスとCB1読取に正式採用されたR/H開始終了フレーム値は今回見つからなかった。攻撃のおおまかな区間や動画全長から時間を逆算しない。全資産に存在しない保証ではない。

10/5の時間比wR=TR/(TR+TH)、wH=TH/(TR+TH)は既存承認方針。旧chargeBladeCompositeRatioはR_X/R_A,H_X/H_Aを加重する相対指標であり、非正規化主表示へ復活させない。R/H各ループ実ダメージ、所要時間、時間比を別列で保持する構造が最小。混合主値を『加重ループダメージ』『時間当たり値』『共通時間窓総計』のどれとするかは単位が異なるため、既存後続合意と照合が必要。今回どれかを新規採用していない。

今回結論：R受入を記録。Hは純粋な許可表追加だけで完成せず、盾突き発生/資源条件と冒頭変形方向が具体的残件。製品実装は行わず根拠整理で区切る。

## 既存CB1限定再読追記

[限定読取結果](cb1-shield-limited/READOUT.md)と[保全manifest](cb1-shield-limited/manifest.json)を追加。後半48–49.5秒の斧→剣変形→盾突きは技表示で確認。盾突き爆発数・内部消費は未確定。追加細粒度切出しはSwift/SDK不一致でexit1、既存フレームの読取のみ成立。製品/計算テスト変更なし。
