const status = document.getElementById('copy-status');
for (const button of document.querySelectorAll('[data-copy]')) {
  let reset;
  button.addEventListener('click', async () => {
    const code = document.getElementById(button.dataset.copy);
    const text = code.textContent.trim();
    const original = button.innerHTML;
    clearTimeout(reset);
    button.disabled = true;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      button.textContent = 'Copied ✓';
      status.textContent = 'Command copied to clipboard.';
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(code);
      selection.removeAllRanges(); selection.addRange(range);
      status.textContent = 'Select and copy the highlighted command with your keyboard.';
    } finally {
      reset = setTimeout(() => { button.innerHTML = original; button.disabled = false; }, 1800);
    }
  });
}
const preview = document.getElementById('preview-dialog');
const image = document.getElementById('preview-image');
const links = [...document.querySelectorAll('[data-preview]')];
const slides = links.filter((link, index) => links.findIndex(item => item.href === link.href) === index);
let currentSlide = 0;
let previousOverflow = '';
function showSlide(index) {
  currentSlide = (index + slides.length) % slides.length;
  const link = slides[currentSlide];
  image.src = link.href;
  image.alt = link.querySelector('img').alt;
  image.removeAttribute('width'); image.removeAttribute('height');
  document.getElementById('preview-title').textContent = link.dataset.caption;
  document.getElementById('full-image-link').href = link.href;
  document.getElementById('preview-count').textContent = `${currentSlide + 1} / ${slides.length}`;
  preview.querySelector('.preview-scroll').scrollTop = 0;
}
for (const link of links) {
  link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || typeof preview?.showModal !== 'function') return;
    event.preventDefault();
    showSlide(slides.findIndex(slide => slide.href === link.href));
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    preview.showModal();
  });
}
document.getElementById('previous-preview')?.addEventListener('click', () => showSlide(currentSlide - 1));
document.getElementById('next-preview')?.addEventListener('click', () => showSlide(currentSlide + 1));
preview?.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    showSlide(currentSlide + (event.key === 'ArrowLeft' ? -1 : 1));
  }
});
document.getElementById('close-preview')?.addEventListener('click', () => preview.close());
preview?.addEventListener('click', event => {
  if (event.target !== preview) return;
  const rect = preview.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) preview.close();
});
preview?.addEventListener('close', () => {
  document.body.style.overflow = previousOverflow;
  // Release the large decoded image while the gallery is closed.
  image.removeAttribute('src');
});
