import { catalogueReady, ProductStore } from './products.mjs';

import { Cart } from './cart.mjs';

// Display an error message
export function showError(error) {
    console.error(error);

    const status = document.getElementById('status');

    if (status) {
        status.textContent =
            'Products could not load. Check products.json and your local web server.';
    }
}

// Create an HTML element
export function element(tag, text, className) {
    const node = document.createElement(tag);

    if (text !== undefined) {
        node.textContent = text;
    }

    if (className) {
        node.className = className;
    }

    return node;
}

// Format a price using the catalogue currency
export function money(amount) {
    return ProductStore.formatPrice(amount);
}

// Update the cart badge
export async function refreshBadge() {
    try {
        const count = await Cart.count();
        const badge = document.getElementById('cart-count');

        if (badge) {
            badge.textContent = count;
        }
    } catch (error) {
        console.error('Could not update cart badge:', error);
    }
}

// Set up shared website features
async function initUtils() {
    try {
        await catalogueReady;
        await refreshBadge();
    } catch (error) {
        showError(error);
    }
}

// Refresh the badge whenever the cart changes
window.addEventListener('cart:changed', refreshBadge);

// Mobile navigation
function setupNavigation() {
    const menu = document.getElementById('menu-toggle');
    const navigation = document.getElementById('navigation');

    if (!menu || !navigation) {
        return;
    }

    menu.addEventListener('click', () => {
        const expanded =
            menu.getAttribute('aria-expanded') === 'true';

        menu.setAttribute(
            'aria-expanded',
            String(!expanded)
        );

        navigation.classList.toggle('open', !expanded);
    });
}

// Start shared features
setupNavigation();
initUtils();
