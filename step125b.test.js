const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const html = fs.readFileSync('index.html','utf8');
assert(html.includes('<title>Step 1.25-B v2.5'), 'title must be Step 1.25-B v2.5');
assert(html.includes('MH Wilds OCR — Step 1.25-B v2.5'), 'visible h1 must be Step 1.25-B v2.5');
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
  {id:3,kind:'chest',category:'chest',name:'シュバルカメイルγ'}
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
assert(html.includes("const passes=[['white_extract','白文字強調'],['otsu','大津二値化'],['grayscale','グレースケール']];"),
  'v2.4 equipment OCR passes must include adaptive preprocessing');
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
  CATEGORY_ANCHORS:{head:['ヘルム'],chest:['メイル'],arms:['アーム'],waist:['コイル'],legs:['グリーヴ']},
  armorCategoryKey:c=>({'頭防具':'head','胴防具':'chest','腕防具':'arms','腰防具':'waist','脚防具':'legs'}[c]||c||''),
  parseArmorStructure:(raw,cat)=>{const clean=String(raw||'').replace(/[\s\._|｜]+/g,'');const anchors=hs.CATEGORY_ANCHORS[hs.armorCategoryKey(cat)]||[];for(const a of anchors){const i=clean.indexOf(a);if(i>=0)return {hasAnchor:true,seriesPart:clean.substring(0,i),anchorPart:a,tailPart:clean.substring(i+a.length)}}return {hasAnchor:false,seriesPart:clean,anchorPart:'',tailPart:''};},
  armorDbStructure:(name,cat)=>hs.parseArmorStructure(name,cat),
  parseSubtypeFromTail:s=>/^(?:v|γ)$/i.test(String(s||''))?'γ':/^(?:6|b|BQ|β)$/i.test(String(s||''))?'β':/^(?:a|aq|α)$/i.test(String(s||''))?'α':'',
  normalizeForNameScore:v=>Array.from(String(v||'').normalize('NFKC')).filter(ch=>!/[\s\u3000・･·•\-‐‑‒–—―＿_.,，。！？!?、:：;；/／\\|｜()[\]{}「」『』【】〈〉《》<>＋+＝=＊*#＃%％&＆@＠]/.test(ch)),
  splitEquipmentSubtype:raw=>{const s=String(raw||'').replace(/\s+/g,'').replace(/(?:v|V|ν)$/u,'γ').replace(/(?:aq|a)$/iu,'α').replace(/(?:bq|b|BQ)$/iu,'β');const m=s.match(/^(.*?)([αβγ])$/u);return m?{base:m[1],subtype:m[2]}:{base:s,subtype:null};},
  weightedNameDistance:(raw,name)=>({score:String(raw).replace(/\s/g,'')===String(name).replace(/\s/g,'')?1:.4}),
  equipmentSubtypeScore:(raw,item)=>hs.splitEquipmentSubtype(raw).subtype===hs.splitEquipmentSubtype(item).subtype?1:0,
  confidenceWeight:()=>1};
vm.createContext(hs);
vm.runInContext(hCode+'\nthis.rank=rankHierarchicalArmorCandidates;this.agg=aggregateHierarchicalArmorCandidates;',hs);
const armorItems=[
  {id:1,kind:'chest',category:'chest',name:'シュバルカメイルα'},
  {id:2,kind:'chest',category:'chest',name:'シュバルカメイルβ'},
  {id:3,kind:'chest',category:'chest',name:'シュバルカメイルγ'},
  {id:4,kind:'chest',category:'chest',name:'ドシャグマメイルα'}
];
const hr=hs.rank('シュバルカメイルv',90,armorItems);
assert.strictEqual(hr[0].seriesName,'シュバルカメイル');
assert.strictEqual(hr[0].name,'シュバルカメイルγ');
assert(hr[0].seriesScore>hr.find(x=>x.name==='ドシャグマメイルα').seriesScore);
const ha=hs.agg([{raw:'シュバルカメイルv',conf:80},{raw:'シュバルカメイルγ',conf:90}],armorItems);
assert.strictEqual(ha[0].name,'シュバルカメイルγ');
assert.strictEqual(ha[0].support,2);
assert(ha.some(x=>x.name==='シュバルカメイルα'), 'all variants in the winning series must remain comparable');
assert(ha.some(x=>x.name==='シュバルカメイルβ'), 'all variants in the winning series must remain comparable');
assert(ha.filter(x=>x.seriesName==='シュバルカメイル').length===3, 'stage 2 must compare all alpha/beta/gamma variants within the winning series');
const noisyArmorItems=[
  {id:1,kind:'chest',category:'chest',name:'シュバルカメイルα'},
  {id:2,kind:'chest',category:'chest',name:'シュバルカメイルβ'},
  {id:3,kind:'chest',category:'chest',name:'シュバルカメイルγ'},
  {id:4,kind:'chest',name:'コンガメイルα'},
  {id:5,kind:'chest',name:'コンガメイルβ'},
  {id:6,kind:'chest',name:'コンガメイルγ'},
];
const hn=hs.agg([{raw:'シュバルカメイルv',conf:80},{raw:'シュバルカメイルγ',conf:90},{raw:'シュバルカメイルv',conf:85}],noisyArmorItems);
assert.strictEqual(hn.filter(x=>x.seriesName==='シュバルカメイル').length,3, 'winning series must keep all subtype variants even when other series compete');
assert.strictEqual(hn[0].name,'シュバルカメイルγ');
assert.strictEqual(ha[0].hierarchy.seriesScore,ha[0].avgSeriesScore);
console.log('step125b v2.3 hierarchical armor tests passed');


// Step 1.25-B v2.5 RED: adaptive preprocessing and contextual subtype normalization.
// Otsu must be available as a standalone canvas transform without changing OCR pass count.
const otsuStart = html.indexOf('function otsuThreshold(');
assert(otsuStart >= 0, 'v2.4 Otsu helper must exist');
const otsuEnd = html.indexOf('\nfunction ', otsuStart + 10);
const otsuCode = html.slice(otsuStart, otsuEnd > otsuStart ? otsuEnd : otsuStart + 2500);
const otsuCtx = {
  getImageData:()=>({data:new Uint8ClampedArray([0,0,0,255, 255,255,255,255]), width:2, height:1}),
  putImageData:img=>{otsuCtx.last=img;}
};
const os = {Math, Array, Uint8ClampedArray};
vm.createContext(os);
vm.runInContext(otsuCode+'\nthis.otsu=otsuThreshold;', os);
os.otsu(otsuCtx,2,1);
assert(os.otsu && otsuCtx.last && otsuCtx.last.data[0]===0 && otsuCtx.last.data[4]===255, 'Otsu should binarize a simple bimodal image');
assert(html.includes("const passes=[['white_extract','白文字強調'],['otsu','大津二値化'],['grayscale','グレースケール']];"), 'v2.4 equipment OCR must use adaptive three-pass preprocessing');

// Contextual suffix normalization: only the terminal subtype-like token is rewritten.
const sub24Start = html.indexOf('function normalizeSubtypeSymbols(');
const sub24End = html.indexOf('\nfunction getDictionary', sub24Start);
const sub24Code = html.slice(sub24Start, sub24End);
const s24 = {Math, Number, String, Object, Array};
vm.createContext(s24);
vm.runInContext(sub24Code+'\nthis.norm=normalizeSubtypeSymbols;', s24);
assert.strictEqual(s24.norm('シュバルカメイル80Q'), 'シュバルカメイルβ');
assert.strictEqual(s24.norm('護火竜アーム6'), '護火竜アームβ');
assert.strictEqual(s24.norm('クイーンピアスaq'), 'クイーンピアスα');
assert.strictEqual(s24.norm('シュバルカメイルv'), 'シュバルカメイルγ');
assert.strictEqual(s24.norm('ゴアグリーヴ80Q し'), 'ゴアグリーヴ80Q し', 'non-terminal noise must not be globally rewritten');

// v2.4 RED: series evidence must be exposed independently from subtype evidence.
const seriesCodeStart = html.indexOf('function armorSeriesEvidence(');
assert(seriesCodeStart >= 0, 'v2.4 armorSeriesEvidence helper must exist');
const seriesCodeEnd = html.indexOf('\nfunction rankHierarchicalArmorCandidates(', seriesCodeStart);
const seriesCode = html.slice(seriesCodeStart, seriesCodeEnd);
const se = {Math, Number, String, Object, Array, Map,
  armorBaseName:raw=>String(raw||'').replace(/[αβγ]$/u,''),
  armorSeriesScore:(raw,name)=>{
    const a=String(raw||'').replace(/[αβγ]$/u,'').replace(/\s/g,'');
    const b=String(name||'').replace(/[αβγ]$/u,'').replace(/\s/g,'');
    return a.includes(b)||b.includes(a)?0.9:0.2;
  }};
vm.createContext(se);
vm.runInContext(seriesCode+'\nthis.ev=armorSeriesEvidence;', se);
const ev=se.ev([{raw:'シュバルカメイルv',conf:72},{raw:'シュバルカメイルv',conf:70},{raw:'ノイズ',conf:20}], 'シュバルカメイル');
assert(ev.score>=0.8, 'repeated strong OCR should raise series evidence');
assert(ev.support===2, 'series evidence support should count matching OCR passes');

// v2.4 RED: adaptive preprocessing helper must exist and use local Otsu threshold.
assert(html.includes("const passes=[['white_extract','白文字強調'],['otsu','大津二値化'],['grayscale','グレースケール']];"), 'v2.4 equipment OCR must use adaptive three-pass preprocessing');

// v2.4 RED: subtype parsing must be tail-only, while the series matcher must tolerate OCR insertions/deletions.
const parseStart = html.indexOf('function parseSubtypeFromTail(');
assert(parseStart >= 0, 'v2.4 parseSubtypeFromTail helper must exist');
const parseEnd = html.indexOf('\nfunction matchArmorV24', parseStart);
assert(parseEnd > parseStart, 'v2.4 matchArmorV24 must follow subtype parser');
const parseCode = html.slice(parseStart, parseEnd);
const ps = {Math, Number, String, Object, Array};
vm.createContext(ps);
vm.runInContext(parseCode+'\nthis.parseSubtypeFromTail=parseSubtypeFromTail;', ps);
assert.strictEqual(ps.parseSubtypeFromTail('v'), 'γ');
assert.strictEqual(ps.parseSubtypeFromTail('6'), 'β');
assert.strictEqual(ps.parseSubtypeFromTail('aq'), 'α');
assert.strictEqual(ps.parseSubtypeFromTail('80Q'), 'β');
assert.strictEqual(ps.parseSubtypeFromTail('ゴア80Q'), '', 'tail parser must not reinterpret multi-character non-tail text');

// v2.4 RED: series matching must be part-limited and resilient to common OCR corruption.
const matchStart = html.indexOf('function matchArmorV24(');
const matchEnd = html.indexOf('\nfunction rankHierarchicalArmorCandidates', matchStart);
assert(matchStart >= 0 && matchEnd > matchStart, 'v2.4 matchArmorV24 helper must exist');
const helperStart = html.indexOf('function armorEditSimilarity(');
const matchCode = html.slice(parseStart, matchEnd);
const ms = {Math, Number, String, Object, Array, Map};
vm.createContext(ms);
vm.runInContext(matchCode+'\nthis.matchArmorV24=matchArmorV24;', ms);
const db = [
  {name:'護火竜アームα',category:'腕防具'},
  {name:'護火竜アームβ',category:'腕防具'},
  {name:'護火竜アームγ',category:'腕防具'},
  {name:'コンガアームα',category:'腕防具'}
];
const m1 = ms.matchArmorV24('護火音アーム6','腕防具',db);
assert(m1 && m1.item.name==='護火竜アームβ', 'corrupted series + tail 6 should resolve to 護火竜アームβ');
const m2 = ms.matchArmorV24('ゴアグリーヴ80Q','脚防具',[{name:'ゴアグリーヴα',category:'脚防具'},{name:'ゴアグリーヴβ',category:'脚防具'},{name:'コンガグリーヴα',category:'脚防具'}]);
assert(m2 && m2.item.name==='ゴアグリーヴβ', 'part-limited series matching should resolve ゴアグリーヴβ');

console.log('step125b v2.4 adaptive preprocessing/series evidence RED tests passed');


// Step 1.25-B v2.5 RED: armor structure anchors isolate the series from the part suffix.
const v25AnchorStart = html.indexOf('function parseArmorStructure(');
assert(v25AnchorStart >= 0, 'v2.5 parseArmorStructure helper must exist');
const v25AnchorEnd = html.indexOf('\nfunction matchArmorV25', v25AnchorStart);
assert(v25AnchorEnd > v25AnchorStart, 'v2.5 armor matcher must follow structure parser');
const v25AnchorCode = "const CATEGORY_ANCHORS={head:['ヘルム','キャップ','クラウン','ピアス','ヘッド'],chest:['メイル','ベスト','スーツ','ジャケット','ボディ'],arms:['アーム','グラブ','アームズ','カフス','バンテージ'],waist:['コイル','フォールド','ウエスト','ベルト','ループ'],legs:['グリーヴ','ブーツ','パンツ','トラウザー','レギンス']};\nfunction armorCategoryKey(c){return ({'頭防具':'head','胴防具':'chest','腕防具':'arms','腰防具':'waist','脚防具':'legs'}[c]||c||'');}\n"+html.slice(v25AnchorStart, v25AnchorEnd);
const a25 = {Math, Number, String, Object, Array};
vm.createContext(a25);
vm.runInContext(v25AnchorCode+'\nthis.parseArmorStructure=parseArmorStructure;', a25);
const ah = a25.parseArmorStructure('謀電器音ヘルムBQ','頭防具');
assert.strictEqual(ah.hasAnchor,true);
assert.strictEqual(ah.seriesPart,'謀電器音');
assert.strictEqual(ah.anchorPart,'ヘルム');
assert.strictEqual(ah.tailPart,'BQ');
const ac = a25.parseArmorStructure('シュバパルカメイルv','胴防具');
assert.strictEqual(ac.anchorPart,'メイル');
assert.strictEqual(ac.seriesPart,'シュバパルカ');
assert.strictEqual(ac.tailPart,'v');

// v2.5 RED: talisman structure must isolate the prefix before 「の」 and preserve level parsing.
const talStart = html.indexOf('function parseTalismanStructure(');
assert(talStart >= 0, 'v2.5 parseTalismanStructure helper must exist');
const talEnd = html.indexOf('\nfunction matchTalismanV25', talStart);
assert(talEnd > talStart, 'v2.5 talisman matcher must follow structure parser');
const talCode = html.slice(talStart, talEnd);
const ts = {Math, Number, String, Object, Array};
vm.createContext(ts);
vm.runInContext("function parseTalismanLevel(s){return String(s||'').includes('Ⅳ')?'Ⅳ':'';}\n"+talCode+'\nthis.parseTalismanStructure=parseTalismanStructure;', ts);
const tp = ts.parseTalismanStructure('由由の護引 ニ');
assert.strictEqual(tp.anchorFound,true);
assert.strictEqual(tp.prefixCandidate,'由由');
assert.strictEqual(tp.suffixCandidate,'護引ニ');
const tp2 = ts.parseTalismanStructure('栄世護石Ⅳ');
assert.strictEqual(tp2.anchorFound,true);
assert.strictEqual(tp2.prefixCandidate,'栄世');

// v2.5 RED: matching must use anchor structure before full-name similarity.
const m25Start = html.indexOf('function matchArmorV25(');
const m25End = html.indexOf('\nfunction parseTalismanStructure', m25Start);
assert(m25Start >= 0 && m25End > m25Start, 'v2.5 armor matcher helper must exist');
const m25Code = "const CATEGORY_ANCHORS={head:['ヘルム'],chest:['メイル'],arms:['アーム'],waist:['コイル'],legs:['グリーヴ']};function armorCategoryKey(c){return ({'頭防具':'head','胴防具':'chest','腕防具':'arms','腰防具':'waist','脚防具':'legs'}[c]||c||'');}\n"+html.slice(v25AnchorStart, m25End);
const m25 = {Math, Number, String, Object, Array, Map,
  robustArmorSeriesSimilarity:(a,b)=>{a=String(a||'').replace(/\s/g,'');b=String(b||'').replace(/\s/g,'');if(a===b)return 1;if(a.includes(b)||b.includes(a))return .92;return .25;},
  armorBaseName:s=>String(s||'').replace(/[αβγ]$/u,''),
  splitEquipmentSubtype:s=>{const m=String(s||'').match(/^(.*?)([αβγ])$/u);return m?{base:m[1],subtype:m[2]}:{base:String(s||''),subtype:null};},
  calculateSimilarity:(a,b)=>{
    a=String(a||''); b=String(b||'');
    if(a==='謀電器音'&&b==='護雷顎竜') return 0.25;
    return a===b?1:0.1;
  },
  parseSubtypeFromTail:s=>String(s)==='BQ'?'β':'',
};
vm.createContext(m25);
vm.runInContext(m25Code+'\nthis.matchArmorV25=matchArmorV25;', m25);
const armor25db=[
 {name:'護雷顎竜ヘルムα',category:'頭防具'},
 {name:'護雷顎竜ヘルムβ',category:'頭防具'},
 {name:'コンガヘルムβ',category:'頭防具'}
];
const am25=m25.matchArmorV25('謀電器音ヘルムBQ','頭防具',armor25db);
assert(am25 && am25.item.name==='護雷顎竜ヘルムβ', 'anchor-separated matching should prefer the correct armor family');

// v2.5 RED: talisman matching must not let suffix OCR noise contaminate prefix matching.
const tm25Start = html.indexOf('function matchTalismanV25(');
assert(tm25Start >= 0, 'v2.5 matchTalismanV25 helper must exist');
const tm25End = html.indexOf('\nfunction ', tm25Start + 10);
const tm25Code = html.slice(talStart, tm25End > tm25Start ? tm25End : tm25Start + 5000);
const tm = {Math, Number, String, Object, Array,
  robustArmorSeriesSimilarity:(a,b)=>{a=String(a||'').replace(/\s/g,'');b=String(b||'').replace(/\s/g,'');return (a==='由由'&&b==='栄世')?.8:(a===b?1:0);},
  calculateSimilarity:(a,b)=>{
    a=String(a||''); b=String(b||'');
    if(a==='由由'&&b==='栄世') return 0.8;
    return a===b?1:0;
  },
  parseTalismanLevel:s=>String(s).includes('Ⅳ')?'Ⅳ':''
};
vm.createContext(tm);
vm.runInContext(tm25Code+'\nthis.matchTalismanV25=matchTalismanV25;', tm);
const talDb=[{name:'栄世の護石',category:'護石'},{name:'整備の護石Ⅳ',category:'護石'}];
const tmres=tm.matchTalismanV25('由由の護引 ニ',talDb);
assert(tmres && tmres.item.name==='栄世の護石', 'talisman prefix matching should ignore suffix OCR noise');
console.log('step125b v2.5 RED tests passed');
