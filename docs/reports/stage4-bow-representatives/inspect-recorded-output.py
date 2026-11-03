import json,hashlib,pathlib
r=pathlib.Path('docs/reports/stage4-bow-representatives');p=json.load(open(r/'public-run.json'));db=json.load(open(r/'mhdb-loaded-cache.json'))['data']; dec={str(x['id']):x for x in db['decorations']};weap={str(x['id']):x for x in db['weapons']}
checks=[]
for c in p['cases']:
 s=c['snapshot'];slots={}
 for i,v in enumerate(weap[s['weaponId']]['slots']): slots['w'+str(i)]=(v,'weapon')
 for k,a in c['slots'].items():
  for i,v in enumerate(a['slots']):slots[k+str(i)]=(v,'armor')
 for i,v in enumerate(s['charmCustom']['weaponSlots']):slots['cw'+str(i)]=(v,'weapon')
 for i,v in enumerate(s['charmCustom']['slots']):slots['c'+str(i)]=(v,'armor')
 for k,did in s['decos'].items():
  d=dec[did];lv,kind=slots[k];assert d['slot']<=lv and d['kind']==kind,(k,d)
 row=next(x for x in p['comparison'] if x['name']==c['id']);loaded=next(x for x in p['loads'] if x['id']==c['id'])
 assert row['pipeline'].get('channels')==c['result'].get('channels'); assert row['pipeline'].get('reason')==c['result'].get('reason'); assert loaded['result']==c['result']
 if 'channels' in c['result']:
  totals={ch:x['metrics']['comboTotalDamage']['value'] for ch,x in c['result']['channels'].items()}
  assert all(f'{x:.1f}' in c['summary'] and f'{x:.1f}' in p['comparisonText'] for x in totals.values())
 else:totals=None
 checks.append({'id':c['id'],'decorationSlotsAndKinds':'pass','charm':c['charm']['status'],'saveLoadAndComparisonResultMatch':'pass','totals':totals,'reason':c['result'].get('reason')})
assert p['before']==p['after'] and p['savedBefore']==p['savedAfter']
manifest={'sourceSHA256':hashlib.sha256((r/'mhdb-loaded-cache.json').read_bytes()).hexdigest(),'sourceBytes':(r/'mhdb-loaded-cache.json').stat().st_size,'sourceProvenance':'User-exported normalized app DB; acquisitionDate and apiDataVersion unknown. Original Downloads file untouched.','counts':{k:len(v) for k,v in db.items()},'runs':[{'command':'node tools/stage4-real-bow-proof.cjs','log':'public-before.json','exit':1,'reason':'Harness used unexposed closure function renderBuildTemplateUI; no template run.'},{'command':'node tools/stage4-real-bow-proof.cjs','log':'public-run.json','exit':1,'reason':'Both public runs and save/load/compare completed; final assertion assumed channels on blocked Kotatu and threw TypeError. Raw unavailable result retained.'}],'existingOutputChecks':checks,'savedTwoAndCurrentStateUnchanged':True,'productHashes':p['hashes'],'limitations':['JSDOM only; actual exported equipment records, no synthetic equipment.','Representative bow profile, not verified source-video combo.','No coating, critical range, start shot 1, overcome explicitly selected.','Kotatu attribute-conversion bow scope blocked; activation input remains unspecified and requires explicit scenario once scope is resolved.','Sara totals rendered; DPS unavailable, duration unspecified.','No game/Safari/full regression/F01 injection; no product edits.']}
(r/'loaded-data-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(checks,ensure_ascii=False))
