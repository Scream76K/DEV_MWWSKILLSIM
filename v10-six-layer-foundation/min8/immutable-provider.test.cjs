'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {createImmutableProvider}=require('./immutable-provider.cjs');
const versions={game:'g',equipment:'e',technique:'t',effects:'fx'};
function fixture(){let live={versions:{...versions},equipment:{attack:10},techniques:{move:{id:'move',dataVersion:'t',revision:'r1',events:[]}},effects:{bonus:2}};const open=createImmutableProvider({capture:()=>live,resolveBuild:(input,eq)=>({weaponType:'bow',trueAttack:eq.attack+input.raw}),resolveEffects:(_b,_c,_ch,fx)=>[{amount:fx.bonus}]});return {open,mutate:()=>{live.equipment.attack=900;live.techniques.move.revision='r2';live.effects.bonus=100}}}
test('capture copies equipment, technique and effects together',()=>{const f=fixture(),s=f.open(versions);f.mutate();assert.equal(s.resolveBuild({raw:1},'e','g',{}).trueAttack,11);assert.equal(s.readTechnique('move','t').revision,'r1');assert.equal(s.resolveEffects({}, {}, 'normal','fx')[0].amount,2)});
test('mutating returned records does not alter snapshot',()=>{const s=fixture().open(versions),t=s.readTechnique('move','t');t.revision='other';assert.equal(s.readTechnique('move','t').revision,'r1');const e=s.resolveEffects({}, {},'normal','fx');e[0].amount=999;assert.equal(s.resolveEffects({}, {},'normal','fx')[0].amount,2)});
test('bad versions fail closed',()=>{const s=fixture().open(versions);assert.throws(()=>s.readTechnique('move','wrong'),/VERSION_MISMATCH/);assert.throws(()=>s.resolveBuild({},'wrong','g',{}),/VERSION_MISMATCH/)});
test('capture source must provide complete data snapshot',()=>{const bad=createImmutableProvider({capture:()=>({versions,techniques:{}}),resolveBuild:()=>({}),resolveEffects:()=>[]});assert.throws(()=>bad(versions),/SNAPSHOT_equipment_INVALID/)});
