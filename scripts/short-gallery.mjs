let smallGallery = [];

const shortContainer = document.querySelector("#short-container");

export async function shortGallery() {
    try {
        const response = await fetch("data/chort-menu.json");

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const smallGallery = await response.json();

        shortContainer.innerHTML = "";

        smallGallery.forEach(item => {
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
        console.error("Failed to load gallery:", error);
    }
}