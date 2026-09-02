#!/usr/bin/env python3
"""ei-site用 fal 画像生成（falの教科書の型: 画風の親=既存ブランドマークを参照・1画像1call・台帳記帳）
使い方: python3 tools/fal_gen.py <name> "<prompt>" [--size landscape_4_3|square_hd|...] [--quality high] [--ref path ...]
キー: 環境変数 FAL_KEY または apps/short-factory/assets/.fal_key（git除外）
"""
import argparse, base64, json, os, sys, time, urllib.request, mimetypes, datetime, pathlib
QUEUE="https://queue.fal.run"; MODEL="openai/gpt-image-2/edit"
HERE=pathlib.Path(__file__).resolve().parent.parent
def key():
    k=os.environ.get("FAL_KEY","").strip()
    if not k:
        p=HERE.parent/"short-factory"/"assets"/".fal_key"
        if p.exists(): k=p.read_text().strip()
    if not k: sys.exit("FAL_KEY未設定")
    return k
def req(url,payload=None):
    data=json.dumps(payload).encode() if payload is not None else None
    r=urllib.request.Request(url,data=data,headers={"Authorization":f"Key {key()}","Content-Type":"application/json"})
    with urllib.request.urlopen(r,timeout=180) as resp: return json.loads(resp.read())
def datauri(path):
    mt=mimetypes.guess_type(path)[0] or "image/png"
    return f"data:{mt};base64,"+base64.b64encode(open(path,"rb").read()).decode()
def main():
    ap=argparse.ArgumentParser(); ap.add_argument("name"); ap.add_argument("prompt")
    ap.add_argument("--size",default="landscape_4_3"); ap.add_argument("--quality",default="high")
    ap.add_argument("--ref",nargs="*",default=[str(HERE/"assets/request73-v4/selected/brand-atelier-mark.png")])
    ap.add_argument("--n",type=int,default=1); ap.add_argument("--fmt",default="png")
    a=ap.parse_args()
    payload={"prompt":a.prompt,"image_urls":[datauri(p) for p in a.ref],"image_size":a.size,"quality":a.quality,"num_images":a.n,"output_format":a.fmt}
    t0=time.time(); sub=req(f"{QUEUE}/{MODEL}",payload)
    status_url=sub.get("status_url"); resp_url=sub.get("response_url")
    while True:
        st=req(status_url+"?logs=0"); s=st.get("status")
        if s=="COMPLETED": break
        if s in ("FAILED","ERROR"): sys.exit("fal失敗: "+json.dumps(st)[:500])
        time.sleep(3)
    res=req(resp_url); outdir=HERE/"assets/fal-2026-09/raw"; outdir.mkdir(parents=True,exist_ok=True)
    outs=[]
    for i,im in enumerate(res["images"]):
        p=outdir/f"{a.name}{'' if a.n==1 else '-'+str(i+1)}.{a.fmt}"
        urllib.request.urlretrieve(im["url"],p); outs.append(str(p))
    dt=round(time.time()-t0,1)
    ledger=HERE/"assets/fal-2026-09/00_生成台帳.md"
    if not ledger.exists(): ledger.write_text("# ei-site fal生成台帳（1画像1行・実費はfal請求画面で月末照合）\n\n| 日時 | name | model | size/quality | 秒 | 出力 | prompt要旨 |\n|---|---|---|---|---|---|---|\n")
    with open(ledger,"a") as f: f.write(f"| {datetime.datetime.now():%m/%d %H:%M} | {a.name} | {MODEL} | {a.size}/{a.quality} | {dt} | {', '.join(os.path.basename(o) for o in outs)} | {a.prompt[:60].replace('|','/')}… |\n")
    print(json.dumps({"outputs":outs,"seconds":dt},ensure_ascii=False))
main()
