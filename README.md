# MH Wilds OCR Step 1.25-C v4.1.1

## OCR DB icon frame rebuild

- 14 weapon icons use the user-confirmed mapping.
- Original supplied icon files are preserved byte-for-byte under `db_icons/weapon/raw/`.
- The weapon artwork itself is never resized.
- The in-game reference was measured as a 45×45 icon area with a 34×36 tight icon reference.
- The DB frame is generated outside the original artwork using that measured geometric ratio.
- The frame is a square dark/gray game-style border; transparent artwork background is excluded from NCC matching.
- Framed PNGs use `compress_level=0` to avoid additional PNG compression.
- The OCR matcher searches scales 0.20–0.60 because the framed DB assets retain the original icon resolution.
- OCR geometry remains: icon bottom-right is the vertical center of the OCR band; OCR band height equals icon height and width is approximately 7× icon width.
