
/* ========================================
   1. SELECT HOMEPAGE ELEMENTS
======================================== */

const featuredProducts = document.querySelector("#featured-products");
const homeStatus = document.querySelector("#home-status");
const menuToggle = document.querySelector("#menu-toggle");
const navigation = document.querySelector("#navigation");


/* ========================================
   2. FORMAT PRODUCT PRICES
======================================== */

function formatPrice(price) {
    return `R ${Number(price).toFixed(2)}`;
}


/* ========================================
   3. CREATE A PRODUCT CARD
======================================== */

function createProductCard(product, index) {
    const card = document.createElement("article");

    card.className = "product-card";

    // Open the existing product details page.
    const productLink = document.createElement("a");

    productLink.href =
        `product.html?id=${encodeURIComponent(product.id)}`;

    // Product image.
    const image = document.createElement("img");

    image.src = product.images?.[0] || "images/p1.jpg";
    image.alt = product.name;
    image.loading = "lazy";

    // Product category.
    const category = document.createElement("p");

    category.className = "eyebrow";
    category.textContent = product.category;

    // Product name.
    const name = document.createElement("h2");

    name.textContent = product.name;

    // Product price.
    const price = document.createElement("p");

    price.className = "price";
    price.textContent = formatPrice(product.price);

    // Assemble the card.
    productLink.append(image);

    card.append(
        productLink,
        category,
        name,
        price
    );

    return card;
}


/* ========================================
   4. LOAD FEATURED PRODUCTS
======================================== */

async function loadFeaturedProducts() {
    try {
        const response = await fetch("./data/products.json");

        if (!response.ok) {
            throw new Error("Could not load the product catalogue.");
        }

        const catalogue = await response.json();

        const products = catalogue.products;

        if (!Array.isArray(products) || products.length === 0) {
            throw new Error("No products were found.");
        }

        // Display up to four products.
        const featured = products.slice(0, 4);

        featuredProducts.replaceChildren();

        featured.forEach((product, index) => {
            const card = createProductCard(product, index);

            featuredProducts.append(card);
        });

    } catch (error) {
        console.error("Homepage products:", error);

        featuredProducts.replaceChildren();

        homeStatus.textContent =
            "Our products could not load. Please visit the shop.";

        const shopLink = document.createElement("a");

        shopLink.href = "shop.html";
        shopLink.className = "btn";
        shopLink.textContent = "Visit the shop";

        featuredProducts.append(shopLink);
    }
}


/* ========================================
   5. MOBILE NAVIGATION
======================================== */

if (menuToggle && navigation) {
    menuToggle.addEventListener("click", () => {
        const isOpen = navigation.classList.toggle("open");

        menuToggle.setAttribute("aria-expanded", String(isOpen));
    });
}


/* ========================================
   6. NEWSLETTER FORM
======================================== */

const newsletterForm = document.querySelector("#newsletter-form");
const newsletterStatus = document.querySelector("#newsletter-status");

if (newsletterForm && newsletterStatus) {
    newsletterForm.addEventListener("submit", (event) => {
        event.preventDefault();

        newsletterStatus.textContent =
            "Newsletter sign-up is not connected yet. Please contact us for updates.";
    });
}


/* ========================================
   7. START THE HOMEPAGE
======================================== */

loadFeaturedProducts();
