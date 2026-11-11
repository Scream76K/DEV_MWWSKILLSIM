最新の公開参照基準は21d428aです。現在のボウガン標準とID163の直接承認照合は、末尾「後続の照合・表示修正」を参照してください。以下の過去チェックポイントは当時の記録として保持しています。

# C06 再読込・保存入力の実装追補（基準6df2116a）

既に採用されていた編集・比較入力の再読込復元を現行APIへ復旧しました。通常/最大を再計算し、保存した計算値やDPSを復活させません。旧形式の原記録・名前付き保存を保持し、破損・未知版・欠落IDは明示、部分適用を巻き戻します。欠落装飾品を空欄扱いにして数値を変えません。

実装はローカル候補段階です。全14武器の再読込、初回起動、旧形式、保存不可時の警告、競合、390px表示を限定検証。全ゲーム数値・Safari実機・完全ネットワーク切断時のWeb起動を認定しません。C01〜C05の採否と係数は変更なし。ID172後続決定の適用範囲は引き続き照合対象で、推測で採用/除外しません。[根拠・検証・限界](../docs/reports/reload-input-integrity-20261110/README.md)。

## 以下は今回追補前の記録（原文保持）

# 現行契約と仕様変更台帳

## 現在の実装・公開チェックポイント（2026-11-10）

確認対象は公開済み mainline [`6df2116a0cec4cf22ea42592f8d3de6d036d523c`](https://github.com/Scream76K/DEV_MWWSKILLSIM/commit/6df2116a0cec4cf22ea42592f8d3de6d036d523c)。C04/C05は `8f6e759e0745618bb26b26c0962bc62735426616` で統合済みで、その後の旧テスト環境修復・GL実行ID維持・保存入力と現行比較データ整合修正を含みます。C03の通常弾10射基準は引き続き未反映、弾Lvとライト速射は未決定です。採用仕様・優先順位・未決事項は変更しません。

同固定版の全件検証は公式1243件（1212成功/31失敗）、DOM533件（372成功/161失敗）、browser92件（23成功/69失敗）。GitHub CIの1506件・freshness94件・現行データ39件と非CB13武器26チャンネル（error0）は成功。source-only47件は同commitのローカル再実行のみで、このpushのCI再実行ではありません。出典・公開確認・残課題は [系譜の現在チェックポイント](../INTEGRATION_LINEAGE.md) と [固定版の検証JSON](../docs/reports/current-data-integrity-20261110/verification.json) を参照してください。全過去機能の同等性・全組合せ・実ゲーム精度・実機受入・β公開を認定しません。

本追補は実装・公開状態の整理です。[INTEGRATION.md](../INTEGRATION.md) と [INTEGRATION_VERSION.json](../INTEGRATION_VERSION.json) の未公開表示は作成時点の履歴（`SNAPSHOT_AT_BUILD`）として保持し、新しい製品検証や公開承認の代わりにしません。

## 仕様確認・第4段階実装時点の記録（履歴）

以下の対象SHA・hash・「隔離候補」は各確認時点の記録です。後続の実装・公開状態は上記チェックポイントと各契約の現行実装欄を参照してください。

版: 2026-11-10 / SPEC-20261110-01
状態: 最新の確認済み決定を反映。実装完了・全仕様網羅・公開承認ではない。
仕様確認時の対象（履歴）: 作業ブランチ work/integrated-latest-20261110、ソース確認時 HEAD 5be4c5c37a58234c55a2842051994e7a83ce9c55（4673a77から文書のみ変更）。
仕様確認時の製品 SHA-256: index.html = 755d47570753cda951cdb82244b8bef1a117031e91c540588b7f506fa2053d45、hope-hammer-browser-adapter.js = 440fc5e8d50ba84b8be1ddc3c10c734bffc42310b004d42cb5d99bd316120fe4。
後続の製品変更後は、この確認結果をそのまま再検証済みと扱わない。

C04/C05実装追補（2026-11-10）: 基準 `a772e58af777bf4702237b22d4bdf39ed3d2bd99` からの隔離候補。index.html `c3499eba8a8433525256967ffe6ca68587d8a6681c39cd214c2089d38d88dddb`、skill-effect-continuation.js `62f077d4941380661da5a7e07448e244ed1ec1098d06a957000cdba4aad2cab3`、skill-calculation-policy.js `3ca0b86404597ea92d1e6a5e644ad0c26e170a2d97521395241e47bfd9fec9b4`。adapterは上記440fc5e8と同一。今回の実行範囲・未実施・既存失敗は [検証記録](../docs/reports/skill-continuation-20261110/verification.json) で区別する。これは旧仕様確認を全製品の再受入へ読み替えるものではない。

## 正本と変更手順

- この文書を現行の承認済み契約・変更履歴・実装差分の入口とする。最新のユーザー明示指示が本文に優先する。未記録の後続決定を見つけたら先に反映し、旧仕様を復活させない。
- 優先順: 最新ユーザー指示・承認 → その決定の記録 → 固定版の実装・DB → 旧仕様・旧テスト・参考計算。新しいコードであることだけでは仕様承認にならない。
- 数値の正本は装備・スキルのMHDB、技・Hit・係数のTechnique DB。ここには数値DBを複製しない。
- 各変更は契約ID、決定日時、出典、上書きする旧決定、実装箇所、検証対象版、未完了を一緒に更新する。仕様状態と実装状態を別欄で管理する。
- オーナーは仕様の最終判断。ゼーリエは最新決定の整合と受入判断、ヒンメルは実装・統合、独立レビュー担当は差分確認。Jira assignee未割当を架空の実ユーザー担当へ変えない。
- 進捗の窓口は既存 [KAN-44](https://harasworkspace-36774503.atlassian.net/browse/KAN-44)、実装はKAN-66/47/108、UXはKAN-18/63、公開はKAN-40。本文を各所へ複製せず、この契約ID・固定commit・証拠へリンクする。
- リビジョン保存は同じ作業ブランチのcommitで行う。新branchは禁止、必要な開発方針分岐・試作時も事前にユーザー許可を得る。これは既存枝の削除や履歴書換えの許可ではない。

## 現行契約

### C01: 火力指標とDPS

仕様状態: 確定。
- 全14武器の通常・最大火力、コンボ火力、保存A/B比較を対象とする。
- 主表示は正規化しない実計算値。A=100は相対比較列だけ。基準Aが未算出でも、算出できた各ビルドの絶対値を消さない。
- コンボ火力は採用した各技・各Hitの物理・属性・特殊成分の丸め前実ダメージを単純加算。表示のために内部値を丸めない。
- DPS開発は中止であり延期ではない。コンボ所要時間・DPS・時間比によるコンボ重み付け、CBのR/H平均合成を現行の必須機能、実装着手条件、受入条件にしない。会心期待値等の採用済み計算式に含まれる平均まで禁止する指示ではない。旧DPS依存は安全に分離し、通常UIへ復活させない。
- 暫定採用値の出典と検証状態はDB・証拠で保持する。出典確認だけで現行ゲーム実測済みへ昇格させない。

出典: [KAN-44本文の2026-11-03最優先決定](https://harasworkspace-36774503.atlassian.net/browse/KAN-44)、2026-11-04直接引継ぎ Sentinel_6fd7c8971584819187d0529b9810f5a3（DPS中止・単純加算・非正規化・通常最大独立を再確認）。
上書き: r139のDPS必須、未検証DPSを一律保留する機能要求、10月の参考DPS追加要求。これらを現在の開発対象へ戻さない。
実装確認: consumerEvaluationPlan / evaluateConsumerCombat と比較表示の現行経路。旧DPSコードは残存しており、その存在は現行仕様を意味しない。今回文書更新ではUI全箇所を実行監査していない。

### C02: 通常・最大、CB、保存比較

仕様状態: 確定。
- 同じ技列・対象・武器状態に対し通常と最大のスキル条件を独立に適用する。A/Bと各チャンネルの状態・資源・結果を混線させない。
- CB基準は解放系Rを1回、高出力系Hを1回、独立開始して丸め前実ダメージを単純加算する。Rの終状態をHの開始状態に流用しない。時間比・平均・DPS・A=100合成へ戻さない。
- 保存→読込→各計算→比較→個別復元を同じ公開計算経路で行い、元のビルド・条件・保存データを保護する。
- 同内容2保存の成功を異装備A/B比較の成功へ読み替えない。実行・静的確認・旧証拠再利用を区別する。
- 未対応スキルの扱いは後続C05に従う。技データ・必須入力・資源の欠損を推測値で埋めたり、未処理成分を正当な0として完成総計にしない。

出典: 2026-11-01 Sentinel_81a8a4106964819190bbfb330c4c7965、最終追補 Sentinel_c4922dd02de48191966bf7f423a5e1f8、[CB独立合算の決定・限定受入](../docs/reports/stage4-bow-representatives/CB_INDEPENDENT_MIX_REPORT.md)。
上書き: CB単一列をR/H合算の代用にすること、旧時間比による合成。
実装確認: candidateのCB_INDEPENDENT_R_H_SUMとadapterの独立経路を保持。旧受入ログと今回の統合実行は別証拠。全CB装備・全スキル・Safari受入は本書では認定しない。

### C03: ボウガンの基準火力

仕様状態: 通常弾・10射・装填無視は確定。弾Lvとライト速射の採否は未決定。
- ライト・ヘビィとも通常弾1〜10射の連続合計を基準火力とする。
- 装填数・リロードは考慮せず射順を1〜10で継続する。ファーストショット・フォースショットは採用済みの該当射順の効果を反映する。
- 弾選択はコンボ火力側で扱う。
- 通常弾Lv、ライトの速射を含めるかは推測で決定しない。この未決定を理由に、確定済みの通常弾10射方針を属性弾1接触へ戻さない。

決定履歴（UTC、会話原文確認）:
- 2026-11-06 03:00:41 / Sentinel_062e7be92c8c81918e9bbd9abf0d2e39: 「１０発にしましょうか。出ないとフォースショットが含まれません」
- 03:01:10 / Sentinel_c442f0177c508191a8d5dfc3a65f8e71: 「ライトもヘビィも通常弾でいいですよ」
- 03:01:45 / Sentinel_621a8ed810a481918fd17478419bab25: 「コンボ火力計算のところで弾を選べるようにするので」
- 04:07:13 / Sentinel_a1051a71b6e08191947c61bd12d79ce0: 「連続して打ったことにして下さい。装填数などは気にしないでください」
- 同日正式DB検証依頼 Sentinel_63c4dfeb9b288191a360eb9ed3b6402c は弾Lv・ライト速射を未決定として維持。
- [KAN-44コメント11184](https://harasworkspace-36774503.atlassian.net/browse/KAN-44?focusedCommentId=11184) は5f1f733で未実装と記録。

上書き: 11/1の属性弾目標、11/5の属性弾1接触標準。明示的な属性弾計算経路そのものの削除指示ではない。
実装状態: **候補へ未反映**。確認対象index.htmlのconsumerStandardProfileはLBG/HBG_ELEMENT_FIRST_HIT_REFERENCEを選び、consumerElementAmmoChoiceはcontactCount=1、consumerStandardConditionsは初射を設定する。明示通常弾経路は存在するが、通常弾10射の基準実装ではない。旧経路で数値が出ることをこの契約の成功に数えない。

専用経路の追補: 明示された対応通常弾Lvを受ける `BowgunNormalReference.tenShot` と `MHWRealOneHitBrowserAdapter.evaluateNormalTenShot` を追加。装填数に依存しない1〜10射とFirst/Forceを個別評価し、保存値を変更しない。[実装範囲と検証](../docs/reports/normal-ten-shot-20261111/README.md)。これはC03の標準入口切替ではない。現行属性弾1接触出力は10射基準を満たさず、標準採用完了・実ゲーム検証済みとは扱わない。標準弾Lvとライト速射の未決定は維持する。

### C04: スキル採否

仕様状態: 下記のユーザー指定除外と条件は確定。
- 今回の火力計算から除外: ID8 抜刀術【力】、ID85 鈍器使い、ID103 抜刀術【技】、ID129 破壊王、ID138 研鑽、ID160 刃鱗増装。
- 装備・スキル表示・保存内容を削除せず、対象の火力効果と対象スキルを理由とする停止を外す。破壊王の部位耐久・傷破壊を火力へ足さない。
- 狂竜症、属性変換は最大火力へ反映。属性変換の固定ダメージは反映しない。採用済み対象条件・成分範囲を越えて別効果へ拡張しない。
- ユーザー指定除外、ゲーム上の非火力効果、未対応効果は別の区分として記録する。

出典:
- 11/1最終追補 Sentinel_c4922dd02de48191966bf7f423a5e1f8 はID8/85/103を明記。
- 10/30 Sentinel_496e182a8c108191a8471890da3a5ab7「いえ、今回は除外しましょう」は直前の鈍器使いの話題への回答。
- 11/5 Sentinel_f15f583ea1c48191980e38f435370681「研鑽は考慮しなくていい」。
- 11/5 Sentinel_51df24b45f488191baa3fd444371a403「狂竜症は最大火力に反映、属性変換は最大火力に反映（固定ダメージは未反映）、刃鱗増装は考慮しない」。
- 11/10 Sentinel_39815925717481918b126c5da1fb12b9「破壊王は計算対象外のはず」。

実装状態（公開済みmainline `6df2116a`）: **C04の6 IDの除外は統合済み**。`8f6e759e` で共有基盤に入ったskill-calculation-policy.jsを同一hashで保持し、装備・表示・保存を残したまま対象火力効果を除外する。ID163の標準比較限定境界は下記の別区分を維持する。全スキルの効果・条件を受入済みという意味ではない。

第4段階実装時点の記録（履歴。以下の「今回」「候補」は当時の範囲）:

実装確認: 第4段階候補ではskill-calculation-policy.jsのMHOwnerCalculationExclusionへ既存の上記6 IDを分離。値・API・採否の範囲は同一。破壊王は今回統合差分でLv1〜3を追加し、CB合算の除外注記も保持。検証範囲は[統合記録](../INTEGRATION.md)を参照。除外済み6件という事実を全スキル受入へ一般化しない。
別の限定境界（現行実装の事実、直接の採用根拠は今回未照合）: skill-calculation-policy.jsのMHStandardCalculationExclusion / MHIsStandardExcludedCalculationSkillは、ID163 刃鱗研装Lv1をstandardEvaluation===trueの標準比較だけで除外する。明示経路・装備・保存は保持する実装であり、上記6件の全域除外とは別。ここで7件目の全域除外を承認したり、明示経路まで除外を拡張したりしない。既存境界を保護し、直接のユーザー決定との照合対象として残す。
旧179件監査表・81/82・82/82等は当時の採用範囲とSHAの静的集計。現在の全14武器実行率や現在の除外数として再利用しない。

### C05: 未対応スキルでも計算継続

仕様状態: 2026-11-10の最新確定指示。
- 計算できないスキルの効果は無視し、他の計算を継続する。スキル未対応を理由に全体を停止しない。
- 未反映のスキル・効果、武器、Lv、通常/最大、理由を識別できるようにし、全効果反映済みとは区別する。未対応一覧を後続で作る。
- 未知の係数を創作したり、未反映効果を正常なゼロ効果と認定したりしない。
- この指示はスキル未対応についての変更。壊れた入力、未知の技ID、欠損した技データ・資源等の妥当性検査を無条件に削除する根拠ではない。

決定履歴（UTC）:
- 2026-11-10 10:22:56 / Sentinel_90828bf90b8c8191a77f89c76d5a389e: 「計算を止めるという選択肢があること自体許容できません」
- 10:23:34 / Sentinel_3d7c28ad238c8191adf1a1bf990ceba4: 「計算できなければそのスキルは無視すればいいのです」
- 10:24:32 / Sentinel_258bc28bd24c8191964eda1330ea93b0: 「そのあとは未対応スキルを一覧化すること」
- 10:36:06 / Sentinel_f22acd31d17c8191a65d9ceeff8757b7: 既存対策・検証の統合を先にし、その後で未対応・部分対応を進める。
上書き: 旧採用スキルの未対応を理由とする一律Fail-closed方針。技の必須成分失敗時の資源保護とは区別する。
実装状態（公開済みmainline `6df2116a`）: **未対応スキル効果を明示して計算継続する機構は、`8f6e759e` で共有基盤へ統合・公開済み**。正常な通常/最大channelの保持、失敗channelの限定再計算、装備・保存・入力/技/資源の検査、152/162の既存本体効果とGL162の未対応砲撃成分の区別を保持する。skill-effect-continuation.jsとskill-calculation-policy.jsは `8f6e759e` と同一hash。後続 `6df2116a` では不正な保存スキルLvを補完せず入力検証へ渡し、現行計算の未反映効果を比較・相談用データにも引き継ぐ。全スキル組合せで停止しないことや完全なゲーム数値を保証するものではない。

下記6188ケース/12376channelの走査は第4段階固定版の実行証拠であり、本追補で `6df2116a` の全rank走査を再実行したものではない。現在の検証範囲と残失敗は冒頭のチェックポイントを参照する。

第4段階実装時点の記録（履歴。「共有統合基盤へは未適用」は統合前の状態）:

実装状態: **第4段階の隔離候補へ実装・検証中、共有統合基盤へは未適用**。公開入口で元の通常/最大を独立に評価し、正常channelは完全保持、失敗channelはsource-validな未対応効果を明示して再計算する。元装備・保存・入力/技/資源の検査は保持。既存部分採用の152/162を優先し、標準GLの162は対応済み本体成分と未対応の砲撃への効果を分離する。旧全体停止を復活させず、条件・相互作用を未検証のまま完全値と表示しない。候補の全179スキル/442rank×14代表武器（6188ケース/12376channel）は算出・rank適用を確認、例外0。全装備/発動条件/実機精度の受入ではない。固定基準のfresh全走査と比較し、従来算出できた12232channelの数値変更0、未算出144channelを回復し残停止0。統合commitは別記録とし、[変更記録・限界・再現方法](../docs/reports/skill-continuation-20261110/README.md)および同フォルダの未反映一覧を参照する。

### C06: UI・保存と受入

- ビルド/サポートの外側配置と、装備/スキルの内側配置を別々に管理する。旧iPhone内部6:4要求を外側50:50で満たしたことにしない。
- 11/1のレスポンシブ方針と11/4のオーナー引継ぎを合わせ、実幅・可読性・実操作で受入する。数値比率の未解決部分を勝手に新仕様として確定しない。
- 通常UIのDPS・開発参考表示を復活させない。通常/最大の算出値、未算出理由、C05による未反映効果の区別を保つ。
- Safari/iPhone/iPad実機受入、製品計算検証、独立レビュー、mainlineへの統合、β公開は別状態。Chromiumの限定成功を実機承認へ読み替えない。

出典: [KAN-63](https://harasworkspace-36774503.atlassian.net/browse/KAN-63)、[KAN-18](https://harasworkspace-36774503.atlassian.net/browse/KAN-18)、11/4直接引継ぎ Sentinel_6fd7c8971584819187d0529b9810f5a3、[UI再開記録](../docs/reports/zeerie-ui-resume-20261104.md)。
実装状態: 今回は静的記録照合のみ。現行レイアウトと実機受入の残件は[統合記録](../INTEGRATION.md)と各UI課題で追跡。

## 武器別仕様の入口と未確定範囲

全14武器の技ID・順序の既存索引は[baseline-target-signatures.json](../docs/reports/stage4-bow-representatives/baseline-target-signatures.json)。これは11/1時点の固定記録であり、それだけを最新正本として実装しない。
- CB: C02と[独立R/H合算](../docs/reports/stage4-bow-representatives/CB_INDEPENDENT_MIX_REPORT.md)が旧単一列・時間比を上書き。
- LBG/HBG: C03が旧属性弾目標を上書き。通常弾Lv/速射のみ未決定。
- SA/IG: [11/4採用接続記録](../docs/reports/sa-ig-target-recovery-20261104.md)を参照。旧限定経路を目標の代替にしない。
- GL: [指定4技の接続・後続訂正](../docs/reports/gl-target-recovery-20261104.md)と今回統合の後続差分を照合。短混在列を無条件に基準へ戻さない。
- HH: 採用済みイベントモデルと技順・発生回数を保持し、[引継ぎ](../docs/reports/himmel-flamme-handoff-20261106.md)と統合差分を照合する。
- 弓: [11/5記録末尾の係数訂正](../docs/reports/standard-premise-recovery-20261105.md)が同報告冒頭の旧係数を上書き。旧297/12.852を復活させない。
- その他の武器も、目標採用、数値採用、実装接続、実行検証、実機検証を別状態で扱う。

## 今回の確認で分かった管理上の欠落

1. spec/00_SPEC_INDEX.mdがr139を「現行仕様のみ」と表示し、DPS中止等の後続決定と同期されていなかった。旧本文を履歴へ区分し、この台帳へ入口を一本化した。
2. ボウガン10射は決定済みなのに製品の標準入口は属性弾1接触のまま。C03に未反映として記録した。
3. 旧179件監査表、Jira、11月の採用・除外変更の版が揃っていない。ここでは現在の全件接続率を再算出・認定しない。
4. Gitの履歴包含だけで仕様保存を保証できない。契約ID→製品箇所→対象SHA→必要最小限の結果を対応付け、未包含の旧機能は[系譜記録](../INTEGRATION_LINEAGE.md)で追跡する。

本更新は仕様の復旧・差分明示であり、上記未実装を修正済みにするものではない。新しい仕様を独断で採用していない。

### C03 latest owner amendment (supersedes pending level/rapid wording above)
The owner now selects the normal ammo level supported by each weapon and rapid fire for LBG. After confirming ten consumed rounds / fifty hits, the latest instruction reduces LBG to FIVE consumed rounds / TWENTY-FIVE hits. HBG remains ten discharges. Each selected ammo record must be explicit and unique; no automatic highest-level or nonrapid substitution.
When First/Force application to all five rapid hits is unverified, retain calculable components and identify those skill effects as NOT_APPLIED / PARTIAL_REFERENCE. Do not stop other calculable components for these effects alone.
Implementation stage: dedicated selectStandardAmmo / evaluateRapidFiveShot are added; standard UI switching remains unimplemented. Supported rapid source paths are Lv1 and explicit baseLv2 + powder effectiveLv3. Native Lv2/Lv3 expansion is separate. Old pending statements above describe history, not current owner intent.

C03 standard-UI follow-up: the current candidate now selects weapon-supported normal ammo in the standard path, HBG10/30 and LBG5/25. Native LBG Lv2/Lv3 are added from directly listed source values, with nativeLv3 distinct from powder-upgradedLv3. Earlier dedicated-only statements describe the prior stage. Partial-effect warnings remain visible, unsupported rapid weapons are not substituted, and explicit saved combos are preserved.

C03 nonrapid follow-up: the owner explicitly selected five NORMAL discharges for LBG weapons without normal-ammo rapid capability. This yields15 contacts using the existing nonrapid formula and adopted per-discharge First/Force rules, ignoring magazine count/reload. Rapid LBG remains five consumed rounds /25 hits with unverified First/Force effects omitted and disclosed; HBG remains ten/30. Same-kind owner-standard comparison may include both modes, with the mode and shot/hit count identified per row. Exact weapon variant normal-ammo capability must be retained; missing source data is not replaced with a representative variant's capability. Earlier no-substitution decisions describe the stage before this explicit approval.

## 後続の照合・表示修正（21d428a基準）

公開参照基準は21d428a4658e74f2f07f260c43f1b3393e5b27f2。C03は対応Lvの通常弾を選び、ライト速射5発25命中／非速射5発15命中、ヘビィ10射30接触を標準画面へ接続済み。速射First／Forceは未反映と明示し、実ゲーム精度は未確認。冒頭の6df2116a等は各時点の履歴であり現在の未実装一覧ではない。

C04のID163標準比較限定除外は直接承認を照合済み。2026-11-05 08:31:49 UTCの標準比較で刃鱗研装を除外する質問（Sentinel_20af643222108191b47e9e88b6bb639f）に対し、08:39:39のユーザー回答（Sentinel_bd2fdf91f08c81918498c18deb7d917b）は「除外してOKです」。午後の刃鱗増装160の指示とは別件。既存採否は変更しない。ID172の後続直接決定は未確認のまま。

表示修正候補は、実モンスター部位の元キー・ID保持による識別、既存非表示の技／テンプレ／指定コンボDOM経路の通常最大別未反映表示、保存比較の対象外・別注釈表示。係数・肉質値・保存ID・スキル採否を変更しない。[根拠と限界](../docs/reports/shared-ui-disclosure-20261111/README.md)。

### Standard LBG rapid142/154 follow-up (86b653f baseline)
The five-consumed-round/25-contact standard route now accepts source-valid Latent Power142 and Peak Performance154 only when the existing condition plan is resolved. Normal retains the existing inactive premise; maximum consumes the existing affinity/attack-flat producers. No coefficient change or explicit single-trigger scope expansion. Full-health conflicts, other skill gates and rapid First/Force omissions remain. The previous full skill matrix is historical at86b653f; a20-case142/154 delta and109-check proof cover this narrow change. See [scope and verification](../docs/reports/lbg-rapid-common-skills-20261111/README.md).

### Standard LBG rapid81 follow-up (9d0bd43 baseline)
The standard five-consumed-round/25-contact route now accepts source-valid Counterstrike81 ranks1–3 through the existing resolved conditional plan. Normal retains the inactive-buff premise; maximum adds the existing KNOCKBACK_BUFF +10/+15/+25 to attack once and uses that value for every contact. Existing flat bonuses combine once through the same producer. Explicit single-trigger scope, other gates and rapid First/Force omissions remain unchanged. This is a source-reference adoption, not live-game uptime/version verification or validation of arbitrary externally modified plan payloads. See [scope and verification](../docs/reports/lbg-rapid-counterstrike-20261111/README.md).
