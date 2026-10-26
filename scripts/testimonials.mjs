
//    CLIENT TESTIMONIAL CAROUSEL


// to Find all testimonials and navigation controls.
const testimonials = document.querySelectorAll(".testimonial");
const dots = document.querySelectorAll(".testimonial-dot");

const previousButton = document.querySelector(".testimonial-btn.prev");
const nextButton = document.querySelector(".testimonial-btn.next");

let currentIndex = 0;


function showTestimonial(index) {

   
    testimonials.forEach((testimonial, i) => {
        testimonial.classList.toggle("active", i === index);
    });

    dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === index);

        if (i === index) {
            dot.setAttribute("aria-current", "true");
        } else {
            dot.removeAttribute("aria-current");
        }
    });

  
    currentIndex = index;
}


previousButton.addEventListener("click", () => {

    const previousIndex =
        (currentIndex - 1 + testimonials.length) % testimonials.length;

    showTestimonial(previousIndex);
});

nextButton.addEventListener("click", () => {

    const nextIndex =
        (currentIndex + 1) % testimonials.length;

    showTestimonial(nextIndex);
});

dots.forEach((dot, index) => {

    dot.addEventListener("click", () => {
        showTestimonial(index);
    });

});
