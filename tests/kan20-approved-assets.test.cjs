'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
// Golden hashes lock the independently reviewed, owner-approved crop pixels.
const approvedHashes={"fire": "3638ae0243789664c9820ca02839092e20b645da6c336e1b749f615e1b95b008", "water": "bd1746b815d7190d7571916a7a5bd7a5d6825a579dcf8ac1208ca035558ae6ea", "thunder": "e0130bffd505efdae9d1cab1f72d6f2caa0c374922e6e2572112c38432323de4", "ice": "8fea3cd56beb9911cd5227192f5bc16a4c3b9a9ae66708cb54ab4798dc5fab1a", "dragon": "6b46727abe885dec283db57fca979517fa873a2b74646116a708591c0fccf263", "poison": "6b128796e5644e62ed6379cdd8e7061231a8774b35675ce8a4cd7d095015050c", "paralysis": "3662c0c971146ce10d05df8d11d8ef69b2863d23f91e180755c95230e32344b6", "sleep": "56e4c647571b60a6c1ed43dd0d9ba330b3c5b25bd0c8d240328952fc42240dd4", "blast": "2859652381c8ccfb49608a2138bec3b70a96c44a6381670cec281c814349c222"};
for(const key of ['fire','water','thunder','ice','dragon','poison','paralysis','sleep','blast'])test('approved '+key+' asset is 128px RGBA PNG selected by common renderer',()=>{
 const p=path.join(__dirname,'../assets/element-icons',key+'.png'),b=fs.readFileSync(p);
 assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a');assert.equal(b.readUInt32BE(16),128);assert.equal(b.readUInt32BE(20),128);assert.equal(b[25],6);assert.equal(require('node:crypto').createHash('sha256').update(b).digest('hex'),approvedHashes[key]);
 const html=require('../element-display.js').render({elementType:key,typeKnown:true,elementKnown:false,elementStatus:'UNKNOWN',element:null});assert.match(html,new RegExp(key+'\\.png'));assert.match(html,/未算出/);
});
