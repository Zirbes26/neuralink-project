// Scripted synthetic dialogue, never a recording of a person with ALS.
export function createNarrativeSpeech({onLine,onSpeaking,onFallback=()=>{}}){
 let generation=0,current=null,timer=null,finishCurrent=null;
 const synth=globalThis.speechSynthesis;
 function cancel(){generation++;if(timer)clearTimeout(timer);timer=null;if(finishCurrent)finishCurrent();finishCurrent=null;current=null;onSpeaking(false);synth?.cancel();}
 async function play(lines,kind='patient'){
  cancel();const token=generation;
  for(const line of lines){if(token!==generation)return false;onLine(line.text,kind);const estimated=Math.max(900,line.text.split(/\s+/).length*420);
   await new Promise(resolve=>{
    let ended=false;const finish=()=>{if(ended)return;ended=true;clearTimeout(timer);timer=null;current=null;onSpeaking(false);finishCurrent=null;resolve();};finishCurrent=finish;
    if(synth&&typeof SpeechSynthesisUtterance!=='undefined'){
     const u=new SpeechSynthesisUtterance(line.say||line.text);u.lang='en-US';u.rate=kind==='patient'?.73:.94;u.pitch=kind==='patient'?.94:1.03;
     const voices=synth.getVoices().filter(v=>/^en[-_]/i.test(v.lang));if(voices.length)u.voice=voices[kind==='patient'?0:Math.min(1,voices.length-1)];
     u.onstart=()=>{if(token!==generation)return;current={kind,start:performance.now(),duration:estimated};onSpeaking(kind==='patient');};u.onend=finish;u.onerror=e=>{if(token!==generation||['canceled','interrupted'].includes(e.error)){finish();return;}clearTimeout(timer);current=null;onSpeaking(false);onFallback();timer=setTimeout(finish,estimated);};synth.speak(u);
     timer=setTimeout(finish,Math.max(7000,estimated*2.5));
    }else{current={kind,start:performance.now(),duration:estimated};onSpeaking(kind==='patient');timer=setTimeout(finish,estimated);}
   });
   if(token!==generation)return false;
   if(line.pause)await new Promise(resolve=>{finishCurrent=resolve;timer=setTimeout(()=>{finishCurrent=null;timer=null;resolve();},line.pause);});
  }
  return token===generation;
 }
 function amount(now){if(!current||current.kind!=='patient')return 0;const t=(now-current.start)/1000;const envelope=Math.min(1,t*8);return envelope*(.08+.17*Math.abs(Math.sin(t*9.7))+.09*Math.abs(Math.sin(t*17)));}
 return {play,cancel,amount,get active(){return !!current;}};
}
