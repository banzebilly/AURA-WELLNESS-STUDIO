import { catalogueReady, ProductStore } from './products.mjs';
import { money, element, showError } from './utils.mjs';
import './site.mjs';

// Your shop page code goes below.


// Get the HTML elements
const grid = document.getElementById('product-grid');
const categoryFilter = document.getElementById('category');
const sortSelect = document.getElementById('sort');
const productCount = document.getElementById('product-count');

// Store the products after loading them
let products = [];

// Load the catalogue and prepare the page
async function initProductsPage() {
    try {
        // STEP 1: Load all products
        products = await ProductStore.all();

        // STEP 2: Create the category options
        createCategoryOptions();

        // STEP 3: Display the products
        renderProducts();

        // STEP 4: Listen for filter and sort changes
        categoryFilter.addEventListener('change', renderProducts);
        sortSelect.addEventListener('change', renderProducts);

    } catch (error) {
        console.error('Could not load products:', error);
        showError(error);
    }
}

// Create the category dropdown options
function createCategoryOptions() {
    // Get unique categories
    const categories = [
        ...new Set(
            products.map(product => product.category)
        )
    ];

    // Keep the existing "All" option
    categoryFilter.replaceChildren(
        element('option', 'All')
    );

    categoryFilter.firstElementChild.value = 'All';

    // Create one option for each category
    const options = categories.map(category => {
        const option = element('option', category);
        option.value = category;

        return option;
    });

    categoryFilter.append(...options);
}

// Filter and sort the products
function getVisibleProducts() {
    // FILTER: Select the chosen category
    let visibleProducts = products.filter(product => {
        return (
            categoryFilter.value === 'All' ||
            product.category === categoryFilter.value
        );
    });

    // SORT: Lowest price first
    if (sortSelect.value === 'ascending') {
        visibleProducts.sort(
            (a, b) => a.price - b.price
        );
    }

    // SORT: Highest price first
    if (sortSelect.value === 'descending') {
        visibleProducts.sort(
            (a, b) => b.price - a.price
        );
    }

    return visibleProducts;
}

// Display the product grid
function renderProducts() {
    const visibleProducts = getVisibleProducts();

    // Clear the previous products
    grid.replaceChildren();

    // Update the number of products
    productCount.textContent =
        `${visibleProducts.length} products`;

    // Show a message when no products match
    if (visibleProducts.length === 0) {
        grid.append(
            element('p', 'No products found.')
        );
        return;
    }

    // MAP: Create a card for every product
    const cards = visibleProducts.map(product => {
        return createProductCard(product);
    });

    // Display all product cards
    grid.append(...cards);
}

// Create one product card
function createProductCard(product) {
    const link = element('a', undefined, 'product-card');

    link.href =
        `product.html?id=${encodeURIComponent(product.id)}`;

    // Product image
    const image = element('img');

    image.alt = product.name;
    image.loading = 'lazy';

    if (product.images?.[0]) {
        image.src = product.images[0];
    }

    // Product information
    const category = element(
        'p',
        product.category,
        'eyebrow'
    );

    const name = element('h2', product.name);

    const price = element(
        'p',
        money(product.price)
    );

    // Put the card together
    link.append(image, category, name, price);

    return link;
}

// Start the page
initProductsPage();
