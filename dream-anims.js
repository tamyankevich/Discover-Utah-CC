console.log('dream anims loaded')

// Reusable animation functions
function animateTextIn(timeline, selector, position = '<') {
  return timeline.from(selector, {
    opacity: 0,
    y: 100,
    duration: 1
  }, position);
}

function animateTextOut(timeline, selector, position = '<') {
  return timeline.to(selector, {
    opacity: 0,
    y: -50, // Exit upward for variety
    duration: 0.8
  }, position);
}

function animateImageIn(timeline, selector, position = '<') {
  return timeline.from(selector, {
    opacity: 0,
    y: 100,
    duration: 1, 
  }, position);
};

//story module fade to white
let fadeTimeline = gsap.timeline({
  scrollTrigger: {
      trigger: '.frame__outer',
      start:'top bottom' ,
      end:'top center+=20%',
      toggleActions: "play none reverse reset"
  }
})

//Fade out stage
fadeTimeline.to('.dream-track', {
  opacity: 0,
})



let mm = gsap.matchMedia();

//Desktop + tablet animations
mm.add("(min-width: 992px)", () => {
  
  //stage 1-4 of the dream animation: images and text
  let stage1 = gsap.timeline({
    scrollTrigger: {
          trigger: '.dream-track',
          start: 'top 30%',
          end: 'top -20%',
          scrub: true,
    }
  })
  let stage2 = gsap.timeline({
    scrollTrigger: {
          trigger: '.dream-track',
          start: 'top -40%',
          end: 'top -80%',
          scrub: true,
    }
  })
  let stage3 = gsap.timeline({
    scrollTrigger: {
          trigger: '.dream-track',
          start: 'top -100%',
          end: 'top -140%',
          scrub: true,
    }
  })
  let stage4 = gsap.timeline({
    scrollTrigger: {
          trigger: '.dream-track',
          start: 'top -150%',
          end: 'top -190%',
          scrub: true,
    }
  })

  // Stage 1: Enter first image and text
  animateImageIn(stage1, '.img-dream__1');
  animateTextIn(stage1, '.dream-content__container-1');

  // Stage 2: Exit previous text, enter new content
  animateImageIn(stage2, '.img-dream__2');
  stage2.to('.dream-imgs__container', {scale: 1.1, x: -100, ease: 'power1.inOut'}, '<');
  animateTextOut(stage2, '.dream-content__container-1', '<');
  animateTextIn(stage2, '.dream-content__container-2', '<0.3');

  // Stage 3: Continue pattern
  animateImageIn(stage3, '.img-dream__3');
  stage3.to('.dream-imgs__container', {scale: 1.15, y: 80, ease: 'power1.inOut'}, '<');
  animateTextOut(stage3, '.dream-content__container-2', '<');
  animateTextIn(stage3, '.dream-content__container-3', '<0.3');

  // Stage 4: Final stage
  animateImageIn(stage4, '.img-dream__4');
  stage4.to('.dream-imgs__container', {scale: 1.3, x: -150, y: 250, ease: 'power1.inOut'}, '<');
  animateTextOut(stage4, '.dream-content__container-3', '<');
  animateTextIn(stage4, '.dream-content__container-4', '<0.3');

});

//Mobile animations
mm.add("(max-width: 991px)", () => {
  
  //stage 1-4 of the dream animation: images and text
  let stage1 = gsap.timeline({
    scrollTrigger: {
          trigger: '.dream-track',
          start: 'top 30%',
          end: 'top -20%',
          scrub: true,
    }
  })
  let stage2 = gsap.timeline({
    scrollTrigger: {
          trigger: '.dream-track',
          start: 'top -40%',
          end: 'top -80%',
          scrub: true,
    }
  })
  let stage3 = gsap.timeline({
    scrollTrigger: {
          trigger: '.dream-track',
          start: 'top -100%',
          end: 'top -140%',
          scrub: true,
    }
  })
  let stage4 = gsap.timeline({
    scrollTrigger: {
          trigger: '.dream-track',
          start: 'top -150%',
          end: 'top -190%',
          scrub: true,
    }
  })

  // Stage 1: Enter first image and text
  animateImageIn(stage1, '.img-dream__1');
  animateTextIn(stage1, '.dream-content__container-1');

  // Stage 2: Exit previous text, enter new content
  animateImageIn(stage2, '.img-dream__2');
  stage2.to('.dream-imgs__container', {scale: 1.1, ease: 'power1.inOut'}, '<');
  animateTextOut(stage2, '.dream-content__container-1', '<');
  animateTextIn(stage2, '.dream-content__container-2', '<0.3');

  // Stage 3: Continue pattern
  animateImageIn(stage3, '.img-dream__3');
  stage3.to('.dream-imgs__container', {scale: 1.15, ease: 'power1.inOut'}, '<');
  animateTextOut(stage3, '.dream-content__container-2', '<');
  animateTextIn(stage3, '.dream-content__container-3', '<0.3');

  // Stage 4: Final stage
  animateImageIn(stage4, '.img-dream__4');
  stage4.to('.dream-imgs__container', {scale: 1.3, ease: 'power1.inOut'}, '<');
  animateTextOut(stage4, '.dream-content__container-3', '<');
  animateTextIn(stage4, '.dream-content__container-4', '<0.3');

});


// later, if we need to revert all the animations/ScrollTriggers...
// mm.revert();



// stage1.from('.img-dream__1', {opacity: 0, y: 100})
//       .from('.dream-content__container-1', {opacity: 0, y: 100}, '<')

// stage2.from('.img-dream__2', {opacity: 0, y: 100})
//       .to('.dream-content__container-1', {opacity: 0, y: 100}, '<')
//       .from('.dream-content__container-2', {opacity: 0, y: 100}, '<')
//       .to('.dream-imgs__container', {scale: 1.1, x: -100},'<')

// stage3.from('.img-dream__3', {opacity: 0, y: 100})
//       .from('.dream-content__container-3', {opacity: 0, y: 100}, '<')
//       .to('.dream-imgs__container', {scale: 1.15, y: 50},'<')  

// stage4.from('.img-dream__4', {opacity: 0, y: 100})
//       .from('.dream-content__container-4', {opacity: 0, y: 100}, '<')
//       .to('.dream-imgs__container', {scale: 1.3, x: -150, y: 300},'<')