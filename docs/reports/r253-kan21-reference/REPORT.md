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

## 追加静的照合：装填Lv未接続（再実行なし）

承認根拠：docs/reports/kan-21/REPORT.md:7–11（POWER_ELEMENT限定・全5命中・版・本体・盾補正・REFERENCE_ONLY）、index.html:5702–5712（approvalRefs KAN-21#10057/#10058、hitPolicy FULL_STOCK_FULL_HIT、hitCount/eventCount各5）。今回はJira原文の再取得ではなく保存済み承認参照の照合。命中5は限定採用条件であり、消費5だけから推定していない。

実入力はMHDB103、POWER_ELEMENT、盾true、斧false、enhancedPhial=true、砲弾装填スキルなし。保存traceはammoLoadingLevel:null、enhancedCount:5、normalCount:0、hitCount:5。815.977335は旧互換の全強化5本分岐であり、実装備Lv0の正しい本数接続の実証ではない。前節の成立報告はこの制限付きで読むこと。

フランメ契約はindex.html:5249–5252とtests/flamme-cb-saed-mixed-phials.test.cjsにあり、明示Lv0/1は強化3+通常2、Lv2は強化5。Adapter:92はスキルentryなし時chargeBladeState.ammoLoadingLevelへfallbackし、今回undefinedで旧enhancedPhial互換分岐へ落ちる。実装備なし=Lv0の接続欠陥であり、新承認の問題ではない。

最小修正候補は集計済み実装備入口でスキルなしを明示0へ正規化してreferenceへ渡すこと。旧単独APIの未指定互換は維持。今回追加実行なしの指示に従い修正・再実行なし。既存式によるLv0の静的期待値はビン500.916、合計759.193335（物理234.877335、属性23.4不変）。未実行の受入候補であり、保存ログを変更していない。
