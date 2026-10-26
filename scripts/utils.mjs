
import { catalogueReady, ProductStore } from './products.mjs';
import { Cart } from './cart.mjs';

// Create an HTML element
export function element(tag, text, className) {
    const el = document.createElement(tag);

    if (text !== undefined && text !== null) {
        el.textContent = text;
    }

    if (className) {
        el.className = className;
    }

    return el;
}

// Format prices in South African rand
export function money(amount) {
    return `R ${Number(amount).toFixed(2)}`;
}

// Display an error message on the page
export function showError(error) {
    console.error(error);

    const status = document.getElementById('status');

    if (status) {
        status.textContent =
            'Something went wrong loading the page. Please refresh and try again.';
    }
}

// Update the cart count in the header
export async function refreshBadge() {
    try {
        await catalogueReady;

        const badge = document.getElementById('cart-count');

        if (badge) {
            badge.textContent = String(await Cart.count());
        }
    } catch (error) {
        console.error('Could not update cart count:', error);
    }
}

// Initialize shared page utilities
async function initUtils() {
    try {
        await ProductStore.all();
        await refreshBadge();
    } catch (error) {
        showError(error);
    }
}

window.addEventListener('cart:changed', refreshBadge);

initUtils();
