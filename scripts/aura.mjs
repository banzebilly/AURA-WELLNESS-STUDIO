// ========== Mobile Menu By Banze Billy ==========

import { desplayNavationMenu } from "./navigation.mjs";
import { displayDate } from "./navigation.mjs";
import { shortGallery } from "./short-gallery.mjs";
import { loadGallery } from "./gallery.mjs";
import { loadServices } from "./services.mjs";

desplayNavationMenu();

displayDate();

shortGallery();
loadGallery()
loadServices()


// ========== Footer ==========


/* Reveal elements when they enter the viewport */

function setupRevealAnimation() {
    const revealElements = document.querySelectorAll(".reveal");

    // If there are no reveal elements on this page, stop.
    if (revealElements.length === 0) {
        return;
    }

    // Check whether the browser supports IntersectionObserver.
    if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -40px 0px"
            }
        );

        revealElements.forEach((element) => {
            revealObserver.observe(element);
        });
    } else {
        // Make everything visible in older browsers.
        revealElements.forEach((element) => {
            element.classList.add("is-visible");
        });
    }
}

// Run after the HTML has been parsed.
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupRevealAnimation);
} else {
    setupRevealAnimation();
}
