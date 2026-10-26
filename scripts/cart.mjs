
import { catalogueReady, ProductStore } from './products.mjs';

const CART_KEY = 'glamdays_cart_v2';

let memoryCart = [];

// =========================================
// 1. LOAD PRODUCTS
// =========================================

async function getProducts() {
    return await ProductStore.all();
}

// =========================================
// 2. GENERATE VARIANT AND CART KEYS
// =========================================

function getVariantKey(variant) {
    if (!variant) {
        return 'default';
    }

    const identifier =
        variant.id ??
        variant.length ??
        variant.size ??
        variant.label ??
        variant.key;

    if (identifier === undefined || identifier === null) {
        throw new Error(
            'The selected variant needs an id, length, size, label, or key.'
        );
    }

    return String(identifier);
}

function getCartKey(id, variant) {
    return `${id}::${getVariantKey(variant)}`;
}

// =========================================
// 3. READ AND NORMALIZE SAVED CART ITEMS
// =========================================

async function readCart() {
    try {
        const products = await getProducts();

        const saved = JSON.parse(
            localStorage.getItem(CART_KEY) || '[]'
        );

        if (!Array.isArray(saved)) {
            return [];
        }

        return saved
            .filter(line => {
                const product = products.find(
                    item => item.id === line.id
                );

                return (
                    typeof line.id === 'string' &&
                    Number.isInteger(line.qty) &&
                    line.qty > 0 &&
                    Boolean(product)
                );
            })
            .map(line => {
                const product = products.find(
                    item => item.id === line.id
                );

                const variant = line.variant || null;

                const cartKey = getCartKey(
                    line.id,
                    variant
                );

                const unitPrice = variant
                    ? Number(variant.price)
                    : Number(
                        line.unitPrice ?? product.price
                    );

                return {
                    ...line,
                    cartKey,
                    variant,
                    unitPrice
                };
            })
            .filter(line =>
                Number.isFinite(line.unitPrice) &&
                line.unitPrice >= 0
            );

    } catch (error) {
        console.error('Could not read the saved cart:', error);
        return memoryCart;
    }
}

// =========================================
// 4. SAVE CART AND NOTIFY PAGE
// =========================================

function saveCart(lines) {
    memoryCart = lines;

    try {
        localStorage.setItem(
            CART_KEY,
            JSON.stringify(lines)
        );
    } catch (error) {
        console.error('Could not save the cart:', error);

        const status = document.getElementById('status');

        if (status) {
            status.textContent =
                'Storage is unavailable. Your cart may not persist after leaving this page.';
        }
    }

    window.dispatchEvent(
        new CustomEvent('cart:changed')
    );
}

// =========================================
// 5. FIND A CART ITEM
// =========================================

function findCartItem(lines, cartKey) {
    return lines.find(
        line => line.cartKey === cartKey
    );
}

// =========================================
// 6. CHANGE CART ITEM QUANTITY
// =========================================

async function setQuantity(cartKey, quantity) {
    if (!Number.isInteger(quantity) || quantity < 0) {
        return;
    }

    const products = await getProducts();
    const lines = await readCart();

    const line = findCartItem(lines, cartKey);

    if (!line) {
        return;
    }

    const product = products.find(
        item => item.id === line.id
    );

    if (!product) {
        return;
    }

    const updatedLines = lines.filter(
        item => item.cartKey !== cartKey
    );

    if (quantity > 0 && product.inStock) {
        updatedLines.push({
            ...line,
            qty: quantity
        });
    }

    saveCart(updatedLines);
}

// =========================================
// 7. CART API
// =========================================

export const Cart = {

    // Return saved cart lines.
    async items() {
        return await readCart();
    },

    // Add a product or selected variant.
    async add(id, quantity = 1, variant = null) {
        if (!Number.isInteger(quantity) || quantity < 1) {
            throw new Error('Quantity must be at least 1.');
        }

        const products = await getProducts();

        const product = products.find(
            item => item.id === id
        );

        if (!product || !product.inStock) {
            throw new Error('This product is unavailable.');
        }

        let selectedVariant = null;

        if (variant) {
            const variantKey = getVariantKey(variant);
            const variantPrice = Number(variant.price);

            if (
                !Number.isFinite(variantPrice) ||
                variantPrice < 0
            ) {
                throw new Error(
                    'The selected size does not have a valid price.'
                );
            }

            selectedVariant = {
                ...variant,
                price: variantPrice,
                key: variantKey
            };
        }

        const cartKey = getCartKey(
            id,
            selectedVariant
        );

        const lines = await readCart();

        const existing = findCartItem(
            lines,
            cartKey
        );

        const savedLine = {
            cartKey,
            id,
            qty: (existing?.qty || 0) + quantity,
            variant: selectedVariant,
            unitPrice: selectedVariant
                ? selectedVariant.price
                : Number(product.price)
        };

        if (
            !Number.isFinite(savedLine.unitPrice) ||
            savedLine.unitPrice < 0
        ) {
            throw new Error('The product price is invalid.');
        }

        const updatedLines = existing
            ? lines.map(line =>
                line.cartKey === cartKey
                    ? savedLine
                    : line
            )
            : [...lines, savedLine];

        saveCart(updatedLines);
    },

    // Set quantity directly.
    async setQty(cartKey, quantity) {
        await setQuantity(cartKey, quantity);
    },

    // Increase quantity by one.
    async increase(cartKey) {
        const lines = await readCart();

        const line = findCartItem(
            lines,
            cartKey
        );

        if (line) {
            await setQuantity(
                cartKey,
                line.qty + 1
            );
        }
    },

    // Decrease quantity by one.
    async decrease(cartKey) {
        const lines = await readCart();

        const line = findCartItem(
            lines,
            cartKey
        );

        if (line) {
            await setQuantity(
                cartKey,
                Math.max(0, line.qty - 1)
            );
        }
    },

    // Remove an item completely.
    async remove(cartKey) {
        await setQuantity(cartKey, 0);
    },

    // Empty the cart.
    clear() {
        saveCart([]);
    },

    // Return cart lines with product details.
    async detailed() {
        const products = await getProducts();
        const lines = await readCart();

        return lines
            .map(line => {
                const product = products.find(
                    item => item.id === line.id
                );

                if (!product) {
                    return null;
                }

                return {
                    ...product,
                    ...line,
                    name: product.name,
                    images: product.images || [],
                    price: line.unitPrice,
                    qty: line.qty,
                    variant: line.variant,
                    cartKey: line.cartKey
                };
            })
            .filter(Boolean);
    },

    // Count total units.
    async count() {
        const lines = await readCart();

        return lines.reduce(
            (total, line) => total + line.qty,
            0
        );
    },

    // Calculate merchandise subtotal.
    async subtotal() {
        const items = await this.detailed();

        return items.reduce(
            (total, item) =>
                total + item.price * item.qty,
            0
        );
    },

    // Calculate delivery charge.
    async deliveryFee() {
        const subtotal = await this.subtotal();
        const data = await catalogueReady;

        if (
            subtotal === 0 ||
            subtotal >= data.freeDeliveryOver
        ) {
            return 0;
        }

        return data.deliveryFee;
    },

    // Calculate grand total.
    async total() {
        return (
            await this.subtotal()
        ) + (
            await this.deliveryFee()
        );
    }
};
