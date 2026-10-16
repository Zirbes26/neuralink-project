const page = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('nav a').forEach(a => { if(a.getAttribute('href') === page) a.setAttribute('aria-current', 'page'); });
