const sliderDetail = {
	loop: true,
	slidesPerView: 1.125,
	speed: 1000,
	spaceBetween: 20,
	loopAdditionalSlides: 3,
	watchSlidesProgress: true,
	a11y: {
		prevSlideMessage: 'Предыдущий слайд',
		nextSlideMessage: 'Следующий слайд',
	},
	breakpoints: {
		576: {
			slidesPerView: 1.25,
			spaceBetween: 20,
		},
		768: {
			slidesPerView: 2,
			spaceBetween: 24,
		},
		1024: {
			slidesPerView: 1.75,
			spaceBetween: 24,
		},
		1280: {
			slidesPerView: 2.25,
			spaceBetween: 24,
		},
		1600: {
			slidesPerView: 2.7,
			spaceBetween: 24,
		},
	},
};

document.addEventListener('DOMContentLoaded', function () {
	document.querySelectorAll('.js-swiper-slider').forEach(function (el) {
		new Swiper(el, {
			...sliderDetail,
			navigation: {
				nextEl: el.querySelector('.detail-banner__slider-arrow--next'),
				prevEl: el.querySelector('.detail-banner__slider-arrow--prev'),
			},
		});
	});
});
