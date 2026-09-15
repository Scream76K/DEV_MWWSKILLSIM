# v7.5.0 OCR slot-aware
- v7.4.1 OCR row reconstruction retained.
- Armor candidates are now restricted to the detected armor slot (head/chest/arms/waist/legs).
- Vertical proximity to the corresponding part label is weighted more strongly.
- Obvious status/UI fragments are filtered before DB matching.
- Confirmation UI remains rank 1/2/3 + 該当なし.
- Beta repository MHWSKILLSIM is not modified by this build.
