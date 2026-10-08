# r53: 通常ダメージと部位耐久補正の分離

## 結果

双剣STANDARDは乱舞Ⅰ・Ⅱ・Ⅲの採用済みHit別データで通常ダメージ比較が可能になりました。27Hit、MV合計393、属性補正合計20です。採用済みという状態を実機検証済みや現行バージョン監査済みに変更していません。

部位補正は部位耐久用の係数です。通常のHPダメージに掛けていたgenericProfileDamageの誤りを修正しました。大剣STANDARDの物理部分は従来値の1/1.2になり、属性部分は変わりません。通常ダメージに部位補正0が掛かってHPダメージまで0になる誤りも防ぎます。

## 計算とデータ

- 物理期待値: 武器倍率 × MV/100 × 物理斬れ味 × 物理肉質/100 × 会心期待倍率。
- 属性期待値: 表示属性値/10 × Hit別属性補正 × 属性斬れ味 × 属性肉質/100。
- 比較火力は既存仕様の丸め前期待値です。実機の表示ダメージやDPSとは区別します。
- HitのMV・属性補正に欠落・非数・負数がある場合は計算を拒否します。属性補正を1と仮定しません。
- 部位補正は技DBに原資料どおり保持します。未記載のものは未記載のまま、計算traceではnullです。partModifierAppliedToHpはfalseです。
- 部位耐久ダメージ計算は未実装です。HP比較可能を部位耐久計算可能とは扱いません。
- 双剣3技のみcalculationStatus=READY_ADOPTED_HP、calculationScope=HP_DAMAGE_ONLYとします。通常Hit readerはその採用状態と数値を確認します。
- 双剣の部位補正の保留理由はnonBlockingReasonsに移動し、fieldVerification.partModifiers=UNVERIFIEDを維持します。監査画面も通常ダメージ比較可と部位耐久未対応を分けて表示します。
- revision=3。r51のMVのみ、r52の属性採用時の状態を履歴に保持します。旧一括乱舞レコードの資料競合・計算保留は継続します。
- 他の未検証技、操虫棍の資料競合、全技DB COMPLETE、DPS用所要時間の確認は今回解除しません。

## 根拠

2026-10-06に本文を確認。部位耐久の意味は明示された用語と、HP計算式にその係数が含まれないことを照合して判断しました。

- [まかろん: ダメージ計算式](https://macarongamemo.com/entry/mhwilds-damage_calculation) — 物理・属性のHPダメージ計算式。
- [KUROYONHON: 狩猟笛](https://kuroyonhon.com/mhwilds/memo/8.php) — 響周波の係数を「部位耐久値への補正」と明記。
- [まかろん: 大剣モーション](https://macarongamemo.com/entry/mhwilds-great_sword-motion) — 部位補正0と1.2のHitを保持する根拠。
- [まかろん: 双剣モーション](https://macarongamemo.com/entry/mhwilds-dual_blades-motion) — r52採用済み属性補正の変更履歴。ゲーム基準1.042.00.02が現在の公式最新版であるとの確認ではありません。

## 検証

`node --test tests/*.test.cjs`で53件すべて成功。読取り専用レビューで重要な指摘なし。通常HPと部位補正0・1・1.2・未記載の独立性、欠落属性の拒否、双剣27HitのNORMAL/MAX、大剣の物理補正修正、既存武器回帰、監査UI、5つの組込自己テスト、inline JavaScript構文を確認します。r46の数値fixtureは書き換えていません。実ブラウザとゲーム内での検証は未実施です。
