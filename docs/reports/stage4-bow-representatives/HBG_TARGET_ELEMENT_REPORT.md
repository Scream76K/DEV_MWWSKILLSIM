# HBG属性弾：MHDB弾種名の接続是正／実代表は保留

HH目標4技の独立受入後に選定。新係数・新範囲を採用せず、既存属性弾入力とMHDB対応弾の名前照合だけを是正。名前照合のみ独立レビュー01a1956c-7a04-76b6-ac7e-09422cc1d37aで限定受入可。基準属性弾は未成立、保存比較は未実施。

## 根拠と差分
`hope-hammer-browser-adapter.js:305–310` の共通属性弾状態解決で、UI/肉質のfire/iceをMHDBのflaming/freezeへ照合する。water/thunderは同名。属性名自体・Lv一致・容量・Formula・スキルguardは保持し、未知名はnull。回収実DB（SHA256 9491bfc1cf357aed4967418949d78c0ddd73407c6461443a7b594a2b2710c810）の武器1094はflaming Lv1 ammo517/容量2。これは新しいゲーム数値ではなくschema対応の漏れ。

## 公開経路実行
JSDOMで実DB初期化→KOTATU_HBG_01テンプレ読込ボタン→公開技追加/入力同期/calcBuild。原装備・22発動スキルを保持。火炎Lv1・明示3接触・適正距離・特殊モード0・容量2・第1射・満タンを使用。これは今回の明示例であり、基準全体の命中数固定でも原典散弾用途の検証でもない。

変更前：通常/最大ともHBG_ELEMENT:WEAPON_AMMO_UNRESOLVED。`public-probe.json`のexit0はハーネスがexecution.completeだけを判定した誤りで、成分/総計は未算出。成功には算入しない。旧ログ保持。
変更後：ハーネスはmetricsも確認しexit2。両側ともHBG_ELEMENT:SKILL_INTERACTION_UNSUPPORTED。対応弾判定を通ったことは確認、ダメージ計算成立は未確認。`after.json`/stderr参照。

## 残る具体的境界
`hope-hammer-browser-adapter.js:810`の属性弾併用guardに、実武器固有ID160刃鱗増装Lv1が該当。通常/最大とも装備時点で停止する。既存別射撃の係数や固定射数を属性弾へ流用せず、スキル除去・装備差替え・guard解除はしていない。次の判断対象は属性弾における160の発動状態と物理/属性成分への適用範囲。これが最後の障害とは断定せず、後続系列/条件属性guardも残す。新しい係数・状態をここでは提案採用していない。

## 検証限界
保存/読込/共有A/Bはこの属性弾ケースで未実行。通常最大とも総計が止まるため、基準成立や保存成功を捏造しない。共有resolverのLBGとiceは静的波及のみ。実機/Safari/F01注入/全回帰なし。HH/CB受入証拠は再利用として保持し再実行していない。製品変更はadapterの名前照合のみ、index不変。最終hash/実行exit/差分はhbg-target-element/manifest.jsonとincremental.patch。commit/pushなし。
