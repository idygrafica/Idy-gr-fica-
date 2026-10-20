const y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();

const menuBtn=document.querySelector('.mobile-menu-toggle');
const navLinks=document.querySelector('.navlinks');
if(menuBtn && navLinks){
  const header=menuBtn.closest('.nav');
  const menuQuery=window.matchMedia('(max-width:980px)');
  const setMenuOpen=(open,restoreFocus=false)=>{
    navLinks.classList.toggle('open',open);
    header?.classList.toggle('site-menu-open',open);
    menuBtn.classList.toggle('open',open);
    menuBtn.setAttribute('aria-expanded',String(open));
    menuBtn.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');
    if(restoreFocus)menuBtn.focus();
  };
  menuBtn.addEventListener('click',()=>{
    const open=menuBtn.getAttribute('aria-expanded')!=='true';
    setMenuOpen(open);
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape' && menuBtn.getAttribute('aria-expanded')==='true')setMenuOpen(false,true);
  });
  document.addEventListener('click',event=>{
    if(menuBtn.getAttribute('aria-expanded')==='true' && !header?.contains(event.target))setMenuOpen(false);
  });
  navLinks.addEventListener('click',event=>{
    if(event.target.closest('a'))setMenuOpen(false);
  });
  menuQuery.addEventListener('change',()=>setMenuOpen(false));
}

// No mobile, o atalho começa sobre o tênis direito e fica fixo ao rolar.
const mobileWhats=document.querySelector('.whats-widget');
if(mobileWhats){
  const mobileWhatsQuery=window.matchMedia('(max-width:620px)');
  let whatsUnlocked=false;
  const positionMobileWhats=()=>{
    if(!mobileWhatsQuery.matches){
      whatsUnlocked=false;
      mobileWhats.classList.remove('whats-ready');
      mobileWhats.style.removeProperty('--idy-whats-top');
      return;
    }
    const mascot=[...document.querySelectorAll('.hero-mascot')].find(img=>getComputedStyle(img).display!=='none');
    const height=window.visualViewport?.height||window.innerHeight;
    const safeBottom=parseFloat(getComputedStyle(mobileWhats).getPropertyValue('--idy-whats-safe-bottom'))||0;
    const bottomTop=Math.max(20,height-84-safeBottom);
    if(!mascot){
      mobileWhats.style.setProperty('--idy-whats-top',bottomTop+'px');
      mobileWhats.classList.add('whats-ready');
      return;
    }
    const footTop=mascot.getBoundingClientRect().bottom-82;
    const footVisible=mascot.complete&&mascot.naturalWidth>0&&footTop<=bottomTop;
    if(window.scrollY<=1)whatsUnlocked=footVisible;
    else whatsUnlocked=whatsUnlocked||footVisible;
    mobileWhats.classList.toggle('whats-ready',whatsUnlocked);
    mobileWhats.style.setProperty('--idy-whats-top',(window.scrollY<=1?footTop:bottomTop)+'px');
  };
  window.addEventListener('scroll',positionMobileWhats,{passive:true});
  window.addEventListener('resize',positionMobileWhats,{passive:true});
  window.visualViewport?.addEventListener('resize',positionMobileWhats,{passive:true});
  window.addEventListener('load',positionMobileWhats,{once:true});
  document.querySelectorAll('.hero-mascot').forEach(img=>img.addEventListener('load',positionMobileWhats,{once:true}));
  mobileWhatsQuery.addEventListener('change',positionMobileWhats);
  positionMobileWhats();
}

// Fecha o submenu de serviços ao navegar, clicar fora ou mudar o tamanho da tela.
const serviceMenus=[...document.querySelectorAll('.nav-service-menu')];
const closeServiceMenus=()=>serviceMenus.forEach(menu=>{menu.open=false;});
serviceMenus.forEach(menu=>menu.addEventListener('click',event=>{
  if(event.target.closest('a'))closeServiceMenus();
}));
document.addEventListener('click',event=>{
  if(!event.target.closest('.nav-service-group'))closeServiceMenus();
});
document.addEventListener('keydown',event=>{
  if(event.key!=='Escape')return;
  const openMenu=serviceMenus.find(menu=>menu.open);
  if(!openMenu)return;
  closeServiceMenus();
  (window.matchMedia('(max-width:980px)').matches?menuBtn:openMenu.querySelector('summary'))?.focus();
});
menuBtn?.addEventListener('click',closeServiceMenus);
window.matchMedia('(max-width:980px)').addEventListener('change',closeServiceMenus);
