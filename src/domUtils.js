/**
 * Utility for safe and efficient DOM element creation.
 */
export const domUtils = {
    /**
     * Creates an element with attributes and children.
     * @param {string} tag 
     * @param {Object} attrs 
     * @param {Array|string} children 
     * @returns {HTMLElement}
     */
    el(tag, attrs = {}, children = []) {
        const element = document.createElement(tag);
        
        for (const [key, value] of Object.entries(attrs)) {
            if (key === 'className') {
                element.className = value;
            } else if (key.startsWith('aria-') || key === 'role' || key === 'tabindex') {
                element.setAttribute(key, value);
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else if (key === 'id') {
                element.id = value;
            } else if (key.startsWith('data-')) {
                element.setAttribute(key, value);
            } else {
                element[key] = value;
            }
        }

        if (typeof children === 'string') {
            element.textContent = children;
        } else if (Array.isArray(children)) {
            const fragment = document.createDocumentFragment();
            children.forEach(child => {
                if (child instanceof HTMLElement) {
                    fragment.appendChild(child);
                } else if (typeof child === 'string') {
                    fragment.appendChild(document.createTextNode(child));
                }
            });
            element.appendChild(fragment);
        }

        return element;
    }
};
