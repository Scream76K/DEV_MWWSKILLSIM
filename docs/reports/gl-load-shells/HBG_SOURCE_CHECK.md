# HBG竜撃弾：独立した構成差検証

現DB HBG_WYVERN_AMMO（r49、revision1）の根拠はMACARONGAMEMO_HBG_R49_SOURCE。
URL：https://macarongamemo.com/entry/mhwilds-bowgun-bullets
登録アクセス日2026-10-06、資料更新2025-06-29。今回再取得し、竜撃弾欄の「1 / 32.2(火50)×5」を確認。DBのimpactValue1、explosionValuePerHit32.2、fireValuePerHit50、explosionHitCount5と一致。5爆発は転記時に推測した値ではなく根拠表に存在する。

ただし、記事のVer1.011.00変更履歴は通常弾/散弾/徹甲の変更を列挙し、竜撃弾2Hit→5爆発の変更は説明していない。更新日を当該弾の実測対象ゲーム版と同一視しない。資料本文が表全項目を同じ版に更新した保証も確認できない。

原著 https://note.com/kehaar6/n/ne919a3e7c6cb はVer1.000.05.00の2Hitと1Hit目のみ砲術を記録。現在DBの着弾/5爆発と旧2Hitのイベント対応は未確認。計算上のイベント数とゲーム内Hitカウンター数も未照合。現DBhits配列は空で、未確定理由SPECIAL_FORMULA_AND_EVENT_COUNT_PENDING等を保持。

結論：根拠表とDBの値一致を確認できた。版差の原因/対応は未解明。旧「1Hit目」を現在の「第1爆発」に対応させず、砲術接続も行わない。HBG計算コード/数値/状態は今回変更なし。
次の独立検証：既存の現行版資料で着弾・各爆発・火の単位と版を特定し、旧イベントとの対応を確認する。新たなオーナー撮影依頼は行わない。

CB/徹甲候補は前工程TARGET_MATRIXとHit成分設計を維持。CBは榴弾爆発だけ、徹甲は着弾/爆発物理/火を別管理。未確定の全体値は未算出、強属性SAED/通常弾を変更しない。
