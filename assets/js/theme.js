(() => {
 const query=matchMedia('(prefers-color-scheme: dark)');
 let theme=query.matches?'dark':'light';
 // Keep the choice within this tab; the site does not require stored data.
 try { const saved=sessionStorage.getItem('voice-theme'); if(saved==='dark'||saved==='light')theme=saved; } catch {}
 const apply=()=>{document.documentElement.dataset.theme=theme;const b=document.querySelector('#theme-toggle');if(b){b.textContent=theme==='dark'?'Light mode ☀':'Dark mode ◐';b.setAttribute('aria-label',`Switch to ${theme==='dark'?'light':'dark'} mode`);}};
 apply();document.addEventListener('DOMContentLoaded',()=>{apply();const b=document.querySelector('#theme-toggle');b.hidden=false;b.addEventListener('click',()=>{theme=theme==='dark'?'light':'dark';apply();try{sessionStorage.setItem('voice-theme',theme);}catch{}});});
})();