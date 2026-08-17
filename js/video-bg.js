/* Controls the public/auth background video and pauses it in video-free sections. */
(function(){
  const bgVideo = document.getElementById('bg-video');
  const embeddedVideo = document.getElementById('bg-video-embed');
  const backgroundMedia = bgVideo || embeddedVideo;
  if (!backgroundMedia) return;
  const playBackground = () => {
    if (!bgVideo) return;
    bgVideo.muted = true;
    bgVideo.play().catch(()=>{
      // A browser may require the first user gesture before autoplay; retry then.
      document.addEventListener('pointerdown', () => bgVideo.play().catch(()=>{}), { once: true });
    });
  };
  const pauseBackground = () => { if (bgVideo) bgVideo.pause(); };

  function enableBackgroundVideo(enable = true){
    document.body.classList.toggle('no-video', !enable);
    if (enable) playBackground();
    else { pauseBackground(); try{ if (bgVideo) bgVideo.currentTime = 0; } catch(e){} }
  }

  const videoFreeSections = Array.from(document.querySelectorAll('[data-background-video-disabled="true"]'));
  const isPublicOrAuthPageVisible = () => {
    const landing = document.getElementById('landingPage');
    const auth = document.getElementById('loginPage');
    return Boolean(landing?.classList.contains('active') || auth?.classList.contains('active'));
  };
  const shouldPauseForSection = () => videoFreeSections.some(section => {
    if (section.classList.contains('public-section-hidden')) return false;
    const rect = section.getBoundingClientRect();
    return rect.top < window.innerHeight * 0.75 && rect.bottom > window.innerHeight * 0.25;
  });
  function syncBackgroundVideo(){
    const pauseForSection = shouldPauseForSection();
    const shouldPlay = isPublicOrAuthPageVisible() && !pauseForSection && !document.body.classList.contains('no-video');
    document.body.classList.toggle('section-media-visible', pauseForSection);
    if (shouldPlay) playBackground();
    else pauseBackground();
  }
  window.syncBackgroundVideo = syncBackgroundVideo;
  window.addEventListener('scroll', syncBackgroundVideo, { passive: true });
  window.addEventListener('resize', syncBackgroundVideo);
  new MutationObserver(syncBackgroundVideo).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });
  syncBackgroundVideo();

  // Pause when gallery modal opens (Bootstrap) — fallback to class toggle if bootstrap isn't loaded
  const galleryModal = document.getElementById('galleryImageModal');
  if (galleryModal) {
    galleryModal.addEventListener('show.bs.modal', pauseBackground);
    galleryModal.addEventListener('shown.bs.modal', pauseBackground);
    galleryModal.addEventListener('hidden.bs.modal', syncBackgroundVideo);
    // fallback: observe 'show' class
    const modalObs = new MutationObserver((mut)=>{
      for (const m of mut) {
        if (m.attributeName === 'class') {
          const isShown = galleryModal.classList.contains('show');
          if (isShown) pauseBackground(); else syncBackgroundVideo();
        }
      }
    });
    modalObs.observe(galleryModal, { attributes: true });
  }

  // expose toggle for UI or console
  window.toggleBackgroundMotion = function(){
    const disabled = document.body.classList.toggle('no-video');
    if (disabled) pauseBackground(); else playBackground();
    try { localStorage.setItem('dawah_no_video', disabled ? '1' : '0'); } catch(e){}
  };

  // The public site explicitly uses a background video, so ignore any old saved disable preference.
  try { localStorage.removeItem('dawah_no_video'); } catch(e) {}
  document.body.classList.remove('no-video');
  bgVideo?.addEventListener('loadeddata', syncBackgroundVideo, { once: true });
  bgVideo?.addEventListener('canplay', syncBackgroundVideo, { once: true });
  playBackground();

})();
