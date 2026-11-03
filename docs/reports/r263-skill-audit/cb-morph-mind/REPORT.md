# CB剣→斧変形追加Hit 心眼限定接続

基点7c6a37c、隔離branch himmel/stage3-mindseye-cb-followup。2026-10-30ユーザー承認により、単発CB_SWORD_TO_AXE_MORPHの既存斧強化追加4Hit物理だけを暫定接続。直接実機未確認。

既存DBのHit数/MV/属性補正を参照し、既存心眼条件（傷前切断肉質44以下）とLv倍率を加算前に一回適用。実ダメージは現在肉質。追加属性とビンは変更なし。既存本体の肉質種別受渡し不足も、この単発斧強化変形だけ既存切断契約から補完した。共通攻撃値への事前乗算なし。

正規技・単発・斧強化状態・DB追加Hit配列の件数/値/出典を照合。ED1/ED2/AED/FOLLOWUP_AEDには拡張しない。分類136は部分のまま、81/82維持。対象外8/85/103は変更なし。

## 公開最小検証
JSDOM公開calcBuild、CB103合成装備条件、攻撃5/挑戦者1/心眼3。実装備成立・実ゲーム検証ではない。
- 44: 総計 通常112.69→141.03、最大115.42→143.92（非正規化、浮動小数表現は生ログ優先）。
- 45: OFF/ONで通常・最大一致。
- 傷前44/現在60: 現在肉質で増加。傷前不明はORIGINAL_HITZONE_UNRESOLVED。
- 追加4HitのFormula入力はbase*1.04*1.3+9、最大はさらに挑戦者flat4。物理各Hitの心眼effectは1個、属性は0個、属性値不変。
- ED1/反復列は理由付き未算出。停止理由の実体はafter.json参照。
- 保存OFF/ON2件と現共有条件比較が一致、現在snapshotとstorage不変。

初回修正前ハーネスは下流guardを期待したが実際は本体肉質種別不足で停止しassert失敗(exit1)。失敗はbefore.jsonに保持。after-initialは初期修正状態の証拠、after.jsonが最終ソースの証拠。全体回帰/Safari/実機/F01注入/Lv1・2は未実行。計算式/入力/結果/hashは生ログとmanifest、製品差分はproduct.patch。

一般心眼条件・順序の資料: https://kuroyonhon.com/mhwilds/memo/21.php および https://kuroyonhon.com/mhwilds/program/skill.php 。これらを斧強化追加Hitへの直接検証根拠とは扱わない。適用範囲はOWNER_APPROVED_PROVISIONAL。
