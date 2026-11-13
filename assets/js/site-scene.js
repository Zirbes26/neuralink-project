(() => {
 const header=document.querySelector('#site-header');
 if(!header)return;
 const update=()=>document.documentElement.style.setProperty('--site-header-height',Math.ceil(header.getBoundingClientRect().height)+'px');
 const observer=new ResizeObserver(update);observer.observe(header);update();
 addEventListener('pagehide',()=>observer.disconnect(),{once:true});
})();
