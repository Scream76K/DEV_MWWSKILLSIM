# DEV_MWWSKILLSIM OCR Step 1.10 Safe Const

Step 1.10 full-weapon-DB build, with one safety fix only:
`makeNameOCRCanvas` uses `let c` because the canvas variable is reassigned later.

OCR behavior is otherwise unchanged from Step 1.10.
Otsu, smoothing, and PSM6 are not included.
