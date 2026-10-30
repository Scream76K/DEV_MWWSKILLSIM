# 刃鱗研装163：初回1Hit限定接続

OWNER_APPROVED_PROVISIONAL。承認 Sentinel_4543022b580481919ba2477e0043a636（2026-10-29 20:02 JST）。全列継続案は撤回し、無属性・採用通常本体1Hitを1回だけ評価する範囲。現行版実機未確認。

数値源は index.html BLADESCALE_FIRST_HIT_RULE。最大のみ canonicalPhysical.resolveSharpness を1.4へ置換し、context-attack:85 の効果を最大だけ抑制。通常、元装備斬れ味、匠、保存キーは変更しない。既存DBのHit数・順序を検証し、MV等は複製しない。反復/属性/特殊/reference/追撃は最大 BLADESCALE_FIRST_HIT_SCOPE_PENDING、通常の既存成立は維持。時間・消費・再充填は扱わない。

## 明示採用14技
- 大剣: GS_CHARGED_SLASH_3 / GS_STRONG_CHARGED_SLASH_3 / GS_STRONG_WIDE_SLASH_3
- 片手剣: SNS_SIDE_SLASH
- ハンマー: HAM_SIDE_SWING / HAM_VERTICAL_II / HAM_UPPERCUT
- ランス: LAN_MID_THRUST_I / LAN_MID_THRUST_II / LAN_MID_THRUST_III
- ガンランス: GL_SLAM / GL_SWEEP
- スラッシュアックス: SA_SWORD_VERTICAL（非覚醒の明示状態のみ）
- 操虫棍: IG_DIAGONAL_SLASH

選定理由: 既採用DB本体配列1Hit、reference/componentSourceなし、盾以外の通常武器接触技。打撃分類を根拠に盾を含めていない。その他技へ自動適用しない。

## 実行（合成装備契約・JSDOM公開calcBuild）
GL_SLAM、攻撃Lv5（基礎90×1.04＋flat9）の対照。緑なし49.12、緑＋鈍器3 53.61。刃鱗＋鈍器は通常53.61/最大65.50、白側は通常61.76/最大65.50。元色に乗算する誤りと、最大鈍器の残存を識別。
反復通常98.24、属性あり通常52.12、砲撃混在通常58.728はいずれも最大のみ未算出。保存2件（緑/白）の通常読込、共有比較、現在値/条件の復元一致をassert。
修正前は公開経路拒否、修正後は上記成立。before/afterともハーネスexit0。生出力・コマンド・hashは bladescale163-execution.json。追加再実行なし。

実行はGL_SLAM代表のみ。他13技、誤Lv、未知技、単独複数Hitの負例は静的のみ。実装備成立・ゲーム実測・全体回帰は未確認。分類は欠落→部分、限定接続の独立レビュー待ち。全体Doneではない。

## 根拠
- https://mhw.fuguai-online.com/2025/06/30/serure-jinrin/ （2025-06-30、元色置換の比較。盾/消費等の観測は今回の採用範囲へ拡張しない）
- https://kuroyonhon.com/mhwilds/program/skill.php （物理1.4、鈍器非発動。属性係数は今回非採用）

Git操作・Safari・ユーザー保存データ変更なし。最終β検証/ローカルLLM起動は未実施。
