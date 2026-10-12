# KAN-17 正式DPS根拠整理・最小計測依頼

2026-10-11 / frieren（フリーレン）01 CALC。作業は指定-r250のみ。branch codex/integrate-r249、HEAD fb6d82cd525da9273af10ac6b719f330208608c5一致を確認。製品/DB数値/tests/Git変更、原本/GUILDアクセス、再委任なし。本報告・専有evidence/dpsのみ作成。

起点: Stage5/TECHNIQUE_AUDIT.md・evidence/technique/runtime-records.json、Stage3/DPS.md、Stage4/REPORT.md。14武器537レコード（V28/P321/U188）を正式DPSの件数と混同しない。成立確認0/14を更新する実機根拠は今回未取得。監査JSONは参照追跡用途であり数値正本ではない。技数値正本はindex内Technique DB。

## 23旧evidenceRefsの実追跡

rgで既存index・JSON・文書を検索し、正規evidence registry外の関連資料を実際に読んだ。資料の存在、同じ著者/武器のURL、旧IDの同一性、対象版verifiedは別判定。aliasをDBへ追加していない。[追跡証跡](evidence/dps/legacy-ref-trace.json)は全23件のexact mentionのパス/行と関連登録を保持する。r68 mappingは同一性監査用途のみで数値正本/独立出典ではない。

|旧参照|既存パス・locator|今回解決した範囲 / 残る事項|
|---|---|---|
|GAME8_2025_06_30_SNS_NERF|index.html内参照、独立原資料未特定|原資料URL/旧ID登録の完全解決は未達。参照の反復のみ|
|MACARONGAMEMO_SNS_VER1020_HISTORY|index.html:5107/5199 MACARONGAMEMO_SNS_R47_SOURCE|関連原著URL/履歴locatorへ到達。旧IDとの同一証拠・現対象版は未確定|
|KUROYONHON_SNS_DAMAGE_CURRENT|index.html内参照、独立原資料未特定|原資料URL/旧ID登録の完全解決は未達。参照の反復のみ|
|MACARONGAMEMO_GREAT_SWORD_VER1040|index.html:5107/5199 MACARONGAMEMO_GS_R47_SOURCE|関連原著URL/履歴locatorへ到達。旧IDとの同一証拠・現対象版は未確定|
|MACARONGAMEMO_GREAT_SWORD_VER1021_CURRENT|index.html:5107/5199 MACARONGAMEMO_GS_R47_SOURCE|関連原著URL/履歴locatorへ到達。旧IDとの同一証拠・現対象版は未確定|
|MACARONGAMEMO_LONG_SWORD_MOTION_CURRENT|index.html:5107/5199 MACARONGAMEMO_LS_R47_SOURCE|関連原著URL/履歴locatorへ到達。旧IDとの同一証拠・現対象版は未確定|
|MACARONGAMEMO_HAMMER_VER1011|index.html:5107/5199 MACARONGAMEMO_HAM_R48_SOURCE|関連原著URL/履歴locatorへ到達。旧IDとの同一証拠・現対象版は未確定|
|MACARONGAMEMO_LANCE_VER1021|index.html:5107/5199 MACARONGAMEMO_LAN_R48_SOURCE|関連原著URL/履歴locatorへ到達。旧IDとの同一証拠・現対象版は未確定|
|MACARONGAMEMO_LANCE_VER1040|index.html:5107/5199 MACARONGAMEMO_LAN_R48_SOURCE|関連原著URL/履歴locatorへ到達。旧IDとの同一証拠・現対象版は未確定|
|MACARONGAMEMO_LANCE_VER1040_HISTORY|index.html:5107/5199 MACARONGAMEMO_LAN_R48_SOURCE|関連原著URL/履歴locatorへ到達。旧IDとの同一証拠・現対象版は未確定|
|MACARONGAMEMO_SWITCH_AXE_CURRENT|index.html:5107/5199 MACARONGAMEMO_SA_R49_SOURCE|関連原著URL/履歴locatorへ到達。旧IDとの同一証拠・現対象版は未確定|
|MACARONGAMEMO_INSECT_GLAIVE_CURRENT|index.html:5107/5199 MACARONGAMEMO_IG_R49_SOURCE|関連原著URL/履歴locatorへ到達。旧IDとの同一証拠・現対象版は未確定|
|GIFTED_AUK410_IG_VER1040|index.html:5107/5199 GUM_IG_R54_STATE|関連原著URL/履歴locatorへ到達。旧IDとの同一証拠・現対象版は未確定|
|USER_CONFIRMED_SPIRAL_6_HITS|index.html:5107/5199 KUROYONHON_IG_R54_SPIRAL|内部確認記述を特定。元動画/意思決定記録と数値対象版を未特定|
|MACARONGAMEMO_HH_MOTION|index.html:6585 HUNTING_HORN_EVIDENCE.source|同一IDのsource URLとSOURCE_CONFIRMEDを特定。対象版・実測は未解決|
|USER_STANDARD_DECISION_2026-10-05|index.html内参照、独立原資料未特定|内部確認記述を特定。元動画/意思決定記録と数値対象版を未特定|
|USER_INGAME_CONFIRMATION_2026-10-05|index.html内参照、独立原資料未特定|内部確認記述を特定。元動画/意思決定記録と数値対象版を未特定|
|MACARONGAMEMO_GUNLANCE_MOTION_CURRENT|index.html:5107/5199 MACARONGAMEMO_GL_R49_SOURCE|関連原著URL/履歴locatorへ到達。旧IDとの同一証拠・現対象版は未確定|
|MACARONGAMEMO_CHARGE_BLADE_MOTION|index.html:5107/5199 MACARONGAMEMO_CB_R49_SOURCE|関連原著URL/履歴locatorへ到達。旧IDとの同一証拠・現対象版は未確定|
|KUROYONHON_CB_CURRENT|index.html:5107/5199 KUROYONHON_CB_R49_CHECK|関連原著URL/履歴locatorへ到達。旧IDとの同一証拠・現対象版は未確定|
|MACARONGAMEMO_BOW_MOTION_CURRENT|index.html:5107/5199 MACARONGAMEMO_BOW_R49_SOURCE|関連原著URL/履歴locatorへ到達。旧IDとの同一証拠・現対象版は未確定|
|MACARONGAMEMO_BOWGUN_BULLETS|index.html:BOWGUN_AMMO_SOURCE|弾資料URL定数を特定。旧ID registry・射撃単位/版は未確定|
|MACARONGAMEMO_DUAL_BLADES_VER1020|index.html:5107/5199 MACARONGAMEMO_DB_R48_SOURCE|関連原著URL/履歴locatorへ到達。旧IDとの同一証拠・現対象版は未確定|

HHはindex.html:6585 HUNTING_HORN_EVIDENCE.sourceが同一IDのURLを保持し、registry未解決から出典locatorまで進んだ。USER_STANDARD_DECISION/USER_INGAME_CONFIRMATIONは同6590付近のジャスト選択/響玉イベント記述に追跡できるが、元動画を発見/検証した意味ではない。関連登録を得た18件のうちHH1件は上記直接IDへ到達、残る17件は関連出典候補に留まる。関連registry無し5件にも内部記述/弾URLがあるが元証拠完全解決とは数えない。

### 履歴で済ませられること

- RELEASE_r234.md、HAMMER_VERSION_GATE_r233.json、現DB HAM_JUMP_CHARGE_1/2/3: MV履歴採用と属性/スタン未実測を分離。再度MVを推測する録画要求はしない。変更一覧にないことは変更なしの証明ではない（r233 rule）。
- CHARGE_BLADE_PROVISIONAL_MV_r235.json、CHARGE_BLADE_MEASURED_MV_r236.json: sourceVersion1.020.00の採用経緯が既存資料で追跡できる。放出I/II MV採用とビン回数nullは別。CB_SAEDは配列が存在してもSOURCE_CONFLICT/UNVERIFIED。対象版1.042.00.02照合を継続し、SAED/ビンなしvariantを混ぜない。
- GREAT_SWORD_MEASURED_EVIDENCE_r229.json: versionExplicitlyVerified=false。GREAT_SWORD_LIVE_CROSSCHECK_r230.json: 12行中MV一致11、相違1という既存記録。タイトルのliveはライブMHDB全武器検証を意味しない。一致を現対象版実測へ昇格しない。
- TECHNIQUE_LOCAL_CROSSREF_r224.jsonはkeyword indexのみ、r225はnumericalConflictResolved=falseを保持。検索hitだけでは競合解決できない。

## 14武器不足の分類

D=既存資料追跡、I=実装/接続不足、C=出典競合、M=対象版・条件の実機計測。時間は全武器の全録画依頼ではなく、実装と資料条件が揃った限定ルートだけを順次依頼する。

|武器|D:先に資料で扱う|I/C|M:残る対象|
|---|---|---|---|
|大剣|r47原著・r229/230、溜めvariant/版|正式producer/証拠契約I|限定STANDARDの連続時間・Hit/丸め照合|
|太刀|LS r47 source、赤刃state|producer I|赤状態3段の連続時間/条件|
|片手剣|SNS r47履歴、旧2出典URL未解決|producer I|同じ攻撃4技の時間/版|
|双剣|r50/51/52のHit/属性採用|PARTIALLY_ADOPTED C/producer I|鬼人化3段、HP成分のみ/時間|
|ハンマー|r234履歴は採用済、ジャンプ技とSTANDARD別|producer I、集中技特殊式I|STANDARD4技時間。ジャンプ全数は要求しない|
|狩猟笛|r56成分/r61音波式、6585出典|音波/響玉イベントmapping・handler I|イベント別の画面対応/版、接続後の時間|
|ランス|LAN r48 sourceと更新履歴|producer I|中段3+三段の連続時間|
|ガンランス|GL r49 source、砲撃/杭別成分|特殊handler/回数式 I|条件・成分分離が決まった後のイベント/時間|
|スラアク|SA r49 source/5Hit方針|STANDARD preset/正規コンボ接続 I|接続後の剣/斧state遷移・時間|
|チャアク|r235/236 sourceVersion差/variant|SAED C、phial回数null、ルート接続 I|各技イベント数・対象版。全DPS撮影はまだ不要|
|操虫棍|IG r49/r54、GUM、既存r55-60観測|SOURCE_CONFLICT C、extract state resolver I|不足する本体/猟虫分離・数値版。時間は後段|
|ライト|弾URL・通常/速射の単位|属性/速射formula/handler I|1発/速射イベント識別は契約後、時間後段|
|ヘビィ|弾URL・通常referenceと属性firstHitを区別|属性全発接続/handler I|装填/何発目/距離/全発イベント・時間後段|
|弓|r112-119 state/skill出典と既存動画locator|版/ビン未確認、handler I|固定ビン/距離/射撃位置の限定ルート時間|

## 最小計測依頼案（実機必要項目のみ）

最優先はGS一条件、一連続ルート。I項目（正式producer・証拠契約）は録画で解決しない。以下は依頼案で未実施。期待ダメージ/MV/time/Hitは指定しない。

### GS-01

- 技ID: GS_CHARGED_SLASH_3→GS_STRONG_CHARGED_SLASH_3→GS_STRONG_WIDE_SLASH_3（CANONICAL_COMBO_PRESETS）。最大溜めを固定し、既存同名variantとの一致を入力映像で判断する。
- 装備: MHDBで解決できる実武器1本。武器ID/revision、全装備/護石/珠、真攻撃/表示攻撃、会心、属性、スキル、斬れ味の実入力値を記録。無属性・会心0・追加追撃/条件バフなしを優先候補とし、存在する装備をDATA担当が選ぶ。架空装備/未取得値で埋めない。
- 標的: 訓練場の固定対象1体・同部位/同状態。対象名/部位/肉質の既存正本locatorを記録。部位肉質不明なら値null、絶対ダメージ照合を保留し時間だけ観測。移動標的/傷破壊/怒り変化は除外。
- 必要画面: 数値ゲーム版、装備/珠とスキル一覧、攻撃/会心/属性、開始・終了斬れ味、対象状態、入力overlay、各ダメージ表示/連続カウンタ。既存資料MVを逆算するために都合のよい肉質を仮定しない。
- 時間境界: CFR元動画のstartFrame/endFrame/fpsは取得までnull。開始は静止状態から第1技入力が受理され最初に動作したフレーム、終了は最終技後に規定した次入力（回避等）を受理できる最初のフレーム。境界定義と入力方法はserie/QAで合意してから撮影。ヒット接触だけを終了としない。連続ルートには技間遷移を含め、個別技時間の単純和で補完しない。
- 繰返し: 計画として独立3試行。試行間で斬れ味/状態/位置を復元し、全試行を保存。差異があれば理由を記録し、最良値のみ選ばない。
- 入力/除外: 溜め解除タイミング、各Hit帰属、キャンセル、空振り、ヒットストップ、FPS欠落を記録。空振り/意図しないbuff/異なるvariant/傷変化は除外理由付き保管。事前expectedHit数を満たすよう映像を切らない。

### CB-01（条件資料の整理後のイベント計測）

CB_ELEMENT_DISCHARGE_1を先に1技だけ対象に、榴弾/強属性を混ぜず盾/斧強化ON/OFF、ビン残数、砲術、高速変形、属性/斬れ味/標的を記録。本体・斧強化・ビンイベントを各フレームで別ラベル化し、読めないイベントはnull。必要画面は技開始前後のビンゲージ、強化表示、全ダメージ表示、入力、版/装備画面。start/end/fpsはnullから実測。予定3試行、同じ状態のみ集計。本体Hit数からビン爆発数を推論しない。放出II/AED/追撃は同方法が識別可能になってから追加。SAEDはr236/現DB/ビンなしvariantの資料齟齬整理が先で、全放出ルート録画を先行要求しない。

### IGは追加録画前に既存動画を再照合

USER_IG_VIDEO_A/B/Cとstatsのlocatorは現registryに存在するがnumericGameVersion=null、combined counterでbodyKinsectAssignment=PENDING。まず既存元動画の版画面/本体猟虫帰属/エキス消費フレームを探す。元動画不在なら再取得不能と記録。追加は不足した技/状態区間だけ（IG_RISING_SPIRAL_SLASH等）、猟虫別成分とTRIPLE_EXTRACT→NO_EXTRACTを可視化する条件設計後に行う。数値版/状態が不明な旧映像を時間正式証拠にしない。

## 段階的解放・契約

1. 出典locator/対象版/variant/丸め/時間境界を確定。正式レコードVERIFIED、MV採用、Hit/属性/回数採用、時間の実測を別字段で記録。
2. GS-01で元映像/装備DB/標的/計算traceをQAが照合し、同条件限定の正式producer契約をレビュー。監査側でVERIFIEDを生成しない。
3. 同経路の片手/ランス/太刀へ、必要な状態/時間の差だけを追加。全14武器録画は要求しない。
4. 特殊Handlerは資料・回数・接続・実測が揃った成分/ルート単位で後段解放。異武器比較条件は別承認。

## 検証・変更・未解決

新実行: 指定branch/HEAD確認、23旧参照のrg exact occurrence検索、既存registry/履歴読取、trace JSON作成。最初の広域grepは中断、追跡は除外付きrgの列挙へ変更。JSON生成初回はキー引用不足SyntaxErrorで書込前停止、修正後成功。外部出典再取得・ライブMHDB・実機撮影・テストスイートは未実施。外部原著再取得がなくても今回は既存locator追跡まで完了できるためネットアクセス要求なし。

変更2件: DPS_EVIDENCE.md、evidence/dps/legacy-ref-trace.json。古い証跡・製品/DB/testsは変更0。P1: 旧出典の完全同一性/対象版、正式producer証拠契約、CB回数/SAED、IG競合。P2: Handler重複/丸め・接続不足。chargeBladeComboDamage（index.html:3845）は専用resolverで検査後別成分式で再計算、二重加算実証なし。techniqueDbHits（index.html:5294）を技値入口として維持する。

影響: heiterへ旧出典locator・対象版照合、fernへGS-01最小映像/境界/除外レビュー、eisenへproducer/adapter/丸め責務、serieへ正式証拠契約の判断。統合は監査文書のみ可。数値正本更新・正式DPS昇格・公開不可。

構造検証: JSON parse成功、旧参照23件、関連registry18件（同一ID source特定HH1件）、未対応registry5件、武器不足表14行を確認。

現行locator再照合（CSS統合後）: index.htmlのregistry5107/5199、HH source6585、確認記述6590付近、chargeBladeComboDamage3845、techniqueDbHits5294。traceJSONの全exactMentionsを各現行ファイルから再取得。数値・判定変更なし。
