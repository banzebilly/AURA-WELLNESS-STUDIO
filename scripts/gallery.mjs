let galleryImages = [];

const galleryContainer = document.querySelector(".grid-gallery");

//To Fetch the gallery data from gallery.json
export async function loadGallery() {
    try {
        const response = await fetch("data/works.json");

        if (!response.ok) {
            throw new Error("Failed to load gallery data");
        }

        galleryImages = await response.json();

        displayGallery(galleryImages);

        setupGalleryButtons();

    } catch (error) {
        console.error("Error loading gallery:", error);
    }
}


// Display gallery images
function displayGallery(items) {
    galleryContainer.innerHTML = "";

    items.forEach(item => {
        galleryContainer.innerHTML += `
            <figure class="gallery-img">
                <img
                    src="${item.image}"
                    alt="${item.title}"
                    loading="lazy"
                    width="800"
                    height="800">

                <figcaption class="flex">
                    <p>${item.title}</p>
                    <p>${item.subtitle}</p>
                </figcaption>
            </figure>
        `;
    });
}


//To Filter buttons
function setupGalleryButtons() {
    const buttons = document.querySelectorAll(".btn");

    buttons.forEach(button => {
        button.addEventListener("click", () => {

            const category = button.dataset.category;

            if (category === "all") {
                displayGallery(galleryImages);
            } else {
                const filtered = galleryImages.filter(
                    item => item.category === category
                );

                displayGallery(filtered);
            }
        });
    });
}