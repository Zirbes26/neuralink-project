// Reveal sections when they enter the viewport. Reading never depends on animation.
(() => {
 if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const sections=document.querySelectorAll('main > section, .grid article, .resource-list article');
 const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}});},{threshold:0.06});
 sections.forEach(section=>{section.classList.add('reveal');observer.observe(section);});
 document.documentElement.classList.add('motion-ready');
})();
