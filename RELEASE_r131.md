# r131 — ガンランス実測成分の型付き比較

- `gunlanceTypedComponentIntegrity`: 物理・属性・砲撃・竜杭の4成分を非負有限数として検証。欠損、負値、オーバーフローを拒否。
- `gunlanceTypedComponentComparison`: 実測・既知成分のA/B差分と増減率を個別に算出。基準ゼロでは増減率をnullとする。
- `window.BuildComparisonEngine`に診断APIを公開。
- **実測値を入力した場合の診断のみ**。砲撃・竜杭の係数やイベント数を推定せず、STANDARDやDPSへの昇格なし。
- 既存のUI、Technique DB、OCR、テンプレート、保存処理は変更なし。
