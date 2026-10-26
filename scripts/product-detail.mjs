
import { ProductStore } from './products.mjs';
import { Cart } from './cart.mjs';
import { showError } from './utils.mjs';
import { setupProductVariants } from './product-variants.mjs';

// =========================================
// 1. LOAD PRODUCT DETAILS PAGE
// =========================================

async function loadProductPage() {
    try {
        const params = new URLSearchParams(location.search);
        const productId = params.get('id');
        const root = document.getElementById('product-detail');

        if (!root) {
            throw new Error('Product detail container not found.');
        }

        const product = productId
            ? await ProductStore.get(productId)
            : undefined;

        if (!product) {
            root.replaceChildren();

            const message = document.createElement('h2');
            message.textContent = 'Product not found';
            root.append(message);

            return;
        }

        document.title = `${product.name} — Glam-Days`;

        const nameElement = document.getElementById('pd-name');
        const categoryElement = document.getElementById('pd-category');
        const descriptionElement = document.getElementById('pd-description');

        if (!nameElement || !categoryElement || !descriptionElement) {
            throw new Error('Product information elements were not found.');
        }

        nameElement.textContent = product.name;
        categoryElement.textContent = product.category || '';
        descriptionElement.textContent = product.description || '';

        displayProductImages(product);
        displayProductSpecifications(product);

        // Create the colour, length, size and price selectors.
        const variantController = setupProductVariants(product);

        setupQuantity();
        setupAddToCart(product, variantController);

    } catch (error) {
        console.error('Product page error:', error);
        showError(error);
    }
}

// =========================================
// 2. DISPLAY PRODUCT IMAGES
// =========================================

function displayProductImages(product) {
    const mainImage = document.getElementById('pd-main-image');
    const thumbnails = document.getElementById('pd-thumbnails');

    if (!mainImage || !thumbnails) {
        throw new Error('Product image elements were not found.');
    }

    const images = (product.images || []).filter(
        src => typeof src === 'string' && src.trim() !== ''
    );

    if (images.length > 0) {
        mainImage.src = images[0];
        mainImage.alt = product.name;
    } else {
        mainImage.removeAttribute('src');
        mainImage.alt = 'No product image available';
    }

    const buttons = images.map((src, index) => {
        const button = document.createElement('button');

        button.type = 'button';
        button.className = 'product-thumbnail';
        button.setAttribute('aria-label', `View photo ${index + 1}`);
        button.setAttribute('aria-pressed', String(index === 0));

        const image = document.createElement('img');
        image.src = src;
        image.alt = '';

        image.addEventListener('error', () => {
            button.hidden = true;
        });

        button.append(image);

        button.addEventListener('click', () => {
            mainImage.src = src;
            mainImage.alt = `${product.name} — photo ${index + 1}`;

            Array.from(thumbnails.children).forEach((thumbnail, i) => {
                thumbnail.setAttribute(
                    'aria-pressed',
                    String(i === index)
                );
            });
        });

        return button;
    });

    thumbnails.replaceChildren(...buttons);
}

// =========================================
// 3. DISPLAY PRODUCT SPECIFICATIONS
// =========================================

function displayProductSpecifications(product) {
    const container = document.getElementById('pd-specifications');

    if (!container) {
        return;
    }

    const specifications = product.specifications || {};

    const labels = {
        size: 'Size',
        colour: 'Colour',
        color: 'Colour',
        material: 'Material',
        dimensions: 'Item dimensions (L × W × H)',
        hairType: 'Hair type',
        style: 'Style',
        specialFeature: 'Special feature',
        brand: 'Brand',
        materialFeatures: 'Material features',
        unitCount: 'Unit count',
        careInstructions: 'Care instructions'
    };

    const rows = Object.entries(specifications)
        .filter(([, value]) =>
            value !== '' &&
            value !== null &&
            value !== undefined
        )
        .map(([key, value]) => {
            const row = document.createElement('div');
            row.className = 'specification-row';

            const term = document.createElement('dt');
            term.textContent = labels[key] || key;

            const description = document.createElement('dd');
            description.textContent = Array.isArray(value)
                ? value.join(', ')
                : String(value);

            row.append(term, description);

            return row;
        });

    container.replaceChildren(...rows);
}

// =========================================
// 4. SET UP QUANTITY SELECTOR
// =========================================

function setupQuantity() {
    const display = document.getElementById('pd-qty');
    const decrease = document.getElementById('pd-decrease');
    const increase = document.getElementById('pd-increase');

    if (!display || !decrease || !increase) {
        throw new Error('Quantity controls were not found.');
    }

    let quantity = 1;

    display.textContent = String(quantity);

    decrease.addEventListener('click', () => {
        quantity = Math.max(1, quantity - 1);
        display.textContent = String(quantity);
    });

    increase.addEventListener('click', () => {
        quantity += 1;
        display.textContent = String(quantity);
    });
}

// =========================================
// 5. SET UP ADD TO CART
// =========================================

function setupAddToCart(product, variantController) {
    const button = document.getElementById('pd-add-to-cart');
    const status = document.getElementById('status');

    if (!button || !status) {
        throw new Error('Shopping cart controls were not found.');
    }

    const productInStock = product.inStock !== false;

    const canPurchase = () =>
        productInStock &&
        (!variantController || variantController.isAvailable());

    function updateButton() {
        button.disabled = !canPurchase();

        button.textContent = !productInStock
            ? 'Out of Stock'
            : !canPurchase()
                ? 'Currently Unavailable'
                : 'Add to Cart';
    }

    updateButton();

    if (!productInStock) {
        return;
    }

    button.addEventListener('click', async () => {
        if (button.disabled) {
            return;
        }

        try {
            const quantity = Number(
                document.getElementById('pd-qty')?.textContent
            );

            if (!Number.isInteger(quantity) || quantity < 1) {
                throw new Error('Please select a valid quantity.');
            }

            const variant = variantController
                ? variantController.getSelectedVariant()
                : null;

            if (!canPurchase()) {
                throw new Error(
                    'This option is unavailable. Please choose another option.'
                );
            }

            button.disabled = true;
            status.textContent = 'Adding product to cart...';

            await Cart.add(product.id, quantity, variant);

            const variantLabel = variant
                ? [
                    variant.length != null
                        ? (
                            /inch|inches|["″]/i.test(String(variant.length))
                                ? String(variant.length)
                                : `${variant.length} inch`
                        )
                        : null,
                    variant.color || variant.colour,
                    variant.size,
                    variant.label
                ]
                    .filter(Boolean)
                    .join(' / ')
                : '';

            status.textContent =
                `${quantity} × ${product.name}` +
                (variantLabel ? ` (${variantLabel})` : '') +
                ' added to cart.';

        } catch (error) {
            console.error('Add to cart error:', error);
            showError(error);

        } finally {
            updateButton();
        }
    });
}

// =========================================
// 6. START THE PRODUCT PAGE
// =========================================

loadProductPage();
