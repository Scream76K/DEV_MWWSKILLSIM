'use strict';
const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const {createSession,validateSession,renderCaptureStatus}=require('../tools/capture-session.cjs');
const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'..','R121_CAPTURE_MANIFEST.json'),'utf8'));
test('r142: 14 weapons with three HBG controls and no invented verification',()=>{const s=createSession(manifest);assert.equal(s.shots.length,16);assert.equal(s.shots.filter(x=>x.weapon==='heavy-bowgun').length,3);assert.ok(s.shots.every(x=>x.status==='NOT_CAPTURED'&&x.hitEvidence===null));assert.equal(s.verification,'UNVERIFIED');});
test('r142: rejected duplicate shot identifiers',()=>{const s=createSession(manifest);s.shots[1].id=s.shots[0].id;assert.throws(()=>validateSession(s),/invalid shot/);});
test('r142: reviewed requires equipment, hit and timing evidence',()=>{const s=createSession(manifest);s.shots[0].status='REVIEWED';assert.throws(()=>validateSession(s),/missing evidence/);s.shots[0].equipmentEvidence='screen';s.shots[0].hitEvidence='video';s.shots[0].timingEvidence='frames';assert.equal(validateSession(s),true);});
test('r142: checklist does not claim game verification',()=>{const s=createSession(manifest);assert.match(renderCaptureStatus(s),/数値確定・DPS検証完了を意味しません/);});
