# KOTATU_SA_01 real-equipment vertical check

Product unchanged. JSDOM public template load/calcBuild/save/load/compare, actual user-exported normalized MHDB (hash9491bfc1cf357aed4967418949d78c0ddd73407c6461443a7b594a2b2710c810). No new data requests, synthetic equipment, Safari or live-game testing.

## Equipment
Loader reports all equipment matched. Weapon1175 邪執のコンキエレガン, power phial, dragon, attack mutation, production attack3, same-element materials3, restores affEX/atkIII/sharpEX/atkIII/atkEX. Attribute source index ARTIA_ELEMENT_SOURCE_DB gives260+20+attackMutation0+elementRestore0=280; source memo38 retrieved2026-10-11, target game version unknown, source-confirmed not live verified. Captured artiaSourceElement returned280; no old +30 fallback.
Head700/chest706/arms707/waist612/legs709 maximum slots[3,1,1]/[3,2,0]/[1,1,0]/[2,2,1]/[3,3,0]. All requested jewels resolved. Charm R8 栄世 見切り3/鎖刃刺撃1, 武1防1防1 passes existing G3/G10 validator. No equipment/jewel/skill removed or relocated.

## Explicit conditions and profiles
Training-front target, starting SWORD, awakening explicitly false or true (separate runs), frenzy OVERCOME, conversion normalOFF/maximumON. Existing maximum conditional skills retain preactivation semantics; no time/gauge simulation. Full profiles and states stored in raw evidence. Original video transform loop is not asserted to equal these reference profiles.
Standard four-technique profile: SA_SWORD_VERTICAL / SA_SWORD_RIGHT_RISING / SA_SWORD_MORPH_DOUBLE / SA_AXE_MORPH_SLASH, exact IDs and1/1/2/1 body-Hits asserted. Public result stops RAPID_MORPH_TECHNIQUE_SCOPE_UNRESOLVED, exit1 expected-completion assertion retained. This is product scope stop, not missing DB equipment.
Separate already-adopted three-technique reference: SA_SWORD_VERTICAL / SA_SWORD_MORPH_DOUBLE / SA_AXE_MORPH_SLASH, exact1/2/1 body-Hits asserted. Not relabeled as standard four-technique success.
- AwakeOFF: normal672.79 / maximum831.44; four physical/four elemental body components, no awakened followup.
- AwakeON: normal825.73 / maximum1038.95; three extra physical+elemental followups at adopted sword contacts; existing phial/transform state contract.
Both runs exit0. Each saves two identical equipment copies A/B, reloads each, compares using shared current conditions, asserts result equality and current/saved content invariance. Not two distinct equipment builds or cross-weapon comparison.

## Remaining scope
adapter237 rapid-morph coexistence list excludes RIGHT_RISING although standard four-profile includes it. adapter382 also needs a declared mode; four-technique record lacks that and damageType. index MHConversionComponentScope/SA_AWAKENED_MODEL explicitly adopt only three techniques. Therefore simply passing the initial guard would not complete the fourth. Need distinguish non-transform ordinary sword body wiring from new conversion/awakened target expansion; do not infer awakening solely from sword name or expand three-technique approval silently. Smallest decision for full four-profile: explicitly settle RIGHT_RISING body mode/damage type and rapid-morph nonapplication from source, then whether to extend conversion and awakened sword-contact contract to that specific Hit. No new coefficients proposed.

Existing SNS wiring acceptance recorded separately; SNS equipment stays BLOCKED. No new product diff, commit/push, full regression or final beta test.

## 現況訂正
上記Remaining scopeは初回調査時の履歴。非覚醒4技と、承認後の覚醒4技は独立レビュー受入済。最新範囲・未検証はSA_RIGHT_RISING_AWAKENED_REPORT.mdおよびsa-rising-awakened-manifest.json参照。旧失敗証拠は保持。
