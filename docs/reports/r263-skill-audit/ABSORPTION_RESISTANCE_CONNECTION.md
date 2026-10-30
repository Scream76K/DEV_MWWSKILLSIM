# 属性吸収133と耐性変換：最大吸収属性の限定入力

承認：2026-10-29 10:23 JST Sentinel_532b68435ea8819184f8b4e2254e383d。通常未発動／最大同一属性3被弾を維持。UIは受けた攻撃の属性のみ、弱点/敵名推定なし。保存はexplicitAffinityStateへ追加し、通常読込復元、比較は現在共有条件、旧保存の値なしは未指定。

数値源はMHDB133 rank説明の耐性+4/+6/+8と既存maximumHitCount=3。共通耐性producerは従来の装備耐性totalを変更せずabsorptionPlanとして最大寄与を分離。既知一致なら12/18/24、別属性なら0、未知/未指定は最大側だけABSORPTION_ELEMENT_REQUIRED。既存負耐性拒否は維持。adapterの最大L3属性flatに変換係数を一度だけ掛けた寄与を渡し、元属性capへ合流。既存武器属性吸収flatの3被弾表は変更しない。ボウガン/混在被弾/可変回数は新採用しない。

公開calcBuildの合成太刀水500・水耐性10・133Lv3/181Lv1：通常540、最大は水吸収716、火吸収620。未指定は通常540で成立、最大のみ理由付き未算出。耐性200では元属性cap1150。全成功ケースで物理成分不変。UI選択から計算し、保存2件を共有水吸収で比較、通常読込/比較後状態復元一致。旧保存にフィールドなしを再現し未指定/最大未算出を確認。

初回afterは保存時刻を比較した検証側assertで失敗。既存buildSnapshotComparableを使用して製品変更なしで再実行、exit0。前後生出力/失敗ログ/hashはabsorption-resistance-execution.json。太刀Lv3のみ実行。弓/雷/Lv1/2は静的、実装備・実機未検証。分類昇格なし。先の最小統合smokeはこの変更前の証拠。

## DOM changeイベントと追加2経路
製品変更なし、最終hash不変。隔離JSDOMでselect.value設定後にchangeイベントをdispatchし、inline onchange→公開calcBuild→adapter呼出数増加とsnapshot保存状態を確認。実ブラウザ/Safari操作ではない。
弓・水吸収Lv1：耐性+12→水flat48、既存吸収flat50、通常540/最大638。大剣・雷吸収Lv1：耐性+12→雷flat60、既存吸収flat70、通常550/最大680。いずれも最大寄与effect一件、通常成分不変、未指定最大不成立→選択後成立。2契約入力のみ、Lv2/全武器/実機は未実行。生出力absorption-resistance-event.raw.json、exit0。
