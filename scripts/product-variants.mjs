
import { money } from './utils.mjs';

// =========================================
// 1. CONFIGURATION
// =========================================

const SELECTORS = {
    variants: '#pd-variants',
    lengths: '#pd-length-options',
    selectedLength: '#pd-selected-length',

    colors: '#pd-colors',
    colorOptions: '#pd-color-options',
    selectedColor: '#pd-selected-color',

    sizes: '#pd-sizes',
    sizeOptions: '#pd-size-options',
    selectedSize: '#pd-selected-size',

    price: '#pd-price'
};

const COLOR_SWATCHES = {
    'black': '#171513',
    'natural black': '#171513',
    '1': '#171513',
    '1b': '#171513',
    'jet black': '#080808',
    'brown': '#603B2A',
    'dark brown': '#3B241A',
    'chocolate brown': '#4A2C20',
    'burgundy': '#70263D',
    'wine red': '#722F37',
    'blonde': '#D1B078',
    '613': '#D9B875',
    'honey blonde': '#C89A51',
    'grey': '#999999',
    'gray': '#999999',
    'ombre': 'linear-gradient(135deg, #171513 50%, #C89A51 50%)'
};

// =========================================
// 2. HELPER FUNCTIONS
// =========================================

function getElement(selector) {
    return document.querySelector(selector);
}

function normalize(value) {
    return String(value ?? '').trim().toLowerCase();
}

function getVariantColor(variant) {
    return variant.color ?? variant.colour ?? null;
}

function getVariantLength(variant) {
    return variant.length ?? null;
}

function getVariantSize(variant) {
    return variant.size ?? null;
}

function formatLength(length) {
    if (length === null || length === undefined) {
        return '';
    }

    const value = String(length);

    return /inch|inches|["″]/i.test(value)
        ? value
        : `${value} inch`;
}

function getColorBackground(variant) {
    const colorCode =
        variant.colorCode ??
        variant.colourCode ??
        variant.colorHex ??
        variant.colourHex;

    if (
        typeof colorCode === 'string' &&
        (
            /^#[0-9a-f]{3,8}$/i.test(colorCode) ||
            /^linear-gradient\(/i.test(colorCode)
        )
    ) {
        return colorCode;
    }

    const color = getVariantColor(variant);

    if (!color) {
        return '#cccccc';
    }

    return COLOR_SWATCHES[normalize(color)] ?? '#cccccc';
}

function getUniqueValues(variants, getter) {
    const values = [];

    for (const variant of variants) {
        const value = getter(variant);

        if (value === null || value === undefined || value === '') {
            continue;
        }

        if (!values.some(item => normalize(item) === normalize(value))) {
            values.push(value);
        }
    }

    return values;
}

function setPressed(buttons, selectedValue) {
    buttons.forEach(button => {
        const selected =
            normalize(button.dataset.value) === normalize(selectedValue);

        button.setAttribute('aria-pressed', String(selected));
    });
}

// =========================================
// 3. SET UP PRODUCT VARIANTS
// =========================================

export function setupProductVariants(product) {
    const lengthSection = getElement(SELECTORS.variants);
    const lengthContainer = getElement(SELECTORS.lengths);
    const selectedLengthElement = getElement(SELECTORS.selectedLength);

    const colorSection = getElement(SELECTORS.colors);
    const colorContainer = getElement(SELECTORS.colorOptions);
    const selectedColorElement = getElement(SELECTORS.selectedColor);

    const sizeSection = getElement(SELECTORS.sizes);
    const sizeContainer = getElement(SELECTORS.sizeOptions);
    const selectedSizeElement = getElement(SELECTORS.selectedSize);

    const priceElement = getElement(SELECTORS.price);

    // Keep only variants that are available for purchase.
    const allVariants = Array.isArray(product.variants)
        ? product.variants
        : [];

    const availableVariants = allVariants.filter(
        variant =>
            variant &&
            variant.available !== false &&
            Number.isFinite(Number(variant.price)) &&
            Number(variant.price) >= 0
    );

    let selectedVariant = null;

    // Products without variants use their normal product price.
    if (allVariants.length === 0) {
        if (lengthSection) lengthSection.hidden = true;
        if (colorSection) colorSection.hidden = true;
        if (sizeSection) sizeSection.hidden = true;

        if (priceElement) {
            priceElement.textContent = money(Number(product.price) || 0);
        }

        return {
            getSelectedVariant: () => null,
            isAvailable: () => product.inStock !== false
        };
    }

    // No available variants means the product cannot be selected.
    if (availableVariants.length === 0) {
        if (lengthSection) lengthSection.hidden = true;
        if (colorSection) colorSection.hidden = true;
        if (sizeSection) sizeSection.hidden = true;

        if (priceElement) {
            priceElement.textContent = 'Currently unavailable';
        }

        return {
            getSelectedVariant: () => null,
            isAvailable: () => false
        };
    }

    // Prefer the configured default variant, then the first available one.
    selectedVariant =
        availableVariants.find(
            variant => variant.id === product.defaultVariantId
        ) ??
        availableVariants[0];

    // Current selections.
    let selectedLength = getVariantLength(selectedVariant);
    let selectedColor = getVariantColor(selectedVariant);
    let selectedSize = getVariantSize(selectedVariant);

    const lengths = getUniqueValues(
        availableVariants,
        getVariantLength
    );

    const colors = getUniqueValues(
        availableVariants,
        getVariantColor
    );

    const sizes = getUniqueValues(
        availableVariants,
        getVariantSize
    );

    // =========================================
    // 4. FIND THE MATCHING VARIANT
    // =========================================

    function matchesSelection(variant) {
        if (
            selectedLength !== null &&
            selectedLength !== undefined &&
            normalize(getVariantLength(variant)) !== normalize(selectedLength)
        ) {
            return false;
        }

        if (
            selectedColor !== null &&
            selectedColor !== undefined &&
            normalize(getVariantColor(variant)) !== normalize(selectedColor)
        ) {
            return false;
        }

        if (
            selectedSize !== null &&
            selectedSize !== undefined &&
            normalize(getVariantSize(variant)) !== normalize(selectedSize)
        ) {
            return false;
        }

        return true;
    }

    function findMatchingVariant() {
        return availableVariants.find(matchesSelection) ?? null;
    }

    // =========================================
    // 5. RENDER LENGTH OPTIONS
    // =========================================

    function renderLengths() {
        if (!lengthContainer) return;

        lengthContainer.replaceChildren();

        if (lengthSection) {
            lengthSection.hidden = lengths.length === 0;
        }

        lengths.forEach(length => {
            const button = document.createElement('button');

            button.type = 'button';
            button.className = 'length-option';
            button.textContent = formatLength(length);
            button.dataset.value = String(length);

            button.setAttribute(
                'aria-label',
                `Select ${formatLength(length)}`
            );

            button.addEventListener('click', () => {
                selectOption('length', length);
            });

            lengthContainer.append(button);
        });
    }

    // =========================================
    // 6. RENDER COLOUR SWATCHES
    // =========================================

   
function renderColors() {
    if (!colorContainer) {
        console.error('Missing #pd-color-options in product.html');
        return;
    }

    colorContainer.replaceChildren();

    // Show all distinct colours from available variants,
    // regardless of which length is currently selected.
    const colors = getUniqueValues(
        availableVariants.filter(variant => getVariantColor(variant)),
        getVariantColor
    );

    if (colorSection) {
        colorSection.hidden = colors.length === 0;
    }

    colors.forEach(color => {
        const matchingVariant = availableVariants.find(
            variant =>
                normalize(getVariantColor(variant)) === normalize(color)
        );

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'color-swatch';
        button.dataset.value = String(color);
        button.title = String(color);
        button.setAttribute('aria-label', `Select ${color}`);
        button.setAttribute('aria-pressed', 'false');

        button.style.background = getColorBackground(
            matchingVariant ?? { color }
        );

        // Display the colour name under the swatch.
        const label = document.createElement('span');
        label.className = 'color-swatch-label';
        label.textContent = String(color);

        const wrapper = document.createElement('div');
        wrapper.className = 'color-option';
        wrapper.append(button, label);

        button.addEventListener('click', () => {
            selectOption('color', color);
        });

        colorContainer.append(wrapper);
    });
}

    // =========================================
    // 7. RENDER SIZE OPTIONS
    // =========================================

    function renderSizes() {
        if (!sizeContainer) return;

        sizeContainer.replaceChildren();

        if (sizeSection) {
            sizeSection.hidden = sizes.length === 0;
        }

        sizes.forEach(size => {
            const button = document.createElement('button');

            button.type = 'button';
            button.className = 'size-option';
            button.textContent = String(size);
            button.dataset.value = String(size);
            button.setAttribute('aria-label', `Select size ${size}`);
            button.setAttribute('aria-pressed', 'false');

            button.addEventListener('click', () => {
                selectOption('size', size);
            });

            sizeContainer.append(button);
        });
    }

    // =========================================
    // 8. UPDATE SELECTED OPTION
    // =========================================

    function selectOption(type, value) {
        const previous = {
            length: selectedLength,
            color: selectedColor,
            size: selectedSize
        };

        if (type === 'length') selectedLength = value;
        if (type === 'color') selectedColor = value;
        if (type === 'size') selectedSize = value;

        let match = findMatchingVariant();

        // If this exact combination is unavailable, choose an available
        // variant for the requested option and update the other selections.
        if (!match) {
            match = availableVariants.find(variant => {
                if (type === 'length') {
                    return normalize(getVariantLength(variant)) === normalize(value);
                }

                if (type === 'color') {
                    return normalize(getVariantColor(variant)) === normalize(value);
                }

                return normalize(getVariantSize(variant)) === normalize(value);
            }) ?? null;
        }

        if (match) {
            selectedVariant = match;

            selectedLength = getVariantLength(match);
            selectedColor = getVariantColor(match);
            selectedSize = getVariantSize(match);
        } else {
            selectedLength = previous.length;
            selectedColor = previous.color;
            selectedSize = previous.size;
        }

        updateDisplay();
    }

    // =========================================
    // 9. UPDATE PRICE AND SELECTED LABELS
    // =========================================

    function updateDisplay() {
        const lengthButtons = lengthContainer
            ? [...lengthContainer.querySelectorAll('button')]
            : [];

        const colorButtons = colorContainer
            ? [...colorContainer.querySelectorAll('button')]
            : [];

        const sizeButtons = sizeContainer
            ? [...sizeContainer.querySelectorAll('button')]
            : [];

        setPressed(lengthButtons, selectedLength);
        setPressed(colorButtons, selectedColor);
        setPressed(sizeButtons, selectedSize);

        if (selectedLengthElement) {
            selectedLengthElement.textContent =
                selectedLength === null || selectedLength === undefined
                    ? 'Not applicable'
                    : formatLength(selectedLength);
        }

        if (selectedColorElement) {
            selectedColorElement.textContent =
                selectedColor ?? 'Not applicable';
        }

        if (selectedSizeElement) {
            selectedSizeElement.textContent =
                selectedSize ?? 'Not applicable';
        }

        if (priceElement && selectedVariant) {
            priceElement.textContent = money(
                Number(selectedVariant.price)
            );
        }
    }

    // =========================================
    // 10. INITIALIZE THE SELECTORS
    // =========================================

    renderLengths();
    renderColors();
    renderSizes();
    updateDisplay();

    // =========================================
    // 11. RETURN THE CONTROLLER
    // =========================================

    return {
        getSelectedVariant() {
            if (!selectedVariant) return null;

            return {
                ...selectedVariant,
                price: Number(selectedVariant.price)
            };
        },

        isAvailable() {
            return Boolean(
                selectedVariant &&
                selectedVariant.available !== false
            );
        }
    };
}
