# 守勢＋GL 通常／溜め砲撃の限定接続

2026-10-30。OWNER_APPROVED_PROVISIONAL。動画は砲撃表示の増加を支持するが、物理限定・flat後置の順序はユーザー採用であり実機証明ではない。

## 今回の変更
- 既存公開経路はMEDIUM通常砲撃へ既に守勢を渡していた。倍率を再生成せずstandardPowerConditionPlanの攻撃内訳を利用する。
- GunlanceShellReferenceは守勢発動時にも攻撃内訳の一致を必須とし、通常／溜めだけ許可。砲術・焼き砲の既存倍率→flat順を維持、火を変更しない。MEDIUMのFBは通常成立／守勢最大のみ未算出。
- GL_SHELL_WIDE_HIGHだけ旧表24/120→現行表21/110へ訂正。旧値をrevisionHistoryへ保持。HIGHは通常／溜めのみ。MEDIUM他段階値は不変。
- WIDE shellLevel3→HIGHのみ追加。現行MHDB weapon350/gameId36アルラスルークⅠはwide/3/raw160、既存保存資料の同武器は拡散やや強い（表示368）。他型level3は未許可。動画の武器IDは未特定で、この装備と同じとは主張しない。
- 公開adapter経由でも既知武器の型／段階矛盾を拒否。

## 最小公開検証
JSDOMからcalcBuild→共通Pipeline→専用Formula。MHDB350のメタデータ、カスタムスキルは合成契約入力。実装備合法性や動画の絶対値再現の試験ではない。
- 攻撃160×1.04+9、通常砲撃：通常39.034不変、最大39.034→44.2756。物理36.834→42.0756、火2.2不変。
- 溜め＋砲術3＋焼き砲：通常79.73608不変、最大105.653008→120.3006592。最大のFormula攻撃267.336→306.0864、火4.6不変。4スキル合成であり保存ケースには使用しない。
- 弾消費と残数は対照不変。HIGHのFB、守勢不正Lv4、武器段階不一致を固有理由で拒否。
- 通常砲撃の2スキル代表を保存→読込→保存1件対現在値比較。計算・共有条件・比較後状態不変。異なる保存A/B2件の検証ではない。
- MEDIUM通常最大10.7312は修正前と同値。MEDIUMのFBは通常成立、最大の総計はOFFENSIVE_GUARD_ACTION_NOT_ADOPTEDで未算出。

最終成功コマンド：node tools/gl-guard-connection-proof.cjs after、node tools/gl-guard-medium-boundary-proof.cjs（各exit0）。生出力connection-after-pass.json/connection-medium-pass.json。変更前HIGH拒否はconnection-high-before.json（保存した変更前ソースで実行）。
途中失敗を保持：英語aliasのIDなし入力を新検査が拒否したため既存alias契約を保持する修正、合成4スキルの保存上限、savedAtだけの比較差、FB実行statusと総計availabilityの区別。期待値を製品出力へ丸め合わせていない。F01実行器は未変更、今回は故障注入未実施。

## 根拠／制限
https://kuroyonhon.com/mhwilds/memo/10.php の現行／ver1.010旧表を分離。
https://kuroyonhon.com/mhwilds/buki/gannsu.php の武器名・段階対応は既存gl-applicability-audit/REPORT.mdを再利用。
MHDB取得先とhashはguard-connection-manifest.json、個体はmhdb-gunlance-350.json。
実機未確認のflat順序、HIGHのFB・他型他段階、守勢の他特殊成分へ拡張しない。分類66は部分を維持。製品3ファイルだけ今回変更、bundleの変更対象モジュールなし。元差分・保存データ保護、commit/push/統合なし。
