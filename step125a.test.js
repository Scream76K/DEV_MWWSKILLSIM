const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const html = fs.readFileSync('index.html','utf8');
const m = html.match(/function detectEquipmentRegions\(screen, lines\)\s*\{[\s\S]*?\n\}/);
const lm = html.match(/function extractEquipmentOCRLines\(data\)\s*\{[\s\S]*?\n\}/);
assert(lm, 'extractEquipmentOCRLines must exist');
assert(m, 'detectEquipmentRegions must exist');
const sandbox = {console, Math, Set, Map, Array, Number, String, Object};
vm.createContext(sandbox);
vm.runInContext(m[0] + '\n' + lm[0] + '\nthis.detect=detectEquipmentRegions; this.extract=extractEquipmentOCRLines;', sandbox);
const detect = sandbox.detect;
const extract = sandbox.extract;

const lines = [
  {text:'メイン武器', x:80, y:100, width:240, height:34, confidence:92},
  {text:'代償のネイディ・ギア', x:80, y:145, width:360, height:38, confidence:90},
  {text:'サブ武器', x:80, y:300, width:220, height:34, confidence:91},
  {text:'頭防具', x:80, y:520, width:210, height:34, confidence:90},
  {text:'胴防具', x:80, y:650, width:210, height:34, confidence:90},
  {text:'腕防具', x:80, y:780, width:210, height:34, confidence:90},
  {text:'腰防具', x:80, y:910, width:210, height:34, confidence:90},
  {text:'脚防具', x:80, y:1040, width:210, height:34, confidence:90},
  {text:'護石', x:80, y:1170, width:120, height:34, confidence:90}
];
const out = detect({width:1200,height:1400}, lines);
assert.deepStrictEqual(Array.from(out.map(x=>x.key)), ['mainWeapon','head','chest','arms','waist','legs','charm']);
assert(out.find(x=>x.key==='mainWeapon').y2 < out.find(x=>x.key==='head').y1);
assert(!out.some(x=>x.key==='subWeapon'));

// Labels may be split by OCR spaces/punctuation; they should still map to the same part.
const noisy = [
  {text:'メイン 武器', x:60, y:80, width:200, height:30, confidence:88},
  {text:'亡国のクピドバイン', x:60, y:120, width:300, height:34, confidence:84},
  {text:'サブ 武器', x:60, y:230, width:180, height:30, confidence:90},
  {text:'頭 防具', x:60, y:420, width:170, height:30, confidence:90},
  {text:'胴 防具', x:60, y:550, width:170, height:30, confidence:90},
  {text:'腕 防具', x:60, y:680, width:170, height:30, confidence:90},
  {text:'腰 防具', x:60, y:810, width:170, height:30, confidence:90},
  {text:'脚 防具', x:60, y:940, width:170, height:30, confidence:90},
  {text:'護 石', x:60, y:1070, width:120, height:30, confidence:90}
];
const noisyOut=detect({width:1000,height:1200}, noisy);
assert.deepStrictEqual(Array.from(noisyOut.map(x=>x.key)), ['mainWeapon','head','chest','arms','waist','legs','charm']);
assert(!noisyOut.some(x=>x.key==='subWeapon'));
assert(noisyOut.every(x=>x.confidence>=0 && x.confidence<=100));
for (const key of ['head','chest','arms','waist','legs']) {
  const r=out.find(x=>x.key===key); assert(r && r.y2>r.y1 && r.x2>r.x1);
}
console.log('step125a layout tests passed');
// Regression: UI frame noise such as a high-confidence '|' must not become a label
// or expand a part region to nearly the full screen width.
const noise = [
  {text:'|', x:0, y:100, width:1198, height:40, confidence:96},
  {text:'メイン武器', x:80, y:140, width:240, height:34, confidence:92},
  {text:'代償のネイディ・ギア', x:80, y:185, width:360, height:38, confidence:90},
  {text:'頭防具', x:80, y:300, width:210, height:34, confidence:90},
  {text:'胴防具', x:80, y:430, width:210, height:34, confidence:90},
  {text:'腕防具', x:80, y:560, width:210, height:34, confidence:90},
  {text:'腰防具', x:80, y:690, width:210, height:34, confidence:90},
  {text:'脚防具', x:80, y:820, width:210, height:34, confidence:90},
  {text:'護石', x:80, y:950, width:120, height:34, confidence:90}
];
const noiseOut = detect({width:1200,height:1100}, noise);
assert.deepStrictEqual(Array.from(noiseOut.map(x=>x.key)), ['mainWeapon','head','chest','arms','waist','legs','charm']);
assert(noiseOut.find(x=>x.key==='mainWeapon').width <= 1200*0.70, 'main weapon region must be width-limited');
assert(noiseOut.find(x=>x.key==='head').width <= 1200*0.70, 'head region must be width-limited');
const onlyNoise = detect({width:1200,height:1100}, [
  {text:'|', x:0, y:500, width:1198, height:40, confidence:96},
  {text:'I', x:0, y:650, width:1198, height:40, confidence:95}
]);
assert.strictEqual(onlyNoise.length, 0, 'single-character OCR noise must not create equipment regions');



const extracted=extract({lines:[{text:'頭防具',confidence:90,bbox:{x0:10,y0:20,x1:100,y1:50}},{text:'胴防具',confidence:80,bbox:{x0:10,y0:80,x1:100,y1:110}}]});
assert.strictEqual(extracted.length,2);
assert.strictEqual(extracted[0].text,'頭防具');
assert.strictEqual(extracted[0].x,10);
assert.strictEqual(extracted[0].width,90);
console.log('step125a OCR-line extraction tests passed');
