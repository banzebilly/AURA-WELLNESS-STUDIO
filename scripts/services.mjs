// Billy

const servicesContainer = document.querySelector(".services-menu");


export async function loadServices() {
    try {
        const response = await fetch("data/services.json");

        if (!response.ok) {
            throw new Error("Could not load services.json");
        }

        const data = await response.json();

        displayServices(data.services);

    } catch (error) {
        console.error("Error loading services:", error);

        servicesContainer.innerHTML = `
            <p class="error-message">
                Sorry, we could not load our services at this time.
            </p>
        `;
    }
}


function displayServices(services) {

    servicesContainer.innerHTML = "";

    services.forEach((service, index) => {

        const card = document.createElement("div");
        card.classList.add("card-section");

        // Create the image
        const imageDiv = document.createElement("div");
        imageDiv.classList.add("service-img");

        const image = document.createElement("img");
        image.src = service.image;
        image.alt = service.imageAlt;
        image.width = 700;
        image.height = 600;
        image.loading = "lazy";

        imageDiv.appendChild(image);


        // Create the service information
        const imageData = document.createElement("div");
        imageData.classList.add("image-data");

        const tagline = document.createElement("h4");
        tagline.textContent = service.tagline;

        const title = document.createElement("h1");
        title.textContent = service.category;

        imageData.appendChild(tagline);
        imageData.appendChild(title);


        //to create each individual service
        service.items.forEach(item => {

            const info = document.createElement("div");
            info.classList.add("info");

            const innerData = document.createElement("div");
            innerData.classList.add("inner-data");

            const data = document.createElement("div");
            data.classList.add("data");

            const name = document.createElement("h5");

            name.textContent = `${item.name} · ${item.duration}`;

            const description = document.createElement("p");
            description.textContent = item.description;

            data.appendChild(name);
            data.appendChild(description);


            // Price
            const priceData = document.createElement("div");
            priceData.classList.add("data");

            const price = document.createElement("p");
            price.textContent = "Price: ";

            const priceSpan = document.createElement("span");
            priceSpan.textContent = `R${item.price}`;

            price.appendChild(priceSpan);
            priceData.appendChild(price);


            innerData.appendChild(data);
            innerData.appendChild(priceData);

            info.appendChild(innerData);

            imageData.appendChild(info);
        });


        // the  image position
        if (index % 2 === 0) {
            card.appendChild(imageDiv);
            card.appendChild(imageData);
        } else {
            card.appendChild(imageData);
            card.appendChild(imageDiv);
        }

        servicesContainer.appendChild(card);
    });
}


// Start loading the services
loadServices();