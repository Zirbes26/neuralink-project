// Keep incomplete 3D assets out of view while the supplied opening film plays.
(() => {
 const film=document.querySelector('#opening-film'),cover=document.querySelector('#experience-intro');if(!film||!cover)return;
 const play=document.querySelector('#intro-play'),enter=document.querySelector('#intro-enter'),status=document.querySelector('#entry-status'),retry=document.querySelector('#intro-retry');
 const background=[...document.querySelectorAll('#world,.intro,.views,#steps,#task,.gesture,#loading')];
 let ready=document.body.dataset.sceneReady==='true',failed=false,finished=false;
 function lock(value){for(const element of background){element.inert=value;if(value)element.setAttribute('aria-hidden','true');else element.removeAttribute('aria-hidden');}}
 function refresh(){
  enter.disabled=!ready||failed;
  enter.textContent=failed?'Studio unavailable':!ready?'Preparing the studio…':film.paused&&!finished?'Skip introduction → Enter 3D':'Enter the 3D studio →';
  if(failed)status.textContent='The 3D studio could not load. You can still watch the introduction or reload.';
  else if(finished&&!ready)status.textContent='Your introduction has finished. Preparing the final scene details…';
  else if(ready)status.textContent='The studio is ready. Watch the introduction or enter when you are ready.';
  else status.textContent='The 3D studio is preparing in the background.';
 }
 function open(){document.body.dataset.entry='intro';cover.hidden=false;finished=false;film.pause();film.currentTime=0;play.hidden=false;play.lastChild.textContent=' Play introduction';lock(true);window.dispatchEvent(new Event('studio-intro-open'));refresh();}
 function start(){film.play().catch(()=>{play.hidden=false;status.textContent='Press the video’s play control to start, or enter the studio when ready.';});}
 function reveal(){if(!ready||failed)return false;document.body.dataset.entry='scene';film.pause();cover.hidden=true;lock(false);const skip=document.querySelector('.skip');if(skip){skip.href='#task';skip.textContent='Skip to controls';}window.dispatchEvent(new Event('studio-intro-complete'));document.querySelector('#action')?.focus({preventScroll:true});return true;}
 function success(){ready=true;failed=false;refresh();if(finished)reveal();}
 function failure(){failed=true;retry.hidden=false;refresh();}
 play.addEventListener('click',start);enter.addEventListener('click',reveal);retry.addEventListener('click',()=>location.reload());
 film.addEventListener('play',()=>{play.hidden=true;refresh();});
 film.addEventListener('pause',()=>{if(document.body.dataset.entry==='intro'&&!film.ended){play.hidden=false;play.lastChild.textContent=film.currentTime>0?' Resume introduction':' Play introduction';}});
 film.addEventListener('ended',()=>{finished=true;play.hidden=true;if(!reveal())refresh();});
 film.addEventListener('error',()=>{play.hidden=true;status.textContent='The introduction could not play. Enter the 3D studio when it is ready.';});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)film.pause();});
 document.querySelector('#replay-intro')?.addEventListener('click',()=>{open();start();});
 window.addEventListener('studio-ready',success);window.addEventListener('studio-error',failure);
 window.addEventListener('error',event=>{if(event.filename?.includes('/scene-prototype/'))failure();});
 window.addEventListener('unhandledrejection',event=>{if(/WebGL|GLTF|KTX|3D studio/i.test(String(event.reason)))failure();});
 const slow=setTimeout(()=>{if(!ready&&!failed)status.textContent='The studio is taking a little longer. Keep watching while it prepares.';},18000);
 addEventListener('pagehide',()=>{clearTimeout(slow);film.pause();});
 lock(true);refresh();
})();
