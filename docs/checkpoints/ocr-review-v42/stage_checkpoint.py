#!/usr/bin/env python3
"""Assemble OCR checkpoint in an empty staging directory; never edit the input."""
from pathlib import Path
import argparse, hashlib, json, re, subprocess, tempfile
BASE='b224a8e5db74390a3313d92abf02b1ba64d5377e19ee4b2f9f06d5c03e6fc69f'
CANDIDATE='07631c83deef4611d483d359c71828099c169961c5495acb798dbf4f633737e1'
HERE=Path(__file__).resolve().parent
def digest(b):return hashlib.sha256(b).hexdigest()
def patch(src,delta):
    with tempfile.TemporaryDirectory() as tmp:
        path=Path(tmp)/'input'
        path.write_text(src,encoding='utf-8')
        subprocess.run(['patch','--batch','--forward','--fuzz=0',str(path),str(HERE/delta)],check=True,capture_output=True)
        return path.read_text(encoding='utf-8')
def literal(h,anchor):
    a=h.index(anchor)+len(anchor)
    s,n=json.JSONDecoder().raw_decode(h[a:])
    return a,n,s
ap=argparse.ArgumentParser(description=__doc__)
ap.add_argument('index',type=Path)
ap.add_argument('stage',type=Path)
args=ap.parse_args()
base=args.index.read_bytes()
if digest(base)!=BASE:ap.error('Unexpected target index SHA-256; review branch changes before applying')
if args.stage.exists() and (not args.stage.is_dir() or any(args.stage.iterdir())):ap.error('Stage must be empty; input repo is never altered')
h=base.decode('utf-8')
assert 'code.textContent="window.__OCR_SHADOW_ROOT__' in h
a,n,source=literal(h,'code.textContent=')
marker='"<INLINE_OCR>"'
h=patch(h[:a]+marker+h[a+n:],'host.patch')
source=patch(source,'embedded.patch')
a,n,css=literal(h,'  style.textContent=')
css,count=re.subn(r'\.step-label\{[^}]*\}',(HERE/'step-label.css').read_text().strip(),css)
assert count==1
h=h[:a]+json.dumps(css,ensure_ascii=True)+h[a+n:]
assert h.count(marker)==1
out=h.replace(marker,json.dumps(source,ensure_ascii=True)).encode()
assert digest(out)==CANDIDATE,'Candidate hash differs; aborting before any writes'
(args.stage/'ui').mkdir(parents=True)
(args.stage/'index.html').write_bytes(out)
(args.stage/'ui/decoration-ocr-confirmation.js').write_bytes((HERE/'decoration-ocr-confirmation.js').read_bytes())
print('Staged candidate SHA-256:',digest(out))
