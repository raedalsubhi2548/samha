// Improved Banner Slider and Reviews Animation Handling

// Function to initialize the banner slider
function initBannerSlider() {
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;
    const totalSlides = slides.length;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.style.display = (i === index) ? 'block' : 'none';
        });
        // Smooth transition effect
        slides[index].style.transition = 'opacity 0.5s ease-in-out';
        slides[index].style.opacity = 1;
    }

    // Start the slider
    showSlide(currentSlide);
    setInterval(() => {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    }, 5000); // Change slide every 5 seconds
}

// Function to handle reviews animation
function initReviewsAnimation() {
    const reviews = document.querySelectorAll('.review');
    reviews.forEach((review, index) => {
        review.style.opacity = 0; // Start hidden
        review.style.transition = 'opacity 0.5s ease';

        // Animate each review smoothly
        setTimeout(() => {
            review.style.opacity = 1;
        }, index * 300); // Delay each review's appearance
    });
}

// Initialize the functions on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    initBannerSlider();
    initReviewsAnimation();
});