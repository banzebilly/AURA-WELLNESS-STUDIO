// Aura Wellness Studio: dismiss the loading screen.
window.addEventListener("load", () => {
    const loader = document.querySelector("#aura-loader");

    if (loader) {
        loader.classList.add("is-loaded");
    }
});