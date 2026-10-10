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
