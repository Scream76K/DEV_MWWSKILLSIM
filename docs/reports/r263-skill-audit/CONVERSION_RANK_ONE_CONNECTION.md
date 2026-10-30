# 祭事/千刃rankIと変換の接続

既存NO_DIRECT_HP_EFFECTの正規5IDのみ対象。index内の既存ID/親名/技名表を凍結した一つの参照として共有し、producerの検証済み発動情報を計画へ保持。adapterはID/親名/rankI/2〜3部位/一意計画/発動情報/attackAdd0/mult1/条件/非火力scope/原典識別を照合。共通non_damageを一括許可せず、rankIIの既存枝も変更しない。

before公開calcBuildで祭事34rankI＋165、千刃167rankI＋152はそれぞれ変換guard拒否。afterは通常/最大とも完成。祭事Iは攻撃200/200、II開催一致は218/218。千刃I＋巧撃1は200/210、II＋巧撃1は200/220。雷属性550/550、龍500/680はrank間で不変。千刃Iの持続効果を新しい火力加算にしない。

保存通常読込、祭事I/IIの保存A/Bと共有開催34の保持を確認。有効GS技にcount1の不正発動を与え、計画unresolvedと変換guard拒否を確認。祭事の他3IDは同じ表/経路の静的確認。合成装備契約であり実装備合法性/実機の証明ではない。

初回2失敗はpre-adapter診断値を完成実結果と混同したassert、3回目は防具IDを再利用したfixtureの問題。すべてログ保持。製品は初回修正以降不変。最終公開効果レコードの倍率/flat、固定防具IDで検証しexit0。詳細raw/差分/hashはconversion-rank-one-execution.json。

152/165のrankI併用残件を本差分で修正。監査昇格は独立レビュー後に別判断。172の分類訂正は本差分とは別の既存受入証拠に基づく。commit/pushなし。
