const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const view=app.slice(app.indexOf('function renderCompareTable(rows,'),app.indexOf('function renderCachedBuildComparison()'));
test('raw firepower is withheld only when raw calculation is unavailable',()=>assert.match(view,/!Number\.isFinite\(r\.power\?\.normal\?\.comparisonPower\)/));
test('a calculated raw value remains visible even when relative comparison is withheld',()=>assert.match(view,/Number\.isFinite\(r\.power\?\.normal\?\.comparisonPower\)&&!comparisonPowerChange\(r,baseline\)\?\.normal/));
test('unverified reasons are presented in human-readable form',()=>assert.match(view,/comparisonReasonText\(r\.power\.maximumReason\)/));
test('comparison report revision tracks current release',()=>assert.match(app,/release:'r140'/));
