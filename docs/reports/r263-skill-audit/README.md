最新第2照合は [PASS2_AND_ADOPTION_PROPOSALS.md](PASS2_AND_ADOPTION_PROPOSALS.md)。179行中、完全接続1（②採用範囲）、部分56、直接火力非対象76、入口欠落35、未照合11。以下の件数は時点別履歴。

最新の共通経路監査・下流修正は [ROUTE_AUDIT.md](ROUTE_AUDIT.md) と route-after.json。以下の初回分類・producer-only記録は履歴です。現在49部分/3直接非火力/127未照合、全件完了ではありません。

# 工程③ 初回監査・producer修正

基準製品6c71e818919379b0b0649d2389237470cbe3802f。今回ローカル、commit/pushなし。

## 原典・母集団

公開MHDB /ja/skills 全179件、通常137（armor71/weapon66）、set25、group17、442rank。取得時刻/版不明/ハッシュはsource.json。set/groupも同じ原典にrank名称・必要部位数があり別エンドポイントは不要。SKILL_INVENTORY.md全179行、skill-matrix.jsonに原典rank/部位数/14武器2channel/期待効果・単位・段階・上限排他・対象成分・関数証拠欄を設置。nullは未照合であり0ではない。

初回分類は黒蝕/灼熱の部分接続2、既存ID限定直接非火力3（耳栓/精霊の加護/回避距離）、未照合174。全件の式接続監査は未完。文字参照は候補箇所にすぎず完全接続へ昇格しない。非火力分類も状態/時間を含む全ゲーム影響なしとは意味しない。

## 旧Stage3資産監査と選択的再利用

元checkout6file差分と stage3-unfinished-a24f6a1/unfinished.patch は一致、SHA2565781b032f789a9531391ef06834e5657a2c465d0f83ed817adfcacdfa6194ed8。
- index.html: groupPlanのresolved/unresolved分離、未知activeBonusを保持、旧STANDARD入口の安全な未完判定。今回この4箇所のみ選択移植。
- hope-hammer-browser-adapter.js: effectPlanへの受渡し候補。旧SA/CB状態を含む行の全面移植は不可。
- min8/pipeline.cjs: L3 effects/unresolved構造検証候補。未採用。
- min8/real-one-hit-pipeline.cjs: applicability unresolved対応候補。未採用。
- min8/engine.cjs: 未解決効果を最後にissues追加する旧案。F-01の停止規則との整合を先に検討し、未解決のまま消費を進めない設計が必要。未採用。
- bundle: 生成物のため旧ファイルは移植しない。今回bundle所有module変更なし。

元資産は変更していない。6層再設計ではなく既存責務の局所接続を維持。

## 期待出力と実行

根性【果敢】（MHDB131/group3部位）と黒蝕一体Ⅱ（MHDB106/set4部位）が混在しても、解決済み攻撃倍率1.05を失わず、黒蝕未解決理由を保持する。未知を0/非発動に変換しない。原入力を変更せず、未知の必要効果がある総計を完成扱いにしない。

producer-before.jsonはstandardGroupPowerPlanが黒蝕一体Ⅱでthrowし、通常条件planまで生成できない反例。producer-after.jsonはnormal攻撃100→105、既知resolvedBonusEffectsと未知activeBonusEffectsを保持し、pendingへ黒蝕理由を伝える。基準/最大のplanコピーは独立。現在の公開Pipelineに残る入口/maximum条件ガードは解除しておらず、未知を含む総計の完成化は行っていない。この証拠はproducer契約の確認であり、全スキルのL3適用・最終ダメージ完了の証拠ではない。

## 最優先追跡

黒蝕一体: calcMaxAffinityに克服会心候補はあるがstandardGroupPowerPlan未登録。MHDB rank1感染、rank2感染時攻撃＋克服時追加攻撃。状態、rank別攻撃値、無我との重複、基準/最大の合法条件と実式の対応が未解決。既存会心表示だけで完全接続としない。

灼熱化: ScorchReference.damage/observed/expectedに固定・火属性と確率/クールダウン式。forRouteはdamageIncluded:falseで本体総計へ未接続。必要な対象Hit時刻・初期状態・発生列を調べる。新回数や数値の採用は今回していない。

次は各効果の対象/状態が未解決かchannel限定かを明示し、producer→L3→対象成分を追跡。未知1件で既知効果消失を直したことと、総計成立は区別する。④代表14build、全体回帰、DPS、公開・統合なし。
