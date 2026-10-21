/* Busca local de serviços, sem dependências e sem envio de dados externos. */
(() => {
  const form = document.querySelector('.home-search');
  if (!form) return;
  const input = form.querySelector('input');
  const panel = document.getElementById('home-search-results');
  const status = panel.querySelector('[role="status"]');
  const list = panel.querySelector('ul');
  const clear = panel.querySelector('button');
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  const stops = new Set(['a', 'as', 'o', 'os', 'de', 'da', 'das', 'do', 'dos', 'e', 'em', 'para', 'por', 'um', 'uma']);
  const services = [...document.querySelectorAll('[data-home-service]')].map(link => ({
    title: link.dataset.searchTitle || link.querySelector('h3').textContent,
    url: link.getAttribute('href'),
    terms: normalize((link.dataset.search || '') + ' ' + (link.dataset.searchTitle || link.querySelector('h3').textContent))
  }));
  const render = () => {
    const query = normalize(input.value);
    list.replaceChildren();
    if (!query) { panel.hidden = true; return; }
    const tokens = query.split(' ').filter(token => !stops.has(token));
    const matches = tokens.length ? services.filter(service => tokens.every(token => service.terms.split(' ').some(word => word.startsWith(token)))) : [];
    status.textContent = matches.length ? `${matches.length} ${matches.length === 1 ? 'serviço encontrado' : 'serviços encontrados'}:` : 'Não encontramos esse serviço na busca. Consulte a equipe ou veja todas as opções.';
    const results = matches.length ? matches : [{title: 'Ver todos os serviços', url: '/servicos'}, {title: 'Consultar pelo WhatsApp', url: 'https://wa.me/5551981687562'}];
    results.forEach(service => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = service.url;
      link.textContent = service.title;
      const arrow = document.createElement('span');
      arrow.textContent = '→';
      arrow.setAttribute('aria-hidden', 'true');
      link.append(arrow);
      if (service.url.startsWith('https://')) { link.target = '_blank'; link.rel = 'noopener'; }
      item.append(link);
      list.append(item);
    });
    panel.hidden = false;
  };
  form.addEventListener('submit', event => {
    event.preventDefault();
    render();
    if (panel.hidden) { input.focus(); return; }
    list.querySelector('a')?.focus();
  });
  input.addEventListener('input', render);
  clear.addEventListener('click', () => { input.value = ''; render(); input.focus(); });
})();
