// Видео для каждой картинки
const videos = [
  "video/first.mp4",
  "video/second.mp4",
  "video/threee.mp4"
];
// Градиенты
const backgrounds = [
  "linear-gradient(135deg, #9b59b6 0%, #e8d5b5 100%)",
  "linear-gradient(135deg, #d6a9e7 0%, #e2cdb6 100%)",
  "linear-gradient(135deg, #9b59b6 0%, #e8d5b5 100%)"
];
// Тексты описаний
const descriptions = [
  "Дизайн фасада и прифасадного пространства института океанологии им. П.П. Ширшова",
  "Проект тематической открытки и выставочного стенда для столярной мастерской VALKEDA",
  "Проект экстерьерной среды на основе модульных элементов планетария им. Ю. А. Гагарина в г. Смоленске"
];

const img1 = document.getElementById('img1');
const img2 = document.getElementById('img2');
const img3 = document.getElementById('img3');

let images = [
  { element: img1, currentPosition: 1, src: img1.src, videoIndex: 0, name: "Картинка 1" },
  { element: img2, currentPosition: 2, src: img2.src, videoIndex: 1, name: "Картинка 2" },
  { element: img3, currentPosition: 3, src: img3.src, videoIndex: 2, name: "Картинка 3" }
];

const videoPlayer = document.getElementById('videoPlayer');
const videoSource = document.getElementById('videoSource');
let activeLayer = 1;
let currentBgIndex = -1;
const bg1 = document.getElementById('bg1');
const bg2 = document.getElementById('bg2');

function updateBackgroundByTopImage() {
  const topImage = images.find(img => img.currentPosition === 1);
  if (!topImage) return;
  const newIndex = topImage.videoIndex;
  if (newIndex === currentBgIndex) return;
  currentBgIndex = newIndex;

  const nextGradient = backgrounds[newIndex];
  const current = activeLayer === 1 ? bg1 : bg2;
  const next = activeLayer === 1 ? bg2 : bg1;

  next.style.background = nextGradient;
  next.style.opacity = '1';
  current.style.opacity = '0';

  activeLayer = activeLayer === 1 ? 2 : 1;
}

function updateTextByTopImage() {
  const topImage = images.find(img => img.currentPosition === 1);
  if (topImage) {
    const textBlock = document.getElementById('galleryText');
    if (textBlock) {
      textBlock.style.opacity = '0';
      setTimeout(() => {
        textBlock.textContent = descriptions[topImage.videoIndex];
        textBlock.style.opacity = '1';
      }, 300);
    }
  }
}

function updateVideoByTopImage() {
  const topImage = images.find(img => img.currentPosition === 1);
  if (topImage) {
    const videoSrc = videos[topImage.videoIndex];
    videoPlayer.pause();
    videoSource.src = videoSrc;
    videoPlayer.load();
  }
}

function updatePositions() {
  images.forEach(img => {
    img.element.classList.remove('position-1', 'position-2', 'position-3');
    img.element.classList.add(`position-${img.currentPosition}`);
  });
  updateVideoByTopImage();
  updateBackgroundByTopImage();
  updateTextByTopImage();
}

function rotateLeft() {
  images.forEach(img => {
    let newPosition = img.currentPosition + 1;
    if (newPosition > 3) newPosition = 1;
    img.currentPosition = newPosition;
  });
  updatePositions();
}

function rotateRight() {
  images.forEach(img => {
    let newPosition = img.currentPosition - 1;
    if (newPosition < 1) newPosition = 3;
    img.currentPosition = newPosition;
  });
  updatePositions();
}

document.getElementById('leftArrow').addEventListener('click', rotateLeft);
document.getElementById('rightArrow').addEventListener('click', rotateRight);
updatePositions();

// ========== МОДАЛЬНОЕ ОКНО С ЗУМОМ ==========
const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImage');
const closeModal = document.querySelector('.modal-close');
const modalContent = document.querySelector('.modal-content');
let currentZoom = 1;
let isDragging = false;
let startX, startY, translateX = 0, translateY = 0;

// Переменные для навигации
let modalImagesList = [];
let modalCurrentIndex = 0;

// Создаем стрелки навигации
const prevArrow = document.createElement('button');
prevArrow.className = 'modal-arrow modal-prev';
prevArrow.innerHTML = '‹';
const nextArrow = document.createElement('button');
nextArrow.className = 'modal-arrow modal-next';
nextArrow.innerHTML = '›';
modal.appendChild(prevArrow);
modal.appendChild(nextArrow);

function updateZoom() {
  modalImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentZoom})`;
  const indicator = document.getElementById('zoomIndicator');
  if (indicator) indicator.textContent = `${Math.round(currentZoom * 100)}%`;
}

function zoomIn() {
  if (currentZoom < 5) {
    currentZoom += 0.2;
    updateZoom();
  }
}

function zoomOut() {
  if (currentZoom > 0.2) {
    currentZoom -= 0.2;
    if (currentZoom <= 1) {
      translateX = 0;
      translateY = 0;
    }
    updateZoom();
  }
}

function zoomReset() {
  currentZoom = 1;
  translateX = 0;
  translateY = 0;
  updateZoom();
}

// Листание внутри модалки
function navigateModal(direction) {
  if (modalImagesList.length === 0) return;
  zoomReset();
  modalCurrentIndex = (modalCurrentIndex + direction + modalImagesList.length) % modalImagesList.length;
  modalImg.src = modalImagesList[modalCurrentIndex];
}

// Обработчики стрелок
prevArrow.addEventListener('click', (e) => {
  e.stopPropagation();
  navigateModal(-1);
});
nextArrow.addEventListener('click', (e) => {
  e.stopPropagation();
  navigateModal(1);
});

function onMouseDown(e) {
  if (currentZoom > 1) {
    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    modalImg.style.cursor = 'grabbing';
    e.preventDefault();
  }
}

function onMouseMove(e) {
  if (isDragging && currentZoom > 1) {
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    updateZoom();
  }
}

function onMouseUp() {
  isDragging = false;
  modalImg.style.cursor = currentZoom > 1 ? 'grab' : 'zoom-in';
}

function onWheel(e) {
  e.preventDefault();
  if (e.deltaY < 0) {
    zoomIn();
  } else {
    zoomOut();
  }
}

function openModal(src, imagesArray = [], index = 0) {
  modalImg.src = src;
  
  if (imagesArray.length > 0) {
    modalImagesList = imagesArray;
    modalCurrentIndex = index;
    const showArrows = imagesArray.length > 1;
    prevArrow.style.display = showArrows ? 'flex' : 'none';
    nextArrow.style.display = showArrows ? 'flex' : 'none';
  } else {
    modalImagesList = [];
    modalCurrentIndex = 0;
    prevArrow.style.display = 'none';
    nextArrow.style.display = 'none';
  }

  modal.style.display = 'flex';
  zoomReset();
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    modalImg.style.cursor = 'zoom-in';
  }, 100);
}

function closeModalFunc() {
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
  zoomReset();
  isDragging = false;
  modalImagesList = [];
}

closeModal.addEventListener('click', closeModalFunc);
modal.addEventListener('click', (e) => {
  if (e.target === modal || e.target === modalContent) {
    closeModalFunc();
  }
});

document.addEventListener('keydown', (e) => {
  if (modal.style.display === 'flex') {
    if (e.key === 'Escape') closeModalFunc();
    if (e.key === 'ArrowLeft') navigateModal(-1);
    if (e.key === 'ArrowRight') navigateModal(1);
  }
});

const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const zoomResetBtn = document.getElementById('zoomResetBtn');

if (zoomInBtn) zoomInBtn.addEventListener('click', zoomIn);
if (zoomOutBtn) zoomOutBtn.addEventListener('click', zoomOut);
if (zoomResetBtn) zoomResetBtn.addEventListener('click', zoomReset);

modalImg.addEventListener('mousedown', onMouseDown);
window.addEventListener('mousemove', onMouseMove);
window.addEventListener('mouseup', onMouseUp);
modalContent.addEventListener('wheel', onWheel, { passive: false });
modalImg.style.transformOrigin = 'center center';
updateZoom();

// Открытие фото из галереи
const galleryImagesSrcs = [img1, img2, img3].map(img => img.getAttribute('src'));

if (img1 && img2 && img3) {
  [img1, img2, img3].forEach((img, index) => {
    img.addEventListener('click', (e) => {
      e.stopPropagation();
      openModal(e.currentTarget.getAttribute('src'), galleryImagesSrcs, index);
    });
  });
}

// ========== ЛОГИКА МАКЕТИРОВАНИЯ ==========
document.addEventListener('DOMContentLoaded', () => {
  const modelBtns = document.querySelectorAll('.model-btn');
  const slideshows = document.querySelectorAll('.model-slideshow');
  
  modelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const isAlreadyHidden = btn.classList.contains('is-hidden');

      modelBtns.forEach(b => b.classList.remove('is-hidden'));
      slideshows.forEach(sl => sl.classList.remove('active'));

      if (!isAlreadyHidden) {
        btn.classList.add('is-hidden');
        const targetSl = document.getElementById(targetId);
        if (targetSl) {
          targetSl.classList.add('active');
          const allImgs = targetSl.querySelectorAll('.sl-img');
          const allDots = targetSl.querySelectorAll('.sl-dot');
          allImgs.forEach(i => i.classList.remove('active'));
          allDots.forEach(d => d.classList.remove('active'));
          if (allImgs[0]) allImgs[0].classList.add('active');
          if (allDots[0]) allDots[0].classList.add('active');
        }
      }
    });
  });

  slideshows.forEach(slideshow => {
    const slideImages = slideshow.querySelectorAll('.sl-img');
    const dots = slideshow.querySelectorAll('.sl-dot');
    const prevBtn = slideshow.querySelector('.sl-prev');
    const nextBtn = slideshow.querySelector('.sl-next');
    let currentIndex = 0;

    const slideshowImagesSrcs = Array.from(slideImages).map(img => img.getAttribute('src'));

    function updateSlider() {
      slideImages.forEach((img, i) => img.classList.toggle('active', i === currentIndex));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + slideImages.length) % slideImages.length;
        updateSlider();
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % slideImages.length;
        updateSlider();
      });
    }

    dots.forEach((dot, index) => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = index;
        updateSlider();
      });
    });

    slideImages.forEach((img, index) => {
      img.addEventListener('click', (e) => {
        e.stopPropagation();
        openModal(e.currentTarget.getAttribute('src'), slideshowImagesSrcs, index);
      });
    });
  });
});

// ========== ЛОГИКА СЛАЙДЕРОВ ВИЗУАЛИЗАЦИИ ==========
document.addEventListener('DOMContentLoaded', () => {
  const vizSliders = document.querySelectorAll('.viz-slider');
  
  vizSliders.forEach(slider => {
    const slides = slider.querySelectorAll('.viz-slide');
    const dots = slider.querySelectorAll('.viz-dot');
    const prevBtn = slider.querySelector('.viz-prev');
    const nextBtn = slider.querySelector('.viz-next');
    const fsBtn = slider.querySelector('.viz-fullscreen-btn');
    let currentIndex = 0;

    const sliderImagesSrcs = Array.from(slides).map(slide => slide.getAttribute('src'));

    function updateVizSlider() {
      slides.forEach((slide, i) => slide.classList.toggle('active', i === currentIndex));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateVizSlider();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % slides.length;
        updateVizSlider();
      });
    }

    dots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = parseInt(dot.getAttribute('data-index'));
        updateVizSlider();
      });
    });

    slides.forEach((slide, index) => {
      slide.addEventListener('click', (e) => {
        e.stopPropagation();
        openModal(e.currentTarget.getAttribute('src'), sliderImagesSrcs, index);
      });
    });

    if (fsBtn) {
      fsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const activeSlide = slider.querySelector('.viz-slide.active');
        const activeIndex = Array.from(slides).indexOf(activeSlide);
        
        if (activeSlide && activeIndex !== -1) {
          openModal(activeSlide.getAttribute('src'), sliderImagesSrcs, activeIndex);
        }
      });
    }
  });
});

// Открытие фото "Обо мне"
const aboutPhoto = document.querySelector('.about-photo');
if (aboutPhoto) {
  aboutPhoto.addEventListener('click', () => {
    openModal(aboutPhoto.getAttribute('src'));
  });
}

// Открытие фото из кнопок макетирования
const btnPhotos = document.querySelectorAll('.btn-photo img');
btnPhotos.forEach(img => {
  img.addEventListener('click', (e) => {
    e.stopPropagation();
    openModal(e.currentTarget.getAttribute('src'));
  });
});