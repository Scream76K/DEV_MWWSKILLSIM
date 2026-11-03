# LAN 溜め3・当て身成功二連突き — 限定受入済み

ユーザー承認 Sentinel_655f6582c1908191b637c312f6e7e864。通常/最大は共有の「溜め3・攻撃出始めの当て身成功・両Hit命中1回」を明示し、既存スキル条件は独立。原装備 KOTATU_LAN_01（実DB1166、完成龍350）を変更していない。原典の主力用途に近い単発HP参考経路であり、動画コンボ/反復/DPSの再現ではない。

## 採用と変更
- Technique DB既存LAN_COUNTER_DOUBLE_THRUSTのMV33/50・属性1/1を保持。counterReferenceに1.7、承認/出典/未実機/公式版未確定を登録。
- 物理の係数段階でMV×1.7を渡す。Formulaはattack×MV×斬れ味×肉質×会心を丸めるので、これはattackflat込みの丸め前物理×1.7と同値。属性係数は変更しない。既存engine/Formula/bundleの最終内容は変更前と同一。
- 明示select→calcBuild→adapter、保存・読込・共有比較へlanceStateを接続。旧保存欠損は未指定。通常/最大の守勢等は従来の条件計画のまま、成功から自動生成しない。
- 単一技のみ。未指定/異なる状態/反復を停止。43不成立枝、他段階/他技/前段生成/時間/斬れ味消費は未採用。旧コンボ参考計算とDPSは保留でありUIにも明示、共通HP結果だけを使用。

出典: https://kuroyonhon.com/mhwilds/memo/9.php （33×1.7、50×1.7と当て身成功条件）、https://macarongamemo.com/entry/mhwilds-lance-motion （33/50・各属性1）。攻撃flatを含めた順序はOWNER_APPROVED_PROVISIONAL。資料照合は直接実機/公式現行版検証ではない。

## 公開最小検証
JSDOM、ユーザー回収実DB hash9491bfc1cf357aed4967418949d78c0ddd73407c6461443a7b594a2b2710c810。テンプレ読込ボタン/条件select change/公開calcBuild。ブラウザー実操作やゲーム実測ではない。

|channel|Hit1物理|Hit1属性|Hit2物理|Hit2属性|総HP|
|---|---:|---:|---:|---:|---:|
|normal|171.79|12.08|260.29|12.08|456.24|
|maximum|264.50|20.35|400.76|20.35|705.96|

- Formula入力MV56.1/85、攻撃237.3/325.895、会心60/100を捕捉。各物理の未丸め対照×1.7→2桁丸めと一致。最大は既存加算を含む完成攻撃、攻撃加算前の倍率にはしていない。
- 同装備/条件でDB倍率だけ1へ置換した合成対照（不成立枝の採用ではない）と属性各Hit同値。物理効果は各1回、属性には0回。
- 未指定/溜め2/失敗状態は固有guard、同技2回は単発guardで総計なし。standard4技6Hitは643.52/1004.75を維持。
- 同内容2保存の個別読込結果一致、共有条件比較2行一致、現在装備/条件/保存map不変。異装備A/Bではない。

## 証拠と途中経過
- tools/stage4-lance-counter-red-proof.cjs: 保存した変更前ソースから公開入口を再現。未登録canonical技をallowMissingで明示した入力でDAMAGE_TYPE_UNRESOLVED、期待RED確認exit0。成功時のUI利用とは区別。最初の同ハーネス試作はtemplate change不足でCURRENT_WEAPON_NOT_SUPPORTEDだったため是正し、最終REDとは区別。
- lance-counter-red.json: 初回ハーネスは公開catalog未登録のため技追加0件、assert失敗exit1。製品計算結果ではない。
- green-attempt1: lanceStateの入口転送不足、exit1。
- green-attempt2: damage-stage公開schema拒否、exit1。
- green-attempt3: 暫定post-damage方式でexit0だったがFormula内部丸め後と判明し不採用。合格証拠に算入しない。
- green-attempt4: coefficient方式へ修正、exit0。最終greenは境界/式対照/保存を追加してexit0。
- 最終 lance-counter-green.json / lance-counter.patch / lance-counter-manifest.json。旧失敗は保持。

未実行: 実機/Safari/F-01故障注入/全回帰/他段階/反復/時間/斬れ味消費。F-01エンジンは変更していない。静的82/82や④全体Doneを意味しない。commit/push/統合なし。

## 独立レビュー受入

01a19349-2d59-7781-a23e-c64ca805f1da：限定受入可、必須修正なし。MV33/50×DB1.7→56.1/85は既存Formulaの攻撃flat込み丸め前物理1.7と同値、属性不変。通常456.24／最大705.96、標準4技643.52／1004.75維持。同内容2保存であり異装備比較ではない。公開RED exit0は期待停止の確認で、火力計算成功ではない。attempt3は丸め後補正のため撤回済み。実機・Safari・F-01注入・全回帰・反復・DPS未検証。今回の受入記録は文書のみで、製品・テストの変更や再実行なし。
