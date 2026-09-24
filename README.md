# MH Wilds OCR Step 1.25-C v4.3.5

## 変更点
- v4.3.4のcore直接検出＋サイズ適応を維持。
- DB一致検索は0回。DBアイコンはgeometry calibrationだけに使用。
- 検出候補を個別に上から9個採用せず、X座標の一貫性とY座標の等間隔性をRANSAC/Grid的に検証。
- 9個の縦列として幾何的に成立した場合のみ装備9行を生成。
- 同一行に複数候補がある場合も、縦列モデルに最も整合する候補を選択。
- 9行が成立しない場合は後続OCRへ進めない。
- 成立時はpitch、X偏差、pitchのばらつきを診断表示。

## geometry calibration
- anchor offset X = core幅 × 0.22
- anchor offset Y = core高さ × 0.21
- OCR width = core幅 × 7.0
- OCR height = core高さ × 1.0

## 検証順序
1. アイコンcore候補の位置・サイズ
2. 9行縦列Grid/RANSAC整合性
3. 仮想アンカーの位置
4. OCR切り出し枠
5. OCR

OCR結果だけを見てgeometryを変更しない方針です。
