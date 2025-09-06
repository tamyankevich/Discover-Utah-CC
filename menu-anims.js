console.log("menu-anims loaded")

// Menu reveal animation
function animateMenuReveal() {
    const navOuter = document.querySelector('.nav-outer__container');
    const navWrapper = document.querySelector('.nav__wrapper');
    const navContent = document.querySelector('.nav-content__wrapper');
  
  if (!navOuter || !navWrapper || !navContent) return;
  
  // Add active classes
  navOuter.classList.add('is-active');
  navWrapper.classList.add('is-active');
  
  
  // Get all child elements from nav content for stagger animation
  const navElements = Array.from(navContent.children);
  console.log(navElements)
  
  // Set initial state for elements
  gsap.set(navElements, {
    opacity: 0,
    y: 30
  });
  
//   navContent.classList.remove('u-hide')
  // Create timeline
  const tl = gsap.timeline();
  
  // Animate nav wrapper height
  
  tl.to(navWrapper, {
        height: '100%',
        duration: 0.8,
        ease: 'power2.out'
    })
    .to(navContent, {
        height: '75%',
        duration: 0.4, 
        ease: 'power2.out'
    })
  // Stagger animate nav content elements
    .to(navElements, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power1.out'
    }); 
}

// Menu hide animation
function animateMenuHide() {
   const navOuter = document.querySelector('.nav-outer__container');
    const navWrapper = document.querySelector('.nav__wrapper');
    const navContent = document.querySelector('.nav-content__wrapper');
  
  if (!navOuter || !navWrapper || !navContent) return;
  
  const navElements = Array.from(navContent.children);
  
  const tl = gsap.timeline({
    onComplete: () => {
      navOuter.classList.remove('is-active');
    }
  });
  
  // Reverse stagger out elements
  tl.to(navElements, {
    opacity: 0,
    y: -20,
    duration: 0.4,
    stagger: 0.1,
    ease: 'power1.in'
  })
  
  // Animate height back down
  .to(navWrapper, {
    height: '0%',
    duration: 0.6,
    ease: 'power2.in'
  }, '-=0.2');
}


const hamburger = document.querySelector('.nav-hamburger')
let clickIndex = 0;

hamburger.addEventListener('click', function() {
    //console.log('clicked')
    if(clickIndex === 0){
        animateMenuReveal();
        clickIndex = 1;

    } else if(clickIndex === 1) {
        animateMenuHide();
        clickIndex = 0;
    }
})