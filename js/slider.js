// ============================================================
// VKREATE — Before/After Slider (project.html)
// ============================================================

(function () {
  const sliders = document.querySelectorAll('.ba-slider');
  if (!sliders.length) return;

  sliders.forEach(slider => {
    const handle = slider.querySelector('.ba-handle');
    const afterPane = slider.querySelector('.ba-after');
    let dragging = false;

    function setPosition(x) {
      const rect = slider.getBoundingClientRect();
      let pct = ((x - rect.left) / rect.width) * 100;
      pct = Math.max(2, Math.min(98, pct));
      afterPane.style.width = pct + '%';
      handle.style.left = pct + '%';
    }

    // Mouse events
    handle.addEventListener('mousedown', (e) => {
      dragging = true;
      e.preventDefault();
    });
    window.addEventListener('mousemove', (e) => {
      if (dragging) setPosition(e.clientX);
    });
    window.addEventListener('mouseup', () => { dragging = false; });

    // Touch events
    handle.addEventListener('touchstart', (e) => {
      dragging = true;
    }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (dragging) setPosition(e.touches[0].clientX);
    }, { passive: true });
    window.addEventListener('touchend', () => { dragging = false; });

    // Click to jump
    slider.addEventListener('click', (e) => {
      if (e.target !== handle) setPosition(e.clientX);
    });

    // Keyboard support on handle
    handle.setAttribute('tabindex', '0');
    handle.setAttribute('role', 'slider');
    handle.setAttribute('aria-label', 'Before/After comparison slider');
    handle.addEventListener('keydown', (e) => {
      const rect = slider.getBoundingClientRect();
      const curPct = parseFloat(afterPane.style.width) || 50;
      if (e.key === 'ArrowLeft') setPosition(rect.left + rect.width * ((curPct - 5) / 100));
      if (e.key === 'ArrowRight') setPosition(rect.left + rect.width * ((curPct + 5) / 100));
    });

    // Init at 50%
    setPosition(slider.getBoundingClientRect().left + slider.getBoundingClientRect().width * 0.5);
  });

})();
