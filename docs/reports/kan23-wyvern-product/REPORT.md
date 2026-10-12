# KAN-23 HBG竜撃弾2Hit・限定製品接続

基点origin/develop bb004859390899bf4af9b1f40154490b4e0bc3eeをネットワークで確認し、独立worktree `/Users/scream/.codex/worktrees/kan23-hbg-wyvern`、branch `codex/kan23-hbg-wyvern`で実装。直前の操虫棍成果は別worktree `codex/kan17-supported-components`に未コミットのまま保全。commit/push/統合/公開/Jira操作なし。

## 決定と数値源

オーナー・ゼーリエの今回指示によりHBG_WYVERN_AMMOを2HitへFIX。5爆発説の再調査・追加レビューは行わない。Technique DBの既存IDを維持し、旧レコードをreplacedRecordに完全保存。旧出典をhistoryEvidenceRefsへ移し、revisionHistoryに不採用理由と今回の決裁を記録。登録539件、変更は対象1件のみ、他538件は基点とJSON完全一致。

数値は対象Technique DBレコードに一元化：Hit1 MV80/火400、Hit2 MV19/火200、砲術倍率1/1.1/1.2/1.3、火強化倍率1/1/1.1/1.2＋固定0/40/50/60（表示属性単位）、食事なし0/アズズ飯5、護符なし0/あり6。元資料は `docs/reports/hbg-wyvern-video/CONNECTION_DESIGN.md`、`MEASURED_CASES_22.json`、`FOOD_CHARM_CONFIRMATION.md`。Hit構造は今回FIX、数式・適用範囲はPROVISIONAL。具体ゲーム版番号null、内部VERIFIEDへ昇格しない。生の旧5爆発値は現行specialSourceValuesから除き履歴のみで保持。

## 共通集計・専用Handler

新hbg-wyvern-reference.jsに再利用可能なCombatAttackAggregationとHBGWyvernReferenceを置く。既存calcAttackSkillが解決したweaponBase/normalMultiplier/normalFlatを受け、明示状態の外部加算明細を一度だけ加える。同じidの重複・未知値は拒否。

A=B*m+skillFlat+mealFlat+charmFlat。
D1=MV1/100*(B*m*artilleryMultiplier+skillFlat+externalFlat)+fire1/10*targetFireHitzone/100。
D2=MV2/100*A+(fire2*fireMultiplier+fireFlat)/10*targetFireHitzone/100。

11、12、火肉質30をHandler定数にしない。内部186.4などの小数を保持し、Hit別1桁表示のみ参考丸め。肉質は対象部位のfireを優先し、未選択部位では明示入力。既知0は有効。会心・斬れ味・物理肉質補正はこのモデルの物理へ掛けない。火強化はHit2のみ、砲術はHit1の基礎×攻撃倍率の物理のみ。食事・護符・攻撃固定加算へ砲術を掛けない候補を維持。

P0共通評価→専用Handlerで単発、追加参考テンプレadopted:hbg_wyvern、自由コンボ、保存比較に接続。既存通常弾テンプレ順序とSTANDARD火力指数・DPSの意味は維持。新しい時間/DPSを作らない。

食事・護符・その他バフは任意combatBuffsフィールドとして保存し、射撃状態・手入力火肉質はcombo.hbgWyvernStateで保存。旧JSON欠落は不明へ復元。比較時は保存ビルドごとのバフを読み、比較後の元状態へ戻す。新明細・PROVISIONAL・出典・攻撃内訳・Hit表示値をreferenceCombo.stagesへ追加し、既存JSONキーを維持する。食事/護符の新状態は今回竜撃弾参考計算へ限定し、他武器のSTANDARDへ自動加算しない。

## 成立範囲と保留

通常射撃状態、全2Hit命中、他バフなしを明示した場合に成立。今回許可するスキルは攻撃・砲術・火強化と既知の会心系（ビン/爆発に会心を乗せない）。その他の発動スキルは影響未照合として保留する。Artia、シリーズ等のactiveBonusEffects、混在弾コンボは保留。武器ammo情報がある場合はwyvernの正のcapacityを要求し、非対応は保留。情報なしの場合は実装備対応済みと数えず共通参考条件。異なる武器/肉質への式の利用はPROVISIONALであり新しい実機VERIFIEDではない。

版番号、丸めタイ規則、他バフや条件付きスキル・別モードの適用は未確定。未確認値を0へ変換しない。正式DPSは時間未確認のため保留。追加撮影・追加承認要求なし。

## 検証

新規製品DOM30件（22表示条件を含む）、Browser2件。REDはUI/Handler未接続による失敗、GREEN成功。途中、参考テンプレ追加順序で既存14武器fixtureが新テンプレを先に選ぶ退行を検出し、旧順序を維持。武器の竜撃弾装填ガード不足も追加テストで検出し修正。既存テスト削除/skip/期待値緩和なし。

|関連対象|合格|失敗|skip|
|---|---:|---:|---:|
|DOM：新接続、KAN-13、既存14経路、攻撃集計、HBG通常弾/スキル等|89|0|0|
|Node：旧22解析、Technique DB、保存JSON、DPSゲート|69|0|0|
|Browser：新375/1440px、HBG通常弾/スキル、KAN-13比較|6|0|0|
|既存出典監査ゲート|15|0|0|
|合計（関連テストのみ）|179|0|0|

375/1440pxで外部JS読み込み、3経路と保存比較、保留UI、横はみ出しなし、pageerrorなし。375px証拠を目視確認。Safari実機未実施。1491全件の再実行は指示どおり行っていない。今回の結果を全スイート合格とは扱わない。

変更：index.html（DB1件/接続/状態UI/保存伝播）、hbg-wyvern-reference.js（共通集計と専用Handler）、tools/kan23-wyvern-product-dom.test.cjs、tools/kan23-wyvern-product-browser.test.cjs、本報告と証跡。git diff --check合格。
