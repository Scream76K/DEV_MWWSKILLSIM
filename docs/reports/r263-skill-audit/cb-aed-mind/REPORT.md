# 心眼 CB_AED斧強化追加4Hit限定接続

基点7c6a37c、himmel/stage3-mindseye-cb-followup。2026-10-31受領のユーザー暫定承認。既存変形/ED1/ED2/追撃高出力未commit成果保持。
単発CB_AED・斧強化あり・正規DB追加4Hitのみ、傷前切断44以下で既存心眼倍率をflat前に一回適用。現在肉質で実計算。既存本体切断受渡し、前段/盾/消費条件を保持。属性/ビン/Hit数変更なし。CB1にはAEDがあるがON追加が傷破壊と重なるため、厳密直接比較済みにはしない。OWNER_APPROVED_PROVISIONALとPENDING_WOUND_CONFOUNDEDを明記。

## 公開検証
JSDOM calcBuild、合成CB103・攻撃5/挑戦者1/心眼3、前段ED2・盾強化あり・斧強化あり・通常ビン1。実装備成立/ゲーム実測ではない。
修正前：心眼ONでORIGINAL_HITZONE_UNRESOLVEDを再現、assert成功exit0。
修正後：44で本体/追加4Hit物理に各一回、属性・ビン不変。追加Formula入力はbase*1.04*1.3+9（最大+13）。45で不変、傷前44/現在60で現在肉質使用、傷前不明停止。OFF/ON消費後state一致。
ガード前段＋盾強化は既存CB_GUARD_AED_SHIELD_STATE_UNSUPPORTEDで拒否。反復列も未算出。保存OFF/ON2件共有比較一致、現在snapshot/storage不変。最終exit0。

## 静的componentSource照合と残件
現adapterのcomponentSource生成はCB斧強化追加Hitの1箇所。生成対象の変形/ED1/ED2/AED/追撃AEDすべてに限定ルールが揃い、DB配列の数/値/出典一致と単発条件を検査して物理のみ効果生成。属性は通過するが心眼effectなし、ビンは既存別処理。SA追撃、SAED、笛は既存個別経路を保持。
ただし136全体の完了根拠はまだ不足：同5技の斧強化OFFではcbMindEligibleがfalseとなり、Mind用damageTypeは通常Hit自身/標準契約に切断指定がなければnullとなる。今回の補完は斧強化ON単発に限定されているため、非斧強化本体の切断受渡し不足は別の具体的確認対象。静的指摘であり今回未実行、勝手にguard解除/分類昇格しない。

81/82を維持。Lv1/2、Safari、F01注入、全回帰、実ゲーム、斧強化OFFは未実行。対象外8/85/103保持。旧ハーネスのAED未採用負例は旧hashの履歴証拠として保持。commit/push/統合なし。
