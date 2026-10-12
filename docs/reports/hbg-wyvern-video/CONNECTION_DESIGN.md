# HBG竜撃弾 実装準備仕様（レビュー用・製品未接続）

2026-10-12。ゼーリエ承認PROVISIONAL統一モデルを活用し、残条件を明示して進める。製品接続の可否は本設計レビュー後にゼーリエ判断。具体ゲーム版番号不明。539旧戦闘値変更なし。

## 最新実測と22条件

護符なし/アズズ飯あり/攻撃0/砲術2/火0、同HBG/対象：表示攻撃165、初段169.6、次段37.4。OWNER_CONFIRMED。従来予測だった条件を新実測としてCHARM_OFF_MEASUREMENTS.jsonに追加した。古い文書の「未計測」は過去時点の記録で、本仕様が更新状態を示す。
初段=0.8×(160×1.2+5)+12=169.6、次段=0.19×165+6=37.35→37.4。
従来18＋護符なし砲術0の2＋今回砲術2の2＝22ダメージ条件。重複を含む検算ケース数であり、22独立撮影/全組合せ網羅ではない。表示攻撃の照合は別件。固定加算非砲術モデルは今回条件でも支持されたが内部構造完全確定ではない。

## A 共通攻撃集計案

責務：装備集計が次を根拠/状態/検証区分付きで返す。
- weaponBase：MHDB武器基礎＋既存の生産/復元仕様。Artia完成固定値へ二重加算しない。
- skillMultiplier / skillFlat：既存calcAttackSkillの倍率/固定加算。内部小数を保持。
- externalFlatEntries：食事、所持護符、既存外部バフごとのid/value/active/source/verification。未知valueはnull。重複不可グループ/加算範囲を持つ。
- conditionalEffects：既存STANDARD/Handlerの条件ルールから解決した明細。外部効果として再加算しない。
- attackTrue / unresolvedReasons：必要状態未確定なら完全値を返さない。

A=weaponBase×skillMultiplier+skillFlat+externalFlatTotal。今回externalFlatTotalは食事候補5＋護符6/0であり、11という技定数を置かない。食事5は暫定根拠＋オーナー条件、護符6は独立差分で支持、同じSOURCE/VERIFIEDに揃えない。
現行attackComponents3項は保持し、段階的に拡張案を別承認。全武器へ無条件に新外部加算を有効化せず、既存外部状態なしビルドは従来挙動を維持する。保存の拡張は任意フィールド/schema移行を審査し、旧JSONの欠落を『バフなし確定』へ変換しない。旧比較数値を新バフで自動補正しない。UI側で式を重複定義しない。

## B 専用Handlerの案

新しいHBG_WYVERN_TWO_HIT_PROVISIONAL_MODELを独立候補プロファイルとして設計する。旧HBG_WYVERN_AMMOの5構造を置換/修正せず、sourceCandidateRefとconflictReasonを保持。採用後の数値源もTechnique DBへ一元化し、コンボ/HandlerへMVを重複定義しない。539旧レコードからの更新ではなく追加プロファイル案であり、追加採用はゼーリエ判断待ち。
Handler入力：モデルID、共通攻撃成分、砲術Lv、火強化倍率/加算、対象部位fireHitzone、弾適用/モード/射撃状態、検証条件。出力：Hit順序とphysical/fire各成分、rawTotal、表示用値、PROVISIONAL、根拠、複数保留理由。
D1=(MV1/100)×(weaponBase×skillMultiplier×artilleryMultiplier+skillFlat+externalFlatTotal)+(fire1/10)×targetFireHitzone。
D2=(MV2/100)×A+((fire2×fireMultiplier+fireFlat)/10)×targetFireHitzone。
候補MV1/2=80/19、fire1/2=400/200。初段の12は火400×今回火0.30の条件結果、12を固定定数にしない。対象fire0は有効な既知値、未知は未算出。武器属性種別が無属性でもHit火成分は対象fireを参照する。
ただし、肉質の汎用変更や別武器/モードの値は今回モデルから自動VERIFIEDにしない。撮影条件から外れる入力は候補適用範囲として審査し、未承認条件には理由付き未算出。全成分成立後だけ完全総ダメージを返す。
P0共通評価入口で専用Handlerを1回呼び、単発/参考/自由へ共通利用。保存比較は同じ入力と結果の検証詳細を伝播。旧powerIndex/相対100/DPSは意味を保持し、この変更でDPS開発を再開しない。

## C 残条件と判断材料

5爆発対2HitはUNRESOLVED。旧5構造に砲術を適用しない。本候補を独立した限定モデルとして進める選択肢を提示し、5構造解明まで全開発停止とはしない。
護符6差分はOWNER_CONFIRMEDで支持。食事5独立測定未完、対象版番号、火肉質30の設定直接確認、丸め位置/タイ規則、他バフ・別武器への一般化は未確定。根拠と範囲付きPROVISIONALとして維持。追加撮影要求なし。
選択肢：①本設計をレビュー後、共通攻撃集計の状態/保存互換を先に最小実装し、限定プロファイルを別工程で接続（推奨）。②HBG限定でバフ値を直接入力する迂回案は正本/重複リスクがあり非推奨。③全内部仕様確定待ちによる停止は不要。

## D テストと影響

新tests/hbg-wyvern-provisional-model.test.cjsは製品へ接続しない解析回帰。22観測条件と2つの丸め/加算範囲ガード、24テスト。Python Decimalの検算スクリプトを実行して予測を取得し、観測の期待値は独立固定する。最新2条件が無い状態で失敗を確認後、最新実測を追加して合格。係数の本番採用テストではない。
攻撃0〜5/砲術0〜3/火0〜3/護符ありなしは観測された組合せのみ。全144組合せ等を検証済みにしない。37.35→37.4は仮定ROUND_HALF_UP表示で一致、ゲームのタイ規則は保留。
他武器/保存比較は製品ハッシュ保全と既存Node/DOM/Browserスイートで確認。新HBGモデルの3経路/保存接続テストは実装後に追加する計画であり、今回済みとは報告しない。欠損数値/状態、二重バフ/砲術、内部186.4保持、旧JSON、正規化指数を回帰対象とする。

作業場所r250、codex/integrate-r249、HEAD fb6d82cd525da9273af10ac6b719f330208608c5。commit/push/merge/rebase/公開/Jira操作なし。製品接続承認をゼーリエへ依頼する資料。

## レビュー補完：条件付き効果の契約

初回限定モデルのsupportedConditionsは常時攻撃スキル/護符/承認された食事/砲術/火強化のみ。既存conditionalEffectsは共通評価入口が検出し、非中立/不明な条件付き倍率・加算があればCONDITIONAL_EFFECT_SCOPE_PENDINGとしてHandler呼出前に保留。既存ルールを参照し、未知効果を0として無視しない。Handlerは条件スキルを再探索/再適用しない。
将来範囲を広げる際は効果idごとにcomponentTargets（初段砲術対象物理/初段非対象物理/次段物理/火）・stage・source・appliedOnceを審査し、共通resolverが一度だけ解決。resolver未承認の効果をnormalFlatへ混ぜない。状態snapshotを3経路/保存比較で共用し、従来LEGACY評価と新PROVISIONAL_PROFILE評価を別に表示/保存し、旧JSONを新式へ自動移行しない。
実測同期テストを追加：MEASURED_CASES_22.jsonに条件ID付き表示実測を保存し、独立期待値と22点を照合。最新元JSONの護符なし砲術0/2のHit/条件も照合。これは解析用観測台帳で、数値DB正本や本番係数ではない。
