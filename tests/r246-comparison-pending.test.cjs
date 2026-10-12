const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
test('r246 distinguishes three metric-level pending reasons',()=>{assert.match(html,/function comparisonCoverageReason\(row,baseline,metric\)/);assert.match(html,/metric==='maximum'/);assert.match(html,/metric==='dps'/)});
test('r246 preserves weapon/profile and baseline safety gates',()=>{assert.match(html,/SAME_WEAPON_REQUIRED/);assert.match(html,/STANDARD_PROFILE_MISMATCH/);assert.match(html,/BASELINE_DPS_UNAVAILABLE/)});
test('r246 exports and displays metric-specific pending causes',()=>{assert.match(html,/data-comparison-pending="r248"/);assert.match(html,/pending\.map\(x=>/);assert.match(html,/coverage:comparisonCoverageSummary/);assert.match(html,/release:'r249'/)});
