const $=s=>document.querySelector(s);
let dataset,recordIndex=0,stage=0,unlocked=0,playing=false,fraction=0,started=0,offset=0,raf=0;
const completed=[false,false];
const titles=['Record the attempted speech','Follow the decoder','Compare intention and prediction','Give the decoded words a voice'];
const explanations=['The participant attempts to speak. Watch the illustrated implant collect signals. No words or audio are revealed at this stage.','Replay the predictions recorded during this trial. Particles illustrate information flowing into the decoder. No model runs in this browser.','Compare the prompted sentence with the recorded final prediction. A decoder can make mistakes.','Choose to hear the final prediction in an English synthetic voice. This is not the participant’s original voice.'];
function record(){return dataset.records[recordIndex];}
function cancelVoice(){if('speechSynthesis' in window)speechSynthesis.cancel();$('.scene').dataset.speaking='false';}
function stop(){playing=false;cancelAnimationFrame(raf);$('.scene').dataset.playing='false';}
function drawHeat(){const q=record().activityQ,w=q.length,h=q[0].length,c=$('#heatmap');c.width=w;c.height=h;const ctx=c.getContext('2d'),im=ctx.createImageData(w,h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const v=q[x][y],k=(y*w+x)*4;im.data[k]=25+v*.72;im.data[k+1]=48+v*.56;im.data[k+2]=55+v*.52;im.data[k+3]=255;}ctx.putImageData(im,0,0);}
function evidenceAt(f){$('#timeline').value=Math.round(f*1000);$('#time-label').textContent=(f*record().durationMs/1000).toFixed(2)+' s';$('#time-cursor').style.left=Math.min(f*100,99.8)+'%';}
function updateAt(f){fraction=f;$('#stage-progress').value=f;evidenceAt(f);if(stage===1){let text='Waiting for the first recorded prediction…';for(const p of record().partial){if(p.ms<=f*record().durationMs)text=p.text;else break;}$('#partial-text').textContent=text;}}
function render(){
 const r=record();$('.scene').dataset.stage=stage;
 $('#progress').textContent='Step '+(stage+1)+' of 4 · '+r.id;
 $('#stage-title').textContent=titles[stage];$('#explanation').textContent=explanations[stage];
 document.querySelectorAll('.node').forEach((n,i)=>{n.disabled=i>unlocked;n.classList.toggle('selected',i===stage);n.setAttribute('aria-pressed',String(i===stage));});
 $('.transcript').hidden=stage===0;$('#comparison').hidden=stage<2;
 if(stage>=2){$('#partial-text').textContent=r.decoded;$('#comparison').textContent='Prompted sentence: “'+r.target+'” · Final prediction: “'+r.decoded+'”';}
 $('#play').hidden=stage>=2;$('#stage-progress').hidden=stage>=2;
 $('#play').textContent=playing?'Pause':stage===0?'Play signal capture':'Replay decoding';
 $('#next').hidden=stage===3;$('#next').disabled=stage<2&&!completed[stage];
 $('#next').textContent=stage===0?'Continue to decoding →':stage===1?'See the final result →':'Continue to voice →';
 $('#speak').hidden=stage!==3;
 $('#playback-status').textContent=stage<2?(playing?'Replaying this stage…':completed[stage]?'Stage complete. Continue when you are ready.':'Play this stage to continue.'):(stage===2?'The recorded final result is now available.':'Audio plays only when you choose to hear it.');
}
function enter(s){if(s>unlocked)return;stop();cancelVoice();stage=s;fraction=0;$('#result').textContent='';render();if(stage<2)updateAt(0);}
function tick(now){if(!playing)return;updateAt(Math.min(1,(offset+now-started)/record().durationMs));if(fraction===1){completed[stage]=true;unlocked=Math.max(unlocked,stage+1);stop();render();}else raf=requestAnimationFrame(tick);}
function play(){if(!dataset||stage>=2)return;if(playing){stop();render();return;}if(fraction>=1)updateAt(0);offset=fraction*record().durationMs;started=performance.now();playing=true;$('.scene').dataset.playing='true';render();raf=requestAnimationFrame(tick);}
function reset(){stop();cancelVoice();stage=0;unlocked=0;completed.fill(false);fraction=0;$('#result').textContent='';drawHeat();$('#record-meta').textContent=(record().durationMs/1000).toFixed(2)+' s · T12 · 2022-06-14';render();updateAt(0);}
function speak(){if(!dataset||stage!==3||unlocked<3)return;cancelVoice();if(!('speechSynthesis' in window)){$('#result').textContent='Speech synthesis is unavailable in this browser.';return;}const u=new SpeechSynthesisUtterance(record().decoded);u.lang='en-US';u.onstart=()=>{$('.scene').dataset.speaking='true';};u.onend=()=>{$('.scene').dataset.speaking='false';};u.onerror=()=>{$('.scene').dataset.speaking='false';$('#result').textContent='Audio could not play. Please try again.';};speechSynthesis.speak(u);$('#result').textContent='Reading the final prediction with a synthetic voice.';}
document.querySelectorAll('.journey-steps button, #play, #next, #reset, #speak').forEach(b=>b.disabled=true);
fetch('data/trials.json').then(r=>{if(!r.ok)throw new Error('Data unavailable');return r.json();}).then(d=>{
 dataset=d;d.records.forEach((r,i)=>{const o=document.createElement('option');o.value=i;o.textContent=r.id+' · Prompt: “'+r.target+'”';$('#record-select').append(o);});
 document.querySelectorAll('.journey-steps button, #play, #next, #reset, #speak').forEach(b=>b.disabled=false);
 $('#record-select').addEventListener('change',()=>{recordIndex=Number($('#record-select').value);reset();});
 $('#timeline').addEventListener('input',()=>evidenceAt(Number($('#timeline').value)/1000));
 $('#play').addEventListener('click',play);$('#next').addEventListener('click',()=>{if(stage<2&&!completed[stage])return;if(stage===2)unlocked=3;if(stage<3)enter(stage+1);});
 document.querySelectorAll('.node').forEach(n=>n.addEventListener('click',()=>enter(Number(n.dataset.stage))));
 $('#reset').addEventListener('click',reset);$('#speak').addEventListener('click',speak);reset();
}).catch(()=>{$('#stage-title').textContent='Recording could not be loaded';$('#explanation').textContent='Open this page through VS Code Live Server and refresh to load the local research data.';});
window.addEventListener('pagehide',()=>{stop();cancelVoice();});
