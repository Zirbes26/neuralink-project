// Scripted synthetic dialogue, never a recording of a person with ALS.
export function createNarrativeSpeech({onLine,onSpeaking,onFallback=()=>{},voiceGender='male'}){
 let generation=0,current=null,timer=null,finishCurrent=null;
 const synth=globalThis.speechSynthesis;
 function cancel(){generation++;if(timer)clearTimeout(timer);timer=null;if(finishCurrent)finishCurrent();finishCurrent=null;current=null;onSpeaking(false);synth?.cancel();}
 async function play(lines,kind='patient'){
  cancel();const token=generation;
  const voices = await englishVoices(synth);
  if (token !== generation) return false;
  for(const line of lines){if(token!==generation)return false;onLine(line.text,kind);const estimated=Math.max(900,line.text.split(/\s+/).length*420);
   await new Promise(resolve=>{
    let ended=false;const finish=()=>{if(ended)return;ended=true;clearTimeout(timer);timer=null;current=null;onSpeaking(false);finishCurrent=null;resolve();};finishCurrent=finish;
    if(synth&&typeof SpeechSynthesisUtterance!=='undefined'){
     const u=new SpeechSynthesisUtterance(line.say||line.text);u.lang='en-US';u.rate=kind==='patient'?.9:1;u.pitch=1;
     const voice = chooseEnglishVoice(voices, kind === 'patient' ? voiceGender : 'male');
     if (voice) u.voice = voice;
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

// Browser voice names carry gender information that SpeechSynthesisVoice does not expose.
export function chooseEnglishVoice(voices, gender) {
 const english = voices.filter(voice => /^en[-_]/i.test(voice.lang));
 const local = english.filter(voice => voice.localService !== false);
 const candidates = local.length ? local : english;
 const names = gender === 'female'
  ? /\b(Zira|Aria|Jenny|Sonia|Susan|Hazel|Libby|Samantha|Karen|Moira|Tessa|Fiona|Victoria|Ava|Emma)\b/i
  : /\b(David|Guy|Ryan|Mark|George|James|Daniel|Andrew|Brian|Christopher|Eric|Roger|Thomas)\b/i;
 return candidates.find(voice => voice.gender === gender || names.test(voice.name)) || candidates[0];
}

async function englishVoices(synth) {
 if (!synth) return [];
 if (synth.getVoices().length) return synth.getVoices();
 await new Promise(resolve => {
  const finish = () => {
   clearTimeout(timeout);
   synth.removeEventListener?.('voiceschanged', finish);
   resolve();
  };
  const timeout = setTimeout(finish, 750);
  synth.addEventListener?.('voiceschanged', finish, {once: true});
 });
 return synth.getVoices();
}
