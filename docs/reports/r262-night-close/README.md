# 夜間締め：Stage II 局所成果・朝の判断・未送信レビュー依頼

固定基点 e357f1beae822456aa6db314c06845cd2d375b06。全差分は未commit、未push。元Stage3 checkout、Safari、保存データ、serverは変更していない。Stage II全体完了ではなく、Stage III/IVには進んでいない。

## 読み取りレビューと最小是正

- IG: hope-hammer-browser-adapter.js:173–176でKINSECTだけを対象外化、空の本体Hit技は拒否。404で既存conditionKeyへIG_BODY_ONLY_KINSECT_EXCLUDEDを付加し、diagnostics.excludedComponentsとmetric.scopeも保持。虫0ダメージの成功値へ置換していない。
- 保存入力: index.html:4150 comboLBGStoredState、4151 restoreComboLBGState、7535 restoreHbgReferenceState、7540 compareStep5Snapshot。applyBuildSnapshot:5241/5243はpreserveCombo=falseの場合だけ復元。比較の7948はtrue、8306/8317は元装備の復元。UI命中数は装填容量と別フィールド。
- 共通対象: Adapter:39 resolveContactCountは入力1～6から現在の部位・距離を各命中へ明示展開。訓練場正面限定をUIで表示。APIの既存個別命中列は維持。
- 比較キー: Adapter:395–399のcontact scopeが元の共通条件キーを置換する欠陥を発見。originalConditionKeyをcommonConditionsとして保持する最小是正。両チャンネルから同じ元キーを使用し、二重ネストを防止。
- GL: Adapter:170–171で採用2本体技を含む列へ既存shellingResourceを付ける。319のshellingFormulaは実行時stateの残弾を参照。initialStateは318。min8/engine.cjs:176でチャンネルごとに初期状態をcopy、205でconsume、242で通常/最大を別実行。初期値への毎技リセットはない。

再確認はHBG/LBG保存比較の境界のみ。r262-contact-ui/hbg-key-final.json、lbg-key-final.jsonが最新成功。元hbg/lbg.json、review.jsonを保持。review.jsonの失敗は単独と比較のstandardEvaluation=false/未指定差を同じキーと期待したため。最終検証は単独との成分・総計一致、命中列一致、A/B共通キー一致、比較後完全復元を検証し、意味のある共通条件を捨てて一致させていない。

## 成果と実行証拠

1. IG本体限定範囲を結果・比較条件に明示。虫だけの技は対象外拒否。r262-ig-scope-hbg-contacts/ig.json。
2. HBG/LBG属性弾の明示1～6命中総計。物理減衰と属性加算を分離、LBG0.7二重適用なし。flat後続反復は暫定モデルと明示。lbg-cross-weapon.json。
3. GL本体/通常/溜め混在列。開始3→2→0、通常最大110.65。開始2では溜め不足、残1保持。r262-gl-mixed-resource/after.json、charged-compat.json。途中契約キー衝突の失敗ログ保持。
4. HBG/LBG画面命中数、通常save/load、比較共通条件、復元。HBG保存A2Hit39.8848/B3Hit66.17296、比較3Hit A58.79296/B66.17296。LBG保存27.91936/47.671072、比較41.155072/47.671072。r262-contact-ui/*-key-final.json。

## 朝の判断1：CB資源・派生契約

根拠の入口: https://kuroyonhon.com/mhwilds/memo/12.php 、既存TECHNIQUE_DB_SPEC_R72.md、docs/reports/r255-cb-ed1-state/README.md、index.htmlのCHARGE_BLADE_TECHNIQUES/PROVISIONAL_PHIAL_COUNTS。

確認済みは斧強化OFFのED Iが通常ビン1本消費するowner契約。既存爆発命中数ED I=1、ED II=2、AED=2、追撃AED=3は消費本数の根拠ではない。未承認消費数の候補を捏造しない。

質問案：
「次の採用技を状態付きで計算するため、(a)斧強化ONのED Iは何本消費し、通常/強化ビン混在時はどちらを先に消費しますか。(b)ED II・AED・追撃AEDそれぞれについて、今回扱う前段行動と消費本数を、斧強化OFF/ON別に指定できますか。通常/強化で違う場合はその差もお願いします。爆発の命中回数とは別の値です。」

盾突きの爆発命中数も未確定だが、今回の放出技列へ勝手に追加しない。必要なら同じCB採用範囲の確認に含める。任意コンボ/強化ビン消費順全般まで無制限に拡張しない。

## 解決済み：GL_SLAM 属性補正1を維持（朝の回答）

既存採用: GL_SLAM MV57、属性1。https://macarongamemo.com/entry/mhwilds-gunlance-motion の叩きつけ行と一致（ページ2025-06-29）。現在 https://kuroyonhon.com/mhwilds/memo/10.php の叩きつけ行はMV57、切断、属性2。GL_SWEEPは両資料ともMV40/属性1.5。今回は切断分類のみ補完、数値は変更していない。結果sourceRecordに数値差を残す。

過去の質問案（回答済み・再質問不要）：「GL_SLAM（叩きつけ）の属性補正を、現kuro資料の2へ、現行版実機未検証の暫定値として更新しますか。それとも既存採用版の1を維持しますか。」

変更時に影響するのはGL_SLAM本体の属性成分のみ。MV/物理、なぎ払い、砲撃火属性、消費数は不変。今回の無属性fixtureでは属性0のため総計110.65は両案を識別しない。今回は1を維持するため、この変更用検証は実施しない。

## フランメへのレビュー依頼文（未送信）

「Stage IIの武器固有式接続について独立差分レビューをお願いします。現時点は固定基点e357f1beae822456aa6db314c06845cd2d375b06＋ローカル未commit差分です。添付manifestのtrackedDiffSha256と各ファイルSHA256を対象固定に使ってください。承認・commit後はこの対象を製品SHAへ差し替えます。

対象はIG本体限定スコープ、HBG/LBG属性弾命中列とflat適用、GL本体混在残弾、画面入力/通常保存読込/共有条件比較と復元です。主要ファイルはindex.html、hope-hammer-browser-adapter.js、bowgun-element-reference.js。証拠はr262-ig-scope-hbg-contacts、r262-gl-mixed-resource、r262-contact-ui。最新キー修正後の保存証拠は*-key-final.json。旧失敗・旧first-Hit成功は全命中列の最新成功と混同しないでください。

14武器表STAGE2_REVIEW_SCOPE.mdの末尾最新版に基づき、必須成分の欠落、入力と条件キー、加算乗算順、通常最大の独立、特殊成分の重複/黙殺を確認してください。CB消費/派生は判断待ち。GL_SLAMはowner回答により属性1維持で解決済み。②全体完了のレビュー依頼ではありません。全面再設計/大量テスト/全技データ網羅/③全スキル監査は対象外です。JSDOMのみ、Safari/実機/CI未実行。訓練場正面限定・暫定回数モデル・既存reference scopeを保持しています。」

## 制限

実UI操作は隔離JSDOMのDOM経路であり、Safariでの見た目・実ユーザー操作は未確認。実機ダメージ、現行版保証、CI、全14代表build、全スキル監査、DPSは未実施。Stage II合意範囲の資料はSTAGE2_REVIEW_SCOPE.md末尾。旧IG四技STANDARDの復活は現採用単発本体とは別範囲。元資料/失敗証拠は保持。新規commit/push/レビュー送信はしていない。

朝の回答記録：Sentinel_2f73209af1408191b3023b8bbf7541f8「ガンランスの叩きつけの属性補正は1ですよね」。親の採用整理は1維持、2へ更新しない。資料差は履歴として保持し、②の採用判断ブロッカーから除外。製品数値・現行版検証状態は変更せず、VERIFIEDへの昇格なし。残る朝の採用判断はCBのみ。
