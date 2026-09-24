# MH Wilds OCR v4.5.0

装飾品DBをMHDB日本語APIから全件取得し、端末キャッシュする版。

## 追加内容
- `https://wilds.mhdb.io/ja/decorations` を使用
- 装飾品DBをページングで全件取得（250件/ページ）
- `id / gameId / name / slot / rarity / kind / skills / icon` を保持
- `gameId` を長期識別子として保持
- localStorageキャッシュ: `DEV_MWWSKILLSIM_OCR_DECORATIONS_V1`
- OCRはDB取得に依存しない
- OCR後に「スロットLv」「装備種別(weapon/armor)」を使って候補を絞り込み
- OCR誤認識を許容した名前類似度で上位候補を表示
- 装飾品グループ構造（最大8グループ×最大3スロット）を維持

## 重要
MHDB API仕様上、装飾品は `slot` が「装着可能な最低/必要スロットLv」、`kind` が `weapon` / `armor`、`skills` に付与スキル、`icon` に色/IDを持つ。API仕様は docs.wilds.mhdb.io を参照。
