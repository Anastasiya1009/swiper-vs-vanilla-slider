const SPEED = 1000;
const LOOP_ADDITIONAL_SLIDES = 3;
const BREAKPOINTS = [
	{ min: 1600, slidesPerView: 2.7 },
	{ min: 1280, slidesPerView: 2.25 },
	{ min: 1024, slidesPerView: 1.75 },
	{ min: 768, slidesPerView: 2 },
	{ min: 576, slidesPerView: 1.25 },
	{ min: 0, slidesPerView: 1.125 },
];

function initBannerSlider(root) {
	const list = root.querySelector('.detail-banner__list');
	const prevBtn = root.querySelector('.detail-banner__slider-arrow--prev');
	const nextBtn = root.querySelector('.detail-banner__slider-arrow--next');
	const originals = Array.prototype.slice.call(list.querySelectorAll('.detail-banner__item'));
	const realCount = originals.length;

	if (!realCount) {
		return;
	}

	const clonesCount = Math.ceil(Math.max.apply(null, BREAKPOINTS.map(function (item) {
		return item.slidesPerView;
	}))) + LOOP_ADDITIONAL_SLIDES;

	function cloneSlide(slide) {
		const clone = slide.cloneNode(true);
		clone.classList.add('swiper-slide-duplicate');
		clone.setAttribute('aria-hidden', 'true');
		return clone;
	}

	for (var i = 0; i < clonesCount; i += 1) {
		list.appendChild(cloneSlide(originals[i % realCount]));
	}
	for (var j = 1; j <= clonesCount; j += 1) {
		list.insertBefore(cloneSlide(originals[realCount - j]), list.firstChild);
	}

	const slides = Array.prototype.slice.call(list.querySelectorAll('.detail-banner__item'));
	let index = clonesCount;
	let translateX = 0;
	let animating = false;
	let drag = null;

	root.style.overflow = 'hidden';
	root.classList.add('swiper-initialized');
	list.style.overflow = 'visible';
	list.style.userSelect = 'none';
	list.style.touchAction = 'pan-y';
	list.style.willChange = 'transform';

	function getGap() {
		const styles = window.getComputedStyle(list);
		return parseFloat(styles.columnGap || styles.gap) || 0;
	}

	function isTabletRange() {
		return window.innerWidth >= 768 && window.innerWidth < 1024;
	}

	function getTabletSlideWidth() {
		const gap = getGap();
		return (list.clientWidth - gap) / 2;
	}

	function syncSlideWidths() {
		if (!isTabletRange()) {
			slides.forEach(function (slide) {
				slide.style.width = '';
				slide.style.flex = '';
			});
			return;
		}

		const width = getTabletSlideWidth() + 'px';
		slides.forEach(function (slide) {
			slide.style.width = width;
			slide.style.flex = '0 0 ' + width;
		});
	}

	function getStep() {
		if (isTabletRange()) {
			return getTabletSlideWidth() + getGap();
		}

		const inactive = slides.find(function (slide) {
			return !slide.classList.contains('swiper-slide-active');
		}) || slides[0];
		return inactive.getBoundingClientRect().width + getGap();
	}

	function setActiveClass() {
		slides.forEach(function (slide, slideIndex) {
			slide.classList.toggle('swiper-slide-active', slideIndex === index);
		});
	}

	function setTranslate(x, withAnimation, dragging) {
		translateX = x;
		const value = 'translate3d(' + x + 'px, 0, 0)';

		if (dragging) {
			list.style.transition = 'none';
			list.style.transform = value;
			return;
		}

		if (!withAnimation) {
			list.style.transition = 'none';
			list.style.transform = value;
			list.offsetHeight;
			list.style.transition = 'transform ' + SPEED + 'ms ease';
			return;
		}

		list.style.transition = 'transform ' + SPEED + 'ms ease';
		list.style.transform = value;
	}

	function snapTo(nextIndex, withAnimation) {
		index = nextIndex;
		setActiveClass();
		setTranslate(-index * getStep(), withAnimation, false);
		animating = withAnimation;
	}

	function normalizeLoop() {
		if (index >= clonesCount && index < clonesCount + realCount) {
			return;
		}
	
		root.classList.add('is-jumping');
	
		if (index < clonesCount) {
			snapTo(index + realCount, false);
		} else {
			snapTo(index - realCount, false);
		}
	
		requestAnimationFrame(function () {
			requestAnimationFrame(function () {
				root.classList.remove('is-jumping');
			});
		});
	}
	
	function slideBy(delta) {
		normalizeLoop();
		if (!delta) {
			snapTo(index, true);
			return;
		}
		snapTo(index + delta, true);
	}

	list.addEventListener('transitionend', function (event) {
		if (event.target !== list || event.propertyName !== 'transform') {
			return;
		}
		animating = false;
		normalizeLoop();
	});

	prevBtn.addEventListener('click', function () {
		slideBy(-1);
	});
	nextBtn.addEventListener('click', function () {
		slideBy(1);
	});

	list.addEventListener('pointerdown', function (event) {
		if (event.button !== undefined && event.button !== 0) {
			return;
		}

		normalizeLoop();
		list.style.transition = 'none';

		drag = {
			pointerId: event.pointerId,
			startX: event.clientX,
			startY: event.clientY,
			originX: translateX,
			lastX: event.clientX,
			lastTime: performance.now(),
			velocity: 0,
			locked: false,
			moved: false,
		};

		try {
			list.setPointerCapture(event.pointerId);
		} catch (error) {
			/* capture is optional */
		}
	});

	list.addEventListener('pointermove', function (event) {
		if (!drag || event.pointerId !== drag.pointerId) {
			return;
		}

		const dx = event.clientX - drag.startX;
		const dy = event.clientY - drag.startY;

		if (!drag.locked) {
			if (Math.abs(dx) < 6 && Math.abs(dy) < 6) {
				return;
			}
			if (Math.abs(dy) > Math.abs(dx)) {
				drag = null;
				return;
			}
			drag.locked = true;
		}

		event.preventDefault();
		drag.moved = true;

		const now = performance.now();
		const dt = now - drag.lastTime;
		if (dt > 0) {
			drag.velocity = (event.clientX - drag.lastX) / dt;
		}
		drag.lastX = event.clientX;
		drag.lastTime = now;

		setTranslate(drag.originX + dx, false, true);
	});

	function endDrag(event) {
		if (!drag || event.pointerId !== drag.pointerId) {
			return;
		}

		const dx = event.clientX - drag.startX;
		const step = getStep();
		const duration = performance.now() - (drag.lastTime - 16);
		const moved = drag.moved;
		const velocity = drag.velocity;
		drag = null;

		if (!moved) {
			setTranslate(-index * step, false, false);
			return;
		}

		let deltaSlides = 0;
		if (Math.abs(velocity) > 0.35) {
			deltaSlides = velocity < 0 ? 1 : -1;
		} else if (duration < 300 && Math.abs(dx) > 30) {
			deltaSlides = dx < 0 ? 1 : -1;
		} else {
			deltaSlides = Math.round(-dx / step);
		}

		if (deltaSlides > 1) {
			deltaSlides = 1;
		}
		if (deltaSlides < -1) {
			deltaSlides = -1;
		}

		slideBy(deltaSlides);
	}

	list.addEventListener('pointerup', endDrag);
	list.addEventListener('pointercancel', endDrag);

	function refresh() {
		syncSlideWidths();
		snapTo(index, false);
	}

	window.addEventListener('resize', refresh);

	syncSlideWidths();
	snapTo(index, false);
}

document.addEventListener('DOMContentLoaded', function () {
	document.querySelectorAll('.js-swiper-slider').forEach(initBannerSlider);
});
