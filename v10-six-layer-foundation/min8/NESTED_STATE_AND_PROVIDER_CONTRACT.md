# V10 min8 — ネスト状態契約とDB参照固定の受入条件

## 今回追加した実装
- 消費イベント: `resourcePath: (string|nonnegative integer)[]`, `amount: finite nonnegative number` によりネストされた資源量を参照する。`resource`単体フィールドは互換用途。共通実行器がDB定義の値に従い期待状態を計算し、Handlerの`nextState`と全体照合する。
- 状態遷移イベント: `operations:[{op:'set',path:[...],value}]`を順番に適用。パス重複と存在しないキー、危険なプロパティ名は拒否。従来の`updates`は互換用途。
- Hit時点の前状態から共通効果と成分を算出し、Hit後のイベントで状態を変更する。状態更新が不正なら予定イベント未完了でL5総計・DPSは未算出。
- 新規Node回帰テスト5件を追加した。現GitHub HEADでの実行結果は未確認。

## 依然必要な構造保証
- 技DBの取得済みキーはsession内コピーキャッシュ。装備と効果も取得済みキーで同様。ただし**未読キー**は後からProviderに初アクセスするので、元DB更新が混入し得る。
- Providerは比較開始時に読取対象の装備・技・効果定義を固定したデータセット/トランザクションを提供すること。開始時点の版名指定だけでは足りない。
- DB Providerの固定範囲: game, equipment, technique, effects、対象DB、および評価で使用する条件定義。寿命: A/B×normal/maximumの終了まで。下流への変更可能オブジェクト参照は禁止し、読み取りは複製を介す。
- 同一比較の条件は実際のtarget/condition/technique revision/時間定義に基づいて指標別評価。単純JSON項目順や表示用signatureを使わない。
- 実DBスキーマ、非可換遷移、複数リソースの原子的消費、ゲーム内数値は未検証。

**判定:** 6層の構造契約の一部を補強。完全な構造成立とは認定しない。
