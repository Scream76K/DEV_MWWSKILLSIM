const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
test('coverage counts only indexable normal comparisons',()=>assert.match(html,/normal:relative\?\.normal!=null/));
test('coverage reports maximum and DPS separately',()=>{assert.match(html,/maximum:relative\?\.maximum!=null/);assert.match(html,/dps:dps!=null/)});
test('coverage visible and exported',()=>{assert.match(html,/data-comparison-coverage/);assert.match(html,/coverage:comparisonCoverageSummary\(lastBuildComparisonRows\|\|\[\],baseline\)/);assert.match(html,/release:'r249'/)});
