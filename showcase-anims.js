//Showcase on-page animations
let showcaseTimeline = gsap.timeline({
  scrollTrigger: {
    trigger: '.frame__outer',
    start: 'top bottom',
    end: 'top center-=10%', //top of trigger is 20% above  center of vp
    toggleActions: "play none reverse none",
    scrub: true,
  }
})

showcaseTimeline
  .from('.frame__outer', {scale:0.75, opacity: 0})

//Showcase UI interactions
//Minimize controller
document.addEventListener('DOMContentLoaded', function(){
  const minButton = document.querySelector('#minimize');
  const controller = document.querySelector('.ui-listings-controller__wrapper');
  const gradient = document.querySelector('#ui-gradient');
  const plus = document.querySelector('.icon-plus');

  let clickIndex = 0

  minButton.addEventListener('click', function() {
    if(clickIndex === 0) {
      controller.classList.add('is-mini')
      gradient.classList.add('u-d-none')
      plus.classList.add('is-active')
      clickIndex = 1
    } else if(clickIndex === 1) {
      controller.classList.remove('is-mini')
      gradient.classList.remove('u-d-none')
      plus.classList.remove('is-active')
      clickIndex = 0
    }
  })
})



//Filter by state
document.addEventListener('DOMContentLoaded', function(){
  const defaultTabs = document.querySelectorAll('[tab-menu-id]');
  const stylizedTabs = document.querySelectorAll('[tab-stylized-id]');
  const controllerTabs = document.querySelectorAll('[tab-controller-id]');


  stylizedTabs.forEach(tab => {tab.classList.remove('is-active')})
  stylizedTabs[0].classList.add('is-active')

  stylizedTabs.forEach(stylizedTab => {
    const stylizedId = stylizedTab.getAttribute('tab-stylized-id');
    
    stylizedTab.addEventListener('click', function() {
      // Remove is-active from all stylized tabs
      stylizedTabs.forEach(tab => tab.classList.remove('is-active'));
      // Add is-active to clicked tab
      this.classList.add('is-active');
      
      // Find the matching default tab
      const matchingDefaultTab = document.querySelector(`[tab-menu-id="${stylizedId}"]`);
      const matchingControllerTab = document.querySelector(`[tab-controller-id="${stylizedId}"]`);
      
      if (matchingDefaultTab) {
        // Trigger click on the default tab
        matchingDefaultTab.click();
        matchingControllerTab.click();
      }
    });
  });
})

//Properties collection (outer layer)
document.addEventListener('DOMContentLoaded', function() {
  console.log("showcase script loaded")
  const listingsController = document.querySelectorAll('[listing-id]');
  const showcaseItems = document.querySelectorAll('[showcase-id]');
  const scrollContainer = document.querySelector('.listings-visuals__list');
  
  listingsController[0].classList.add('is-active');
  
  listingsController.forEach(listingItem => {
    listingItem.addEventListener('click', function() {
      const listingId = this.getAttribute('listing-id');
      console.log(`logging listing-Id ${listingId}`);
      
      // Remove is-active from all items first
      listingsController.forEach(item => item.classList.remove("is-active"));
      // Then add is-active to clicked item
      listingItem.classList.add("is-active");
      

      showcaseItems.forEach(showcaseItem => {
        const showcaseId = showcaseItem.getAttribute('showcase-id')
        if (showcaseId === listingId) {
          // showcaseItems.forEach(item => item.classList.remove('active'));
          // showcaseItem.classList.add('active');
          
          // Scroll the active showcase item to the top of the container
          if (scrollContainer) {
            scrollContainer.scrollTo({
              top: showcaseItem.offsetTop,
              behavior: 'smooth'
            });
          }
          
          console.log(`calling ${showcaseId}`)
        }
      });
      
      // listingsController.forEach(item => item.classList.remove('active'));
      // this.classList.add('active');
    });
  });
});

//Property images gallery (nested layer)
document.addEventListener('DOMContentLoaded', function() {
  const listingsController = document.querySelectorAll('[listing-id]');
  let galleryAutoplayTimelines = new Map(); // Store autoplay timelines for each gallery
  
  // Gallery autoplay function
  function createGalleryAutoplay(galleryTrack, bullets, listingId) {
    if (!galleryTrack || bullets.length === 0) return null;
    
    let currentIndex = 0;
    const imageCount = bullets.length;
    
    const autoplayTimeline = gsap.timeline({ paused: true, repeat: -1 });
    
    autoplayTimeline.to({}, {
      duration: 5,
      onComplete: function() {
        // Move to next image
        currentIndex = (currentIndex + 1) % imageCount;
        
        // Update bullets
        bullets.forEach(b => b.classList.remove('is-active'));
        bullets[currentIndex].classList.add('is-active');
        
        // Scroll gallery with GSAP for smooth easing
        const scrollPosition = currentIndex * galleryTrack.offsetWidth;
        gsap.to(galleryTrack, {
          scrollLeft: scrollPosition,
          duration: 0.7,
          ease: "power1.out"
        });
      }
    });
    
    // Return timeline with ability to reset index
    autoplayTimeline.resetIndex = function(newIndex) {
      currentIndex = newIndex;
    };
    
    return autoplayTimeline;
  }
  
  // Function to start autoplay for active gallery
  function startAutoplayForActiveGallery() {
    // Stop all autoplay timelines first
    galleryAutoplayTimelines.forEach(timeline => {
      if (timeline) timeline.pause();
    });
    
    // Find active listing
    const activeListing = document.querySelector('[listing-id].is-active');
    if (activeListing) {
      const activeListingId = activeListing.getAttribute('listing-id');
      const activeTimeline = galleryAutoplayTimelines.get(activeListingId);
      if (activeTimeline) {
        activeTimeline.play();
      }
    }
  }

  listingsController.forEach(listingItem => {
    const listingId = listingItem.getAttribute('listing-id');
    const photosControllerWrapper = listingItem.querySelector('.listing-item__nav .photos-controller__wrapper');

    // Find the corresponding showcase item
    const showcaseItem = document.querySelector(`[showcase-id="${listingId}"]`);

    if (showcaseItem && photosControllerWrapper) {
      const galleryTrack = showcaseItem.querySelector('.gallery__track');
      
      if (galleryTrack) {
        const images = galleryTrack.querySelectorAll('.gallery-item');
        const imageCount = images.length;
        
        // Clear existing bullets
        photosControllerWrapper.innerHTML = '';
        
        // Create bullets based on number of images
        for (let i = 0; i < imageCount; i++) {
          const bullet = document.createElement('div');
          bullet.classList.add('carousel-nav-bullet');
          bullet.setAttribute('data-index', i);
          
          // Set first bullet as active
          if (i === 0) {
            bullet.classList.add('is-active');
          }
          
          photosControllerWrapper.appendChild(bullet);
        }
        
        const bullets = photosControllerWrapper.querySelectorAll('.carousel-nav-bullet');
        
        // Create autoplay timeline for this gallery
        const autoplayTimeline = createGalleryAutoplay(galleryTrack, bullets, listingId);
        if (autoplayTimeline) {
          galleryAutoplayTimelines.set(listingId, autoplayTimeline);
        }
        
        // Add click event listeners to bullets
        bullets.forEach((bullet, index) => {
          bullet.addEventListener('click', function() {
            // Pause autoplay and reset index to clicked position
            const timeline = galleryAutoplayTimelines.get(listingId);
            if (timeline) {
              timeline.pause();
              // Reset the autoplay index to the clicked image
              timeline.resetIndex(index);
              // Resume after 6s delay
              gsap.delayedCall(6, () => {
                // Only resume if this listing is still active
                const isStillActive = listingItem.classList.contains('is-active');
                if (isStillActive && timeline) {
                  timeline.play();
                }
              });
            }
            
            // Remove active class from all bullets
            bullets.forEach(b => b.classList.remove('is-active'));
            // Add active class to clicked bullet
            this.classList.add('is-active');
            
            // Calculate scroll position with GSAP animation
            const scrollPosition = index * galleryTrack.offsetWidth;
            gsap.to(galleryTrack, {
              scrollLeft: scrollPosition,
              duration: 0.5,
              ease: "power2.out"
            });
          });
        });
      }
    }
  });
  
  // Start autoplay for initially active gallery
  startAutoplayForActiveGallery();
  
  // Update autoplay when listings change (add this to existing listing click handlers)
  listingsController.forEach(listingItem => {
    listingItem.addEventListener('click', function() {
      // Delay to ensure is-active class has been updated
      gsap.delayedCall(0.1, startAutoplayForActiveGallery);
    });
  });
});
