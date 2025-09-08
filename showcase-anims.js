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

showcaseTimeline.from('.frame__outer', {scale:0.75, opacity: 0});

//Showcase UI interactions
//Minimize controller
document.addEventListener('DOMContentLoaded', function(){
  const minButton = document.querySelector('#minimize');
  const controller = document.querySelectorAll('.ui-listings-controller__wrapper');
  const gradient = document.querySelector('#ui-gradient');
  const plus = document.querySelector('.icon-plus');

  let clickIndex = 0

  // Function to scroll active item into view when minimized
  function scrollActiveItemIntoView() {
    // Find the currently active controller pane
    const activeControllerPane = document.querySelector('.ui-listings-controller__container .w-tab-pane.w--tab-active');
    if (!activeControllerPane) return;
    
    // Find the active listing item in the current pane
    const activeListingItem = activeControllerPane.querySelector('[listing-id].is-active');
    if (!activeListingItem) return;
    
    // Find the .ui-listings-controller__wrapper inside the active pane
    const scrollableWrapper = activeControllerPane.querySelector('.ui-listings-controller__wrapper');
    
    if (scrollableWrapper) {
      // Scroll to show the active item at the top of the 3rem visible area
      scrollableWrapper.scrollTo({
        top: activeListingItem.offsetTop,
        behavior: 'smooth'
      });
      
      console.log('Scrolling active item into view:', activeListingItem.getAttribute('listing-id'));
    } else {
      console.log('No .ui-listings-controller__wrapper found in active pane');
    }
  }

  minButton.addEventListener('click', function() {
    if(clickIndex === 0) {
      controller.forEach(controller => {
        controller.classList.add('is-mini')
      })
      gradient.classList.add('u-d-none')
      plus.classList.add('is-active')
      
      // Scroll active item into view when minimizing
      setTimeout(() => {
        scrollActiveItemIntoView();
      }, 50); // Small delay to ensure CSS transition starts
      
      clickIndex = 1
    } else if(clickIndex === 1) {
      controller.forEach(controller => {
        controller.classList.remove('is-mini')
      })
      gradient.classList.remove('u-d-none')
      plus.classList.remove('is-active')
      clickIndex = 0
    }
  })
})



//Filter by state
document.addEventListener('DOMContentLoaded', function(){
  const stylizedTabs = document.querySelectorAll('[tab-stylized-id]');


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
        
        // Reinitialize controller listeners for the newly active state
        // Use a longer delay to ensure Webflow's tab transition completes
        setTimeout(() => {
          initializeControllersForActiveState();
          initializeGalleryForActiveState();
        }, 350);
      }
    });
  });
})

// Function to initialize controllers for the currently active state
function initializeControllersForActiveState() {
  console.log('Initializing controllers for active state...');
  
  // Wait a bit more and double-check that elements are ready
  const activeControllerPane = document.querySelector('.ui-listings-controller__container .w-tab-pane.w--tab-active');
  if (!activeControllerPane) {
    console.log('No active controller pane found, retrying...');
    setTimeout(initializeControllersForActiveState, 150);
    return;
  }
  
  const listingsController = activeControllerPane.querySelectorAll('[listing-id]');
  if (listingsController.length === 0) {
    console.log('No listing controllers found, retrying...');
    setTimeout(initializeControllersForActiveState, 150);
    return;
  }
  
  // Find the corresponding active showcase tab content
  const activeShowcasePane = document.querySelector('.showcase-ui__wrapper .showcase-tab__content.w--tab-active');
  const showcaseItems = activeShowcasePane ? activeShowcasePane.querySelectorAll('[showcase-id]') : [];
  const scrollContainer = activeShowcasePane ? activeShowcasePane.querySelector('.listings-visuals__list') : null;
  
  console.log(`Found ${listingsController.length} controllers and ${showcaseItems.length} showcase items`);
  
  // Set first item as active if none are active
  const hasActiveItem = Array.from(listingsController).some(item => item.classList.contains('is-active'));
  if (!hasActiveItem && listingsController.length > 0) {
    listingsController[0].classList.add('is-active');
  }
  
  // Clear existing click handlers by removing and re-adding the event listeners
  listingsController.forEach(listingItem => {
    // Remove existing data attribute that might indicate listeners are attached
    listingItem.removeAttribute('data-initialized');
    
    // Clone and replace to remove all event listeners
    const clonedItem = listingItem.cloneNode(true);
    listingItem.parentNode.replaceChild(clonedItem, listingItem);
  });
  
  // Re-query after cloning
  const newListingsController = activeControllerPane.querySelectorAll('[listing-id]');
  
  newListingsController.forEach(listingItem => {
    // Mark as initialized to avoid double-initialization
    listingItem.setAttribute('data-initialized', 'true');
    
    listingItem.addEventListener('click', function(e) {
      e.preventDefault();
      const listingId = this.getAttribute('listing-id');
      console.log(`Clicking listing controller: ${listingId}`);
      
      // Remove is-active from all items first
      newListingsController.forEach(item => item.classList.remove("is-active"));
      // Then add is-active to clicked item
      this.classList.add("is-active");

      // If controller is minimized, scroll this item into view
      const activeControllerPane = document.querySelector('.ui-listings-controller__container .w-tab-pane.w--tab-active');
      const scrollableWrapper = activeControllerPane ? activeControllerPane.querySelector('.ui-listings-controller__wrapper') : null;
      
      if (scrollableWrapper && scrollableWrapper.classList.contains('is-mini')) {
        scrollableWrapper.scrollTo({
          top: this.offsetTop,
          behavior: 'smooth'
        });
      }

      showcaseItems.forEach(showcaseItem => {
        const showcaseId = showcaseItem.getAttribute('showcase-id')
        if (showcaseId === listingId) {
          // Scroll the active showcase item to the top of the container
          if (scrollContainer) {
            scrollContainer.scrollTo({
              top: showcaseItem.offsetTop,
              behavior: 'smooth'
            });
          }
          
          console.log(`Successfully scrolled to: ${showcaseId}`)
        }
      });
    });
  });
  
  console.log('Controller initialization complete');
}

//Properties collection (outer layer)
document.addEventListener('DOMContentLoaded', function() {
  console.log("showcase script loaded")
  initializeControllersForActiveState();
});

// Global variable to store gallery timelines across state switches
let galleryAutoplayTimelines = new Map();

// Function to initialize gallery for the currently active state
function initializeGalleryForActiveState() {
  console.log('Initializing gallery for active state...');
  
  // Find the active controller tab pane
  const activeControllerPane = document.querySelector('.ui-listings-controller__container .w-tab-pane.w--tab-active');
  if (!activeControllerPane) {
    console.log('No active controller pane found for gallery, retrying...');
    setTimeout(initializeGalleryForActiveState, 150);
    return;
  }
  
  const listingsController = activeControllerPane.querySelectorAll('[listing-id]');
  if (listingsController.length === 0) {
    console.log('No listing controllers found for gallery, retrying...');
    setTimeout(initializeGalleryForActiveState, 150);
    return;
  }
  
  // Gallery autoplay function
  function createGalleryAutoplay(galleryTrack, bullets) {
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
    
    // Find active listing in current state
    const activeControllerPane = document.querySelector('.ui-listings-controller__container .w-tab-pane.w--tab-active');
    if (!activeControllerPane) return;
    
    const activeListing = activeControllerPane.querySelector('[listing-id].is-active');
    if (activeListing) {
      const activeListingId = activeListing.getAttribute('listing-id');
      const activeTimeline = galleryAutoplayTimelines.get(activeListingId);
      if (activeTimeline) {
        activeTimeline.play();
      }
    }
  }

  // Find the corresponding active showcase tab content
  const activeShowcasePane = document.querySelector('.showcase-ui__wrapper .showcase-tab__content.w--tab-active');
  
  listingsController.forEach(listingItem => {
    const listingId = listingItem.getAttribute('listing-id');
    const photosControllerWrapper = listingItem.querySelector('.listing-item__nav .photos-controller__wrapper');

    // Find the corresponding showcase item in the active showcase pane
    const showcaseItem = activeShowcasePane ? activeShowcasePane.querySelector(`[showcase-id="${listingId}"]`) : null;

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
        const autoplayTimeline = createGalleryAutoplay(galleryTrack, bullets);
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
}

//Property images gallery (nested layer)
document.addEventListener('DOMContentLoaded', function() {
  initializeGalleryForActiveState();
});
