# オーナー採用：大剣チャージマスター限定接続

承認2026-10-25T21:29Z Sentinel_b67c836659e4819188a37beddccd300a「2件とも採用」。出典 https://kuroyonhon.com/mhwilds/memo/28.php と既存CHARGE_MASTER_SOURCE_RESEARCH.md。対象版未確定、現行ゲーム未検証。OWNER_APPROVED_PROVISIONALを保持。

唯一の係数定義MHGreatSwordChargeMasterDBをindex.htmlのデータ領域に追加。対象GS_CHARGED_SLASH_3/GS_STRONG_CHARGED_SLASH_3/GS_STRONG_WIDE_SLASH_3、正式MHDB24、Lv1/2/3=1.15/1.20/1.25。他武器へ流用しない。Adapterは対象技列に限り旧CM保留だけを除外、他のpendingを維持。L3のelement/multiply効果はevent.techniqueId条件で各技の属性へ一度。既存engine.elementComponentsのweaponBase*normalMultiplier+normalFlatを利用し、加算を乗算しない。物理へ適用しない。未採用GS技を含む場合は保留する。

結果diagnostics.chargeMasterAdoptionに承認・出典・版未検証を保持。各属性成分effectsAppliedに効果ID/source/status、単独・比較表示に暫定注記。Formulaのゲーム数値やbundleモジュールは変更なし。

## 最小実証

既存r253-skill-scope/fixture.jsonの実MHDB244（CM1/集中1、火450）と236（無属性スキルなし）。集計/plan/結果の手上書きなし。既定3技の公開calcBuild→saveNamedBuild→runBuildCompare→元236復元。

244：通常/最大836.85、物理266.11/282.74/202.61は保存済み修正前ログと一致。属性20.25/24.3/29.7→23.29/27.95/34.15、丸めを含むため最終値に一律倍率を掛けた期待値へ置換しない。各属性成分に効果1回、物理に0回。236は通常/最大375.73、効果なし。A/Bは各装備スキルを使い単独と一致、比較終了後のスナップショット復元、DOM表示をassert。result.json checks pass。

初回は除外成分のeffectsApplied未定義を検証器が許容せず失敗（harness-initial-failure.json）。次は未採用技がUI追加対象にならず既定列が残ったため補助assertが失敗（harness-selection-failure.json）。その補助経路を実証扱いしない。最終は実選択可能な2装備に限定。既存テスト削除/skipなし。非対象技の防止は静的確認、未採用技の公開計算成功は主張しない。Lv2/3、属性加算との併用は定義/共通engine経路の静的確認のみで追加実行なし。

実行基点b7f412635faca6eb55f4aead47b7c095ee2919f8＋未コミット変更。result.jsonの3コードハッシュで対応を保持。全体回帰/実機ゲーム検証なし。
