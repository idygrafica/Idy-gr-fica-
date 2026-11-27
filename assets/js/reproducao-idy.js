const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

if ('IntersectionObserver' in window) {
  const visibleVideos = new Set();
  const manuallyPaused = new WeakSet();
  const play = video => {
    if (!motionPreference.matches && !manuallyPaused.has(video)) {
      video.play().catch(() => {
        // O navegador pode exigir interação. Os controles continuam disponíveis.
      });
    }
  };

  const observer = new IntersectionObserver(entries => {
    for (const { target: video, isIntersecting, intersectionRatio } of entries) {
      if (isIntersecting && intersectionRatio >= 0.55) {
        visibleVideos.add(video);
        play(video);
      } else {
        visibleVideos.delete(video);
        video.pause();
      }
    }
  }, { threshold: 0.55 });

  for (const video of document.querySelectorAll('video[data-loop-preview]')) {
    video.addEventListener('pause', () => {
      if (visibleVideos.has(video) && !motionPreference.matches) manuallyPaused.add(video);
    });
    video.addEventListener('play', () => manuallyPaused.delete(video));
    observer.observe(video);
  }

  motionPreference.addEventListener('change', () => {
    for (const video of visibleVideos) {
      if (motionPreference.matches) video.pause();
      else play(video);
    }
  });
}
