'use strict';
const fs = require('node:fs');
const audit = JSON.parse(fs.readFileSync('HAMMER_FULL_DB_AUDIT_r232.json', 'utf8'));
const mismatches = audit.rows.filter(row => !row.match);
const gate = {
  revision:'r233', targetGameVersion:'1.042.00.02',
  sources:[{url:'https://macarongamemo.com/entry/mhwilds-hammer-motion', role:'historical motion value table'}, {url:'https://gamewith.jp/mhwilds/499790', role:'later update change log, qualitative evidence'}],
  rule:'Absence of a move in a change log is not proof of no change. Do not promote to current-version verified without positive version evidence.',
  jumpCharge:mismatches.map(row=>({techniqueId:row.techniqueId,dbHits:row.dbHits,historyAfterHits:row.historyAfterHits,sourceVersion:row.historyVersion,action:'REQUIRES_CURRENT_VERSION_CONFIRMATION',numericDbModified:false})),
  focusShinten:{techniqueId:'HAM_FOCUS_NO_WOUND',knownDbHits:[30],reportedIssue:'Some damage of Focus Strike: Shinten was incorrectly treated as fixed damage and was corrected in the fourth title update',verification:'FORMULA_AND_APPLICABILITY_NOT_ESTABLISHED',action:'REVIEW_HANDLER_AND_DAMAGE_COMPONENTS_BEFORE_NUMERIC_EDIT',numericDbModified:false},
  summary:{historicalMatches:audit.summary.matching,historyConflicts:audit.summary.mismatching,gameVersionVerified:0,numericChanges:0}
};
fs.writeFileSync('HAMMER_VERSION_GATE_r233.json',JSON.stringify(gate,null,2)+'\n');
