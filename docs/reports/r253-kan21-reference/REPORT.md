# KAN-21 単独SAED参照接続

## 判断と変更

既存 docs/reports/kan-21/REPORT.md と index.html の KAN21_SAED_SOURCE / phialReference を照合。承認参照 KAN-21#10057/#10058 は強属性ビン・満装填全5命中・参考値の限定採用であり、新しい承認や係数を追加していない。

元 SOURCE_TABLE_HISTORY_MOTION_CONFLICT は旧12/77/36と採用16/78/45の履歴差、PHIAL_EVENT_AND_FORMULA_PENDING は後続KAN-21の限定モデルで補われた範囲がある。一方 OFFICIAL_BASELINE_VERSION_AUDIT_PENDING と PART_MODIFIER_NOT_REPORTED_IN_SOURCE は今も未解決。トップレベル SOURCE_CONFLICT / UNVERIFIED / EVIDENCE_GATED は変更しない。

real-technique-one-hit-adapter.cjs は exact技ID、scope、出典URL/版、承認参照、暫定状態、全5命中、本体Hit契約を全て満たす場合のみ reference 成分を許可。通常SAEDは AFTER_VER_1_011、AED派生は VER_1_02_ONWARD。既存DB係数を既存式へ渡す。ゲーム版1.042での検証済みとはしない。

hope-hammer-browser-adapter.js は混在列の CB_SEQUENCE_STATE_TRANSITION_UNRESOLVED を保持。盾/斧/強化ビンのboolean欠損と属性会心未接続を拒否。返却に既存式のREFERENCE_ONLY / UNVERIFIED / 成分 / traceを保持し、diagnosticsをPROVISIONAL/referenceOnlyとする。単独・比較rendererに「参考値・暫定」を表示。

## 期待出力と最小実行

保存済み実MHDB CB103原典（cb103-conditional-ab-fixture.json のweaponのみ）。防具・装飾品なし、盾ON/斧OFF/強属性/強化ビンON、訓練肉質。装填拡張未指定では既存契約の強化5本。命中数を新規推定したものではなく、全5命中という限定前提である。

単独 CB_SAED：通常/最大とも本体物理234.877335、属性23.4、強属性ビン557.7、合計815.977335。DOM816.0と参考値・暫定、DPS未算出。混在 CB_ELEMENT_DISCHARGE_1 + CB_SAED：式は登録されるが状態遷移理由で合計未算出。

tools/kan21-single-reference-proof.cjs は実 calcBuild → 公開Pipeline → renderSummary を通す。factory wrapperは登録型を観測後に元関数へ委譲、計算結果/skills/plan上書きなし。result.json のchecks pass、両channelの成分・available・有限期待値・DPS未算出・混在拒否・DOMをassert。実行対象は44f9817上の未コミット修正、identity.jsonが実行後変更していない製品/ハーネスのハッシュを記録。コミット後実行と称さない。

## 限定事項

AED派生の許可条件と比較rendererは静的確認のみ、今回の実入力実行は通常単独SAEDと混在拒否のみ。保存比較の再実行なし。榴弾/属性会心/任意命中数/混在状態遷移/DPSの完成ではない。部位耐久不明値をHPへ適用しない。通常アーティア係数は朝判断待ち維持。

追加のゲーム数値承認質問は発生していない。次の開発調査は近接チャージマスターの既存出典・技別条件の確認。根拠が揃うまでは未算出を維持する。
