// Silent in-view demonstrations; manual pause and reduced motion take precedence.
(() => {
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const states=new Map();
 function updateButton(video){const s=states.get(video),paused=video.paused;s.button.textContent=paused?'Play':'Pause';s.button.setAttribute('aria-label',(paused?'Play ':'Pause ')+s.name);}
 function reconcile(video){const s=states.get(video);if(document.hidden||!s.inView||s.userPaused||reduce.matches&&!s.userStarted){video.pause();return;}video.play().catch(()=>updateButton(video));}
 document.querySelectorAll('.speech-video video').forEach(video=>{
  const button=document.querySelector('[data-video-toggle="'+video.id+'"]');if(!button)return;
  states.set(video,{button,inView:false,userPaused:false,userStarted:false,name:video.id==='speech-decoder-video'?'decoder demonstration':'conversation demonstration'});
  video.muted=true;video.controls=false;button.hidden=false;updateButton(video);
  video.addEventListener('play',()=>updateButton(video));video.addEventListener('pause',()=>updateButton(video));
  button.addEventListener('click',()=>{const s=states.get(video);if(!video.paused){s.userPaused=true;video.pause();}else{s.userPaused=false;s.userStarted=true;video.play().catch(()=>updateButton(video));}});
 });
 const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting,intersectionRatio})=>{states.get(target).inView=isIntersecting&&intersectionRatio>=.25;reconcile(target);}),{threshold:[0,.25]}):null;
 states.forEach((s,video)=>{if(observer)observer.observe(video);else{s.inView=true;reconcile(video);}});
 document.addEventListener('visibilitychange',()=>states.forEach((s,v)=>reconcile(v)));
 reduce.addEventListener('change',()=>states.forEach((s,v)=>{if(reduce.matches)s.userStarted=false;reconcile(v);}));
 addEventListener('pagehide',()=>{observer?.disconnect();states.forEach((s,v)=>v.pause());});
})();
