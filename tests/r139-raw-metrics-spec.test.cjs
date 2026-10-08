const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const chunk=app.slice(app.indexOf('function renderCompareTableChunk('),app.indexOf('let lastBuildComparisonRows='));
test('raw normal and maximum are the main metrics',()=>{assert.match(chunk,/火力指数（計算値）/);assert.match(chunk,/最大火力指数（計算値）/);assert.match(chunk,/comparisonDisplayNumber\(value\)/);assert.doesNotMatch(chunk,/火力指数（基準100）/);});
test('raw metric reads each row, independent of baseline',()=>{assert.match(chunk,/const rawValue=r=>r\.power\?\.\[key\]\?\.comparisonPower/);assert.match(chunk,/rawValue\(r\)/);});
test('relative changes have separate rows',()=>{assert.match(chunk,/data-comparison-metric/);assert.match(chunk,/comparisonPowerChange\(r,baseline\)/);});
test('report exports raw values and separate changes',()=>{assert.match(app,/powerIndex:row\.power\?\.normal\?\.comparisonPower/);assert.match(app,/maxPowerIndex:row\.power\?\.maximum\?\.comparisonPower/);assert.match(app,/release:'r139'/);});
test('accepted spec is bundled',()=>{const spec=fs.readFileSync(path.join(__dirname,'..','spec','COMBAT_METRICS_DISPLAY.md'),'utf8');assert.match(spec,/正規化していない計算値/);});
