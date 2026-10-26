
const PRODUCTS_URL = 'data/products.json';

let catalogueData;

// Load the product catalogue
async function loadCatalogue() {
    try {
        const response = await fetch(PRODUCTS_URL);

        if (!response.ok) {
            throw new Error(
                `Could not load products.json: ${response.status}`
            );
        }

        const data = await response.json();

        if (!Array.isArray(data.products)) {
            throw new Error(
                'products.json must contain a products array'
            );
        }

        catalogueData = data;

        return data;

    } catch (error) {
        console.error('Catalogue loading failed:', error);
        throw error;
    }
}

// Load the catalogue once
export const catalogueReady = loadCatalogue();

// Product catalogue methods
export const ProductStore = {
    async all() {
        const data = await catalogueReady;
        return data.products;
    },

    async get(id) {
        const products = await this.all();

        return products.find(
            product => product.id === id
        );
    },

    async filterByCategory(category) {
        const products = await this.all();

        return products.filter(
            product => product.category === category
        );
    },

    formatPrice(amount) {
        if (!catalogueData) {
            throw new Error(
                'The catalogue has not loaded yet.'
            );
        }

        return `${catalogueData.currencySymbol} ${amount.toFixed(2)}`;
    }
};
