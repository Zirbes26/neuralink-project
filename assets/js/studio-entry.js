import {characters} from './scene/characters.js';
const film=document.querySelector('#opening-film');
const cover=document.querySelector('#experience-intro');
const enter=document.querySelector('#intro-enter');
const play=document.querySelector('#intro-play');
const status=document.querySelector('#entry-status');
const retry=document.querySelector('#intro-retry');
const background=[...document.querySelectorAll('#world,.intro,.views,#task,.gesture,#loading')];
const requested=new URL(location.href).searchParams.get('character');
const selected=characters.find(character=>character.id===requested)||characters[0];
let ready=false,finished=false,failed=false;
function lock(value){
 for(const element of background){
  element.inert=value;
  if(value)element.setAttribute('aria-hidden','true');else element.removeAttribute('aria-hidden');
 }
}
function refresh(){
 enter.disabled=!ready||failed;
 enter.textContent=ready?'Enter the 3D experience →':'Preparing your scene…';
 status.textContent=failed?'The scene could not load. Reload to try again.':ready?'Your character is ready. Watch the introduction or enter 3D.':'Watch the introduction while your selected character prepares.';
}
function reveal(){
 if(!ready||failed)return;
 film.pause();cover.hidden=true;document.body.dataset.entry='scene';lock(false);
 document.querySelector('.skip').href='#task';
 document.querySelector('#action').focus({preventScroll:true});
}
function startFilm(){film.play().catch(()=>{play.hidden=false;});}
enter.addEventListener('click',reveal);
play.addEventListener('click',startFilm);
film.addEventListener('play',()=>{play.hidden=true;});
film.addEventListener('pause',()=>{if(!cover.hidden&&!film.ended)play.hidden=false;});
film.addEventListener('ended',()=>{finished=true;reveal();});
film.addEventListener('error',()=>{play.hidden=true;});
window.addEventListener('studio-ready',()=>{ready=true;refresh();if(finished)reveal();});
function fail(){failed=true;retry.hidden=false;refresh();}
window.addEventListener('studio-error',fail);
retry.addEventListener('click',()=>location.reload());
document.querySelector('#replay-intro').addEventListener('click',()=>{
 document.body.dataset.entry='intro';cover.hidden=false;finished=false;film.currentTime=0;lock(true);
 window.dispatchEvent(new Event('studio-intro-open'));startFilm();
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)film.pause();});
window.addEventListener('pagehide',()=>film.pause());
lock(true);refresh();
import(`./scene/studio.js?character=${encodeURIComponent(selected.id)}`).catch(error=>{console.error(error);fail();});
