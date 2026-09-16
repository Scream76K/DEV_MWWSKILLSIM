const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const html = fs.readFileSync('index.html','utf8');
assert(html.includes('<title>Step 1.25-B v2.2'), 'title must be Step 1.25-B v2.2');
assert(html.includes('MH Wilds OCR — Step 1.25-B v2.2'), 'visible h1 must be Step 1.25-B v2.1');
const mStart = html.indexOf('function detectEquipmentRegions(');
const mEnd = html.indexOf('\nfunction addPadding', mStart);
const lmStart = html.indexOf('function extractEquipmentOCRLines(');
const lmEnd = html.indexOf('\nfunction detectEquipmentRegions', lmStart);
assert(mStart >= 0 && mEnd > mStart, 'detectEquipmentRegions must exist');
assert(lmStart >= 0 && lmEnd > lmStart, 'extractEquipmentOCRLines must exist');
const m = html.slice(mStart, mEnd);
const lm = html.slice(lmStart, lmEnd);
const bStart = html.indexOf('function normalizeEquipmentCandidateRows(');
const bEnd = html.indexOf('\nfunction addPadding', bStart);
assert(bStart >= 0 && bEnd > bStart, 'Step 1.25-B helpers must exist');
const b = html.slice(bStart, bEnd);
const sandbox = {console, Math, Set, Map, Array, Number, String, Object};
vm.createContext(sandbox);
vm.runInContext(m + '\n' + lm + '\n' + b + '\nthis.detect=detectEquipmentRegions; this.extract=extractEquipmentOCRLines; this.normalizeEquipmentCandidateRows=normalizeEquipmentCandidateRows;', sandbox);
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
assert.deepStrictEqual(Array.from(out.map(x=>x.key)), ['mainWeapon','subWeapon','head','chest','arms','waist','legs','charm','mantle']);
assert(out.find(x=>x.key==='mainWeapon').y2 <= out.find(x=>x.key==='head').y1);
assert(out.find(x=>x.key==='subWeapon').excludedFromReflection === true);

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
assert.deepStrictEqual(Array.from(noisyOut.map(x=>x.key)), ['mainWeapon','subWeapon','head','chest','arms','waist','legs','charm','mantle']);
assert(noisyOut.find(x=>x.key==='subWeapon').excludedFromReflection === true);
assert(noisyOut.every(x=>x.confidence>=0 && x.confidence<=100));
for (const key of ['head','chest','arms','waist','legs']) {
  const r=out.find(x=>x.key===key); assert(r && r.y2>r.y1 && r.x2>r.x1);
}
console.log('step125b layout tests passed');

// Step 1.25-A v3 design tests: use left equipment column, retain sub/mantle structurally,
// but mark subWeapon as excluded from reflection. Short labels must not match arbitrary text.
const structured = [
  {text:'メイン武器', x:80, y:100, width:220, height:30, confidence:92},
  {text:'代償のネイディ・ギア', x:80, y:140, width:360, height:34, confidence:90},
  {text:'サブ武器', x:80, y:300, width:220, height:30, confidence:91},
  {text:'頭防具', x:80, y:500, width:220, height:30, confidence:90},
  {text:'胴防具', x:80, y:700, width:220, height:30, confidence:90},
  {text:'腕防具', x:80, y:900, width:220, height:30, confidence:90},
  {text:'腰防具', x:80, y:1100, width:220, height:30, confidence:90},
  {text:'脚防具', x:80, y:1300, width:220, height:30, confidence:90},
  {text:'護石', x:80, y:1500, width:140, height:30, confidence:90},
  {text:'装衣', x:80, y:1700, width:140, height:30, confidence:90},
  {text:'頭', x:900, y:510, width:80, height:30, confidence:99}
];
const structuredOut=detect({width:3840,height:2160}, structured);
assert.deepStrictEqual(Array.from(structuredOut.map(x=>x.key)), ['mainWeapon','subWeapon','head','chest','arms','waist','legs','charm','mantle']);
assert(structuredOut.every(x=>x.x < 3840*0.25), 'regions must stay inside left equipment column');
assert(structuredOut.every(x=>x.width <= 3840*0.22 + 5), 'regions should use equipment-card width');
assert(structuredOut.find(x=>x.key==='subWeapon').excludedFromReflection === true, 'sub weapon must be detected but excluded from reflection');
assert(!structuredOut.some(x=>x.label === '頭' && x.key === 'head'), 'short label must not win over full label');

const garbledLabels = [
  {text:'メイン武器', x:50, y:100, width:220, height:30, confidence:90},
  {text:'サブ武器', x:50, y:220, width:220, height:30, confidence:90},
  {text:'頭防具', x:50, y:340, width:220, height:30, confidence:90},
  {text:'胴防具', x:50, y:460, width:220, height:30, confidence:90},
  {text:'腕防具', x:50, y:580, width:220, height:30, confidence:90},
  {text:'腰防四', x:50, y:700, width:220, height:30, confidence:90},
  {text:'脚防思', x:50, y:820, width:220, height:30, confidence:90},
  {text:'護石', x:50, y:940, width:140, height:30, confidence:90},
  {text:'装衣', x:50, y:1060, width:140, height:30, confidence:90}
];
const garbledOut=detect({width:3840,height:1200}, garbledLabels);
assert.deepStrictEqual(Array.from(garbledOut.map(x=>x.key)), ['mainWeapon','subWeapon','head','chest','arms','waist','legs','charm','mantle']);
assert(garbledOut.find(x=>x.key==='subWeapon').excludedFromReflection === true);
assert(garbledOut.find(x=>x.key==='mantle').excludedFromReflection === true);
assert(garbledOut.every(x=>x.width <= 3840*0.22 + 1), 'region width should be approximately 22% of screen');


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
assert.deepStrictEqual(Array.from(noiseOut.map(x=>x.key)), ['mainWeapon','subWeapon','head','chest','arms','waist','legs','charm','mantle']);
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
console.log('step125b OCR-line extraction tests passed');

// Regression for real IMG_9324 behavior: all five armor labels are found at a
// stable ~198px pitch, while main/sub/charm/mantle labels may be missed. The
// detector should infer the missing rows from the stable armor grid.
const realLike = [
  {text:'頭防具', x:197, y:648, width:260, height:34, confidence:90},
  {text:'胴防具', x:197, y:846, width:260, height:34, confidence:92},
  {text:'腕防具', x:197, y:1044, width:260, height:34, confidence:69},
  {text:'腰防四', x:197, y:1242, width:260, height:34, confidence:0},
  {text:'脚防思', x:197, y:1440, width:260, height:34, confidence:0}
];
const realLikeOut = detect({width:3840,height:2160}, realLike);
assert.deepStrictEqual(Array.from(realLikeOut.map(x=>x.key)), ['mainWeapon','subWeapon','head','chest','arms','waist','legs','charm','mantle'],
  'stable five-armor grid should infer missing main/sub/charm/mantle rows');
assert(realLikeOut.find(x=>x.key==='mainWeapon').inferred === true, 'main weapon should be inferred');
assert(realLikeOut.find(x=>x.key==='subWeapon').excludedFromReflection === true, 'inferred sub weapon must be excluded');
assert(realLikeOut.find(x=>x.key==='charm').inferred === true, 'charm should be inferred');
assert(realLikeOut.find(x=>x.key==='mantle').inferred === true, 'mantle should be inferred');
const headR=realLikeOut.find(x=>x.key==='head');
const chestR=realLikeOut.find(x=>x.key==='chest');
assert(Math.abs((chestR.y1-headR.y1)-198)<8, 'inferred grid pitch should follow armor anchors');
assert(realLikeOut.every(x=>x.x < 3840*0.25 && x.width <= 3840*0.22 + 1), 'inferred regions must remain in left column');
console.log('real-like five-armor inference tests passed');


// Step 1.25-A v5: known OCR aliases should canonicalize without global character replacement.
const aliasInput = [
  {text:'頭防具', x:197, y:648, width:260, height:34, confidence:90},
  {text:'胴防具', x:197, y:846, width:260, height:34, confidence:92},
  {text:'腕防具', x:197, y:1044, width:260, height:34, confidence:69},
  {text:'腰防四', x:197, y:1242, width:260, height:34, confidence:0},
  {text:'脚防思', x:197, y:1440, width:260, height:34, confidence:0}
];
const aliasOut = detect({width:3840,height:2160}, aliasInput);
assert.strictEqual(aliasOut.length, 9);
assert.strictEqual(aliasOut.find(x=>x.key==='waist').label, '腰防具');
assert.strictEqual(aliasOut.find(x=>x.key==='legs').label, '脚防具');
assert(aliasOut.find(x=>x.key==='waist').labelConfidence > 0);
assert(aliasOut.find(x=>x.key==='legs').labelConfidence > 0);
assert.strictEqual(aliasOut.find(x=>x.key==='head').sourceType, 'ocr');
assert.strictEqual(aliasOut.find(x=>x.key==='mainWeapon').sourceType, 'inferred');
console.log('step125b v5 alias/structure tests passed');


// Step 1.25-A v6: scale/pitch must be inferred from OCR anchors, not a fixed 198px value.
// Main+sub anchors alone should establish the per-item pitch and infer the remaining rows.
const scaledTwoAnchors = [
  {text:'メイン武器', x:80, y:120, width:180, height:26, confidence:92},
  {text:'サブ武器', x:80, y:220, width:180, height:26, confidence:91},
  {text:'頭防具', x:80, y:320, width:170, height:26, confidence:90},
  {text:'胴防具', x:80, y:420, width:170, height:26, confidence:90},
  {text:'腕防具', x:80, y:520, width:170, height:26, confidence:90},
  {text:'腰防具', x:80, y:620, width:170, height:26, confidence:90},
  {text:'脚防具', x:80, y:720, width:170, height:26, confidence:90},
  {text:'護石', x:80, y:820, width:120, height:26, confidence:90},
  {text:'装衣', x:80, y:920, width:120, height:26, confidence:90}
];
const scaledOut=detect({width:1536,height:706}, scaledTwoAnchors);
assert.deepStrictEqual(Array.from(scaledOut.map(x=>x.key)), ['mainWeapon','subWeapon','head','chest','arms','waist','legs','charm','mantle']);
const sHead=scaledOut.find(x=>x.key==='head');
const sChest=scaledOut.find(x=>x.key==='chest');
assert(Math.abs((sChest.y1-sHead.y1)-100)<5, 'pitch should be inferred as ~100px from anchors, not fixed 198px');
assert(sHead.height < 160, 'scaled layout should not use a fixed 198px region height');
assert(scaledOut.find(x=>x.key==='subWeapon').excludedFromReflection===true);
assert(scaledOut.find(x=>x.key==='mantle').excludedFromReflection===true);

// Only main+sub labels are available: use their two-item distance as the scale anchor.
const onlyWeaponAnchors = [
  {text:'メイン武器', x:100, y:200, width:180, height:26, confidence:95},
  {text:'サブ武器', x:100, y:350, width:180, height:26, confidence:94}
];
const twoOut=detect({width:2000,height:1500}, onlyWeaponAnchors);
assert.deepStrictEqual(Array.from(twoOut.map(x=>x.key)), ['mainWeapon','subWeapon','head','chest','arms','waist','legs','charm','mantle']);
const tMain=twoOut.find(x=>x.key==='mainWeapon'), tSub=twoOut.find(x=>x.key==='subWeapon'), tHead=twoOut.find(x=>x.key==='head');
assert(Math.abs((tSub.y1-tMain.y1)-150)<8, 'main/sub distance should define pitch');
assert(Math.abs((tHead.y1-tSub.y1)-150)<8, 'remaining rows should follow inferred pitch');

// Three non-adjacent anchors should also infer pitch using index distance.
const sparseAnchors = [
  {text:'メイン武器', x:90, y:100, width:180, height:26, confidence:92},
  {text:'頭防具', x:90, y:300, width:170, height:26, confidence:90},
  {text:'腕防具', x:90, y:500, width:170, height:26, confidence:90},
  {text:'脚防具', x:90, y:900, width:170, height:26, confidence:90}
];
const sparseOut=detect({width:1800,height:1200}, sparseAnchors);
assert.deepStrictEqual(Array.from(sparseOut.map(x=>x.key)), ['mainWeapon','subWeapon','head','chest','arms','waist','legs','charm','mantle']);
const spHead=sparseOut.find(x=>x.key==='head'), spArm=sparseOut.find(x=>x.key==='arms');
assert(Math.abs((spArm.y1-spHead.y1)-200)<12, 'non-adjacent anchors should infer pitch from semantic index distance');

console.log('step125b v6 scale/pitch tests passed');

// Step 1.25-B RED tests: generic equipment candidate normalization/ranking must be
// independent of the weapon-only UI and must honor armor-slot restrictions.
const bRows = sandbox.normalizeEquipmentCandidateRows([{id:1,gameId:2,kind:'head',name:'クイーンピアスα'},{id:2,gameId:3,kind:'chest',name:'シュバルカメイルγ'}], 'head');
assert.strictEqual(bRows.length,1);
assert.strictEqual(bRows[0].name,'クイーンピアスα');
const bRows2 = sandbox.normalizeEquipmentCandidateRows([
  {id:1,gameId:11,kind:'head',name:'クイーンピアスα'},
  {id:2,gameId:22,kind:'chest',name:'シュバルカメイルγ'},
  {id:3,gameId:33,kind:'head',name:'クイーンピアスβ'},
  {id:4,gameId:44,kind:'arms',name:'クイーンアームα'}
], 'head');
assert.deepStrictEqual(bRows2.map(x=>x.name), ['クイーンピアスα','クイーンピアスβ']);
assert.strictEqual(sandbox.normalizeEquipmentCandidateRows([], 'head').length, 0);
assert.strictEqual(sandbox.normalizeEquipmentCandidateRows(bRows2, 'waist').length, 0, 'candidate rows must not leak across armor slots');
console.log('step125b slot filtering tests passed');

// Step 1.25-B RED/GREEN coverage for generic aggregation: one bad armor OCR pass
// must not allow a chest item to enter the head candidate pool.
const gmStart = html.indexOf('function rankGenericEquipmentCandidates(');
const gmEnd = html.indexOf('\nasync function recognizeEquipmentAll', gmStart);
assert(gmStart >= 0 && gmEnd > gmStart, 'generic equipment ranking helpers must exist');
const gm = html.slice(gmStart, gmEnd);
const gs = {console, Math, Set, Map, Array, Number, String, Object,
  weightedNameDistance:(raw,name)=>({score:String(raw).replace(/\\s/g,'')===String(name).replace(/\\s/g,'')?1:.5,details:{},matched:String(name).length}),
  confidenceWeight:()=>1};
vm.createContext(gs);
vm.runInContext(gm+'\nthis.rank=rankGenericEquipmentCandidates;this.aggregate=aggregateGenericEquipmentCandidates;this.decide=equipmentDecision;',gs);
const genericItems=[
  {id:1,kind:'head',name:'クイーンピアスα'},
  {id:2,kind:'head',name:'クイーンピアスβ'},
  {id:3,kind:'chest',name:'シュバルカメイルγ'}
];
const rankedHead=gs.rank('クイーンピアスα',90,genericItems.filter(x=>x.kind==='head'));
assert.strictEqual(rankedHead[0].name,'クイーンピアスα');
const agg=gs.aggregate([{raw:'クイーンピアスα',conf:90},{raw:'クイーンピアスα',conf:85}],genericItems.filter(x=>x.kind==='head'));
assert.strictEqual(agg[0].name,'クイーンピアスα');
assert.strictEqual(agg[0].support,2);
assert.strictEqual(gs.decide(agg[0],agg[1]).level,'auto');
console.log('step125b generic candidate aggregation tests passed');

assert(html.includes("const CHARM_API='https://wilds.mhdb.io/ja/charms';"));
assert(html.includes("JSON.stringify({id:true,gameId:true,ranks:true})"), 'charm API must project ranks');
assert(html.includes('function equipmentOCRShouldStop('), 'B OCR should support staged early exit');
console.log('step125b DB projection/early-exit tests passed');

// Step 1.25-B v2.1 RED: equipment OCR must crop the single name line below the
// semantic label instead of feeding the whole card/background to Tesseract.
const nameCropStart = html.indexOf('function equipmentNameCropRect(');
assert(nameCropStart >= 0, 'v2 name crop helper must exist');
const nameCropEnd = html.indexOf('\nfunction normalizeEquipmentCandidateRows', nameCropStart);
assert(nameCropEnd > nameCropStart, 'v2 name crop helper boundary must exist');
const nameCrop = html.slice(nameCropStart, nameCropEnd);
const ns = {Math, Number, String, Object};
vm.createContext(ns);
vm.runInContext(nameCrop + '\nthis.crop=equipmentNameCropRect;', ns);
const anchored = ns.crop({x:100,y:200,width:500,height:100,labelY:200,labelHeight:26,pitch:100}, 2000, 1200);
assert(anchored, 'anchored crop should exist');
assert(anchored.x >= 100 && anchored.x < 130, 'anchored crop should stay near the detected text-column anchor');
assert(anchored.y > 200 && anchored.y < 260, 'name crop should be below the label');
assert(anchored.height < 70, 'name crop should be a single text-line band');
const inferred = ns.crop({x:100,y:300,width:500,height:100,inferred:true,pitch:100,anchorY:300}, 2000, 1200);
assert(inferred.y > 300 && inferred.y < 360, 'inferred row should place name band below row anchor');
console.log('step125b v2 name-line crop RED tests passed');

// Step 1.25-B v2.1.1 RED: equipment OCR preprocessing must use gentle
// grayscale/white extraction rather than destructive threshold155, with 2.5x
// enlargement and wider explicit padding.
assert(html.includes("function addPaddingCustom(sourceCanvas, padX = 30, padY = 20, color = '#FFFFFF')"),
  'v2.1 must provide configurable OCR padding');
assert(html.includes('const scale=2.5'), 'v2.1 equipment OCR canvas should use 2.5x scaling');
assert(html.includes("mode==='white_extract'"), 'v2.1 must include white-text extraction');
assert(html.includes("mode==='grayscale'"), 'v2.1 must include grayscale mode');
assert(html.includes("const passes=[['white_extract','白文字強調'],['invert','白背景反転'],['grayscale','グレースケール']];"),
  'v2.1 equipment OCR passes must avoid destructive thresholding');
console.log('step125b v2.1 preprocessing RED tests passed');

// Step 1.25-B v2.1 regression: the detected region already begins at the text
// column, so the name crop must not add a second large left inset.
const leftAligned = ns.crop({x:79,y:264,width:338,height:76,labelY:264,labelHeight:14,pitch:79,labelX:79}, 1536, 864);
assert(leftAligned.x <= 82, 'name crop must preserve the first equipment-name character');
assert(leftAligned.width > 190 && leftAligned.width <= 220, 'name crop should stay inside the text column without reaching slot icons');
console.log('step125b v2.1 name-column alignment regression passed');


// Step 1.25-B v2.2 RED: subtype-aware scoring must distinguish alpha/beta/gamma
// when the OCR has common suffix confusions such as v/V, a/aq, b/bq.
const subStart = html.indexOf('function normalizeSubtypeSymbols(');
assert(subStart >= 0, 'v2.2 subtype normalization helper must exist');
const subEnd = html.indexOf('\nfunction getDictionary', subStart);
assert(subEnd > subStart, 'v2.2 subtype helper boundary must exist');
const subCode = html.slice(subStart, subEnd);
const ss = {Math, Number, String, Object, Array};
vm.createContext(ss);
vm.runInContext(subCode + '\nthis.normSubtype=normalizeSubtypeSymbols;this.splitSubtype=splitEquipmentSubtype;this.subScore=equipmentSubtypeScore;', ss);
assert.strictEqual(ss.normSubtype('シュバルカメイルv'), 'シュバルカメイルγ');
assert.strictEqual(ss.normSubtype('ドシャグマコイルaq'), 'ドシャグマコイルα');
assert.strictEqual(ss.normSubtype('護雷顎竜ヘルムBQ'), '護雷顎竜ヘルムβ');
const gammaParts=ss.splitSubtype('シュバルカメイルv');
assert.strictEqual(gammaParts.base,'シュバルカメイル');
assert.strictEqual(gammaParts.subtype,'γ');
assert(ss.subScore('シュバルカメイルv','シュバルカメイルγ') > ss.subScore('シュバルカメイルv','シュバルカメイルα'));
assert(ss.subScore('ドシャグマコイルaq','ドシャグマコイルα') > ss.subScore('ドシャグマコイルaq','ドシャグマコイルβ'));
console.log('step125b v2.2 subtype RED tests passed');

// Step 1.25-B v2.3 RED: armor recognition must be hierarchical — series first,
// then alpha/beta/gamma only inside the selected series.
const hStart = html.indexOf('function armorBaseName(');
assert(hStart >= 0, 'v2.3 hierarchical armor ranking helper must exist');
const hEnd = html.indexOf('\nfunction rankGenericEquipmentCandidates(', hStart);
const hCode = html.slice(hStart, hEnd);
const hs = {Math, Number, String, Object, Array, Map, Set,
  normalizeForNameScore:v=>Array.from(String(v||'').normalize('NFKC')).filter(ch=>!/[\s\u3000・･·•\-‐‑‒–—―＿_.,，。！？!?、:：;；/／\\|｜()[\]{}「」『』【】〈〉《》<>＋+＝=＊*#＃%％&＆@＠]/.test(ch)),
  splitEquipmentSubtype:raw=>{const s=String(raw||'').replace(/\s+/g,'').replace(/(?:v|V|ν)$/u,'γ').replace(/(?:aq|a)$/iu,'α').replace(/(?:bq|b|BQ)$/iu,'β');const m=s.match(/^(.*?)([αβγ])$/u);return m?{base:m[1],subtype:m[2]}:{base:s,subtype:null};},
  weightedNameDistance:(raw,name)=>({score:String(raw).replace(/\s/g,'')===String(name).replace(/\s/g,'')?1:.4}),
  equipmentSubtypeScore:(raw,item)=>hs.splitEquipmentSubtype(raw).subtype===hs.splitEquipmentSubtype(item).subtype?1:0,
  confidenceWeight:()=>1};
vm.createContext(hs);
vm.runInContext(hCode+'\nthis.rank=rankHierarchicalArmorCandidates;this.agg=aggregateHierarchicalArmorCandidates;',hs);
const armorItems=[
  {id:1,kind:'chest',name:'シュバルカメイルα'},
  {id:2,kind:'chest',name:'シュバルカメイルβ'},
  {id:3,kind:'chest',name:'シュバルカメイルγ'},
  {id:4,kind:'chest',name:'ドシャグマメイルα'}
];
const hr=hs.rank('シュバルカメイルv',90,armorItems);
assert.strictEqual(hr[0].seriesName,'シュバルカメイル');
assert.strictEqual(hr[0].name,'シュバルカメイルγ');
assert(hr[0].seriesScore>hr.find(x=>x.name==='ドシャグマメイルα').seriesScore);
const ha=hs.agg([{raw:'シュバルカメイルv',conf:80},{raw:'シュバルカメイルγ',conf:90}],armorItems);
assert.strictEqual(ha[0].name,'シュバルカメイルγ');
assert.strictEqual(ha[0].support,2);
assert.strictEqual(ha[0].hierarchy.seriesScore,ha[0].avgSeriesScore);
console.log('step125b v2.3 hierarchical armor tests passed');
