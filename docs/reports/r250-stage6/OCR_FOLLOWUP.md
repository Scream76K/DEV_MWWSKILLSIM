# KAN-8 Stage6継続状態

実画像ground truth待ちを維持。Stage5の4種類の画像と未確定座標を変更していない。フルスクリーン・上下黒帯・枠撮影の独立goldenは0/3。Stage6で新規実機原画像、viewport、9行10境界、名前bboxの確定根拠は得られていない。

Stage5 OCR_GROUND_TRUTH.mdとevidence/ocr/ground-truth-audit.jsonのnullを維持する。合成crop不変条件のBrowser回帰と、実画像検出・Tesseract認識・実MHDB反映は別評価。今回実画像OCRの新しい成功率を報告しない。candidate_pending誤反映防止は既存回帰で確認する。

次に必要なのは各系統の未加工実機原PNG（全9行・同一版・言語・UI倍率、枠撮影は画面四隅を含む）と撮影条件、二者による独立viewport／10境界／7名前bbox注釈。過去4Kの7ROI記録や17.8%等の提案値は正解境界に昇格しない。新画像取得後にcrop画素一致を先に確認し、その後Tesseractと装備反映を評価する。

今回OCR製品コード・座標係数・DB・既存テストの期待値を変更していない。根拠取得が必要な継続課題であり、完了扱いにしない。
