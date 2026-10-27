
export async function shortGallery() {
    const shortContainer = document.querySelector("#short-container");

    // This page does not have the short gallery.
    if (!shortContainer) {
        return;
    }

    try {
        const response = await fetch("data/chort-menu.json");

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const smallGallery = await response.json();

        shortContainer.innerHTML = "";

        smallGallery.forEach((item) => {
            shortContainer.innerHTML += `
                <figure>
                    <img
                        src="${item.image}"
                        width="400"
                        height="200"
                        loading="lazy"
                        alt="${item.title}"
                    >
                    <figcaption>
                        <h4>${item.title}</h4>
                        <p>${item.subtitle}</p>
                    </figcaption>
                </figure>
            `;
        });

    } catch (error) {
        console.error("Failed to load short gallery:", error);
    }
}
