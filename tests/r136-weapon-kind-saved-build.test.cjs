const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');const app=fs.readFileSync(path.join(root,'index.html'),'utf8');const review=fs.readFileSync(path.join(root,'evidence-review.js'),'utf8');
test('save snapshot persists MHDB canonical weapon kind',()=>{assert.match(app,/weaponKind:canonicalWeaponKind\(DB\.weapons\.find\(/);});
test('legacy builds without authoritative kind are blocked',()=>{assert.match(review,/typeof build\.weaponKind!=='string'/);assert.match(review,/再保存してください/);});
test('cross-weapon and inconsistent diagnostic records are rejected before mutation',()=>{assert.match(review,/build\.weaponKind!==selected/);assert.match(review,/record\.weaponId!==selected/);assert.ok(review.indexOf('build.weaponKind!==selected')<review.indexOf('record.equipmentId=String(build.weaponId)'));});
test('saved build read-only behavior is preserved',()=>{assert.doesNotMatch(review,/localStorage\.setItem/);assert.match(review,/record\.savedBuildRef=/);});
