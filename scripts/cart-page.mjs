
import { Cart } from './cart.mjs';
import { money, element, showError } from './utils.mjs';

// =========================================
// 1. GET HTML ELEMENTS
// =========================================

const cartList = document.getElementById('cart-items');
const clearButton = document.getElementById('clear-cart');

if (!cartList || !clearButton) {
    throw new Error('Cart HTML elements were not found.');
}

// =========================================
// 2. DISPLAY THE SHOPPING CART
// =========================================

async function renderCart() {
    try {
        const items = await Cart.detailed();

        cartList.replaceChildren();

        // Disable the clear button when the cart is empty.
        clearButton.disabled = items.length === 0;

        if (items.length === 0) {
            cartList.append(
                element('p', 'Your cart is empty.')
            );
        } else {
            const rows = items.map(item => createCartItem(item));
            cartList.append(...rows);
        }

        // Calculate totals.
        const subtotal = await Cart.subtotal();
        const delivery = await Cart.deliveryFee();
        const total = await Cart.total();

        // Display totals.
        document.getElementById('subtotal').textContent =
            money(subtotal);

        document.getElementById('delivery').textContent =
            money(delivery);

        document.getElementById('total').textContent =
            money(total);

    } catch (error) {
        console.error('Could not display the cart:', error);
        showError(error);
    }
}

// =========================================
// 3. CREATE ONE CART ITEM
// =========================================

function createCartItem(product) {
    const row = element('article', undefined, 'cart-item');

    // Product image.
    const image = element('img');
    image.alt = product.name;

    if (product.images?.[0]) {
        image.src = product.images[0];
    }

    // Product information.
    const info = element('div');
    const link = element('a', product.name);

    link.href =
        `product.html?id=${encodeURIComponent(product.id)}`;

    info.append(link);

    // Display the selected variant, if available.
    if (product.variant) {
        const variantLabel =
            product.variant.label ??
            product.variant.length ??
            product.variant.color ??
            product.variant.size ??
            product.variant.id;

        if (variantLabel !== undefined && variantLabel !== null) {
            info.append(
                element('p', `Option: ${variantLabel}`)
            );
        }
    }

    // Display the unit price.
    info.append(
        element('p', `Unit price: ${money(product.price)}`)
    );

    // Quantity controls.
    const controls = createQuantityControls(product);

    // Total price for this cart line.
    const lineTotal = element(
        'p',
        `Line total: ${money(product.price * product.qty)}`
    );

    // Remove this exact cart line.
    const removeButton = element('button', 'Remove', 'remove');

    removeButton.type = 'button';

    removeButton.setAttribute(
        'aria-label',
        `Remove ${product.name} from cart`
    );

    removeButton.addEventListener('click', async () => {
        try {
            await Cart.remove(product.cartKey);
        } catch (error) {
            console.error('Could not remove item:', error);
            showError(error);
        }
    });

    // Add all elements to the cart item.
    row.append(
        image,
        info,
        controls,
        lineTotal,
        removeButton
    );

    return row;
}

// =========================================
// 4. CREATE QUANTITY CONTROLS
// =========================================

function createQuantityControls(product) {
    const controls = element('div', undefined, 'quantity');

    // Decrease quantity.
    const decreaseButton = element('button', '−');

    decreaseButton.type = 'button';

    decreaseButton.setAttribute(
        'aria-label',
        `Decrease quantity for ${product.name}`
    );

    decreaseButton.disabled = product.qty <= 1;

    decreaseButton.addEventListener('click', async () => {
        try {
            await Cart.decrease(product.cartKey);
        } catch (error) {
            console.error('Could not decrease quantity:', error);
            showError(error);
        }
    });

    // Display the current quantity.
    const quantity = element('span', String(product.qty));

    // Increase quantity.
    const increaseButton = element('button', '+');

    increaseButton.type = 'button';

    increaseButton.setAttribute(
        'aria-label',
        `Increase quantity for ${product.name}`
    );

    increaseButton.addEventListener('click', async () => {
        try {
            await Cart.increase(product.cartKey);
        } catch (error) {
            console.error('Could not increase quantity:', error);
            showError(error);
        }
    });

    controls.append(
        decreaseButton,
        quantity,
        increaseButton
    );

    return controls;
}

// =========================================
// 5. CLEAR THE CART
// =========================================

clearButton.addEventListener('click', () => {
    try {
        Cart.clear();
    } catch (error) {
        console.error('Could not clear cart:', error);
        showError(error);
    }
});

// =========================================
// 6. REFRESH THE CART
// =========================================

window.addEventListener('cart:changed', renderCart);

// Display the cart when the page loads.
renderCart();
