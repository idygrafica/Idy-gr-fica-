const y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();

const menuBtn=document.querySelector('.mobile-menu-toggle');
const navLinks=document.querySelector('.navlinks');
if(menuBtn && navLinks){
  menuBtn.addEventListener('click',()=>{
    const isOpen=navLinks.classList.toggle('open');
    menuBtn.classList.toggle('open',isOpen);
    menuBtn.setAttribute('aria-expanded',isOpen?'true':'false');
  });
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
