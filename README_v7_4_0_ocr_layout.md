# MH Wilds Skill Simulator v7.4.0

OCR development build for `DEV_MWWSKILLSIM`. This build is intended to improve screenshot import without changing the friend-facing beta.

Flow: screenshot -> sparse OCR with coordinates -> detect UI labels -> category-specific OCR/DB matching -> confirmation -> apply.

The OCR confirmation panel is intentionally conservative. Low-confidence results are omitted rather than forcing a wrong equipment choice. Decorations are recognized as candidates only; automatic decoration placement is not enabled yet.
