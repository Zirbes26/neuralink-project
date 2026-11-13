(() => {
 const cards=[...document.querySelectorAll('.home-character-card')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function pause(){cards.forEach(card=>card.querySelector('video').pause());}
 for(const card of cards){
  const play=()=>{pause();if(!reduced.matches)card.querySelector('video').play().catch(()=>{});};
  card.addEventListener('pointerenter',play);
  card.addEventListener('focus',play);
  card.addEventListener('pointerleave',pause);
  card.addEventListener('blur',pause);
 }
 reduced.addEventListener('change',pause);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
 addEventListener('pagehide',pause);
})();
