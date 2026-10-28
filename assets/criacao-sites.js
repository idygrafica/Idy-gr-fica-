(() => {
  const root = document.querySelector('.web-page');
  if (!root) return;
  const tabs = root.querySelector('[data-demo-tabs]');
  const panel = root.querySelector('#wb-demo-panel');
  const screens = [...root.querySelectorAll('[data-demo-screen]')];
  const status = root.querySelector('[data-demo-status]');
  const labels = {institucional: 'site institucional', catalogo: 'catálogo digital', campanha: 'página de campanha'};
  if (tabs && panel && screens.length === 3) {
    const buttons = [...tabs.querySelectorAll('[data-demo]')];
    const activate = button => {
      const kind = button.dataset.demo;
      const template = root.querySelector('#wb-template-' + kind);
      if (!template || !labels[kind]) return;
      screens.forEach(screen => screen.replaceChildren(template.content.cloneNode(true)));
      buttons.forEach(tab => {
        const selected = tab === button;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });
      panel.setAttribute('aria-labelledby', button.id);
      status.textContent = 'Demonstração de ' + labels[kind] + ', adaptada a computador, tablet e celular.';
    };
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => activate(button));
      button.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % buttons.length;
        if (event.key === 'ArrowLeft') next = (index - 1 + buttons.length) % buttons.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = buttons.length - 1;
        if (next === undefined) return;
        event.preventDefault();
        activate(buttons[next]);
        buttons[next].focus();
      });
    });
    tabs.hidden = false;
  }
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('wb-inview');
        observer.unobserve(entry.target);
      });
    }, {threshold: .12});
    root.querySelectorAll('.wb-format, .wb-process li, .wb-brand-visual').forEach(element => observer.observe(element));
  }
})();
