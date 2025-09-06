console.log("menu-anims loaded")

// Menu reveal animation
function animateMenuReveal() {
    const navOuter = document.querySelector('.nav-outer__container');
    const navWrapper = document.querySelector('.nav__wrapper');
    const navContent = document.querySelector('.nav-content__wrapper');
  
  if (!navOuter || !navWrapper || !navContent) return;
  
  // Add active classes

//   navWrapper.classList.add('is-active');
  
  
  // Get all child elements from nav content for stagger animation
  const navElements = Array.from(navContent.children);
  console.log(navElements)
  
  // Set initial state for elements
  gsap.set(navElements, {
    opacity: 0,
    y: 30
  });
  

  // Create timeline
  const tl = gsap.timeline();
  
  // Animate menu open nav wrapper height
  

  //Animate outer layer blur and height
  tl
    .to(navOuter, {
        height: '100dvh',
        duration: 0.01,
    })

    .to(navOuter, {
        backdropFilter: 'blur(5px)',
        duration: 0.2,
        ease: 'power2.out'
    })
    
    navOuter.classList.add('is-active');
    
    // Calculate responsive height
    function getNavContentHeight() {
        if (window.innerWidth <= 479) return '90%';
        if (window.innerWidth <= 767) return '85%';
        return '75%';
    }

    tl
    .to(navWrapper, {
        height: '100%',
        duration: 0.4,
        ease: 'power2.inOut'
    },'<0.2')

    .to(navContent, {
        height: getNavContentHeight(),
        duration: 0.01, 
        ease: 'power2.out'
    }, '-=0.6')


  // Stagger animate nav content elements
    .to(navElements, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power1.out'
    },'<0.3'); 
}

// Menu hide animation
function animateMenuHide() {
    const navOuter = document.querySelector('.nav-outer__container');
    const navWrapper = document.querySelector('.nav__wrapper');
    const navContent = document.querySelector('.nav-content__wrapper');
  
  if (!navOuter || !navWrapper || !navContent) return;
  
  const navElements = Array.from(navContent.children);
  
  const tl = gsap.timeline({
    // onComplete:
 
  })

  
  // Reverse stagger out elements
  tl
    .to(navElements, {
        opacity: 0,
        y: 20,
        duration: 0.2,
        stagger: 0.15,
        ease: 'power1.in'
    })

    //Collapse content wrapper
    .to(navContent, {
        height: '0%',
        duration: 0.01, 
        ease: 'power2.out'
    })

    // Animate height back down
    .to(navWrapper, {
        height: '3rem',
        duration: 0.2,
        ease:"power4.inOut"
    },'-=0.2')


    .to(navOuter, {
        backdropFilter: 'blur(0px)',
        duration: 0.2,
        ease: 'power2.out'
    },'-=0.2')

    .to(navOuter, {
        height: 'auto',
        duration: 0.2,
        ease: 'power2.out'
    },'+=1')

}


//Menu trigger logic
const hamburger = document.querySelector('.nav-hamburger')
let clickIndex = 0;

hamburger.addEventListener('click', menuAnimation)
document.addEventListener('keydown', function(event){
    if (event.key === 'Escape' && clickIndex === 1){
        menuAnimation()
    }
})

function menuAnimation() {
     const navOuter = document.querySelector('.nav-outer__container');
     
     if(clickIndex === 0){
        animateMenuReveal();
        clickIndex = 1;


    } else if(clickIndex === 1) {
        animateMenuHide();
        clickIndex = 0;
        navOuter.classList.remove('is-active')
    }
}


//Scroll invitation animation
function animateScrollInvitation() {
    const scrollLabel = document.querySelector('.label-nav');
    if (!scrollLabel) return;

    // Split text into characters
    const splitText = new SplitText(scrollLabel, { type: "chars" });
    const allChars = splitText.chars;
    
    // Remove first and last characters from animation
    const chars = allChars.slice(1, -1);

    // Set initial state - only middle characters below viewport
    gsap.set(chars, {
        y: 30,
        opacity: 0
    });

    // Create repeating animation
    const tl = gsap.timeline({ repeat: -1 });
    
    tl
        // Animate characters up with stagger
        .to(chars, {
            y: 0,
            opacity: 1,
            // duration: 0.,
            stagger: 0.05,
            ease: "power2.out"
        })
        // Pause for 1 second
        .to({}, { duration: 2 })
        // Animate characters out (optional - fade or move up)
        .to(chars, {
            y: -10,
            opacity: 0,
            // duration: 0.1,
            stagger: 0.04,
            ease: "power2.in"
        });

    return tl;
}

// Initialize scroll invitation animation
let scrollAnimation = animateScrollInvitation();

// Stop animation when scrolling starts
let hasScrolled = false;
window.addEventListener('scroll', function() {
    if (!hasScrolled && window.scrollY > 10) {
        hasScrolled = true;
        if (scrollAnimation) {
            scrollAnimation.kill();
            // Optional: fade out the element
            gsap.to('.label-nav', {
                opacity: 0,
                duration: 0.3,
                ease: "power2.out"
            });
        }
    }
});
