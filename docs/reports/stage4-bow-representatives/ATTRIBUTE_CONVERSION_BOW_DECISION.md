# こたつ弓：ID152の採用境界

対象はID152属性変換。ID133属性吸収（最大同属性3被弾、受けた属性で耐性加算）でもID165雷/181水の耐性変換でもない。152は明示発動時の龍表示属性flat Lv1/2/3=80/120/180。固定/龍追撃は注釈扱い。値の再承認は不要。

実ソース: index.html:7725 MHAttributeConversionRule、:7726 attributeConversionState、:5276保存通常読込、:7745共有比較復元。normal/maximumは独立ON/OFF、未指定null。adapter:651はchannel別未指定を拒否、発動状態をモンスターから決めない。従来公開証拠の通常OFF/最大ONは明示評価ケースで、全入力への自動既定ではない。

採用履歴: ATTRIBUTE_CONVERSION_CAP_CONNECTION.md:5はLS契約入力の龍本体、CM_CONVERSION_CONNECTION.mdはGS3技+変換（龍625→805）を実証。CONVERSION_SCOPE_CLOSEOUT.md分類節は集約referenceを未採用拡張として明示。PARTIAL39_ACTION_MAP.md:38もaggregate referenceを現gate外と記録。ADOPTED_SCOPE_RECONCILIATION.md:17のCM/Bowと各変換の総括は、すべての組合せを承認した証拠ではない。152の弓適用を明示承認した記録は今回確認範囲で見つからない。

現在adapter:473はisReferenceOnly全体を拒否し、採用弓3技も含まれる。停止を単なる旧guardと断定して外せない。③82/82はこの未採用拡張を含まない静的分類で、こたつ実ビルドの成立証明ではなかった。

最小採用提案（未実装）: 龍属性弓の既採用BOW_SHOT_3/BOW_POWER_SHOT_3/BOW_POWER_VOLLEY_3、今回のビンなし/適正距離の代表列に限定して152を接続。各channel明示ON時のみ既存80/120/180を倍率後flatへ一回、元武器属性基準の既存capを通し、BowReference.elementBasisへ受け渡す。物理・会心・Hit数は不変。通常OFF/最大ONは今回の明示評価条件、未指定は拒否。固定/龍追加ダメージ・千々矢・特殊弾/他専用経路へ拡張しない。係数の新設ではなく弓対象範囲の追加承認が必要。独立レビュー後に親がユーザーへ判断依頼。

ハーネス修正: closure内部への誤参照と未算出でもchannels存在を仮定したassertを是正。旧public-before/public-run失敗ログは保持。public-explicit-state.jsonはnormal OFF/maximum ONを明示し、こたつの正しい未算出、さらだの数値成立、保存2件/読込/比較成分一致と保存・現在値不変を確認してexit0。両ビルド成功や製品修正の意味ではない。製品hash不変。

## 採用・限定接続
Sentinel_9d657feeb0408191b8b7db81aa273379「はい」により上記龍弓3技/ビンなし/適正距離が採用。indexの既存152ルールへbowScope（技列・状態・承認来歴）を追記、係数は既存adds唯一源。adapterは正規bow referenceの同列/状態一致だけisReferenceOnly拒否を限定除外。既存resolveEffects→共通elementComponents→BowReference.elementBasisをそのまま使用。診断も実行referenceのeffectiveDisplayedElement/elementBasisを読む。別武器/専用属性/ビンへの解除なし。

after.json exit0: こたつ通常663.8690796000001/最大893.0267754、さらだ通常712.5190541820002/最大827.7434966820001。こたつ通常表示属性372、最大412+180=592、元属性capBase260/cap660。OFF/ON比較で物理値/Hit数不変、通常不変、最大属性だけ180加算。保存2件/各読込/共通比較channel一致、保存/現在条件不変。最大状態未指定は通常成立/最大固有理由で未算出、接撃ビンは採用外拒否。今回cap上限飽和の新規入力は未実行、式と実出力のcap basisを確認。

initial-after.json exit1は製品両方成立後に旧「こたつ拒否期待」のassertが失敗したログ。期待を新承認の成立/適用差/負例へ更新した最終afterはexit0。旧ログを残す。詳細hash/command/exitはattribute-bow/manifest.json、今回2製品だけの差分はproduct.patch。他武器全体の152適否は別監査であり、今回の成功から一般化しない。
