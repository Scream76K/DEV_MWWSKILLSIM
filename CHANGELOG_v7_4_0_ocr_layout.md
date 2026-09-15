# v7.4.0 OCR layout-aware matching

- OCR now keeps Tesseract line coordinates and uses screen labels as anchors.
- Weapon/armor/charm/decoration matching is category-specific instead of comparing every line against every DB category.
- Armor candidates are associated with detected armor-slot labels rather than assigned purely by OCR order.
- Decoration candidates use the decoration DB directly.
- OCR comparison adds conservative Japanese OCR normalization and character-bigram similarity.
- Landscape and full-screen modes use the same layout-aware sparse OCR path.
- Confirmation UI remains: rank 1 default, rank 2/3 selectable, 該当なし.
- Decoration auto-equip remains deferred.
