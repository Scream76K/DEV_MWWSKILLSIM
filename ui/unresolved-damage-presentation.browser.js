(function(root){
'use strict';

/**
 * Read-only presentation model for unavailable combo damage.
 * This module never changes the calculation result, status, or numeric value.
 * Technical reason identifiers remain available only behind an explicit detail UI.
 */
const REASONS = Object.freeze({
  BLACK_ECLIPSE_NORMAL_STATE_REQUIRED: '必要な発動状態が確認できないため、火力は保留中です。',
  COMPONENT_UNAVAILABLE: '計算に必要なダメージ成分が揃っていません。',
  ANNOTATION_FORMULA_OR_INPUT_UNRESOLVED: '計算条件または計算式の確認が必要です。',
  DAMAGE_TYPE_UNRESOLVED: 'ダメージ種別が確定していません。',
  ELEMENT_COMPONENT_PENDING: '属性ダメージの計算条件が未確定です。',
  VERIFICATION_PENDING: '技データの検証が完了していません。',
  TECHNIQUE_NOT_FOUND: '選択された技の計算データが見つかりません。',
  CB_H_IMPACT_ONLY: '現在の計算条件では、このビン種別のコンボを算出できません。'
});

const normalizeReason = reason => {
  if (typeof reason !== 'string' || !reason.trim()) return null;
  return reason.trim().slice(0, 500);
};

const classifyReason = code => {
  if (!code) return null;
  const normalized = code.startsWith('REAL_SLICE:') ? code.slice('REAL_SLICE:'.length) : code;
  const exact = REASONS[normalized];
  if (exact) return exact;
  const prefix = normalized.split(':')[0];
  if (Object.prototype.hasOwnProperty.call(REASONS, prefix)) return REASONS[prefix];
  return '計算に必要な条件を確認できないため、火力は保留中です。';
};

function makeUnresolvedDamagePresentation(result) {
  const status = result && typeof result === 'object' ? result.status : null;
  const rawReason = normalizeReason(result?.reason ?? result?.unavailableReason ?? null);
  if (status === 'available') return Object.freeze({
    status: 'available', summary: null, technicalReason: null, showTechnicalDetails: false
  });
  // Never present 0 or a fabricated fallback when availability is unknown.
  return Object.freeze({
    status: status === 'unavailable' ? 'unavailable' : 'unknown',
    summary: classifyReason(rawReason) || '火力は現在未算出です。',
    technicalReason: rawReason,
    showTechnicalDetails: Boolean(rawReason)
  });
}

root.MHWUnresolvedDamagePresentation = {makeUnresolvedDamagePresentation};

})(window);
