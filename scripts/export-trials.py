from pathlib import Path
import json
import numpy as np
from scipy.io import loadmat
import argparse

parser=argparse.ArgumentParser(description='Export two speech BCI trials with verified MATLAB-to-Python index conversion.')
parser.add_argument('--source',type=Path,required=True)
parser.add_argument('--output',type=Path,required=True)
args=parser.parse_args()
src=args.source
out=args.output
out.mkdir(parents=True,exist_ok=True)
d=loadmat(src,variable_names=['goTrialEpochs','sentenceDurations','trialState','sentences','ngramFinalOutput','ngramPartialOutput','spikePow','blockNum','blockList','blockTypes','speakingMode'])
blocks=[str(np.asarray(x).ravel()[0]) for x in d['blockTypes'].ravel()]
blockmap={int(b):blocks[i] for i,b in enumerate(d['blockList'].ravel())}
records=[]
for idx in [362,364]:
    first,last=map(int,d['goTrialEpochs'][idx])
    # MATLAB uses 1-based inclusive bounds; Python uses 0-based, exclusive end.
    start,end=first-1,last
    expected=int(d['sentenceDurations'].ravel()[idx])
    assert end-start==expected, 'Trial duration disagrees with source metadata'
    assert np.all(d['trialState'][start:end]==1), 'Extract must contain only go-period bins'
    assert start==0 or d['trialState'][start-1,0]!=1
    assert end==len(d['trialState']) or d['trialState'][end,0]!=1
    # One point every 40 ms; log-scaled and normalized only to make the heatmap legible.
    signal=np.asarray(d['spikePow'][start:end:2,:],dtype=np.float32)
    signal=np.log1p(np.maximum(signal,0))
    lo=float(np.percentile(signal,1)); hi=float(np.percentile(signal,99.5))
    q=np.clip((signal-lo)/max(hi-lo,1e-8)*255,0,255).astype(np.uint8)
    partial=[]
    for t in range(start,end):
        cell=d['ngramPartialOutput'].ravel()[t]
        if np.asarray(cell).size:
            text=str(np.asarray(cell).ravel()[0]).strip()
            if text:
                ms=round((t-start)*20)
                if not partial or text!=partial[-1]['text']:
                    partial.append({'ms':ms,'text':text})
    target=str(np.asarray(d['sentences'].ravel()[idx]).ravel()[0])
    decoded=str(np.asarray(d['ngramFinalOutput'].ravel()[idx]).ravel()[0]).strip()
    b=int(d['blockNum'][start,0])
    assert all(0<=p['ms']<(end-start)*20 for p in partial)
    records.append({'id':f'Trial {idx+1}','target':target,'decoded':decoded,'block':b,'blockType':blockmap[b],'sourceEpochOneBasedInclusive':[first,last],'sourceBinCount':expected,'startTimeMs':round(start*20),'durationMs':(end-start)*20,'sampleIntervalMs':40,'channels':256,'activityMinLog1p':lo,'activityMaxLog1p':hi,'activityQ':q.tolist(),'partial':partial})
payload={'title':'Recorded speech BCI trials','sourceStudy':'Willett et al., A high-performance speech neuroprosthesis (2023)','dataset':'Dryad DOI 10.5061/dryad.x69p8czpq, Version 4 sentences file','participantCode':'T12','speakingMode':str(np.asarray(d['speakingMode']).ravel()[0]),'signalDescription':'Spike-band power, 256 channels, originally binned at 20 ms. For this display, frames are sampled every 40 ms and log-scaled to heatmap contrast.','decoderDescription':'Real-time RNN and n-gram partial/final text outputs recorded during the experiment.','records':records}
payload['sourceFile']=src.name
payload['indexing']='MATLAB 1-based inclusive epochs converted to Python [first-1:last]; partial timestamps relative to first go-period bin.'
(out/'trials.json').write_text(json.dumps(payload,separators=(',',':')),encoding='utf-8')
print('records',[(x['id'],x['target'],x['decoded'],len(x['partial']),len(x['activityQ'])) for x in records])
print('json bytes',(out/'trials.json').stat().st_size)
